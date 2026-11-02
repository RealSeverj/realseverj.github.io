import { onMounted, onUnmounted } from 'vue'

export function useSpotlight(rootRef) {
  let rafId = 0

  const handleMouseMove = (e) => {
    const target = e.target?.closest?.('.link-card, .article-row')
    if (!target || rafId) return
    const clientX = e.clientX
    const clientY = e.clientY
    rafId = requestAnimationFrame(() => {
      rafId = 0
      const rect = target.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 100
      const y = ((clientY - rect.top) / rect.height) * 100
      target.style.setProperty('--mx', `${x}%`)
      target.style.setProperty('--my', `${y}%`)
    })
  }

  onMounted(() => {
    rootRef.value?.addEventListener('mousemove', handleMouseMove, { passive: true })
  })

  onUnmounted(() => {
    rootRef.value?.removeEventListener('mousemove', handleMouseMove)
    if (rafId) cancelAnimationFrame(rafId)
  })
}

