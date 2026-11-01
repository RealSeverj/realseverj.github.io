import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 保留 Vite 7 的浏览器目标，避免升级构建工具时缩小兼容范围。
  build: {
    target: ['chrome107', 'edge107', 'firefox104', 'safari16'],
  },
})
