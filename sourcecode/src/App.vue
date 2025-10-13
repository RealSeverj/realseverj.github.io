<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BackgroundStage from './components/BackgroundStage.vue'
import HeroPanel from './components/HeroPanel.vue'
import LinkSection from './components/LinkSection.vue'
import ModalFrame from './components/ModalFrame.vue'
import site from './site.config'

const wallpaper = site.wallpaper || {}
const hero = site.hero || {}
const sections = ref(site.sections || [])

const root = ref(null)
const handleMouseMove = (e) => {
	const target = e.target?.closest?.('.link-card')
	if (!target) return
	const rect = target.getBoundingClientRect()
	const x = ((e.clientX - rect.left) / rect.width) * 100
	const y = ((e.clientY - rect.top) / rect.height) * 100
	target.style.setProperty('--mxi', `${x}%`)
	target.style.setProperty('--myi', `${y}%`)
}

// 壁纸：使用 Vite 的 glob 导入 10 张图片，按文件名顺序排列
const modules = import.meta.glob('./assets/img/background*.webp', { import: 'default' })
const images = Object.keys(modules)
	.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

const currentIndex = ref(0)
const selectedImage = ref('')

// 异步加载当前图片
async function loadCurrentImage() {
	if (!images.length) {
		selectedImage.value = wallpaper.image || ''
		return
	}
	
	const imagePath = images[currentIndex.value % images.length]
	try {
		const module = await modules[imagePath]()
		selectedImage.value = module
	} catch (error) {
		console.error('Failed to load image:', imagePath, error)
		selectedImage.value = wallpaper.image || ''
	}
}

function pickRandomIndex() {
	if (!images.length) return 0
	const newIndex = Math.floor(Math.random() * images.length)
	currentIndex.value = newIndex
	loadCurrentImage()
}

function nextImage() {
	if (!images.length) return
	const base = Number.isInteger(currentIndex.value) ? currentIndex.value : 0
	currentIndex.value = (base + 1) % images.length
	loadCurrentImage()
}

// 初始化加载第一张图片
onMounted(() => {
	loadCurrentImage()
})

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
	root.value?.addEventListener('mousemove', handleMouseMove)
	// 初次进入随机壁纸
	pickRandomIndex()
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
onUnmounted(() => {
	root.value?.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
		<div ref="root" class="page">
			<BackgroundStage :image="selectedImage" :blur="wallpaper.blur" :overlay="wallpaper.overlay" />

		<header class="header">
				<div class="header__inner">
					<div class="brand">
						<span class="brand__dot" aria-hidden="true"></span>
						<span class="brand__name">RealSeverj</span>
					</div>
					<div class="controls">
						<button class="ctrl-btn" type="button" @click="nextImage" aria-label="切换壁纸">
							<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
								<path fill="currentColor" d="M7 6h11v11h-2V9.414l-9.293 9.293-1.414-1.414L14.586 8H7V6z"/>
							</svg>
							<span class="ctrl-label">切换壁纸</span>
						</button>
					</div>
				</div>
		</header>

		<main class="main">
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
		</main>

		<footer class="footer" aria-label="Footer">
			<div class="footer__inner">
				<span>© {{ new Date().getFullYear() }} Severj.top</span>
				<a href="/" class="footer__link">回到旧版</a>
			</div>
		</footer>
		<ModalFrame v-if="modalSrc" :src="modalSrc" @close="modalSrc = ''" />
	</div>
</template>

<style scoped>
.page {
	position: relative;
	min-height: 100dvh;
	display: grid;
	grid-template-rows: auto 1fr auto;
}

.header {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 64px;
    background: linear-gradient(180deg, rgba(6, 10, 26, 0.55), rgba(6, 10, 26, 0));
}

.header::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,1) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,1) 100%);
}

.header__inner {
	width: min(1100px, 92%);
	display: flex;
  position: relative;
  z-index: 1;
	align-items: center;
	justify-content: space-between;
}

.brand {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	padding: 8px 12px;
	border-radius: 999px;
	border: 1px solid rgba(130, 156, 248, 0.25);
	background: rgba(18, 24, 48, 0.35);
	color: rgba(226, 234, 255, 0.95);
}

.brand__dot {
	width: 9px;
	height: 9px;
	border-radius: 50%;
	background: radial-gradient(circle, #76ffd6 0%, #7fb3ff 100%);
	box-shadow: 0 0 18px rgba(118, 255, 214, 0.8);
}

.brand__name { font-weight: 600; letter-spacing: 0.02em; }

.controls { display: flex; align-items: center; gap: 8px; }
.ctrl-btn {
	display: inline-flex; align-items: center; gap: 8px;
	height: 36px; padding: 0 12px; border-radius: 999px;
	color: rgba(230,238,255,.9);
	background: rgba(20,26,54,.35);
	border: 1px solid rgba(130,156,248,.25);
	cursor: pointer;
	transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}
.ctrl-btn:hover { transform: translateY(-1px); background: rgba(26,32,62,.5); border-color: rgba(173,194,255,.35); }
.ctrl-label { font-size: .92rem; }

.main {
	width: min(1100px, 92%);
	margin: 0 auto;
	padding-bottom: 6vh;
}

.sections { display: grid; gap: clamp(1.8rem, 5vh, 3rem); }

.footer {
	padding: 24px 16px 30px;
	color: rgba(189, 199, 236, 0.7);
}

.footer__inner {
	width: min(1100px, 92%);
	margin: 0 auto;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.footer__link {
	color: rgba(203, 214, 255, 0.9);
	text-decoration: none;
	border-bottom: 1px dashed rgba(160, 178, 255, 0.5);
}
</style>
