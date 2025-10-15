<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BackgroundStage from './components/BackgroundStage.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import ArticleList from './components/ArticleList.vue'
import WeatherTime from './components/WeatherTime.vue'
import HomeView from './views/HomeView.vue'
import site from './site.config'

const wallpaper = site.wallpaper || {}

const root = ref(null)
const mainScrollRef = ref(null)
const sidebarScrollRef = ref(null)

const handleMouseMove = (e) => {
    const target = e.target?.closest?.('.link-card')
    if (!target) return
    const rect = target.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    target.style.setProperty('--mxi', `${x}%`)
    target.style.setProperty('--myi', `${y}%`)
}

// 壁纸：从 public/img 读取 10 张图片（/img/background1.webp ... /img/background10.webp）
const images = Array.from({ length: 10 }, (_, i) => `/img/background${i + 1}.webp`)

const currentIndex = ref(0)
const selectedImage = ref('')

// 异步加载当前图片
async function loadCurrentImage() {
    if (!images.length) {
        selectedImage.value = wallpaper.image || ''
        return
    }
    
    const imagePath = images[currentIndex.value % images.length]
    // public 资源可直接使用路径，预加载与失败回退逻辑在 BackgroundStage 中处理
    selectedImage.value = imagePath
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

// 侧边栏折叠状态
const isSidebarCollapsed = ref(false)
function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 小屏自动折叠侧边栏（<=1200px）
const isMobile = ref(false)
let mq // 媒体查询对象
function handleBreakpoint(e) {
    isMobile.value = e.matches
    if (e.matches) {
        isSidebarCollapsed.value = true
    }
}

onMounted(() => {
    root.value?.addEventListener('mousemove', handleMouseMove)
    loadCurrentImage()
    pickRandomIndex()

    // 绑定断点监听
    mq = window.matchMedia('(max-width: 1200px)')
    handleBreakpoint(mq)
    if (mq.addEventListener) {
        mq.addEventListener('change', handleBreakpoint)
    } else if (mq.addListener) {
        // 兼容旧浏览器
        mq.addListener(handleBreakpoint)
    }
})

onUnmounted(() => {
    root.value?.removeEventListener('mousemove', handleMouseMove)
    // 解绑断点监听
    if (mq) {
        if (mq.removeEventListener) {
            mq.removeEventListener('change', handleBreakpoint)
        } else if (mq.removeListener) {
            mq.removeListener(handleBreakpoint)
        }
    }
})
</script>

<template>
    <div ref="root" class="page">
        <BackgroundStage :image="selectedImage" :blur="wallpaper.blur" :overlay="wallpaper.overlay" />

        <header class="header">
            <div class="header__inner">
                <div class="brand">
                    <span class="brand__dot" aria-hidden="true"></span>
                    <span class="brand__name">Severj.top</span>
                </div>
                <div class="controls">
                    <button class="ctrl-btn" type="button" @click="nextImage" aria-label="切换壁纸">
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <path fill="currentColor" d="M7 6h11v11h-2V9.414l-9.293 9.293-1.414-1.414L14.586 8H7V6z"/>
                        </svg>
                        <span class="ctrl-label">切换壁纸</span>
                    </button>
                    <button class="ctrl-btn sidebar-toggle" type="button" @click="toggleSidebar" aria-label="切换侧边栏">
						<svg v-if="isSidebarCollapsed" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
							<path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"/>
						</svg>
						<svg v-else viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
							<path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
						</svg>
						<span class="ctrl-label">{{ isSidebarCollapsed ? '显示' : '隐藏' }}侧边栏</span>
					</button>
                </div>
            </div>
        </header>

        <div :class="['content-wrapper', { 'sidebar-hidden': isSidebarCollapsed }]">
            <!-- 主内容区：独立滚动 -->
            <div ref="mainScrollRef" class="main-scroll-container">
                <main class="main">
                    <HomeView />
                </main>
            </div>

            <!-- 侧边栏：独立滚动 -->
            <div ref="sidebarScrollRef" :class="['sidebar-scroll-container', { collapsed: isSidebarCollapsed }]">
                <aside class="sidebar">
                    <div class="sidebar__content">
                        <WeatherTime />
                        <MusicPlayer />
                        <ArticleList />
                    </div>
                </aside>
            </div>
        </div>

        <footer class="footer" aria-label="Footer">
            <div class="footer__inner">
                <span>© {{ new Date().getFullYear() }} Severj.top</span>
                <a href="/" class="footer__link">回到旧版</a>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.page {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;

	--header-height: 64px;
    --footer-height: 64px;
}

.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 64px;
    background: transparent;
    flex-shrink: 0;
}

