const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const HOST = '127.0.0.1'; // Bind strictly to loopback to prevent LAN/external network exposure
const ROOT_DIR = path.resolve(__dirname);

// Whitelisted static MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

// Security headers for local testing
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'no-referrer',
};

const server = http.createServer((req, res) => {
  // 1. Only allow safe HTTP methods (GET and HEAD)
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain', 'Allow': 'GET, HEAD' });
    res.end('405 Method Not Allowed');
    return;
  }

  // 2. Safely decode URL and strip query strings / hash
  let decodedPath;
  try {
    const rawPath = req.url.split('?')[0].split('#')[0];
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 Bad Request');
    return;
  }

  // 3. Reject null bytes or malicious patterns
  if (decodedPath.includes('\0')) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 Bad Request');
    return;
  }

  // 4. Default root to index.html
  const sanitizedRelPath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^[/\\]+/, '');

  // 5. Strictly resolve absolute path and enforce jail within ROOT_DIR
  const targetPath = path.resolve(ROOT_DIR, sanitizedRelPath);
  const isWithinRoot = targetPath === ROOT_DIR || targetPath.startsWith(ROOT_DIR + path.sep);

  if (!isWithinRoot) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden: Access Denied');
    return;
  }

  // 6. Block access to hidden files/folders (e.g. .git, .env)
  const relativeParts = path.relative(ROOT_DIR, targetPath).split(path.sep);
  if (relativeParts.some((part) => part.startsWith('.'))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // 7. Check file existence and type
  fs.stat(targetPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext];

    // Only serve whitelisted safe media and web assets
    if (!contentType) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden: File type not allowed');
      return;
    }

    const headers = {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      ...SECURITY_HEADERS,
    };

    if (req.method === 'HEAD') {
      res.writeHead(200, headers);
      res.end();
      return;
    }

    res.writeHead(200, headers);
    const stream = fs.createReadStream(targetPath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      } else {
        res.destroy();
      }
    });
    stream.pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n🚀 Server berjalan di http://${HOST}:${PORT}`);
  console.log(`🔒 Mode keamanan aktif: Loopback only (127.0.0.1) & Path Traversal Guard.`);
  console.log(`Tekan Ctrl+C untuk menghentikan server.\n`);
});
