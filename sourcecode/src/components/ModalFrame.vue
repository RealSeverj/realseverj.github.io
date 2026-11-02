<template>
  <div class="modal-root" role="dialog" aria-modal="true" :aria-label="`小窗预览：${displayUrl}`">
    <div class="backdrop" @click="onClose" />
    <div class="window" ref="win" :style="winStyle">
      <header class="titlebar">
        <!-- 柔和微光三色指示点 -->
        <div class="dots" aria-hidden="true">
          <span class="dot dot--red" />
          <span class="dot dot--yellow" />
          <span class="dot dot--green" />
        </div>

        <!-- 磨砂晶莹地址胶囊 -->
        <div class="address" :title="src">
          <svg class="addr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span class="addr-text">{{ displayUrl }}</span>
        </div>

        <!-- 微光操作按钮组 -->
        <div class="actions">
          <a
            class="action-btn"
            :href="src"
            target="_blank"
            rel="noreferrer"
            title="在新标签页中打开"
            aria-label="在新标签页中打开"
          >
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <button
            ref="closeBtn"
            class="action-btn action-btn--close"
            type="button"
            @click="onClose"
            title="关闭预览 (Esc)"
            aria-label="关闭预览"
          >
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      <div class="content" :aria-busy="loading">
        <transition name="fade">
          <div v-if="loading" class="overlay" aria-live="polite">
            <div class="loader-card">
              <div class="spinner-ring">
                <div class="spinner-core" />
              </div>
              <div class="tip">正在安全载入页面…</div>

              <div v-if="blocked" class="blocked-tip">
                <p class="blocked-text">
                  目标站点响应较慢，或限制在嵌套视窗内直接浏览。
                </p>
                <a class="open-tab-btn" :href="src" target="_blank" rel="noreferrer">
                  <span>在新标签页打开</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </transition>
        <iframe :src="src" title="嵌入页面预览" frameborder="0" @load="onLoad" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useModalFrame } from '../composables/useModalFrame.js'

const props = defineProps({
  src: { type: String, required: true },
  width: { type: [Number, String], default: '90vw' },
  height: { type: [Number, String], default: '85vh' }
})
const emit = defineEmits(['close'])
const onClose = () => emit('close')
const { win, closeBtn, winStyle, displayUrl, loading, blocked, onLoad } = useModalFrame(props, onClose)
</script>

<style scoped>
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: clamp(12px, 3vh, 32px) clamp(12px, 3vw, 32px);
  box-sizing: border-box;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(16, 22, 38, 0.72) 0%, rgba(6, 9, 16, 0.86) 100%);
  backdrop-filter: blur(14px) saturate(130%);
  -webkit-backdrop-filter: blur(14px) saturate(130%);
  animation: modal-fade-in 240ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.window {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(165deg, rgba(20, 26, 46, 0.9) 0%, rgba(10, 14, 26, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: var(--blur-lg) saturate(135%);
  -webkit-backdrop-filter: var(--blur-lg) saturate(135%);
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 24px 60px -8px rgba(0, 0, 0, 0.7);
  animation: modal-pop-in 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.titlebar {
  display: grid;
  grid-template-columns: 80px 1fr 80px;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.035);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.dots {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  display: inline-block;
  opacity: 0.9;
  transition: transform var(--dur-fast) ease, opacity var(--dur-fast) ease;
}

.dot--red {
  background: rgba(248, 113, 113, 0.85);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 0 8px rgba(248, 113, 113, 0.3);
}

.dot--yellow {
  background: rgba(251, 191, 36, 0.85);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 0 8px rgba(251, 191, 36, 0.3);
}

.dot--green {
  background: rgba(52, 211, 153, 0.85);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 0 8px rgba(52, 211, 153, 0.3);
}

.address {
  min-width: 0;
  max-width: 520px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 5px 14px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: background var(--dur-fast) ease, border-color var(--dur-fast) ease;
}

.address:hover {
  background: rgba(255, 255, 255, 0.075);
  border-color: rgba(255, 255, 255, 0.15);
}

.addr-icon {
  width: 13px;
  height: 13px;
  color: var(--fg-muted);
  flex-shrink: 0;
}

.addr-text {
  color: var(--fg-muted);
  font-size: 0.82rem;
  font-family: var(--font-mono);
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
  color: var(--fg-muted);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--dur-fast) cubic-bezier(0.16, 1, 0.3, 1);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.25);
  color: var(--fg-strong);
  transform: translateY(-1px);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.28), 0 3px 8px rgba(0, 0, 0, 0.25);
}

.action-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--focus-ring);
}

.action-btn--close:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(248, 113, 113, 0.4);
  color: #fca5a5;
}

.btn-icon {
  width: 14px;
  height: 14px;
}

.content {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  background: rgba(8, 11, 20, 0.95);
}

.content iframe {
  position: relative;
  z-index: 0;
  width: 100%;
  height: 100%;
  display: block;
  border: none;
}

.overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  padding: var(--space-md);
  background: rgba(9, 12, 22, 0.78);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.loader-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 28px;
  max-width: 380px;
  border-radius: var(--radius-lg);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.03) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 12px 30px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.spinner-ring {
  position: relative;
  width: 38px;
  height: 38px;
}

.spinner-core {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-top-color: rgba(255, 255, 255, 0.9);
  animation: modal-spin 900ms linear infinite;
}

.tip {
  margin-top: 14px;
  color: var(--fg);
  font-size: 0.92rem;
  letter-spacing: 0.01em;
}

.blocked-tip {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.blocked-text {
  margin: 0;
  color: var(--fg-subtle);
  font-size: 0.84rem;
  line-height: 1.5;
}

.open-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  color: var(--fg-strong);
  font-size: 0.82rem;
  text-decoration: none;
  transition: all var(--dur-fast) ease;
}

.open-tab-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.open-tab-btn svg {
  width: 13px;
  height: 13px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes modal-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-pop-in {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (max-width: 640px) {
  .titlebar {
    grid-template-columns: auto 1fr auto;
    padding: 8px 12px;
  }
  .dots {
    display: none;
  }
  .addr-text {
    font-size: 0.78rem;
  }
}
</style>
