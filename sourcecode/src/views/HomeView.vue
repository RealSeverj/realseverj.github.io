<script setup>
import { computed } from 'vue'
import LinkSection from '../components/LinkSection.vue'
import ArticleFeed from '../components/ArticleFeed.vue'
import MusicPlayer from '../components/MusicPlayer.vue'
import ModalFrame from '../components/ModalFrame.vue'
import { decorateLinks } from '../lib/links.js'
import { useLinkSections } from '../composables/useLinkSections.js'
import { useLinkNavigation } from '../composables/useLinkNavigation.js'

const { sections, loadError, fetchSections } = useLinkSections()
const { modalSrc, handleLinkClick } = useLinkNavigation()

const primarySection = computed(() => sections.value[0] || null)
const restSections = computed(() => sections.value.slice(1))
</script>

<template>
  <div class="home-view">
    <section class="sections">
      <div class="top-bento">
        <LinkSection
          v-if="primarySection"
          :id="primarySection.id"
          class="top-bento__site"
          :badge="primarySection.badge"
          :title="primarySection.title"
          :links="decorateLinks(primarySection.links)"
          @link-click="handleLinkClick"
        />
        <div v-else-if="loadError" class="load-error" role="alert">
          站点入口加载失败（{{ loadError }}）。
          <button type="button" class="load-error__retry" @click="fetchSections">重试</button>
        </div>

        <div class="top-bento__music">
          <MusicPlayer id="music" />
        </div>
      </div>

      <template v-for="sec in restSections" :key="sec.id || sec.title">
        <LinkSection
          :id="sec.id"
          :badge="sec.badge"
          :title="sec.title"
          :links="decorateLinks(sec.links)"
          @link-click="handleLinkClick"
        >
          <ArticleFeed v-if="sec.id === 'articles'" :articles="sec.links" />
        </LinkSection>
      </template>
    </section>

    <ModalFrame v-if="modalSrc" :src="modalSrc" @close="modalSrc = ''" />
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
  padding-bottom: 2rem;
}

.sections {
  display: grid;
  gap: clamp(1.2rem, 2.5vh, 1.8rem);
}

.top-bento {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  gap: clamp(1.2rem, 2.5vh, 1.8rem);
  align-items: stretch;
}

.top-bento__site :deep(.link-section__grid) {
  grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
}

.top-bento__music {
  position: relative;
  min-height: 480px;
}

.top-bento__music :deep(.music-section) {
  position: absolute;
  inset: 0;
  height: 100%;
}

.load-error {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
  margin: 0;
  padding: var(--space-md) var(--space-lg);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-2xl);
  background: var(--surface-flat);
  color: var(--fg-muted);
  font-size: 0.95rem;
}

.load-error__retry {
  padding: var(--space-2xs) var(--space-sm);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface-inset);
  color: var(--fg-strong);
  cursor: pointer;
  transition: background var(--dur-fast) ease, border-color var(--dur-fast) ease;
}

.load-error__retry:hover {
  background: var(--surface-hover);
  border-color: var(--border-strong);
}

@media (max-width: 980px) {
  .top-bento {
    grid-template-columns: 1fr;
  }

  .top-bento__music {
    min-height: 0;
  }

  .top-bento__music :deep(.music-section) {
    position: relative;
    inset: auto;
    height: 500px;
  }
}
</style>
