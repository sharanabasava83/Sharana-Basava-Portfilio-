const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4180;
const BASE_DIR = fs.existsSync(path.join(__dirname, 'index.html')) ? __dirname : process.cwd();

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
  const parsedUrl = req.url.split('?')[0];
  let relativePath = parsedUrl === '/' ? 'index.html' : parsedUrl.replace(/^\//, '');
  let filePath = path.join(BASE_DIR, relativePath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`📜 Sharanabasava — Royal Portfolio Ledger Live`);
  console.log(`🔗 Local Address: http://localhost:${PORT}/`);
  console.log(`====================================================`);
});
