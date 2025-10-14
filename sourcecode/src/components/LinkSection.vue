<template>
  <section class="link-section" :aria-labelledby="headingId">
    <header class="link-section__header">
      <div class="link-section__title-group">
        <span v-if="badge" class="link-section__badge">{{ badge }}</span>
        <h2 :id="headingId">{{ title }}</h2>
      </div>
      <p v-if="description" class="link-section__description">{{ description }}</p>
    </header>
    <div class="link-section__grid">
      <LinkCard
        v-for="link in links"
        :key="link.href"
        :label="link.label"
        :href="link.href"
        :emoji="link.emoji"
        :image="link.image"
        :description="link.description"
        :highlight="link.highlight"
        :intercept="shouldIntercept(link.href)"
        @open="onLinkClick(link)"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import LinkCard from './LinkCard.vue'

const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: ''
  },
  links: {
    type: Array,
    default: () => []
  }
})

const headingId = computed(() => {
  if (props.id) return `${props.id}-heading`
  return `${props.title.replace(/\s+/g, '-').toLowerCase()}-heading`
})

const emit = defineEmits(['link-click'])
function onLinkClick(link) {
  emit('link-click', link)
}

function shouldIntercept(href) {
  // 仅对 components 子站使用 Modal；外链 http/https 走新标签（由 LinkCard target 控制）
  return /^\/components\//.test(href) || href.startsWith('./components/') || href.startsWith('/components/')
}
</script>

<style scoped>
.link-section {
  padding: clamp(2.5rem, 6vw, 4rem) clamp(1.5rem, 5vw, 4rem);
  border-radius: 28px;
  border: 1px solid rgba(118, 143, 234, 0.18);
  background: rgba(18, 24, 48, 0.48);
  backdrop-filter: blur(18px);
  box-shadow: 0 12px 24px rgba(8, 12, 28, 0.45);
  transition: transform 240ms ease, box-shadow 240ms ease;
}

.link-section:not(:first-of-type) {
  margin-top: clamp(1.8rem, 5vh, 3rem);
}

.link-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(12, 18, 36, 0.55);
}

.link-section__header {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: clamp(1.6rem, 4vw, 2.2rem);
}

.link-section__title-group {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.75rem;
}

.link-section__badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(115, 183, 255, 0.18);
  color: rgba(199, 209, 255, 0.72);
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  font-size: clamp(1.5rem, 3.8vw, 2.1rem);
  font-weight: 500;
  color: rgba(240, 244, 255, 0.96);
  letter-spacing: -0.01em;
}

.link-section__description {
  margin: 0;
  max-width: 54ch;
  color: rgba(198, 206, 240, 0.68);
  font-size: 1rem;
  line-height: 1.65;
}

.link-section__grid {
  display: grid;
  gap: clamp(1rem, 3vw, 1.5rem);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

@media (max-width: 640px) {
  .link-section {
    padding: clamp(2rem, 9vw, 2.8rem) clamp(1.2rem, 7vw, 2rem);
  }

  .link-section__grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}
</style>
