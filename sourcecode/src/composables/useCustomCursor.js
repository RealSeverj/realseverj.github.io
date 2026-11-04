import { ref, onMounted, onUnmounted } from 'vue'

const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, label, [role="button"], [role="tab"]'

export function useCustomCursor() {
  const ringRef = ref(null)
  const isVisible = ref(false)
  const isHovering = ref(false)
  const isPressed = ref(false)
  const bursts = ref([])

  let targetX = -100
  let targetY = -100
  let ringX = -100
  let ringY = -100
  let rafId = 0
  let isReducedMotion = false
  let isFinePointer = false
  let burstIdCounter = 0
  const timers = new Set()

  function startRingLoop() {
    if (!rafId && !isReducedMotion && isFinePointer) {
      rafId = requestAnimationFrame(updateRing)
    }
  }

  function updateRing() {
    ringX += (targetX - ringX) * 0.24
    ringY += (targetY - ringY) * 0.24

    if (ringRef.value) {
      ringRef.value.style.setProperty('--ring-x', `${ringX.toFixed(2)}px`)
      ringRef.value.style.setProperty('--ring-y', `${ringY.toFixed(2)}px`)
    }

    if (Math.abs(targetX - ringX) > 0.08 || Math.abs(targetY - ringY) > 0.08) {
      rafId = requestAnimationFrame(updateRing)
    } else {
      rafId = 0
    }
  }

  function onPointerMove(e) {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return

    const firstAppear = !isVisible.value
    targetX = e.clientX
    targetY = e.clientY

    if (firstAppear) {
      ringX = targetX
      ringY = targetY
      isVisible.value = true
    }

    if (isReducedMotion) {
      if (ringRef.value) {
        ringRef.value.style.setProperty('--ring-x', `${targetX}px`)
        ringRef.value.style.setProperty('--ring-y', `${targetY}px`)
      }
    } else {
      startRingLoop()
    }
  }

  function onPointerOver(e) {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
    const hit = Boolean(e.target?.closest?.(INTERACTIVE_SELECTOR))
    if (hit !== isHovering.value) {
      isHovering.value = hit
    }
  }

  function spawnBurst(x, y) {
    const id = ++burstIdCounter
    const baseAngle = Math.random() * Math.PI * 2
    const sparks = isReducedMotion
      ? []
      : Array.from({ length: 5 }, (_, i) => {
          const angle = baseAngle + (i * Math.PI * 2) / 5 + (Math.random() - 0.5) * 0.35
          const dist = 20 + Math.random() * 16
          const dx = Math.cos(angle) * dist
          const dy = Math.sin(angle) * dist
          const rot = Math.round((angle * 180) / Math.PI + 45)
          const scale = (0.72 + Math.random() * 0.38).toFixed(2)
          return {
            id: i,
            dx: `${dx.toFixed(1)}px`,
            dy: `${dy.toFixed(1)}px`,
            rot: `${rot}deg`,
            scale,
            variant: i % 2 === 0 ? 'ice' : 'moon',
          }
        })

    bursts.value.push({ id, x, y, sparks })
    if (bursts.value.length > 6) {
      bursts.value.shift()
    }

    const timer = setTimeout(() => {
      timers.delete(timer)
      const idx = bursts.value.findIndex(b => b.id === id)
      if (idx !== -1) bursts.value.splice(idx, 1)
    }, 680)
    timers.add(timer)
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
    isPressed.value = true
    spawnBurst(e.clientX, e.clientY)
  }

  function onPointerUp() {
    isPressed.value = false
  }

  function onPointerLeave() {
    isVisible.value = false
    isPressed.value = false
    isHovering.value = false
  }

  function onWindowBlur() {
    isVisible.value = false
    isPressed.value = false
  }

  onMounted(() => {
    isFinePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches ?? false
    isReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false

    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerUp, { passive: true })

    if (isFinePointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerover', onPointerOver, { passive: true })
      document.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true })
      window.addEventListener('blur', onWindowBlur)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerover', onPointerOver)
    document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    window.removeEventListener('blur', onWindowBlur)

    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    for (const timer of timers) clearTimeout(timer)
    timers.clear()
  })

  return {
    ringRef,
    isVisible,
    isHovering,
    isPressed,
    bursts,
  }
}

