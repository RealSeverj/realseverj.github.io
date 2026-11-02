# 个人网站首页工程

使用 Vue 3、Vite 8 和 music-metadata。需要 Node.js 22.12 或更高版本，推荐 Node.js 24 LTS。

在本目录运行 `npm ci` 安装锁定版本的依赖。

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动首页开发服务，支持热更新 |
| `npm run build` | 只构建到 `dist/`，不启动服务器、不改动根目录 |
| `npm test` | 检查音乐标签、封面、构建同步行为与链接数据一致性 |
| `npm run preview` | 预览 `dist/` 构建结果 |
| `npm run sync:root` | 校验并将已有构建同步到仓库根目录 |
| `npm run deploy` | 构建一次，再同步到仓库根目录；不推送或发布到远端 |
| `npm run serve:root` | 在 `http://127.0.0.1:5500` 预览整个仓库，包括独立子站 |
| `npm run deploy:serve` | 构建并同步，然后启动整个仓库的预览；按 Ctrl+C 停止 |

同步脚本会替换根目录 `assets/`，复制构建中的 public 资源，并更新根目录 `index.html`。独立子站保留；命令不会自动打开浏览器。

根目录 `assets/` 已纳入 Git：GitHub Pages 从 `main` 分支根目录直接提供页面，因此构建产物需要随源码一起提交。发布前务必运行 `npm run deploy`，让根目录入口与 `assets/` 的哈希文件名保持一致。

同步前会校验 `dist/index.html` 中引用的每个 `/assets/...` 文件真实存在，引用缺失或无引用时直接报错，避免把白屏构建发布上线。

部署使用跨平台的 Node.js 脚本 `scripts/deploy.mjs`；旧 PowerShell 入口 `scripts/deploy.ps1` 仅转发同步操作。

## 源码结构

- `src/App.vue`：花田首屏与单栏内容骨架，移除侧边栏
- `src/composables/useSceneScroll.js`：原生滚动进度与壁纸压暗、首屏文字淡出
- `src/views/HomeView.vue`：首页视图，按 `links.json` 渲染链接分组
- `src/components/`：链接卡片、分区、模态小窗、天气时间、音乐播放器、文章列表
- `src/lib/links.js`：`links.json` 共享缓存加载器
- `src/styles/tokens.css`：设计变量（颜色、圆角、阴影、模糊、间距、布局宽度）
- `src/style.css`：全局重置与基础排版
- `src/site.config.js`：Hero 文案与壁纸参数

首屏默认使用 `public/img/background.webp`，无卡片显示时间天气和轻量音乐控件。轻滑一段后，会平滑吸附到主内容区，同时壁纸逐渐变暗；内容区继续正常滚动，向上回滚会恢复首屏。当前歌词和译文直接显示在首屏，歌单按需展开后直接列出歌曲，并保留进度、音量和循环控制。系统启用减少动态效果时，关闭自动吸附及展开动画。天气成功结果在当前浏览器会话中缓存半小时。

## 内容数据

首页链接与文章来自仓库根目录的 `links.json`，本地副本在 `public/links.json`，两份必须保持一致（`npm test` 会校验）。如需修改内容，两边同时改，然后重新构建。

独立子站页面放在仓库根目录 `components/`，不在本工程内构建。

## 音乐

音乐从 `src/assets/mp3/` 加载，同名 `.lrc` 文件用作歌词。音乐标签和封面通过 `music-metadata` 的浏览器 API 读取，无需全局 Buffer 补丁。

## 浏览器目标

Vite 配置显式保留升级前的浏览器构建目标：Chrome/Edge 107、Firefox 104、Safari 16。
