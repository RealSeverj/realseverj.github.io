import { onMounted, onUnmounted } from 'vue'

export function useBackgroundParallax(stageRef) {
  // 鼠标微视差逻辑：平滑阻尼微幅位移，带来空气景深
  let currentX = 0
  let currentY = 0
  let targetX = 0
  let targetY = 0
  let rafId = 0
  let isReduced = false

  function onPointerMove(e) {
    if (isReduced) return
    if (e.pointerType === 'touch') return
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    const nx = (e.clientX - cx) / cx
    const ny = (e.clientY - cy) / cy
    // 最大位移仅 ±10px 反向微视差，克制且平稳
    targetX = -nx * 10
    targetY = -ny * 8
  }

  function updateParallax() {
    currentX += (targetX - currentX) * 0.05
    currentY += (targetY - currentY) * 0.05

    if (stageRef.value) {
      stageRef.value.style.setProperty('--parallax-x', `${currentX.toFixed(2)}px`)
      stageRef.value.style.setProperty('--parallax-y', `${currentY.toFixed(2)}px`)
    }
    rafId = requestAnimationFrame(updateParallax)
  }

  onMounted(() => {
    isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isReduced) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      rafId = requestAnimationFrame(updateParallax)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('pointermove', onPointerMove)
    if (rafId) cancelAnimationFrame(rafId)
  })
}
