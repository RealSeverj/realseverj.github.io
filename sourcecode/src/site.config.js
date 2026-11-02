// 主页外观配置：壁纸与 Hero 文案
//
// 链接分组（sections）不在这里配置：统一维护在 public/links.json，
// 运行时由 src/services/links.js 读取，避免两处内容互相覆盖。

export default {
  // 壁纸配置：固定使用单张图片，可填相对路径或完整 URL。
  wallpaper: {
    image: '/img/background.webp',
    // 当前视觉以原图呈现，不做模糊和额外蒙层；
    // 需要柔化时把 blur 调到 2~8、overlay 改成带透明度的颜色即可。
    blur: 0,
    overlay: 'transparent'
  },

  // 头部 Hero 信息
  hero: {
    badge: 'Welcome',
    title: 'Severj.top',
    tagline: 'A Place No One Has Found',
    intro: 'I am here',
    actions: [
      { label: 'GitHub', href: 'https://github.com/RealSeverj', external: true },
      { label: '源站首页', href: '/', external: false },
    ]
  }
}
