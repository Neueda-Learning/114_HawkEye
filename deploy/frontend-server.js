const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const rootDir = process.env.FRONTEND_DIST_DIR || process.argv[2];
const backendBaseUrl = process.env.BACKEND_BASE_URL || process.argv[3] || 'http://127.0.0.1:8080';
const port = Number(process.env.FRONTEND_PORT || process.argv[4] || 4173);

if (!rootDir) {
  console.error('Frontend dist directory is required');
  process.exit(1);
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const type = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(filePath).pipe(res);
}

function proxyRequest(req, res) {
  const targetUrl = new URL(req.url, backendBaseUrl);
  const options = {
    protocol: targetUrl.protocol,
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: `${targetUrl.pathname}${targetUrl.search}`,
    method: req.method,
    headers: {
      ...req.headers,
      host: targetUrl.host,
    },
  };

  const transport = targetUrl.protocol === 'https:' ? require('https') : require('http');
  const proxy = transport.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on('error', (error) => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: 'Backend proxy error', error: error.message }));
  });

  req.pipe(proxy, { end: true });
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  if (req.url.startsWith('/api/')) {
    proxyRequest(req, res);
    return;
  }

  const requestedPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const safePath = path.normalize(requestedPath).replace(/^([.][.][/\\])+/, '');
  const filePath = path.join(rootDir, safePath);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(filePath, res);
      return;
    }

    const fallback = path.join(rootDir, 'index.html');
    fs.stat(fallback, (fallbackErr, fallbackStats) => {
      if (!fallbackErr && fallbackStats.isFile()) {
        sendFile(fallback, res);
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
    });
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${port}`);
  console.log(`Serving ${rootDir}`);
  console.log(`Proxying /api to ${backendBaseUrl}`);
});

