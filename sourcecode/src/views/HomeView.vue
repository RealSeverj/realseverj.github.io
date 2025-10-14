<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import HeroPanel from '../components/HeroPanel.vue'
import LinkSection from '../components/LinkSection.vue'
import ModalFrame from '../components/ModalFrame.vue'
import site from '../site.config'

const hero = site.hero || {}
const sections = ref(site.sections || [])

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

onMounted(() => {
    // 若存在 public/links.json 则以其为准覆盖本地配置
    fetch('/links.json')
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
            if (data && Array.isArray(data.sections)) {
                sections.value = data.sections
            }
        })
        .catch(() => {})
})
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
    gap: clamp(1.8rem, 5vh, 3rem); 
}
</style>