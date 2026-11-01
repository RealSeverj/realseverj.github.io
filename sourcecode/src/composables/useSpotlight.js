import { onMounted, onUnmounted } from 'vue'

export function useSpotlight(rootRef) {
  const handleMouseMove = (e) => {
    const target = e.target?.closest?.('.link-card')
    if (!target) return
    const rect = target.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    target.style.setProperty('--mx', `${x}%`)
    target.style.setProperty('--my', `${y}%`)
  }

  onMounted(() => {
    rootRef.value?.addEventListener('mousemove', handleMouseMove)
  })

  onUnmounted(() => {
    rootRef.value?.removeEventListener('mousemove', handleMouseMove)
  })
}

