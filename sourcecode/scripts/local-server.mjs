#!/usr/bin/env node
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const args = process.argv.slice(2)
function getArg(flag, def) {
  const i = args.indexOf(flag)
  if (i >= 0 && i + 1 < args.length) return args[i + 1]
  return def
}

const root = path.resolve(getArg('-r', process.cwd()))
const host = getArg('-H', '127.0.0.1')
const port = Number(getArg('-p', '5500'))

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

const server = http.createServer((req, res) => {
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
    // SPA 回退到根 index.html（如 /music 等仍按其自身 index.html 生效）
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

server.listen(port, host, () => {
  console.log(`[local-server] Serving ${root} at http://${host}:${port}`)
})
