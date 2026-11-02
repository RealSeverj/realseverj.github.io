import { onMounted, onUnmounted } from 'vue'

// Native scroll drives the scene. A short pause after a deliberate gesture
// settles only the opening transition; the reading area stays free to scroll.
export function useSceneScroll(rootRef, openingRef, contentRef) {
  let frame = 0
  let openingHeight = 1
  let lastScrollY = 0
  let lastInputAt = -Infinity
  let direction = 0
  let settleTimer = 0
  let completionTimer = 0
  let autoTarget = null
  let resizeObserver
  let reducedMotion

  function update() {
    frame = 0
    const root = rootRef.value
    if (!root) return
    const distance = Math.max(0, window.scrollY)
    const position = Math.min(1, distance / (openingHeight * 0.78))
    const progress = position * position * (3 - 2 * position)
    const ink = [24, 63, 74].map((channel) => Math.round(channel + (245 - channel) * progress))
    root.style.setProperty('--scene-progress', progress.toFixed(4))
    root.style.setProperty('--intro-opacity', Math.max(0, 1 - distance / (openingHeight * 0.55)).toFixed(4))
    root.style.setProperty('--scene-ink', `rgb(${ink.join(', ')})`)
  }

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(update)
  }

  function finishSettle() {
    autoTarget = null
    window.clearTimeout(completionTimer)
  }

  function interruptSettle() {
    window.clearTimeout(settleTimer)
    if (autoTarget !== null) {
      finishSettle()
      window.scrollTo({ top: window.scrollY, behavior: 'instant' })
    }
  }

  function settle() {
    if (reducedMotion?.matches || performance.now() - lastInputAt > 1400) return
    const y = Math.max(0, window.scrollY)
    const landing = Math.max(0, (contentRef.value?.offsetTop ?? openingHeight) - 24)
    let target = null
    if (direction > 0 && y >= 48 && y < landing * 0.85) target = landing
    if (direction < 0 && y > 0 && y < landing * 0.7) target = 0
    if (target === null) return
    autoTarget = target
    window.scrollTo({ top: target, behavior: 'smooth' })
    completionTimer = window.setTimeout(finishSettle, 1200)
  }

  function onScroll() {
    const y = Math.max(0, window.scrollY)
    const delta = y - lastScrollY
    lastScrollY = y
    schedule()
    if (autoTarget !== null) {
      if (Math.abs(y - autoTarget) < 2) finishSettle()
      return
    }
    if (Math.abs(delta) > 0.5) direction = Math.sign(delta)
    window.clearTimeout(settleTimer)
    if (performance.now() - lastInputAt < 1400 && y > 0 && y < openingHeight) {
      settleTimer = window.setTimeout(settle, 120)
    }
  }

  function isNestedControl(target) {
    return target?.closest?.('#music-details, .modal-root, input, textarea, select, [contenteditable="true"]')
  }

  function onWheel(event) {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || isNestedControl(event.target)) return
    interruptSettle()
    lastInputAt = performance.now()
  }

  function onTouchStart(event) {
    if (isNestedControl(event.target)) return
    interruptSettle()
    lastInputAt = performance.now()
  }

  function onKeydown(event) {
    if (isNestedControl(event.target)) return
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(event.key)) {
      interruptSettle()
      lastInputAt = performance.now()
    }
  }

  function onPointerDown() {
    interruptSettle()
    lastInputAt = -Infinity
  }

  function onFocusIn(event) {
    if (event.target?.closest?.('a, button, input, textarea, select')) {
      interruptSettle()
      lastInputAt = -Infinity
    }
  }

  function onLinkClick(event) {
    if (event.target?.closest?.('a[href]')) {
      interruptSettle()
      lastInputAt = -Infinity
    }
  }

  function measure() {
    interruptSettle()
    openingHeight = openingRef.value?.offsetHeight || window.innerHeight
    lastScrollY = Math.max(0, window.scrollY)
    schedule()
  }

  onMounted(() => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('click', onLinkClick)
    window.addEventListener('focusin', onFocusIn)
    window.addEventListener('resize', measure)
    window.addEventListener('pageshow', measure)
    resizeObserver = new ResizeObserver(measure)
    if (openingRef.value) resizeObserver.observe(openingRef.value)
  })

  onUnmounted(() => {
    interruptSettle()
    window.cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('click', onLinkClick)
    window.removeEventListener('focusin', onFocusIn)
    window.removeEventListener('resize', measure)
    window.removeEventListener('pageshow', measure)
    resizeObserver?.disconnect()
  })
}
