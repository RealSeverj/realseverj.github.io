# Severj 的个人网站

终于空出时间来把老主页重构了一下。算是个人的一个小窝吧，看到的人想要拿去改一改用也不是不行。总体上网站整合了若干独立功能页的静态网站。新首页使用 Vue 3 + Vite 开发并编译到根目录，独立页面以静态子站方式提供，适合在 GitHub Pages 上直接部署。

- 站点入口（构建产物）：[index.html](index.html)
- 源码工程（开发入口）：[sourcecode/index.html](sourcecode/index.html)

## 项目亮点

- 新首页（Vue + Vite）：现代化 UI、双栏布局、独立滚动与响应式适配，支持壁纸切换与侧边栏折叠  
  相关文件：  
  - 根组件：[sourcecode/src/App.vue](sourcecode/src/App.vue)  
  - 首页视图：[sourcecode/src/views/HomeView.vue](sourcecode/src/views/HomeView.vue)  
  - 链接分区：[sourcecode/src/components/LinkSection.vue](sourcecode/src/components/LinkSection.vue)  
  - 模态预览：[sourcecode/src/components/ModalFrame.vue](sourcecode/src/components/ModalFrame.vue)  
  - 站点配置：[sourcecode/src/site.config.js](sourcecode/src/site.config.js)
- 组件页小窗预览：指向 /components 的链接默认在小窗中打开，既不打断浏览，又能快速体验
- 多独立功能页：例如  
  - 概率分布可视化：[components/MathDis/index.html](components/MathDis/index.html)  
  - 翻译器：[components/TransToWhat/index.html](components/TransToWhat/index.html)  
  - 缓存/离线演示：[components/CacheWhat/index.html](components/CacheWhat/index.html)  
  - 音乐小站：[components/MusiGrace/index.html](components/MusiGrace/index.html)
- 旧版主页保留：仍可从新首页进入 [old/index.html](old/index.html)

## 目录结构（摘录）

- 根目录
  - [index.html](index.html)：新首页构建后的入口页面（Vite 产物）
  - /assets：构建后的静态资源（JS/CSS/媒体等）
  - /components：若干独立子站（纯静态页）
  - /old：[old/index.html](old/index.html) 老版主页
  - [links.json](links.json)：用于覆盖首页的链接分组数据（可选）
  - /sourcecode：Vue 源码工程（开发入口见 [sourcecode/index.html](sourcecode/index.html)）
- 源码工程 /sourcecode
  - [src/App.vue](sourcecode/src/App.vue)：页面骨架、壁纸与布局
  - [src/views/HomeView.vue](sourcecode/src/views/HomeView.vue)：首页视图与链接渲染
  - [src/components/LinkSection.vue](sourcecode/src/components/LinkSection.vue)：分组与小窗拦截
  - [src/components/ModalFrame.vue](sourcecode/src/components/ModalFrame.vue)：模态小窗容器
  - [src/site.config.js](sourcecode/src/site.config.js)：文案、壁纸、链接分组
  - [scripts/local-server.mjs](sourcecode/scripts/local-server.mjs)：静态本地预览（含 SPA 回退）

## 快速开始

- 在线访问：将本仓库托管到 GitHub Pages 即可直接访问根目录的 [index.html](index.html)
- 本地开发（新首页/Vue 工程）
  1. 进入 sourcecode 目录
  2. 按 Vite 默认流程安装与启动（需本地 Node 环境）
  
````sh
# 进入源码目录
cd sourcecode

# 安装依赖（任选包管器）
npm install
# or: pnpm install / yarn

# 启动开发服务
npm run dev

# 构建产物（会输出到上层根目录的 /assets 与 index.html 所需的静态资源）
npm run build
````
- 本地预览静态站点（含 SPA 回退）
  
````sh
# 在仓库根目录执行
node local-server.mjs -r . -p 5500
# 打开 http://127.0.0.1:5500
````

## 配置与内容管理

- 站点文案与分组：编辑 [sourcecode/src/site.config.js](sourcecode/src/site.config.js)  
  - Hero 文案、按钮
  - 链接分组（sections）
- 在线覆盖数据：在根目录放置 [links.json](links.json)，新首页会优先加载它以覆盖默认分组（见 [sourcecode/src/views/HomeView.vue](sourcecode/src/views/HomeView.vue) 中对 /links.json 的获取逻辑）
- 壁纸与背景：新首页从 /img 读取 `background1.webp ~ background10.webp`，可直接替换图片资源；模糊与遮罩可在 [sourcecode/src/site.config.js](sourcecode/src/site.config.js) 与 [sourcecode/src/App.vue](sourcecode/src/App.vue) 中调整
- 组件页拦截规则：指向 `/components/` 的链接会在模态框内打开（规则见 [sourcecode/src/components/LinkSection.vue](sourcecode/src/components/LinkSection.vue)）

## 核心实现概览

- 布局与交互：[sourcecode/src/App.vue](sourcecode/src/App.vue)
  - 头部操作区：壁纸切换、侧边栏显示/隐藏
  - 双列自适应布局：主内容与侧边栏分别独立滚动
  - 小屏断点（≤1200px）：自动折叠侧边栏，并以浮层形式显示
- 首页渲染：[sourcecode/src/views/HomeView.vue](sourcecode/src/views/HomeView.vue)
  - 首次加载尝试拉取根目录的 [links.json](links.json) 覆盖本地默认配置
  - 对 `/components/` 链接以模态框打开，对外链在新标签页打开
- 模态小窗：[sourcecode/src/components/ModalFrame.vue](sourcecode/src/components/ModalFrame.vue)
  - 窗口样式、地址栏展示、加载中态、外链安全打开等

## 独立功能页

- 概率分布演示：[components/MathDis/index.html](components/MathDis/index.html)
- 翻译器：[components/TransToWhat/index.html](components/TransToWhat/index.html)
- 缓存演示：[components/CacheWhat/index.html](components/CacheWhat/index.html)
- 音乐小站：[components/MusiGrace/index.html](components/MusiGrace/index.html)
- 老版主页：[old/index.html](old/index.html)

## 许可

本项目使用 MIT 许可证，详见 [LICENSE](LICENSE)。