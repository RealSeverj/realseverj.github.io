export function findSection(sections, id) {
  return Array.isArray(sections) ? sections.find((section) => section.id === id) : undefined
}

export function isComponentPath(href) {
  return /^\/components\//.test(href) || href.startsWith('./components/') || href.startsWith('/components/')
}

export function isExternalUrl(href) {
  return /^https?:\/\//i.test(href)
}

export function toComponentUrl(href) {
  return href.replace(/^\.\//, '/').replace(/^(?!https?:|\/)/, '/')
}

export function decorateLinks(links = []) {
  return links.map(link => ({ ...link, intercept: isComponentPath(link.href) }))
}

export function resolveLinkImage(image) {
  if (!image) return ''
  if (isExternalUrl(image) || image.startsWith('/')) return image
  return `/${image}`
}

export function inferLinkIcon({ icon, label, description }) {
  if (icon) return icon
  const text = `${label || ''} ${description || ''}`
  if (text.includes('缓存') || text.includes('Cache')) return 'cache'
  if (text.includes('概率') || text.includes('MathDis')) return 'math'
  if (text.includes('图形') || text.includes('Graph')) return 'chart'
  if (text.includes('音乐') || text.includes('Musi')) return 'music'
  if (text.includes('解锁') || text.includes('Unlock')) return 'unlock'
  if (text.includes('导航') || text.includes('Nav')) return 'compass'
  if (text.includes('翻译') || text.includes('Trans')) return 'translate'
  if (text.includes('博客')) return 'blog'
  if (text.includes('公众号')) return 'newspaper'
  return 'link'
}
