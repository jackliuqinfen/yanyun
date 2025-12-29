# 江苏盐韵管理系统 - 后端服务

本服务基于 Node.js Express 构建，提供数据持久化存储 (MySQL) 和文件对象存储 (腾讯云 COS) 功能。

## 🚀 部署指南 (宝塔面板)

### 1. 环境准备
- 确保宝塔面板已安装 **PM2 管理器**。
- 确保已安装 **MySQL 5.7+**。
- 确保已开通 **腾讯云对象存储 (COS)**。

### 2. 安装依赖
在当前目录 (`server/`) 打开终端，运行：
```bash
npm install
```
*(注意：如果之前没有安装过依赖，这一步是必须的)*

### 3. 配置环境
打开 `server/.env` 文件，填入您的真实信息：
- **数据库信息**: Host, User, Password, Database Name
- **COS 信息**: SecretId, SecretKey, Bucket, Region

### 4. 启动服务
使用 PM2 启动服务：
```bash
npm start
```
或者在宝塔 PM2 管理器中添加项目，启动文件选择 `index.js`。

## 📁 目录结构
- `index.js`: 服务入口，包含数据库连接和 API 接口
- `.env`: 配置文件 (敏感信息)
- `uploads/`: (旧版兼容) 本地临时文件目录

## 🔍 接口说明
- `GET /api/health`: 健康检查，用于前端判断是否连接云端
- `GET/POST /api/kv`: 通用键值对存储接口 (用于保存设置、新闻等)
- `POST /api/file`: 文件上传接口 (直接流式传输到 COS)
