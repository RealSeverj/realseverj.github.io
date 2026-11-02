# 个人网站首页工程

使用 Vue 3、Vite 8 和 music-metadata。需要 Node.js 22.12 或更高版本，推荐 Node.js 24 LTS。

在本目录运行 `npm ci` 安装锁定版本的依赖。

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动首页开发服务，支持热更新 |
| `npm run build` | 只构建到 `dist/`，不启动服务器、不改动根目录 |
| `npm test` | 检查播放状态、链接跳转与缓存、天气、静态服务、音乐资源和构建同步 |
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

```text
sourcecode/
├─ src/
│  ├─ main.js                应用入口，按顺序加载设计变量与全局样式
│  ├─ App.vue                花田首屏与单栏内容骨架
│  ├─ site.config.js         Hero 文案与壁纸参数
│  ├─ views/                 页面组装
│  ├─ components/            模板、props、事件与组件样式
│  │  └─ music/              播放控制、歌词和歌单视图
│  ├─ composables/           Vue 状态、交互与生命周期
│  ├─ services/              数据请求与缓存，不依赖 Vue
│  ├─ lib/                   链接、歌词、格式化等规则与工具
│  ├─ data/                  花瓣与微尘的静态参数
│  ├─ styles/tokens.css      颜色、圆角、阴影、模糊、间距等设计变量
│  └─ style.css              全局重置与基础排版
├─ public/                   直接发布的图片、链接数据、音乐与歌词
├─ scripts/                  npm 命令入口与部署脚本
│  └─ lib/                   歌单生成和本地静态服务的实现
└─ test/                     Node.js 内置测试，无额外测试框架
```

组件路径保留，模板和样式就近维护；复杂交互通过 composable 拆分。依赖方向为 `views/components → composables → services/lib/data`，服务与数据模块不反向导入组件。`lib/musicMetadata.js` 保留旧的浏览器标签解析工具；当前播放器使用构建清单，不在运行时读取音频标签。

| 开发内容 | 对应入口 |
| --- | --- |
| 首页分组加载、错误与重试 | `composables/useLinkSections.js`、`services/links.js` |
| 独立子站小窗与链接跳转 | `composables/useLinkNavigation.js`、`lib/links.js` |
| 链接图标推断与图片路径 | `lib/links.js` |
| 播放、切歌、循环、音量与原生 audio 事件 | `composables/useAudioPlayer.js` |
| 歌单清单加载与音轨字段转换 | `services/playlist.js` |
| 歌词请求、时间索引与 LRC 解析 | `composables/usePlayerLyrics.js`、`lib/lyric.js` |
| 歌单面板开关、焦点与关闭事件 | `composables/useMusicDetails.js` |
| 天气加载状态、刷新定时器 | `composables/useWeather.js` |
| 高德请求、会话缓存与缓存有效期 | `services/weather.js` |
| 天气描述与图标映射 | `lib/weather.js` |
| 图片预载与鼠标视差 | `composables/useDisplayedImage.js`、`composables/useBackgroundParallax.js` |
| 花瓣参数与鼠标微风 | `data/petals.js`、`composables/usePetalWind.js` |
| 首屏滚动、压暗、淡出与吸附 | `composables/useSceneScroll.js` |
| 弹窗焦点循环、滚动锁与加载超时 | `composables/useModalFrame.js` |

注册全局事件、动画帧和定时器的 composable 同时负责卸载清理。请求服务只返回数据或抛出错误，界面状态和用户提示由调用方管理。添加新功能时优先沿已有职责扩展，避免在组件脚本中重新混入请求或重复的路径判断。

首屏默认使用 `public/img/background.webp`，无卡片显示时间天气和轻量音乐控件。轻滑一段后，会平滑吸附到主内容区，同时壁纸逐渐变暗；内容区继续正常滚动，向上回滚会恢复首屏。当前歌词和译文直接显示在首屏，歌单按需展开后直接列出歌曲，并保留进度、音量和循环控制。系统启用减少动态效果时，关闭自动吸附及展开动画。天气成功结果在当前浏览器会话中缓存半小时。

## 内容数据

首页链接与文章来自仓库根目录的 `links.json`，本地副本在 `public/links.json`，两份必须保持一致（`npm test` 会校验）。如需修改内容，两边同时改，然后重新构建。

独立子站页面放在仓库根目录 `components/`，不在本工程内构建。

## 音乐

音乐维护在 `public/music/`，支持 `.mp3`、`.flac`、`.wav`、`.ogg`，同名 `.lrc` 文件用作歌词。

`npm run build:playlist` 扫描音乐目录，使用 `music-metadata` 读取文件前 512144 字节中的标签与封面，生成 `public/music/playlist.json` 和 `public/music/covers/`。`npm test` 与 `npm run build` 会先自动执行这一步；开发时添加音乐后可单独运行该命令。

运行时由 `services/playlist.js` 读取清单，`useAudioPlayer` 负责原生音频事件，`usePlayerLyrics` 请求并解析歌词。歌单生成入口在 `scripts/build-playlist.mjs`，实现位于 `scripts/lib/playlist.mjs`。请保持文件名中的空格、分号、加号等字符的现有 URL 编码规则。

## 验证与维护边界

在 `sourcecode/` 执行 `npm test` 和 `npm run build`。测试包含数据一致性、音乐资源、播放状态、链接导航与请求重试、天气缓存和错误、本地静态服务及部署校验；不请求真实天气接口。

结构整理时保留组件模板、class、CSS 和样式加载顺序。动画参数、减少动态效果设置、缓存有效期、跳转方式与播放器事件行为也应保持一致。`build` 只更新本地 `dist/`；需要更新仓库根目录的发布文件时，另行执行 `npm run deploy`。

## 浏览器目标

Vite 配置显式保留升级前的浏览器构建目标：Chrome/Edge 107、Firefox 104、Safari 16。