.header::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
        to bottom,
        rgba(6, 10, 26, 0.6) 0%,
        rgba(6, 10, 26, 0.5) 30%,
        rgba(6, 10, 26, 0.4) 60%,
        rgba(6, 10, 26, 0.3) 85%,
        transparent 100%
    );
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    -webkit-mask-image: linear-gradient(to bottom, black 0%, black 40%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 0%, black 40%, transparent 100%);
}

.header__inner {
    width: min(1400px, 94%);
    display: flex;
    position: relative;
    z-index: 1;
    align-items: center;
    justify-content: space-between;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid rgba(130, 156, 248, 0.25);
    background: rgba(18, 24, 48, 0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: rgba(226, 234, 255, 0.95);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.brand__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: radial-gradient(circle, #76ffd6 0%, #7fb3ff 100%);
    box-shadow: 0 0 18px rgba(118, 255, 214, 0.8);
    animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
    0%, 100% { 
        box-shadow: 0 0 18px rgba(118, 255, 214, 0.8); 
    }
    50% { 
        box-shadow: 0 0 24px rgba(118, 255, 214, 1); 
    }
}

.brand__name { 
    font-weight: 600; 
    letter-spacing: 0.02em; 
}

.controls { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
}

.ctrl-btn {
    display: inline-flex; 
    align-items: center; 
    gap: 8px;
    height: 36px; 
    padding: 0 12px; 
    border-radius: 999px;
    color: rgba(230, 238, 255, .95);
    background: rgba(20, 26, 54, .65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(130, 156, 248, .25);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.ctrl-btn:hover { 
    transform: translateY(-1px); 
    background: rgba(26, 32, 62, .75); 
    border-color: rgba(173, 194, 255, .35);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.ctrl-label { 
    font-size: .92rem; 
}

.sidebar-toggle i {
    font-size: 16px;
    transition: transform 300ms ease;
}

.sidebar-toggle:active i {
    transform: rotate(90deg);
}

.content-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 24px;
    width: min(1400px, 94%);
    margin: 0 auto;
    overflow: hidden;
    transition: grid-template-columns 400ms cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
}

/* 侧边栏隐藏时主内容占满 */
.content-wrapper.sidebar-hidden {
    grid-template-columns: 1fr 0px;
}

/* 主内容滚动容器 - 隐藏滚动条 */
.main-scroll-container {
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    min-width: 0;
    overscroll-behavior: contain;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
}

.main-scroll-container::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}

.main {
    min-width: 0;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: 80px 0 80px;
    transition: max-width 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.content-wrapper.sidebar-hidden .main {
    max-width: 1000px;
}

/* 侧边栏滚动容器 - 隐藏滚动条 */
.sidebar-scroll-container {
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    min-width: 0;
    overscroll-behavior: contain;
    transition: 
        transform 400ms cubic-bezier(0.4, 0, 0.2, 1), 
        opacity 400ms ease,
        visibility 0s linear 0s;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
}


.sidebar-scroll-container::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}

.sidebar-scroll-container.collapsed {
    transform: translateX(100%);
    opacity: 0;
    visibility: hidden;
    transition: 
        transform 400ms cubic-bezier(0.4, 0, 0.2, 1), 
        opacity 400ms ease,
        visibility 0s linear 400ms;
    pointer-events: none;
}

.sidebar {
    padding: 80px 0 80px;
}

.sidebar__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    color: rgba(189, 199, 236, 0.7);
    flex-shrink: 0;
    z-index: 20;
    background: transparent;
}

.footer::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
        to top,
        rgba(6, 10, 26, 0.92) 0%,
        rgba(6, 10, 26, 0.85) 30%,
        rgba(6, 10, 26, 0.6) 60%,
        rgba(6, 10, 26, 0.3) 85%,
        transparent 100%
    );
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    -webkit-mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
    mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
}

.footer__inner {
    width: min(1400px, 94%);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.footer__link {
    color: rgba(203, 214, 255, 0.95);
    text-decoration: none;
    border-bottom: 1px dashed rgba(160, 178, 255, 0.5);
    padding: 2px 4px;
    border-radius: 4px;
    transition: all 200ms ease;
}

.footer__link:hover {
    color: rgba(118, 255, 214, 0.98);
    background: rgba(118, 255, 214, 0.1);
    border-bottom-color: rgba(118, 255, 214, 0.7);
    text-shadow: 0 0 12px rgba(118, 255, 214, 0.5);
}

/* Header 和 Footer 渐变遮罩层 - 多层叠加实现优雅过渡 */
.header-mask {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    height: 120px;
    pointer-events: none;
    z-index: 15;
}

.header-mask::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
        to bottom,
        rgba(6, 10, 26, 0.75) 0%,
        rgba(6, 10, 26, 0.55) 20%,
        rgba(6, 10, 26, 0.35) 45%,
        rgba(6, 10, 26, 0.15) 70%,
        rgba(6, 10, 26, 0.05) 85%,
        transparent 100%
    );
}

