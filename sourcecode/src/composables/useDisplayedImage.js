import { ref, watch, onUnmounted } from 'vue'

export function useDisplayedImage(getSource) {
  const displayedImage = ref('')
  let loadToken = 0

  watch(getSource, (newSrc) => {
    const token = ++loadToken
    if (!newSrc) {
      displayedImage.value = ''
      return
    }
    const img = new Image()
    img.onload = () => {
      if (token === loadToken) displayedImage.value = newSrc
    }
    img.src = newSrc
  }, { immediate: true })

  onUnmounted(() => { loadToken++ })

  return displayedImage
}
