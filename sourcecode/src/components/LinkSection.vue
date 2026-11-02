<template>
  <section :id="id || undefined" class="link-section" :aria-labelledby="headingId">
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
        :label="link.label || link.title"
        :href="link.href"
        :icon="link.icon"
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
import { isComponentPath as shouldIntercept } from '../lib/links.js'

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
</script>

<style scoped>
.link-section {
  scroll-margin-top: 96px;
  padding: clamp(1.6rem, 3.5vw, 2.4rem) clamp(1.2rem, 3.5vw, 2.4rem);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--border);
  background: var(--surface-flat);
  backdrop-filter: var(--blur-lg) saturate(130%);
  -webkit-backdrop-filter: var(--blur-lg) saturate(130%);
  box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.22), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: transform var(--dur-base) ease, box-shadow var(--dur-base) ease, border-color var(--dur-base) ease;
}

.link-section:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.24);
  box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.38), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.link-section__header {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: clamp(1.2rem, 3vw, 1.8rem);
}

.link-section__title-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.85rem;
}

.link-section__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.36rem 0.85rem;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: var(--fg-muted);
  font-size: 0.76rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  font-size: clamp(1.4rem, 3.2vw, 1.9rem);
  font-weight: 600;
  line-height: 1.15;
  color: #ffffff;
  letter-spacing: -0.015em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}

.link-section__description {
  margin: 0;
  max-width: 54ch;
  color: var(--fg-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

.link-section__grid {
  display: grid;
  gap: clamp(0.9rem, 2.5vw, 1.25rem);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

@media (max-width: 640px) {
  .link-section {
    padding: clamp(1.4rem, 6vw, 1.8rem) clamp(1rem, 5vw, 1.4rem);
  }

  .link-section__grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}
</style>
