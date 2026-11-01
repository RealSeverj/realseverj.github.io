import { ref, onMounted, onUnmounted } from 'vue'

export function useResponsiveSidebar(breakpoint = 1200) {
  const isSidebarCollapsed = ref(false)
  const isMobile = ref(false)
  let mq = null

  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  function handleBreakpoint(e) {
    isMobile.value = e.matches
    if (e.matches) {
      isSidebarCollapsed.value = true
    }
  }

  onMounted(() => {
    mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    handleBreakpoint(mq)
    if (mq.addEventListener) {
      mq.addEventListener('change', handleBreakpoint)
    } else if (mq.addListener) {
      mq.addListener(handleBreakpoint)
    }
  })

  onUnmounted(() => {
    if (mq) {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handleBreakpoint)
      } else if (mq.removeListener) {
        mq.removeListener(handleBreakpoint)
      }
    }
  })

  return {
    isSidebarCollapsed,
    isMobile,
    toggleSidebar
  }
}

