// 主页配置：壁纸、文案、链接分组
// 可自由修改并即时热更新

export default {
  // 壁纸配置：可留空仅用渐变背景；也可填入相对路径或完整 URL
  wallpaper: {
    image: '', // 例如 '/wallpapers/hero.jpg' 或 'https://...'
    blur: 6,
    overlay: 'rgba(6, 10, 26, 0.62)'
  },

  // 头部 Hero 信息
  hero: {
    badge: 'Welcome',
    title: 'Severj.top',
    tagline: 'A Place No One Has Found',
    intro:
      'I am here',
    actions: [
      { label: 'GitHub', href: 'https://github.com/RealSeverj', external: true },
      { label: '源站首页', href: '/', external: false },
    ]
  },

  // 链接分组
  sections: [
    {
      id: 'site',
      badge: 'Site',
      title: '站点入口',
      description: '常用入口与独立页面',
      links: [
        { label: '主页（旧版）', href: '/', emoji: '🏠', description: '保留入口', highlight: true },
        { label: '音乐空间', href: '/music/', emoji: '🎧', description: 'Music App', highlight: false },
        { label: '源码舞台', href: '/sourcecode/', emoji: '🧩', description: '当前 Vue 重构工程', highlight: false },
        { label: '导航页', href: '/components/Navfore/', emoji: '🧭', description: 'Navfore', highlight: false },
        { label: '翻译器', href: '/components/TransToWhat/', emoji: '🧪', description: 'TransToWhat', highlight: false },
        { label: '博客', href: 'https://www.cnblogs.com/Severj', emoji: '📝', description: '外部博客', highlight: false },
        { label: '公众号', href: 'https://mp.weixin.qq.com/s/KeUQrukPCCm_neH55cQb9A?token=466519641&lang=zh_CN', emoji: '📖', description: '微信公众号文章', highlight: false },
      ]
    },
    {
      id: 'friends',
      badge: 'Friends',
      title: '我的朋友们',
      description: '给最好的朋友们编写的纪念网页',
      links: [
        { label: 'Lemon', href: '/components/friends/lemon/', emoji: '🍋', description: '友链页', highlight: false },
        { label: 'Nightstart', href: '/components/friends/nightstart/', emoji: '🌌', description: '友链页', highlight: false },
        { label: 'Shire', href: '/components/friends/shire/', emoji: '🌿', description: '友链页', highlight: false },
      ]
    }
  ]
}
