# 个人网站首页工程

使用 Vue 3、Vite 8 和 music-metadata。需要 Node.js 22.12 或更高版本，推荐 Node.js 24 LTS。

在本目录运行 `npm ci` 安装锁定版本的依赖。

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动首页开发服务，支持热更新 |
| `npm run build` | 只构建到 `dist/`，不启动服务器、不改动根目录 |
| `npm test` | 检查音乐标签、封面、歌词匹配和构建同步行为 |
| `npm run preview` | 预览 `dist/` 构建结果 |
| `npm run sync:root` | 将已有构建同步到仓库根目录 |
| `npm run deploy` | 构建一次，再同步到仓库根目录；不推送或发布到远端 |
| `npm run serve:root` | 在 `http://127.0.0.1:5500` 预览整个仓库，包括独立子站 |
| `npm run deploy:serve` | 构建并同步，然后启动整个仓库的预览；按 Ctrl+C 停止 |

同步脚本会替换根目录 `assets/`，复制构建中的 public 资源，并更新根目录 `index.html`。独立子站保留；命令不会自动打开浏览器。

根目录 `assets/` 当前被 Git 忽略。上传静态站点时需要包含生成的资源；若通过 CI 发布，应先运行 `npm run deploy` 再上传站点文件。

部署使用跨平台的 Node.js 脚本 `scripts/deploy.mjs`；旧 PowerShell 入口 `scripts/deploy.ps1` 仅转发同步操作。

音乐从 `src/assets/mp3/` 加载，同名 `.lrc` 文件用作歌词。音乐标签和封面通过 `music-metadata` 的浏览器 API 读取，无需全局 Buffer 补丁。

Vite 配置显式保留升级前的浏览器构建目标：Chrome/Edge 107、Firefox 104、Safari 16。
