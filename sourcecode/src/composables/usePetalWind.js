import { onMounted, onUnmounted } from 'vue'

export function usePetalWind(containerRef) {
  // 交互微风动力学：鼠标滑动时产生微小、平滑的阻尼风偏
  let windX = 0
  let windY = 0
  let targetWindX = 0
  let targetWindY = 0
  let lastX = 0
  let lastY = 0
  let lastTime = 0
  let rafId = 0
  let isReduced = false

  function onPointerMove(e) {
    if (isReduced) return
    const now = performance.now()
    if (lastTime > 0) {
      const dt = Math.max(16, now - lastTime)
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      // 限制微风最大偏转在 ±16px，保持绝对克制优雅
      targetWindX = Math.max(-16, Math.min(16, (dx / dt) * 10))
      targetWindY = Math.max(-12, Math.min(12, (dy / dt) * 8))
    }
    lastX = e.clientX
    lastY = e.clientY
    lastTime = now
  }

  function updateWind() {
    windX += (targetWindX - windX) * 0.06
    windY += (targetWindY - windY) * 0.06
    targetWindX *= 0.94
    targetWindY *= 0.94

    if (containerRef.value) {
      containerRef.value.style.setProperty('--breeze-wind-x', `${windX.toFixed(2)}px`)
      containerRef.value.style.setProperty('--breeze-wind-y', `${windY.toFixed(2)}px`)
    }
    rafId = requestAnimationFrame(updateWind)
  }

  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    isReduced = mediaQuery.matches
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    if (!isReduced) {
      rafId = requestAnimationFrame(updateWind)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('pointermove', onPointerMove)
    if (rafId) cancelAnimationFrame(rafId)
  })
}
