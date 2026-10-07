import fs from 'node:fs'
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
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文章', buttonAriaLabel: '搜索文章' },
          modal: {
            displayDetails: '显示详细列表',
            resetButton: { title: '清除查询' },
            noResultsText: '未找到相关结果',
            footer: { selectText: '选中', navigateKeys: '切换', closeText: '关闭' },
          },
        },
        miniSearch: {
          // 无小节标题的文章（107 篇）会被默认切节逻辑整篇丢弃，
          // 兜底：切不出节时把整页作为一节。
          // 构建侧 add 时写死 title = titles.at(-1)，忽略 section.title，
          // 所以标题必须放进 titles 数组才能被存储与展示。
          // 注意层级：这个钩子挂在 options.miniSearch 上，不是 miniSearch.options 里
          _splitIntoSections: (file: string, html: string) => {
            const headingRe = /<h(\d*).*?>(.*?<a.*? href="#.*?".*?>.*?<\/a>)<\/h\1>/gi
            const parts = html.split(headingRe)
            if (parts.length > 1) return undefined // 有锚点标题，走默认切节
            const stripped = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
            if (!stripped) return []
            const fm = fs.readFileSync(file, 'utf8').match(/^---[\s\S]*?^title:\s*(.+)$/m)
            const title = (fm?.[1] ?? '').trim().replace(/^['"]|['"]$/g, '')
            return [{ anchor: '', titles: title ? [title] : [], text: stripped }]
          },
          options: {
            // MiniSearch 默认按空格分词，中文会整句成一个词；
            // 改为西文按单词、CJK 按单字切分（配置函数会随 themeConfig 序列化到客户端）
            tokenize: (text: string) =>
              String(text).toLowerCase().match(/[a-z0-9_]+|[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) ?? [],
            // 单字 token 粒度细，关掉模糊匹配减少噪音，保留前缀匹配
            searchOptions: {
              fuzzy: false,
              prefix: true,
              boost: { title: 4, titles: 2, text: 1 },
            },
          },
          searchOptions: {
            fuzzy: false,
            prefix: true,
            boost: { title: 4, titles: 2, text: 1 },
          },
        },
      },
    },
  },
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
