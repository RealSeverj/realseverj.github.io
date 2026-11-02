#!/usr/bin/env node
import path from 'node:path'
import { createStaticServer } from './lib/static-server.mjs'

const args = process.argv.slice(2)
function getArg(flag, def) {
  const i = args.indexOf(flag)
  if (i >= 0 && i + 1 < args.length) return args[i + 1]
  return def
}

const root = path.resolve(getArg('-r', process.cwd()))
const host = getArg('-H', '127.0.0.1')
const port = Number(getArg('-p', '5500'))

const server = createStaticServer(root)
server.listen(port, host, () => {
  console.log(`[local-server] Serving ${root} at http://${host}:${port}`)
})
