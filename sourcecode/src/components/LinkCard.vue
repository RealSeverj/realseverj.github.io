<template>
  <a
    class="link-card"
    :class="{ 'link-card--highlight': highlight }"
    :href="href"
    :target="isExternal ? '_blank' : '_self'"
    rel="noreferrer noopener"
    @click="onClick"
  >
    <div class="link-card__inner">
      <div class="link-card__icon-box" aria-hidden="true">
        <img v-if="imageSrc" class="link-card__img" :src="imageSrc" alt="" />
        <SiteIcon v-else :name="iconName" :size="20" class="link-card__svg" />
      </div>
      <div class="link-card__content">
        <div class="link-card__title">{{ label }}</div>
        <div v-if="description" class="link-card__desc">{{ description }}</div>
      </div>
      <svg class="link-card__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M13.172 11l-4.95-4.95 1.414-1.414L16 11.414l-6.364 6.364-1.414-1.414L13.172 13H4v-2h9.172z"
        />
      </svg>
    </div>
  </a>
</template>

<script setup>
import { computed } from 'vue'
import SiteIcon from './SiteIcon.vue'
import { isExternalUrl, inferLinkIcon, resolveLinkImage } from '../lib/links.js'

const props = defineProps({
  label: { type: String, required: true },
  href: { type: String, required: true },
  icon: { type: String, default: '' },
  emoji: { type: String, default: '' },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  highlight: { type: Boolean, default: false },
  intercept: { type: Boolean, default: false }
})

const isExternal = computed(() => isExternalUrl(props.href))
const emit = defineEmits(['open'])

const iconName = computed(() => inferLinkIcon(props))
const imageSrc = computed(() => resolveLinkImage(props.image))

function onClick(e) {
  if (props.intercept) {
    e.preventDefault()
    emit('open')
  }
}
</script>

<style scoped>
.link-card {
  position: relative;
  display: block;
  border-radius: var(--radius-xl);
  padding: 13px 15px;
  text-decoration: none;
  color: var(--fg);
  /* 内层卡片保持扁平：外层分区面板已经是玻璃，这里不再叠加模糊与内高光 */
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  overflow: hidden;
  transition: transform var(--dur-base) ease, border-color var(--dur-base) ease, background var(--dur-base) ease;
  will-change: transform;
}

/* 纯净聚光灯（Spotlight）自然柔和漫反射 */
.link-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: radial-gradient(130px 130px at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.14), transparent 70%);
  opacity: 0;
  transition: opacity 250ms ease;
  pointer-events: none;
  border-radius: inherit;
}

.link-card:hover::before {
  opacity: 1;
}

.link-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
  background: var(--card-bg-hover);
}

.link-card--highlight {
  border-color: rgba(254, 240, 138, 0.26);
  background: var(--card-highlight-bg);
}

.link-card--highlight:hover {
  border-color: rgba(254, 240, 138, 0.5);
  background: var(--card-highlight-bg-hover);
}

.link-card__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 13px;
}

.link-card__icon-box {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--fg);
  transition: transform var(--dur-fast) ease, background var(--dur-fast) ease, color var(--dur-fast) ease;
}

.link-card:hover .link-card__icon-box {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

.link-card__svg {
  opacity: 0.88;
}

.link-card:hover .link-card__svg {
  opacity: 1;
}

.link-card__img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.link-card__content { 
  min-width: 0; 
}

.link-card__title {
  font-size: 0.98rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.01em;
  line-height: 1.3;
}

.link-card__desc {
  margin-top: 3px;
  font-size: 0.84rem;
  color: var(--fg-muted);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-card__icon {
  width: 18px;
  height: 18px;
  color: var(--fg-muted);
  opacity: 0.6;
  transition: transform var(--dur-fast) ease, opacity var(--dur-fast) ease, color var(--dur-fast) ease;
}

.link-card:hover .link-card__icon {
  opacity: 1;
  color: #ffffff;
  transform: translateX(2px);
}

/* 有悬停能力的设备上，箭头默认隐藏，悬停或键盘聚焦时滑入；触屏设备保持常显 */
@media (hover: hover) {
  .link-card__icon {
    opacity: 0;
    transform: translateX(-4px);
  }

  .link-card:focus-visible .link-card__icon {
    opacity: 1;
    color: #ffffff;
    transform: translateX(2px);
  }
}
</style>
