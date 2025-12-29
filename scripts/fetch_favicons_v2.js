import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONSTANTS_PATH = path.join(__dirname, '../constants.ts');
const FAVICON_DIR = path.join(__dirname, '../public/image/favicons');
const REPORT_PATH = path.join(FAVICON_DIR, 'report_v2.csv');
const ERROR_LOG_PATH = path.join(FAVICON_DIR, 'error_list.txt');
const JSON_REPORT_PATH = path.join(FAVICON_DIR, 'report.json'); // Legacy report for resume

// --- Configuration ---
const CONFIG = {
    threads: 20,
    baseTimeout: 15000,
    govTimeout: 30000,
    maxRetries: 3,
    circuitBreakerThreshold: 5,
    circuitBreakerPause: 60000, // 1 min
    userAgentPool: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
};

// --- State ---
const state = {
    consecutiveFailures: 0,
    processedCount: 0,
    successCount: 0,
    startTime: Date.now(),
    existingHashes: new Set()
};

// --- Helpers ---

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const getRandomUserAgent = () => CONFIG.userAgentPool[Math.floor(Math.random() * CONFIG.userAgentPool.length)];

const isGovSite = (url) => url.includes('.gov.cn') || url.includes('.org.cn');

const getTimeout = (url) => isGovSite(url) ? CONFIG.govTimeout : CONFIG.baseTimeout;

// Circuit Breaker Check
const checkCircuitBreaker = async () => {
    if (state.consecutiveFailures >= CONFIG.circuitBreakerThreshold) {
        console.log(`[CIRCUIT BREAKER] Pausing for ${CONFIG.circuitBreakerPause / 1000}s due to ${state.consecutiveFailures} consecutive failures...`);
        await sleep(CONFIG.circuitBreakerPause);
        state.consecutiveFailures = 0; // Reset after pause
    }
};

const calculateHash = (buffer) => crypto.createHash('md5').update(buffer).digest('hex');

// Fetch with advanced retry and timeout
const fetchWithRetry = async (url, options = {}, retries = CONFIG.maxRetries) => {
    const isGov = isGovSite(url);
    const timeout = getTimeout(url);
    
    for (let i = 0; i <= retries; i++) {
        try {
            await checkCircuitBreaker();
            
            // Random delay before request to avoid burst
            await sleep(Math.random() * 1500 + 500); 

            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            
            const agent = url.startsWith('https') 
                ? new https.Agent({ rejectUnauthorized: false, keepAlive: true })
                : new http.Agent({ keepAlive: true });

            const res = await fetch(url, { 
                ...options, 
                signal: controller.signal,
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    ...options.headers
                },
                agent, 
            });
            clearTimeout(id);
            
            if (res.ok) {
                state.consecutiveFailures = 0; // Reset on success
                return res;
            }
            
            if (res.status === 404 || res.status === 403) {
                // Don't retry 404/403 immediately, maybe try fallback strategy
                throw new Error(`HTTP ${res.status}`);
            }
            throw new Error(`HTTP ${res.status}`);
            
        } catch (err) {
            // console.log(`   Retry ${i}/${retries} for ${url}: ${err.message}`);
            if (i === retries) {
                state.consecutiveFailures++;
                throw err;
            }
            // Exponential backoff: 1s, 2s, 4s...
            await sleep(1000 * Math.pow(2, i)); 
        }
    }
};

// --- Extract Links ---
const extractLinks = () => {
    const content = fs.readFileSync(CONSTANTS_PATH, 'utf-8');
    const match = content.match(/export const INITIAL_LINKS: NavigationLink\[\] = \[([\s\S]*?)\];/);
    if (!match) return [];
    
    const arrayContent = match[1];
    const links = [];
    const objectRegex = /\{[\s\S]*?id:\s*'([^']*)'[\s\S]*?title:\s*'([^']*)'[\s\S]*?url:\s*'([^']*)'[\s\S]*?\}/g;
    
    let objMatch;
    while ((objMatch = objectRegex.exec(arrayContent)) !== null) {
        links.push({
            id: objMatch[1],
            title: objMatch[2],
            url: objMatch[3]
        });
    }
    return links;
};

// --- Strategies ---

const tryRootFavicon = async (domain) => {
    const url = new URL('/favicon.ico', domain).toString();
    const res = await fetchWithRetry(url, { method: 'HEAD' }, 0); // 1 try for root check
    if (res && res.ok && res.headers.get('content-type')?.includes('image')) {
        return url;
    }
    throw new Error('Root favicon not found');
};

