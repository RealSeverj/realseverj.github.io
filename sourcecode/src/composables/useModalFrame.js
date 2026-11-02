import { computed, onMounted, onUnmounted, ref } from 'vue'

export function useModalFrame(props, onClose) {
  const win = ref(null)
  const closeBtn = ref(null)

  const winStyle = computed(() => ({
    width: typeof props.width === 'number' ? props.width + 'px' : props.width,
    height: typeof props.height === 'number' ? props.height + 'px' : props.height
  }))

  const displayUrl = computed(() => props.src.replace(/^https?:\/\//i, '').replace(/\/$/, ''))

  const loading = ref(true)
  const blocked = ref(false)
  let timer

  function onLoad() {
    loading.value = false
    clearTimeout(timer)
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key !== 'Tab' || !win.value) return
    // 焦点循环锁定在弹窗内
    const focusables = win.value.querySelectorAll('a[href], button:not([disabled])')
    if (focusables.length < 2) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  let previousOverflow = ''

  onMounted(() => {
    // 超时提示：若 2.5 秒仍未完成 load，可能存在 CSP 或响应延迟
    timer = setTimeout(() => {
      if (loading.value) blocked.value = true
    }, 2500)
    window.addEventListener('keydown', onKeydown)
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtn.value?.focus()
  })

  onUnmounted(() => {
    clearTimeout(timer)
    window.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = previousOverflow
  })

  return { win, closeBtn, winStyle, displayUrl, loading, blocked, onLoad }
}
