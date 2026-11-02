import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.flac': 'audio/flac',
  '.ogg': 'audio/ogg',
  '.lrc': 'text/plain; charset=utf-8',
  '.map': 'application/octet-stream'
}

function send(res, code, body, headers = {}) {
  res.writeHead(code, { 'Cache-Control': 'no-cache', ...headers })
  if (body instanceof Buffer) res.end(body)
  else res.end(body ?? '')
}

function safeJoin(rootDir, reqPath) {
  const p = path.normalize(path.join(rootDir, reqPath))
  if (!p.startsWith(rootDir)) return rootDir
  return p
}

/** 创建静态服务，保留原有 MIME、目录首页、404 与 SPA 回退规则。 */
export function createStaticServer(root) {
  return http.createServer((req, res) => {
    const parsed = url.parse(req.url)
    let pathname = decodeURIComponent(parsed.pathname || '/')

    // 默认访问目录 index.html
    let filePath = safeJoin(root, pathname)
    try {
      const stat = fs.existsSync(filePath) && fs.statSync(filePath)
      if (stat && stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html')
      }
    } catch {}

    if (!fs.existsSync(filePath)) {
      const ext = path.extname(pathname).toLowerCase()
      // 静态文件（如 json, mp3, js, css 等）不存在时直接返回 404，防止回退 index.html 破坏 API/数据解析
      if (ext && ext !== '.html' && ext !== '.htm') {
        send(res, 404, 'Not Found')
        return
      }
      // SPA 回退到根 index.html
      filePath = path.join(root, 'index.html')
    }

    try {
      const data = fs.readFileSync(filePath)
      const ext = path.extname(filePath).toLowerCase()
      const type = mime[ext] || 'application/octet-stream'
      send(res, 200, data, { 'Content-Type': type })
    } catch (e) {
      send(res, 500, 'Internal Server Error')
    }
  })
}
