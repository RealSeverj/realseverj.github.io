import { spawn } from 'node:child_process'
import { readFile, lstat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = fileURLToPath(new URL('../', import.meta.url))
const repoRoot = path.resolve(sourceRoot, '..')
const envPath = path.join(sourceRoot, '.env.deploy.local')

async function loadDeployConfig() {
  const config = {
    DEPLOY_HOST: process.env.DEPLOY_HOST || '',
    DEPLOY_PORT: process.env.DEPLOY_PORT || '22',
    DEPLOY_USER: process.env.DEPLOY_USER || 'root',
    DEPLOY_PATH: process.env.DEPLOY_PATH || '',
  }
  try {
    const raw = await readFile(envPath, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      if (key in config && !process.env[key]) {
        config[key] = val
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
  if (!config.DEPLOY_HOST || !config.DEPLOY_PATH) {
    throw new Error('缺少服务器配置，请检查 sourcecode/.env.deploy.local 中的 DEPLOY_HOST 与 DEPLOY_PATH')
  }
  return config
}

const args = new Set(process.argv.slice(2))
const quickMode = args.has('--quick')

// --quick 模式仅同步代码、配置、图标与图片（跳过体积较大的 music/ 和 components/ 独立子站）
const itemsToSync = quickMode
  ? ['index.html', 'links.json', 'vite.svg', 'assets', 'icon', 'img']
  : ['index.html', 'links.json', 'vite.svg', 'assets', 'icon', 'img', 'music', 'components']

for (const item of itemsToSync) {
  const stat = await lstat(path.join(repoRoot, item)).catch(() => null)
  if (!stat) {
    throw new Error(`本地缺少待同步文件或目录: ${item}，请先运行 npm run deploy`)
  }
}

const { DEPLOY_HOST, DEPLOY_PORT, DEPLOY_USER, DEPLOY_PATH } = await loadDeployConfig()
const target = `${DEPLOY_USER}@${DEPLOY_HOST}`

console.log(`[deploy-remote] 目标服务器: ${target}:${DEPLOY_PATH} (${quickMode ? '快速模式：跳过 music/ 与 components/' : '全量模式'})`)

// 远端预创建目录并清理旧的 assets 与旧版带特殊字符的音乐文件（清理后解压覆盖，并统一修正属主为 www:www）
const remoteCmd = quickMode
  ? `mkdir -p '${DEPLOY_PATH}' && rm -rf '${DEPLOY_PATH}/assets' && tar --no-same-owner --no-same-permissions -xzf - -C '${DEPLOY_PATH}' && (chown -R www:www '${DEPLOY_PATH}/index.html' '${DEPLOY_PATH}/links.json' '${DEPLOY_PATH}/vite.svg' '${DEPLOY_PATH}/assets' '${DEPLOY_PATH}/icon' '${DEPLOY_PATH}/img' 2>/dev/null || true)`
  : `mkdir -p '${DEPLOY_PATH}' && rm -rf '${DEPLOY_PATH}/assets' '${DEPLOY_PATH}/music' && tar --no-same-owner --no-same-permissions -xzf - -C '${DEPLOY_PATH}' && (chown -R www:www '${DEPLOY_PATH}/index.html' '${DEPLOY_PATH}/links.json' '${DEPLOY_PATH}/vite.svg' '${DEPLOY_PATH}/assets' '${DEPLOY_PATH}/icon' '${DEPLOY_PATH}/img' '${DEPLOY_PATH}/music' '${DEPLOY_PATH}/components' 2>/dev/null || true)`

await new Promise((resolve, reject) => {
  const tar = spawn('tar', ['-czf', '-', '-C', repoRoot, ...itemsToSync], {
    stdio: ['ignore', 'pipe', 'inherit'],
  })

  const ssh = spawn(
    'ssh',
    ['-p', DEPLOY_PORT, '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', target, remoteCmd],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  )

  tar.stdout.pipe(ssh.stdin)

  tar.on('error', err => reject(new Error(`本地 tar 打包失败: ${err.message}`)))
  ssh.on('error', err => reject(new Error(`SSH 启动失败: ${err.message}`)))

  ssh.on('close', code => {
    if (code === 0) {
      console.log(`[deploy-remote] 同步完成 -> ${target}:${DEPLOY_PATH}`)
      resolve()
    } else {
      reject(new Error(`SSH 同步退出码 ${code}（请确认已将公钥导入服务器 ~/.ssh/authorized_keys）`))
    }
  })
})