.header-mask::after {
    content: "";
    position: absolute;
    inset: 0;
    backdrop-filter: blur(0px) blur(4px) blur(8px);
    -webkit-backdrop-filter: blur(0px) blur(4px) blur(8px);
    -webkit-mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.9) 0%,
        rgba(0, 0, 0, 0.6) 30%,
        rgba(0, 0, 0, 0.3) 60%,
        transparent 100%
    );
    mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.9) 0%,
        rgba(0, 0, 0, 0.6) 30%,
        rgba(0, 0, 0, 0.3) 60%,
        transparent 100%
    );
}

.footer-mask {
    position: fixed;
    bottom: 52px;
    left: 0;
    right: 0;
    height: 120px;
    pointer-events: none;
    z-index: 15;
}

.footer-mask::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
        to top,
        rgba(6, 10, 26, 0.75) 0%,
        rgba(6, 10, 26, 0.55) 20%,
        rgba(6, 10, 26, 0.35) 45%,
        rgba(6, 10, 26, 0.15) 70%,
        rgba(6, 10, 26, 0.05) 85%,
        transparent 100%
    );
}

.footer-mask::after {
    content: "";
    position: absolute;
    inset: 0;
    backdrop-filter: blur(0px) blur(4px) blur(8px);
    -webkit-backdrop-filter: blur(0px) blur(4px) blur(8px);
    -webkit-mask-image: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.9) 0%,
        rgba(0, 0, 0, 0.6) 30%,
        rgba(0, 0, 0, 0.3) 60%,
        transparent 100%
    );
    mask-image: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.9) 0%,
        rgba(0, 0, 0, 0.6) 30%,
        rgba(0, 0, 0, 0.3) 60%,
        transparent 100%
    );
}

@media (max-width: 1200px) {
    /* 关键：让窗口滚动，侧边栏为浮层 */
    .page {
        height: auto;
        min-height: 100dvh;
        overflow-x: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .content-wrapper {
        grid-template-columns: 1fr;
        position: static;
        overflow: visible;
    }
    
    .content-wrapper.sidebar-hidden,
    .content-wrapper:not(.sidebar-hidden) {
        grid-template-columns: 1fr;
    }
    
    .content-wrapper.sidebar-hidden .main,
    .content-wrapper:not(.sidebar-hidden) .main {
        max-width: none;
    }

    .main-scroll-container {
        overflow: visible;
        height: auto;
        -webkit-overflow-scrolling: auto;
        touch-action: auto;
    }

    /* 改用变量 + 安全区计算固定区域，避免底部滚不到 */
    .sidebar-scroll-container {
        position: fixed;
        top: calc(var(--header-height) + 16px);
        right: 16px;
        bottom: calc(var(--footer-height) + env(safe-area-inset-bottom) + 16px);
        width: 360px;
        z-index: 9;
        background: linear-gradient(135deg, rgba(20, 26, 54, 0.95), rgba(16, 22, 48, 0.95));
        border: 1px solid rgba(130, 156, 248, 0.3);
        border-radius: 16px;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        padding: 16px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y;
        overscroll-behavior: contain;
    }
    
    /* 新增：为内容加底部内边距，确保最后一项能完全露出 */
    .sidebar__content {
        padding-bottom: calc(16px + env(safe-area-inset-bottom));
    }
    
    .sidebar-scroll-container .sidebar {
        padding: 16px 0;
    }
    
    .sidebar-scroll-container.collapsed {
        transform: translateX(calc(100% + 32px));
        pointer-events: none;
    }
}

@media (max-width: 768px) {
    .header__inner { width: 92%; }
    .ctrl-label { display: none; }
    .ctrl-btn { padding: 0 10px; height: 34px; }
    .content-wrapper { width: 92%; }

    /* 在窄屏下仅调整左右与宽度，上下仍由变量控制 */
    .page { 
        --header-height: 70px; 
        --footer-height: 100px; 
    }

    .sidebar-scroll-container {
        top: calc(var(--header-height) + 12px);
        left: 12px;
        right: 12px;
        bottom: calc(var(--footer-height) + env(safe-area-inset-bottom) + 12px);
        width: auto;
    }
    
    .sidebar-scroll-container.collapsed {
        transform: translateX(calc(100% + 24px));
    }

    .footer__inner {
        width: 92%;
        flex-direction: column;
        gap: 8px;
        text-align: center;
    }
}

@media (max-width: 480px) {
    .brand__name { display: none; }
    .brand { padding: 8px; }
    
    .sidebar-scroll-container {
        left: 8px;
        right: 8px;
        bottom: calc(var(--footer-height) + env(safe-area-inset-bottom) + 8px);
    }
    
    .sidebar-scroll-container.collapsed {
        transform: translateX(calc(100% + 16px));
    }
}
</style>