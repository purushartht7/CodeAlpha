// Local Development Server (Zero-Dependency Node.js HTTP Server)
// Mirrors Vercel Serverless Function & Serves Static Frontend
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle API: /api/translate
  if (pathname === '/api/translate') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      return res.end();
    }

    let text = parsedUrl.query.text || '';
    let source = parsedUrl.query.source || 'auto';
    let target = parsedUrl.query.target || 'en';

    if (req.method === 'POST') {
      let bodyData = '';
      req.on('data', chunk => { bodyData += chunk; });
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(bodyData || '{}');
          text = parsed.text || text;
          source = parsed.source || source;
          target = parsed.target || target;
          await executeTranslate(text, source, target, res);
        } catch (e) {
          await executeTranslate(text, source, target, res);
        }
      });
      return;
    }

    return await executeTranslate(text, source, target, res);
  }

  // Serve static files
  let safePath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  let filePath = path.join(PUBLIC_DIR, safePath);

  // Prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA-style routing
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        return res.end('Error loading file');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

async function executeTranslate(text, source, target, res) {
  if (!text || !text.trim()) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Text query parameter is required' }));
  }

  try {
    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Upstream error: ${response.status}`);
    const data = await response.json();
    const segments = data[0] || [];
    const translatedText = segments.map(seg => (seg && seg[0]) ? seg[0] : '').join('');
    const detectedSource = data[2] || source;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      translatedText,
      detectedSource,
      originalText: text
    }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

server.listen(PORT, () => {
  console.log(`Unified Internship Web Application running at: http://localhost:${PORT}`);
});
