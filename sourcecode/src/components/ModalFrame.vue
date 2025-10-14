<template>
  <div class="modal-root" role="dialog" aria-modal="true" @keydown.esc="onClose">
    <div class="backdrop" @click="onClose" />
    <div class="window" ref="win" :style="winStyle">
      <header class="titlebar">
        <div class="dots" aria-hidden="true">
          <span class="dot dot--red" />
          <span class="dot dot--yellow" />
          <span class="dot dot--green" />
        </div>
        <div class="address">
          <span class="addr-text">{{ displayUrl }}</span>
        </div>
        <div class="actions">
          <a :href="src" target="_blank" rel="noreferrer" title="新标签打开">↗</a>
          <button class="close-btn" type="button" @click="onClose" aria-label="关闭">✕</button>
        </div>
      </header>
      <div class="content" :aria-busy="loading">
        <div v-if="loading" class="overlay" aria-live="polite">
          <div class="loader">
            <div class="spinner"></div>
            <div class="tip">正在加载页面…</div>
          </div>
          <div v-if="blocked" class="blocked">
            <p>加载时间较长，可能是服务器响应慢，或目标站点不允许在 iframe 中加载。</p>
            <a class="open-tab" :href="src" target="_blank" rel="noreferrer">在新标签打开 ↗</a>
          </div>
        </div>
        <iframe :src="src" title="Embedded page" frameborder="0" @load="onLoad" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  width: { type: [Number, String], default: '90vw' },
  height: { type: [Number, String], default: '85vh' }
})
const emit = defineEmits(['close'])
const win = ref(null)
const onClose = () => emit('close')

const winStyle = computed(() => ({
  width: typeof props.width === 'number' ? props.width + 'px' : props.width,
  height: typeof props.height === 'number' ? props.height + 'px' : props.height
}))

const displayUrl = computed(() => props.src.replace(/^https?:\/\/|\/$/g, ''))

const loading = ref(true)
const blocked = ref(false)
let timer
function onLoad() {
  loading.value = false
  clearTimeout(timer)
}

// 若 2.5 秒仍未触发 load，可能被阻止
onMounted(() => {
  timer = setTimeout(() => { if (loading.value) blocked.value = true }, 2500)
})

onMounted(() => {
  // 聚焦以支持 Esc 关闭
  win.value?.focus?.()
})
</script>

<style scoped>
.modal-root {
  position: fixed; inset: 0; z-index: 1000;
  display: grid; place-items: center;
}
.backdrop {
  position: absolute; inset: 0;
  background: rgba(4, 6, 18, 0.55);
  backdrop-filter: blur(6px) saturate(120%);
  animation: fade-in 200ms ease both;
}
.window {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(140, 165, 255, 0.25);
  background: rgba(14, 18, 40, 0.85);
  box-shadow: 0 30px 120px rgba(6, 10, 26, 0.6);
  transform-origin: center;
  animation: pop-in 220ms ease-out both;
}

.titlebar {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center;
  gap: 12px; padding: 8px 10px; border-bottom: 1px solid rgba(140,165,255,0.18);
  background: linear-gradient(180deg, rgba(20, 26, 56, 0.7), rgba(16, 22, 48, 0.5));
}
.dots { display: inline-flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; opacity: .8; }
.dot--red { background: #ff5f57; }
.dot--yellow { background: #ffbd2e; }
.dot--green { background: #28c840; }

.address { min-width: 0; }
.addr-text { display: block; color: rgba(215,225,255,.85); font-size: .9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.actions { display: inline-flex; align-items: center; gap: 6px; }
.actions a { color: rgba(220,230,255,.9); text-decoration: none; font-size: 14px; }
.close-btn { cursor: pointer; border: none; background: transparent; color: rgba(220,230,255,.8); font-size: 14px; }

.content { position: relative; width: 100%; height: calc(100% - 40px); background: #0b0f22; }
.content iframe { position: relative; z-index: 0; width: 100%; height: 100%; display: block; }

.overlay { position: absolute; inset: 0; z-index: 1; display: grid; place-items: center; text-align: center; padding: 0 16px; background: rgba(6,10,26,0.6); backdrop-filter: blur(4px) saturate(120%); }
.loader { display: grid; place-items: center; }
.spinner {
  width: 44px; height: 44px; border-radius: 50%;
  border: 3px solid rgba(180, 200, 255, 0.28);
  border-top-color: rgba(180, 200, 255, 0.9);
  animation: spin 1s linear infinite;
}
.tip { margin-top: 12px; color: rgba(210,220,255,.85); font-size: .95rem; }
.blocked { display: grid; place-items: center; }
.open-tab { margin-top: 8px; display: inline-block; color: #cfe0ff; text-decoration: none; border-bottom: 1px dashed rgba(200,210,255,.6); }

@keyframes spin { to { transform: rotate(360deg) } }

@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes pop-in { from { transform: scale(.98); opacity: 0 } to { transform: scale(1); opacity: 1 } }
</style>