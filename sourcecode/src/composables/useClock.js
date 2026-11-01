import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useClock() {
  const now = ref(new Date())
  let timer = null

  const dateText = computed(() => {
    const y = now.value.getFullYear()
    const m = now.value.getMonth() + 1
    const d = now.value.getDate()
    return `${y} 年 ${m} 月 ${d < 10 ? '0' + d : d} 日`
  })

  const weekdayText = computed(() => {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return days[now.value.getDay()]
  })

  const timeText = computed(() => {
    const h = String(now.value.getHours()).padStart(2, '0')
    const m = String(now.value.getMinutes()).padStart(2, '0')
    const s = String(now.value.getSeconds()).padStart(2, '0')
    return `${h}:${m}:${s}`
  })

  function updateTime() {
    now.value = new Date()
  }

  onMounted(() => {
    updateTime()
    timer = setInterval(updateTime, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    now,
    dateText,
    weekdayText,
    timeText
  }
}

