import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONSTANTS_PATH = path.join(__dirname, '../constants.ts');
const FAVICON_DIR = path.join(__dirname, '../public/image/favicons');

// --- Helper: Fetch with timeout and retry ---
const fetchWithRetry = async (url, options = {}, retries = 3) => {
    const timeout = 10000; // 10s timeout
    
    for (let i = 0; i <= retries; i++) {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            
            // Handle HTTP/HTTPS explicitly to ignore cert errors (common in gov sites)
            const agent = url.startsWith('https') 
                ? new https.Agent({ rejectUnauthorized: false })
                : new http.Agent();

            const res = await fetch(url, { 
                ...options, 
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    ...options.headers
                },
                agent, 
            });
            clearTimeout(id);
            
            if (res.ok) return res;
            if (res.status === 404) throw new Error('404 Not Found'); // Don't retry 404
            
        } catch (err) {
            if (i === retries) throw err;
            await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Backoff
        }
    }
};

// --- Helper: Extract Links from constants.ts ---
const extractLinks = () => {
    const content = fs.readFileSync(CONSTANTS_PATH, 'utf-8');
    // Extract the INITIAL_LINKS array content
    const match = content.match(/export const INITIAL_LINKS: NavigationLink\[\] = \[([\s\S]*?)\];/);
    if (!match) return [];
    
    const arrayContent = match[1];
    const links = [];
    
    // Regex to capture { id: '...', title: '...', url: '...' } objects
    // This is a rough parser, assuming standard formatting
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

// --- Strategy 1: Root Favicon ---
const tryRootFavicon = async (domain) => {
    const url = new URL('/favicon.ico', domain).toString();
    const res = await fetchWithRetry(url, { method: 'HEAD' }, 0);
    if (res && res.ok && res.headers.get('content-type')?.includes('image')) {
        return url;
    }
    return null;
};

// --- Strategy 2: HTML Parsing ---
const tryHtmlParsing = async (domain) => {
    try {
        const res = await fetchWithRetry(domain, {}, 1);
        if (!res) return null;
        const html = await res.text();
        
        // Look for <link rel="icon" ... href="...">
        // Handles: rel="icon", rel="shortcut icon", href="...", href='...'
        const linkRegex = /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["'][^>]*>/i;
        const match = html.match(linkRegex);
        
        if (match) {
            let iconUrl = match[1];
            // Resolve relative URLs
            return new URL(iconUrl, domain).toString();
        }
    } catch (e) {
        // HTML fetch failed
    }
    return null;
};

// --- Strategy 3: Google S2 (Fallback) ---
const tryGoogleS2 = (domain) => {
    try {
        const hostname = new URL(domain).hostname;
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch (e) {
        return null;
    }
};

// --- Main Process ---
const run = async () => {
    // 0. Disable TLS verification globally for this script (needed for some gov sites)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const links = extractLinks();
    console.log(`Found ${links.length} links to process.`);
    
    const results = {
        success: 0,
        failed: 0,
        logs: []
    };
    
    // Batch process
    const BATCH_SIZE = 5;
    for (let i = 0; i < links.length; i += BATCH_SIZE) {
        const batch = links.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (link) => {
            const { id, title, url } = link;
            const logEntry = { id, title, url, status: 'pending' };
            
            try {
                let iconUrl = null;
                let strategy = '';
                
                // 1. Try HTML Parsing first (Highest Quality)
                if (!iconUrl) {
                    try {
                        iconUrl = await tryHtmlParsing(url);
                        if (iconUrl) strategy = 'html';
                    } catch (e) { /* ignore */ }
                }
                
                // 2. Try Root Favicon (Standard)
                if (!iconUrl) {
                    try {
                        iconUrl = await tryRootFavicon(url);
                        if (iconUrl) strategy = 'root';
                    } catch (e) { /* ignore */ }
                }

                // 3. Fallback to Google S2 (Most reliable)
                if (!iconUrl) {
                    try {
                        iconUrl = tryGoogleS2(url);
                        if (iconUrl) strategy = 'google';
                    } catch (e) { /* ignore */ }
                }

                if (iconUrl) {
                    // Download
                    // Use a more lenient fetch for the final download
                    let res;
                    try {
                        res = await fetchWithRetry(iconUrl);
                    } catch (e) {
                        // If download fails, and we haven't tried Google yet (e.g. html strategy found a broken link), try Google
                        if (strategy !== 'google') {
                             iconUrl = tryGoogleS2(url);
                             strategy = 'google (fallback)';
                             res = await fetchWithRetry(iconUrl);
                        } else {
                            throw e;
                        }
                    }

                    if (!res) throw new Error('Download failed');
                    
                    const buffer = await res.arrayBuffer();
                    const hostname = new URL(url).hostname;
                    
                    // Detect extension
                    const contentType = res.headers.get('content-type') || 'image/png';
                    let ext = 'png';
                    if (contentType.includes('ico')) ext = 'ico';
                    else if (contentType.includes('svg')) ext = 'svg';
                    else if (contentType.includes('jpg') || contentType.includes('jpeg')) ext = 'jpg';
                    
                    if (strategy.includes('google')) ext = 'png';
                    
                    const filename = `${hostname}.${ext}`;
                    const filePath = path.join(FAVICON_DIR, filename);
                    
                    fs.writeFileSync(filePath, Buffer.from(buffer));
                    
                    logEntry.status = 'success';
                    logEntry.localPath = `/image/favicons/${filename}`;
                    logEntry.strategy = strategy;
                    results.success++;
                    console.log(`[SUCCESS] ${title} (${strategy}) -> ${filename}`);
                } else {
                    throw new Error('No icon found');
                }
            } catch (err) {
                logEntry.status = 'failed';
                logEntry.error = err.message;
                results.failed++;
                console.error(`[FAILED] ${title}: ${err.message}`);
            }
            results.logs.push(logEntry);
        }));
    }
    
    // Generate Report
    const reportPath = path.join(FAVICON_DIR, 'report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\nDone! Report saved to ${reportPath}`);
    console.log(`Success: ${results.success}, Failed: ${results.failed}`);
};

run();
