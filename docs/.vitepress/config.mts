import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'CrazyAirhead',
  description: '疯狂的傻瓜，傻瓜也疯狂——傻方能执著，疯狂才专注!',
  head: [
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/images/favicon-32x32-next.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/images/favicon-16x16-next.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/apple-touch-icon-next.png' }],
    ['meta', { name: 'author', content: 'L4qiang' }],
  ],
  sitemap: { hostname: 'https://l4qiang.goldsyear.com' },
  // 忽略死链检查：
  // - 旧文里的飞书 blob 死图
  // - 文章中指向本地调试服务的示例链接（http://localhost:8080/...）
  // - homework/064 的词语标注链接（](名词)，URL 编码后为 %E5%90%8D%E8%AF%8D 等）
  // - 几条当年就失效的站内相对链接
  ignoreDeadLinks: [
    /^blob:/,
    /^https?:\/\/localhost/,
    /%E5%90%8D%E8%AF%8D|%E5%89%AF%E8%AF%8D|%E5%8A%A8%E8%AF%8D/,
    './index',
    './data-isolate-intro',
    './00-overview',
    './java-go-comparison',
    './multi-table-mapping',
  ],
  markdown: {
    // 生成 page.headers，供侧栏目录卡使用
    headers: true,
    config(md) {
      const fence = md.renderer.rules.fence!
      md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
        const token = tokens[idx]
        const info = token.info.trim()
        if (info === 'mermaid') {
          // 编码后交给客户端组件渲染，避免 HTML/模板特殊字符破坏页面
          return `<MermaidBlock code="${encodeURIComponent(token.content.trim())}" />`
        }
        // Shiki 未内置 mysql 语法，别名到 sql
        if (info === 'mysql') token.info = 'sql'
        return fence(tokens, idx, opts, env, self)
      }
      // Hexo 时代 ![](xxx.mp4) 的写法 → 视频标签
      const defaultImage = md.renderer.rules.image!
      md.renderer.rules.image = (tokens, idx, opts, env, self) => {
        const token = tokens[idx]
        const src = token.attrGet('src') ?? ''
        if (/\.(mp4|webm|ogg)$/i.test(src)) {
          return `<video controls preload="metadata" src="${src}"></video>`
        }
        return defaultImage(tokens, idx, opts, env, self)
      }
    },
  },
})
