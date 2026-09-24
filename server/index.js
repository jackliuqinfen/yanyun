require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const COS = require('cos-nodejs-sdk-v5');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// ==================================================================================
// 🔧 本地文件存储配置 (作为 MySQL/COS 的降级方案)
// ==================================================================================
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 托管本地上传的文件
app.use('/uploads', express.static(UPLOAD_DIR));

let useFileMode = false;

// ==================================================================================
// 1. 数据库连接池
// ==================================================================================
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'yanyun_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 5000 // 5s
});

// ==================================================================================
// 2. 腾讯云 COS 初始化
// ==================================================================================
let cos = null;
if (process.env.COS_SECRET_ID && !process.env.COS_SECRET_ID.includes('your_')) {
    cos = new COS({
        SecretId: process.env.COS_SECRET_ID,
        SecretKey: process.env.COS_SECRET_KEY,
    });
}

// ==================================================================================
// 3. 中间件配置
// ==================================================================================
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 鉴权中间件
const EXPECTED_TOKEN = process.env.AUTH_TOKEN;
const authenticate = (req, res, next) => {
    if (req.method === 'GET' && req.path === '/api/health') return next();
    if (!EXPECTED_TOKEN) return res.status(503).json({ error: 'Authentication is not configured' });
    
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${EXPECTED_TOKEN}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// ==================================================================================
// 4. 启动与自检
// ==================================================================================
async function initDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log(`✅ [MySQL] 数据库连接成功: ${process.env.DB_HOST}`);
        
        // 自动建表
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`system_kv\` (
                \`key_name\` varchar(255) NOT NULL,
                \`json_value\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
                \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`key_name\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log(`✅ [MySQL] 数据表 system_kv 检查通过`);
        connection.release();
        return true;
    } catch (e) {
        console.error(`❌ [MySQL] 连接失败: ${e.message}`);
        console.warn(`⚠️ 自动切换到本地文件存储模式 (降级运行)`);
        useFileMode = true;
        return false;
    }
}

// 简单的文件读写帮助函数
const fileDB = {
    get: (key) => {
        try {
            const filePath = path.join(DATA_DIR, `${key}.json`);
            if (fs.existsSync(filePath)) {
                return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            }
            return null;
        } catch (e) {
            console.error(`File Read Error (${key}):`, e);
            return null;
        }
    },
    set: (key, value) => {
        try {
            const filePath = path.join(DATA_DIR, `${key}.json`);
            fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
            return true;
        } catch (e) {
            console.error(`File Write Error (${key}):`, e);
            return false;
        }
    }
};

// ==================================================================================
// 5. API 接口
// ==================================================================================

// 健康检查
app.get('/api/health', async (req, res) => {
    let dbStatus = 'disconnected';
    let dbError = '';

    if (useFileMode) {
        dbStatus = 'connected_local_file';
    } else {
        try {
            const conn = await pool.getConnection();
            await conn.ping();
            conn.release();
            dbStatus = 'connected';
        } catch(e) { 
            dbError = e.message; 
            // 运行时检测到 DB 断开，也尝试降级
            // useFileMode = true; 
        }
    }

    res.json({ 
        status: (dbStatus === 'connected' || dbStatus === 'connected_local_file') ? 'ok' : 'error',
        database: dbStatus,
        db_error: dbError,
        cos_enabled: !!cos,
        timestamp: new Date().toISOString()
    });
});

