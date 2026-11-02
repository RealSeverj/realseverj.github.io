# Severj 的个人网站

个人主页与若干独立功能页。新首页使用 Vue 3 + Vite 开发，构建产物直接输出到仓库根目录；独立页面以静态子站方式放在 `components/`，整体适合在 GitHub Pages 上直接部署。

- 站点入口（构建产物）：[index.html](index.html)
- 源码工程（开发入口）：[sourcecode/index.html](sourcecode/index.html)

## 项目亮点

- 新首页（Vue + Vite）：无卡片花田首屏、时间天气与轻量音乐控件；滚动进入单栏内容，壁纸随滚动逐渐压暗
- 设计变量集中管理：[sourcecode/src/styles/tokens.css](sourcecode/src/styles/tokens.css) 统一颜色、圆角、阴影、模糊、间距与动效，换肤只需改这一处
- 组件页小窗预览：指向 `/components/` 的链接默认在模态小窗中打开，不打断浏览
- 多独立功能页：例如
  - 概率分布可视化：[components/MathDis/index.html](components/MathDis/index.html)
  - 翻译器：[components/TransToWhat/index.html](components/TransToWhat/index.html)
  - 缓存/离线演示：[components/CacheWhat/index.html](components/CacheWhat/index.html)
  - 音乐小站：[components/MusiGrace/index.html](components/MusiGrace/index.html)

## 目录结构（摘录）

- 根目录
  - [index.html](index.html)：新首页构建后的入口页面（Vite 产物）
  - `/assets`：构建后的静态资源（JS/CSS 等），随构建一起提交，Pages 直接读取
  - `/components`：若干独立子站（纯静态页）
  - [links.json](links.json)：首页的链接分组与文章数据（运行时加载）
  - `/img`、`/icon`：壁纸、头像与站点图标
  - `/sourcecode`：Vue 源码工程
- 源码工程 `/sourcecode`
  - [src/App.vue](sourcecode/src/App.vue)：沉浸首屏与单栏内容骨架
  - [src/views/HomeView.vue](sourcecode/src/views/HomeView.vue)：首页视图与链接渲染
  - [src/components/LinkSection.vue](sourcecode/src/components/LinkSection.vue)：链接分组与小窗拦截
  - [src/components/ModalFrame.vue](sourcecode/src/components/ModalFrame.vue)：模态小窗容器（Esc 关闭、焦点循环）
  - [src/components/WeatherTime.vue](sourcecode/src/components/WeatherTime.vue)：时间与天气卡片（内联 SVG 图标）
  - [src/components/MusicPlayer.vue](sourcecode/src/components/MusicPlayer.vue)：音乐播放器与歌词
  - [src/lib/links.js](sourcecode/src/lib/links.js)：`links.json` 的共享缓存加载器
  - [src/site.config.js](sourcecode/src/site.config.js)：Hero 文案、壁纸参数等站点级配置
  - [src/styles/tokens.css](sourcecode/src/styles/tokens.css)：设计变量
  - [scripts/deploy.mjs](sourcecode/scripts/deploy.mjs)：构建同步与资源校验
  - [scripts/local-server.mjs](sourcecode/scripts/local-server.mjs)：静态本地预览（含 SPA 回退）

## 快速开始

- 在线访问：将本仓库托管到 GitHub Pages，入口为根目录的 [index.html](index.html)
- 本地开发（新首页 / Vue 工程）
  1. 进入 `sourcecode` 目录
  2. 安装与启动（需要 Node.js 22.12+，推荐 Node.js 24 LTS）

```sh
cd sourcecode

# 安装依赖
npm ci

# 启动开发服务
npm run dev

# 只构建到 sourcecode/dist，不启动服务器
npm run build

# 构建并同步到仓库根目录，供 GitHub Pages 使用
npm run deploy
```

- 本地预览整个静态站点（含 `components/` 子站与 SPA 回退）

```sh
# 在仓库根目录执行
npm --prefix sourcecode run serve:root
# 打开 http://127.0.0.1:5500
```

## 发布流程

1. `cd sourcecode && npm run deploy`：构建、校验构建产物、同步到仓库根目录
2. 提交根目录的 `index.html`、`assets/`、`links.json` 等变更并推送到 `main`
3. GitHub Pages 从 `main` 分支根目录直接提供页面

同步脚本会先校验 `dist/index.html` 中引用的每个 `/assets/...` 文件都存在，再替换根目录资源；校验失败会中止并保留旧发布目录，避免线上白屏。

## 配置与内容管理

- 链接分组与文章：编辑 [links.json](links.json)（运行时由 [sourcecode/src/lib/links.js](sourcecode/src/lib/links.js) 加载）
  - `sections` 里的 `site`、`friends`、`articles` 三个分组
  - 文章项使用 `title` 字段作为展示名
- 站点文案与壁纸：[sourcecode/src/site.config.js](sourcecode/src/site.config.js)
  - Hero 标题、副标题、简介与按钮
  - 壁纸参数：默认固定 `/img/background.webp`；`image` 留空则从 `/img/backgrounds/background1.webp ~ background10.webp` 随机，`blur` 与 `overlay` 控制基础模糊和蒙层
- 视觉风格：[sourcecode/src/styles/tokens.css](sourcecode/src/styles/tokens.css)
  - 颜色、圆角、阴影、模糊、间距、动效与布局宽度都在这里定义
- 组件页拦截规则：指向 `/components/` 的链接会在模态框内打开（见 [sourcecode/src/components/LinkSection.vue](sourcecode/src/components/LinkSection.vue)）

## 核心实现概览

- 布局与交互：[sourcecode/src/App.vue](sourcecode/src/App.vue)
  - 首屏不显示内容卡片，时间天气和当前歌词直接融入背景，歌单按需展开后直接选曲
  - 全页使用原生滚动；站点、朋友与文章集中在一个主内容区
  - [useSceneScroll.js](sourcecode/src/composables/useSceneScroll.js) 将首屏滚动距离映射到壁纸暗度，轻滑后吸附到主内容区，回滚时同步恢复
- 首页渲染：[sourcecode/src/views/HomeView.vue](sourcecode/src/views/HomeView.vue)
  - 通过 `links.js` 拉取 [links.json](links.json)，失败时显示可重试的错误提示
  - 对 `/components/` 链接以模态框打开，对外链在新标签页打开
- 模态小窗：[sourcecode/src/components/ModalFrame.vue](sourcecode/src/components/ModalFrame.vue)
  - Esc 关闭、Tab 焦点循环、打开时锁定页面滚动

## 测试

在 `sourcecode` 目录运行 `npm test`：覆盖音乐标签/封面解析、构建同步与资源校验、`links.json` 两份副本一致性与分组结构。

## 许可

本项目使用 MIT 许可证，详见 [LICENSE](LICENSE)。
