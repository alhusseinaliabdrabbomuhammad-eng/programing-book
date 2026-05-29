/* static-server.cjs — خادم ملفات ثابت بسيط لخدمة تطبيق SPA دون اتصال
 * يخدم index.html والأصول وملفات JSON من جذر المشروع.
 * لا يُستخدم في الإنتاج (Cloudflare Pages يخدم الملفات مباشرة) — للتطوير والاختبار فقط. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json'
};

const server = http.createServer(function (req, res) {
  try {
    var urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';

    var filePath = path.normalize(path.join(ROOT, urlPath));
    // منع الخروج من جذر المشروع
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, function (err, stat) {
      if (err || !stat.isFile()) {
        // SPA fallback: أعِد index.html للمسارات غير الموجودة (التوجيه عبر hash يعمل أصلاً)
        var ext0 = path.extname(filePath);
        if (!ext0) {
          serveFile(path.join(ROOT, 'index.html'), res);
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found: ' + urlPath);
        return;
      }
      serveFile(filePath, res);
    });
  } catch (e) {
    res.writeHead(500);
    res.end('Server error');
  }
});

function serveFile(filePath, res) {
  var ext = path.extname(filePath).toLowerCase();
  var type = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(500);
      res.end('Read error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}

server.listen(PORT, '0.0.0.0', function () {
  console.log('Static server running at http://0.0.0.0:' + PORT + ' (root: ' + ROOT + ')');
});
