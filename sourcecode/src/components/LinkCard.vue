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
      <div class="link-card__emoji" aria-hidden="true">
        <img v-if="imageSrc" class="link-card__img" :src="imageSrc" alt="" />
        <template v-else>{{ emoji }}</template>
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

const props = defineProps({
  label: { type: String, required: true },
  href: { type: String, required: true },
  emoji: { type: String, default: '🔗' },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  highlight: { type: Boolean, default: false },
  intercept: { type: Boolean, default: false }
})

const isExternal = computed(() => /^(http|https):\/\//i.test(props.href))
const emit = defineEmits(['open'])

// Resolve image if provided (supports public directory paths or absolute URLs)
const imageSrc = computed(() => {
  if (!props.image) return ''
  if (/^https?:\/\//i.test(props.image)) return props.image
  if (props.image.startsWith('/')) return props.image
  return `/${props.image}`
})

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
  border-radius: 18px;
  padding: 14px;
  text-decoration: none;
  color: rgba(236, 244, 255, 0.96);
  background: linear-gradient(180deg, rgba(28, 34, 72, 0.55), rgba(20, 24, 52, 0.55));
  border: 1px solid rgba(138, 162, 255, 0.18);
  overflow: hidden;
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease, background 220ms ease;
  will-change: transform;
}

.link-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: radial-gradient(120px 120px at var(--mx, 50%) var(--my, 50%), rgba(123, 148, 255, 0.22), rgba(0,0,0,0) 60%);
  opacity: 0;
  transition: opacity 250ms ease;
  pointer-events: none;
}

.link-card:hover::before {
  opacity: 1;
}

.link-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 48px rgba(16, 22, 48, 0.5);
  border-color: rgba(173, 194, 255, 0.35);
  background: linear-gradient(180deg, rgba(38, 66, 92, 0.62), rgba(22, 41, 62, 0.62));
}

.link-card--highlight {
  border-color: rgba(255, 214, 124, 0.55);
  background: linear-gradient(180deg, rgba(66, 54, 20, 0.35), rgba(31, 26, 10, 0.35));
}

.link-card--highlight:hover {
  border-color: rgba(255, 226, 156, 0.85);
  background: linear-gradient(180deg, rgba(74, 60, 24, 0.45), rgba(36, 30, 12, 0.45));
}

.link-card__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
}

.link-card__emoji {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 22px;
  background: radial-gradient(100% 100% at 40% 30%, rgba(250, 251, 255, 0.22) 0%, rgba(140, 163, 255, 0.15) 100%);
  border: 1px solid rgba(167, 186, 255, 0.2);
}

.link-card__img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 10px;
}

.link-card__content { min-width: 0; }

.link-card__title {
  font-size: 1.05rem;
  font-weight: 550;
  letter-spacing: 0.01em;
  line-height: 1.25;
}

.link-card__desc {
  margin-top: 2px;
  font-size: 0.92rem;
  color: rgba(198, 209, 245, 0.75);
  line-height: 1.35;
}

.link-card__icon {
  width: 22px;
  height: 22px;
  opacity: 0.7;
}

/* 鼠标移动光斑跟随 */
.link-card:hover {
  --mx: var(--mxi, 50%);
  --my: var(--myi, 50%);
}
</style>