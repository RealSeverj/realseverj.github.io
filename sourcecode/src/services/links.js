/**
 * 站点入口数据的唯一加载入口。
 *
 * 内容维护在 sourcecode/public/links.json，部署时由 scripts/deploy.mjs
 * 同步到仓库根目录，线上通过 fetch('/links.json') 读取。
 * 这里对请求做一次缓存，避免 HomeView / ArticleList 各拉一遍。
 */
let pending = null

export function loadLinks() {
  if (!pending) {
    pending = fetch('/links.json', { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => (data && Array.isArray(data.sections) ? data.sections : []))
      .catch((error) => {
        // 失败后允许调用方重试
        pending = null
        throw error
      })
  }
  return pending
}

