import { ref, nextTick, onMounted, onUnmounted } from 'vue'

/** 歌单面板的开关、焦点恢复和全局事件清理。 */
export function useMusicDetails() {
  const container = ref(null)
  const detailsToggle = ref(null)
  const detailsClose = ref(null)
  const showDetails = ref(false)

  function closeDetails(restoreFocus = false) {
    showDetails.value = false
    if (restoreFocus) detailsToggle.value?.focus({ preventScroll: true })
  }

  async function toggleDetails() {
    if (showDetails.value) {
      closeDetails()
      return
    }
    showDetails.value = true
    await nextTick()
    detailsClose.value?.focus({ preventScroll: true })
  }

  function onOutsidePointer(event) {
    if (showDetails.value && !container.value?.contains(event.target)) closeDetails()
  }

  function onKeydown(event) {
    if (event.key === 'Escape' && showDetails.value) {
      event.preventDefault()
      closeDetails(true)
    }
  }

  function onPageScroll() {
    if (showDetails.value) closeDetails()
  }

  onMounted(() => {
    document.addEventListener('pointerdown', onOutsidePointer)
    document.addEventListener('keydown', onKeydown)
    window.addEventListener('scroll', onPageScroll, { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('pointerdown', onOutsidePointer)
    document.removeEventListener('keydown', onKeydown)
    window.removeEventListener('scroll', onPageScroll)
  })

  return { container, detailsToggle, detailsClose, showDetails, closeDetails, toggleDetails }
}
