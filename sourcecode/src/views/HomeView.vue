<script setup>
import { ref, onMounted } from 'vue'
import HeroPanel from '../components/HeroPanel.vue'
import LinkSection from '../components/LinkSection.vue'
import ModalFrame from '../components/ModalFrame.vue'
import site from '../site.config'
import { loadLinks } from '../lib/links'

const hero = site.hero || {}
const sections = ref([])
const loadError = ref('')
const isLoading = ref(true)

// 组件页小窗打开
const modalSrc = ref('')
function isComponentPath(href) {
    return /^\/components\//.test(href) || href.startsWith('./components/') || href.startsWith('/components/')
}
function isExternal(href) { return /^https?:\/\//i.test(href) }
function decorateLinks(links = []) {
    return links.map(l => ({ ...l, intercept: isComponentPath(l.href) }))
}
function handleLinkClick(link) {
    const href = link.href || ''
    if (isComponentPath(href)) {
        const abs = href.replace(/^\.\//, '/').replace(/^(?!https?:|\/)/, '/')
        modalSrc.value = abs
        return
    }
    if (isExternal(href)) {
        window.open(href, '_blank', 'noopener')
        return
    }
    window.location.href = href
}

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
</script>

<template>
    <div class="home-view">
        <HeroPanel
            :badge="hero.badge"
            :title="hero.title"
            :tagline="hero.tagline"
            :intro="hero.intro"
            :actions="hero.actions"
        />

        <section class="sections">
            <LinkSection
                v-for="sec in sections"
                :key="sec.id || sec.title"
                :id="sec.id"
                :badge="sec.badge"
                :title="sec.title"
                :description="sec.description"
                :links="decorateLinks(sec.links)"
                @link-click="handleLinkClick"
            />
            <p v-if="loadError" class="load-error" role="alert">
                站点入口加载失败（{{ loadError }}）。
                <button type="button" class="load-error__retry" @click="fetchSections">重试</button>
            </p>
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

.load-error {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    flex-wrap: wrap;
    margin: 0;
    padding: var(--space-md) var(--space-lg);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius-lg);
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
</style>
