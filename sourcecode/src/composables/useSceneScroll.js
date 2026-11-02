import { onMounted, onUnmounted } from 'vue'

// Smooth two-stage transition between #opening and #discover, while keeping
// the #discover reading area completely free to scroll natively.
export function useSceneScroll(rootRef, openingRef, contentRef) {
  let frame = 0
  let glideFrame = 0
  let openingHeight = 1
  let lastScrollY = 0
  let lastInputAt = -Infinity
  let lastDeepScrollAt = -Infinity
  let direction = 0
  let settleTimer = 0
  let autoTarget = null
  let isPointerDown = false
  let resizeObserver
  let reducedMotion

  function getLandingY() {
    const raw = contentRef.value?.offsetTop ?? openingHeight
    return Math.max(0, raw - 20)
  }

  function update() {
    frame = 0
    const root = rootRef.value
    if (!root) return
    const distance = Math.max(0, window.scrollY)
    const position = Math.min(1, distance / (openingHeight * 0.78))
    const progress = position * position * (3 - 2 * position)
    root.style.setProperty('--scene-progress', progress.toFixed(4))
    root.style.setProperty('--intro-opacity', Math.max(0, 1 - distance / (openingHeight * 0.58)).toFixed(4))
  }

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(update)
  }

  function stopGlide() {
    window.clearTimeout(settleTimer)
    if (glideFrame) {
      window.cancelAnimationFrame(glideFrame)
      glideFrame = 0
    }
    autoTarget = null
  }

  function startGlide(target, customDuration) {
    if (autoTarget === target && glideFrame) return
    stopGlide()
    const startY = Math.max(0, window.scrollY)
    const distance = target - startY
    if (Math.abs(distance) < 1.5) {
      window.scrollTo({ top: target, behavior: 'instant' })
      schedule()
      return
    }
    if (reducedMotion?.matches) {
      window.scrollTo({ top: target, behavior: 'instant' })
      schedule()
      return
    }

    autoTarget = target
    const duration = customDuration ?? Math.min(520, Math.max(280, Math.abs(distance) * 0.52))
    const startTime = performance.now()

    function step(now) {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / duration)
      // Cubic ease-out: immediate initial velocity, smooth deceleration
      const eased = 1 - Math.pow(1 - t, 3)
      const nextY = startY + distance * eased
      window.scrollTo({ top: nextY, behavior: 'instant' })
      lastScrollY = Math.max(0, window.scrollY)
      schedule()

      if (t < 1 && autoTarget !== null) {
        glideFrame = window.requestAnimationFrame(step)
      } else {
        glideFrame = 0
        autoTarget = null
      }
    }

    glideFrame = window.requestAnimationFrame(step)
  }

  function settle() {
    if (isPointerDown || reducedMotion?.matches || performance.now() - lastInputAt > 1600) return
    const y = Math.max(0, window.scrollY)
    const landing = getLandingY()
    if (y <= 1 || y >= landing - 1) return

    let target = null
    if (direction > 0) {
      target = y >= 24 ? landing : 0
    } else if (direction < 0) {
      target = y <= landing - 24 ? 0 : landing
    }
    if (target !== null) startGlide(target)
  }

  function onScroll() {
    const y = Math.max(0, window.scrollY)
    const delta = y - lastScrollY
    lastScrollY = y
    schedule()

    const landing = getLandingY()
    if (y > landing + 16) {
      lastDeepScrollAt = performance.now()
    }

    if (autoTarget !== null) return

    if (Math.abs(delta) > 0.4) direction = Math.sign(delta)
    window.clearTimeout(settleTimer)
    if (!isPointerDown && performance.now() - lastInputAt < 1600 && y > 1 && y < landing - 1) {
      settleTimer = window.setTimeout(settle, 90)
    }
  }

  function isNestedControl(target) {
    return target?.closest?.('#music-details, .playlist-items, .lyrics-scroll, .modal-root, input, textarea, select, [contenteditable="true"]')
  }

  function onWheel(event) {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || isNestedControl(event.target)) return
    const dy = event.deltaY
    const wheelDir = Math.sign(dy)
    if (wheelDir === 0) return

    const now = performance.now()
    direction = wheelDir
    lastInputAt = now

    const y = Math.max(0, window.scrollY)
    const landing = getLandingY()

    // While a glide is active in the transition zone:
    // - Same-direction wheel events are absorbed cleanly so they never stutter
    // - Opposite-direction wheel events immediately reverse the glide
    if (autoTarget !== null) {
      if (y <= landing + 4) {
        event.preventDefault()
        const movingDir = Math.sign(autoTarget - y)
        if (movingDir !== 0 && wheelDir !== movingDir) {
          startGlide(wheelDir > 0 ? landing : 0)
        }
      } else {
        stopGlide()
      }
      return
    }

    // One-step smooth glide when scrolling down from #opening
    if (wheelDir > 0 && y < landing - 2 && Math.abs(dy) >= 4) {
      event.preventDefault()
      startGlide(landing)
      return
    }

    // One-step smooth glide when scrolling up from the top of #discover into #opening
    const cooledFromDeepScroll = now - lastDeepScrollAt > 180
    if (wheelDir < 0 && y > 0 && (y < landing - 28 || (y <= landing + 6 && cooledFromDeepScroll)) && Math.abs(dy) >= 4) {
      event.preventDefault()
      startGlide(0)
      return
    }
  }

  function onTouchStart(event) {
    if (isNestedControl(event.target)) return
    isPointerDown = true
    stopGlide()
    lastInputAt = performance.now()
  }

  function onTouchEnd() {
    if (!isPointerDown) return
    isPointerDown = false
    lastInputAt = performance.now()
    const y = Math.max(0, window.scrollY)
    const landing = getLandingY()
    if (y > 1 && y < landing - 1) {
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(settle, 80)
    }
  }

  function onKeydown(event) {
    if (isNestedControl(event.target)) return
    const y = Math.max(0, window.scrollY)
    const landing = getLandingY()
    if (['ArrowDown', 'PageDown', ' '].includes(event.key) && y < landing - 4) {
      event.preventDefault()
      direction = 1
      startGlide(landing)
      return
    }
    if (['ArrowUp', 'PageUp'].includes(event.key) && y > 0 && y <= landing + 6) {
      event.preventDefault()
      direction = -1
      startGlide(0)
      return
    }
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(event.key)) {
      stopGlide()
      lastInputAt = performance.now()
    }
  }

  function onPointerDown(event) {
    if (isNestedControl(event.target)) return
    if (!event.target?.closest?.('a[href], button')) {
      stopGlide()
    }
  }

  function onLinkClick(event) {
    const anchor = event.target?.closest?.('a[href^="#"]')
    if (!anchor) return
    const hash = anchor.getAttribute('href')
    if (!hash || hash === '#') return
    const targetEl = document.querySelector(hash)
    if (!targetEl) return

    event.preventDefault()
    lastInputAt = -Infinity
    let targetY = 0
    if (hash === '#opening') {
      targetY = 0
    } else if (hash === '#discover' || hash === '#site') {
      targetY = getLandingY()
    } else {
      const rect = targetEl.getBoundingClientRect()
      targetY = Math.max(getLandingY(), window.scrollY + rect.top - 88)
    }
    startGlide(targetY, 500)
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash)
    }
  }

  function measure() {
    stopGlide()
    openingHeight = openingRef.value?.offsetHeight || window.innerHeight
    lastScrollY = Math.max(0, window.scrollY)
    schedule()
  }

  onMounted(() => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('click', onLinkClick)
    window.addEventListener('resize', measure)
    window.addEventListener('pageshow', measure)
    resizeObserver = new ResizeObserver(measure)
    if (openingRef.value) resizeObserver.observe(openingRef.value)
  })

  onUnmounted(() => {
    stopGlide()
    window.cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('touchcancel', onTouchEnd)
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('click', onLinkClick)
    window.removeEventListener('resize', measure)
    window.removeEventListener('pageshow', measure)
    resizeObserver?.disconnect()
  })
}
