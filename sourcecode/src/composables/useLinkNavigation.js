import { ref } from 'vue'
import { isComponentPath, isExternalUrl, toComponentUrl } from '../lib/links.js'

/** 独立子站使用小窗；其他链接保留原有的跳转方式。 */
export function useLinkNavigation() {
  const modalSrc = ref('')

  function handleLinkClick(link) {
    const href = link.href || ''
    if (isComponentPath(href)) {
      modalSrc.value = toComponentUrl(href)
      return
    }
    if (isExternalUrl(href)) {
      window.open(href, '_blank', 'noopener')
      return
    }
    window.location.href = href
  }

  return { modalSrc, handleLinkClick }
}