// 获取数据
app.get('/api/kv', authenticate, async (req, res) => {
    const key = req.query.key;
    if (!key) return res.status(400).json({ error: 'Key required' });

    if (useFileMode) {
        const data = fileDB.get(key);
        return res.json(data);
    }

    try {
        const [rows] = await pool.query('SELECT json_value FROM system_kv WHERE key_name = ?', [key]);
        if (rows.length > 0) {
            let val = rows[0].json_value;
            try { res.json(JSON.parse(val)); } catch (e) { res.send(val); }
        } else {
            res.json(null);
        }
    } catch (err) {
        console.error(`[DB Error] GET ${key}:`, err.message);
        // 如果查询失败，尝试降级读取
        console.warn(`Trying local file fallback for ${key}`);
        const data = fileDB.get(key);
        if (data) return res.json(data);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// 保存数据
app.post('/api/kv', authenticate, async (req, res) => {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ error: 'Missing key or value' });

    if (useFileMode) {
        if (fileDB.set(key, value)) {
            console.log(`[File Saved] ${key}`);
            return res.json({ success: true });
        } else {
            return res.status(500).json({ error: 'File save failed' });
        }
    }

    try {
        const stringValue = JSON.stringify(value);
        await pool.query(
            'INSERT INTO system_kv (key_name, json_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE json_value = VALUES(json_value)',
            [key, stringValue]
        );
        console.log(`[DB Saved] ${key} (${stringValue.length} bytes)`);
        
        // 同时保存一份到本地文件作为备份
        fileDB.set(key, value);
        
        res.json({ success: true });
    } catch (err) {
        console.error(`[DB Error] POST ${key}:`, err.message);
        // 写入失败时，写入本地文件保底
        console.warn(`Fallback saving to local file for ${key}`);
        if (fileDB.set(key, value)) {
            return res.json({ success: true, warning: 'Saved to local file only due to DB error' });
        }
        res.status(500).json({ error: 'Database save failed', details: err.message });
    }
});

// --- 文件上传 (COS 集成 / 本地存储) ---
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/file', authenticate, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const fileExt = path.extname(req.file.originalname);
    const fileName = `uploads/${Date.now()}_${Math.round(Math.random() * 1000)}${fileExt}`;

    // 1. 如果配置了 COS，优先传 COS
    if (cos) {
        try {
            console.log(`[Upload] 开始上传至 COS: ${fileName}`);
            await new Promise((resolve, reject) => {
                cos.putObject({
                    Bucket: process.env.COS_BUCKET,
                    Region: process.env.COS_REGION,
                    Key: fileName,
                    Body: req.file.buffer,
                    ContentLength: req.file.size
                }, function(err, data) {
                    if (err) reject(err);
                    else resolve(data);
                });
            });

            let publicUrl = '';
            if (process.env.COS_CDN_DOMAIN) {
                const domain = process.env.COS_CDN_DOMAIN.replace(/\/$/, '');
                publicUrl = `${domain}/${fileName}`;
            } else {
                publicUrl = `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/${fileName}`;
            }

            console.log(`[Upload Success] ${publicUrl}`);
            return res.json({ success: true, url: publicUrl });

        } catch (err) {
            console.error('[COS Upload Error]', err);
            // COS 失败，尝试降级到本地
        }
    }

    // 2. 降级方案：保存到本地 uploads 目录
    try {
        const localFileName = `${Date.now()}_${Math.round(Math.random() * 1000)}${fileExt}`;
        const localFilePath = path.join(UPLOAD_DIR, localFileName);
        
        fs.writeFileSync(localFilePath, req.file.buffer);
        
        // 获取服务器地址 (简单推断，实际生产建议配置 BASE_URL)
        // 注意：前端通过代理访问 /uploads/xxx
        const publicUrl = `/uploads/${localFileName}`;
        
        console.log(`[Local Upload Success] ${publicUrl}`);
        res.json({ success: true, url: publicUrl });
    } catch (e) {
        console.error('[Local Upload Error]', e);
        res.status(500).json({ error: 'Failed to upload file', details: e.message });
    }
});

// 启动服务
app.listen(PORT, '0.0.0.0', async () => {
    console.log('\n--------------------------------------------------');
    console.log(`🚀 江苏盐韵管理系统 - 后端服务已启动 (http://0.0.0.0:${PORT})`);
    console.log('--------------------------------------------------');
    
    await initDatabase();

    if (cos) {
        console.log(`✅ [COS] 对象存储已配置 (Bucket: ${process.env.COS_BUCKET})`);
    } else {
        console.log(`⚠️ [COS] 对象存储未配置，使用本地文件存储 (server/uploads)`);
    }
    console.log(`📂 [Local] 本地数据目录: ${DATA_DIR}`);
    console.log('--------------------------------------------------\n');
});