const tryHtmlParsing = async (domain) => {
    const res = await fetchWithRetry(domain, {}, 1);
    const html = await res.text();
    const linkRegex = /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["'][^>]*>/i;
    const match = html.match(linkRegex);
    
    if (match) {
        return new URL(match[1], domain).toString();
    }
    throw new Error('No icon tag in HTML');
};

const tryGoogleS2 = (domain) => {
    try {
        const hostname = new URL(domain).hostname;
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch (e) {
        throw new Error('Invalid domain for Google S2');
    }
};

// --- Main Runner ---

const run = async () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    // Resume capability
    let processedIds = new Set();
    if (fs.existsSync(JSON_REPORT_PATH)) {
        try {
            const oldReport = JSON.parse(fs.readFileSync(JSON_REPORT_PATH, 'utf-8'));
            oldReport.logs.forEach(l => {
                if (l.status === 'success') processedIds.add(l.id);
            });
            console.log(`[RESUME] Found ${processedIds.size} already processed items.`);
        } catch (e) { console.error('Error reading previous report:', e.message); }
    }

    const allLinks = extractLinks();
    // Filter out already processed if needed, OR force retry for failures.
    // User asked to "support recovery from failed 27 websites". 
    // So we skip successes, process failures + new.
    const linksToProcess = allLinks.filter(l => !processedIds.has(l.id));
    
    console.log(`Total Links: ${allLinks.length}, To Process: ${linksToProcess.length}`);
    
    // Init CSV
    if (!fs.existsSync(REPORT_PATH)) {
        fs.writeFileSync(REPORT_PATH, 'ID,Title,URL,Status,Strategy,LocalPath,Duration,Error\n');
    }
    
    // Queue
    let queue = [...linksToProcess];
    let activeWorkers = 0;
    const results = [];
    
    const worker = async () => {
        while (queue.length > 0) {
            const link = queue.shift();
            const start = Date.now();
            let result = { ...link, status: 'failed', strategy: 'none', error: '' };
            
            try {
                console.log(`[START] ${link.title}`);
                let iconUrl = null;
                let buffer = null;
                
                // Strategy Chain
                try {
                    // 1. Root (Fastest check)
                    iconUrl = await tryRootFavicon(link.url);
                    result.strategy = 'root';
                } catch (e) {
                    try {
                        // 2. HTML
                        iconUrl = await tryHtmlParsing(link.url);
                        result.strategy = 'html';
                    } catch (e2) {
                        // 3. Google Fallback
                        iconUrl = tryGoogleS2(link.url);
                        result.strategy = 'google';
                    }
                }

                // Download Content
                const res = await fetchWithRetry(iconUrl);
                buffer = await res.arrayBuffer();
                
                // Deduplication
                const fileHash = calculateHash(Buffer.from(buffer));
                // if (state.existingHashes.has(fileHash)) {
                //     console.log(`[DUPLICATE] ${link.title} (Hash: ${fileHash})`);
                //     // Even if duplicate, we might want to save it with its own name for mapping
                // }
                state.existingHashes.add(fileHash);

                // Save
                const hostname = new URL(link.url).hostname;
                const contentType = res.headers.get('content-type') || 'image/png';
                let ext = 'png';
                if (contentType.includes('ico')) ext = 'ico';
                else if (contentType.includes('svg')) ext = 'svg';
                else if (contentType.includes('jpg')) ext = 'jpg';
                if (result.strategy === 'google') ext = 'png';

                const filename = `${hostname}.${ext}`;
                const savePath = path.join(FAVICON_DIR, filename);
                fs.writeFileSync(savePath, Buffer.from(buffer));
                
                result.status = 'success';
                result.localPath = filename;
                state.successCount++;
                console.log(`[SUCCESS] ${link.title} -> ${filename}`);

            } catch (err) {
                result.error = err.message;
                console.error(`[FAILED] ${link.title}: ${err.message}`);
                fs.appendFileSync(ERROR_LOG_PATH, `${new Date().toISOString()} - ${link.url} - ${err.message}\n`);
            } finally {
                state.processedCount++;
                const duration = ((Date.now() - start) / 1000).toFixed(2);
                
                // Log to CSV
                const csvLine = `"${link.id}","${link.title}","${link.url}","${result.status}","${result.strategy}","${result.localPath || ''}","${duration}s","${result.error}"\n`;
                fs.appendFileSync(REPORT_PATH, csvLine);
                
                // Update Console Stats
                const progress = ((state.processedCount / linksToProcess.length) * 100).toFixed(1);
                // process.stdout.write(`Progress: ${progress}% | Success: ${state.successCount}/${state.processedCount}\r`);
            }
        }
    };

    // Start Threads
    const workers = [];
    for (let i = 0; i < Math.min(CONFIG.threads, linksToProcess.length); i++) {
        workers.push(worker());
    }
    
    await Promise.all(workers);
    
    console.log('\n------------------------------------------------');
    console.log(`Job Complete.`);
    console.log(`Processed: ${state.processedCount}`);
    console.log(`Success: ${state.successCount}`);
    console.log(`See ${REPORT_PATH} for details.`);
};

run().catch(console.error);
