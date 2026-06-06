#!/usr/bin/env bun
// Simple HTML Server with Bun

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = process.env.PUBLIC_DIR || '';

// Static file MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

// Read file asynchronously
async function readFile(path) {
  const fs = await import('fs/promises');
  try {
    return await fs.readFile(path);
  } catch {
    return null;
  }
}

// Check if file exists
async function fileExists(path) {
  const fs = await import('fs/promises');
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

// Get MIME type from file extension
function getMimeType(filePath) {
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

// Join path segments properly
function join(base, ...paths) {
  return base + paths.map(p => p.replace(/^\/+/, '')).join('/').replace(/\\/g, '/');
}

// Server
const server = Bun.serve({
  port: PORT,
  hostname: '0.0.0.0',
  
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname;
    
    // Prevent access to hidden files
    const pathParts = filePath.split('/').filter(p => p);
    for (const part of pathParts) {
      if (part.startsWith('.')) {
        return new Response('Forbidden', { status: 403 });
      }
    }
    
    // If path ends with /, add index.html
    if (filePath.endsWith('/')) {
      filePath += 'index.html';
    }

    
    
    // Full file path
    const fullPath = join(PUBLIC_DIR, filePath);

    // Check if file exists
    if (!(await fileExists(fullPath))) {
      return new Response('Not Found', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
    
    // Read and return file
    const content = await readFile(fullPath);
    if (content === null) {
      return new Response('Error reading file', { status: 500 });
    }
    
    const mimeType = getMimeType(fullPath);

    if(mimeType == 'text/html; charset=utf-8'){
      console.log(`[${new Date().toISOString()}] ${req.method} ${filePath}`);
      // console.log(`  -> ${mimeType}`);
    }
    
    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache',
      }
    });
  }
});

// Get local IP address
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIP = getLocalIP();

console.log(`
🌐 Simple HTML Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 Directory: ${PUBLIC_DIR}
🌍 Local:    http://localhost:${PORT}
💻 Network:  http://${localIP}:${PORT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Auto open browser
if (process.platform === 'win32' || process.platform === 'darwin') {
  setTimeout(() => {
    require('child_process').exec(`start http://localhost:${PORT}`);
  }, 1000);
}