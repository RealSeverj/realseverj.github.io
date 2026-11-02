import { ref, onMounted } from 'vue'
import { loadLinks } from '../services/links.js'

export function useLinkSections() {
  const sections = ref([])
  const loadError = ref('')
  const isLoading = ref(true)

  async function fetchSections() {
    isLoading.value = true
    loadError.value = ''
    try {
      sections.value = await loadLinks()
    } catch (error) {
      loadError.value = error?.message || '未知错误'
    } finally {
      isLoading.value = false
    }
  }

  onMounted(fetchSections)

  return { sections, loadError, isLoading, fetchSections }
}
