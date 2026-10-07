import { createContentLoader } from 'vitepress'

export interface PostData {
  title: string
  url: string
  /** 秒级时间戳，用于排序 */
  time: number
  /** YYYY-MM-DD */
  date: string
  categories: string[]
  tags: string[]
  /** CJK 字符数 + 西文单词数 */
  wordCount: number
  /** 阅读时长（分钟），对齐 hexo-symbols-count-time 的 300字/分 */
  readingTime: number
  /** 纯文本摘要，用于列表页 */
  summary: string
}

declare const data: PostData[]
export { data }

function toArray(v: unknown): string[] {
  if (v == null) return []
  return (Array.isArray(v) ? v : [v]).map(String)
}

function toPlain(src: string): string {
  return src
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#+\s?/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default createContentLoader('posts/**/*.md', {
  includeSrc: true,
  transform(data) {
    return data
      .map(post => {
        const fm = post.frontmatter
        const d = typeof fm.date === 'string' ? new Date(fm.date) : new Date()
        const plain = toPlain(post.src ?? '')
        const cjk = (plain.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) ?? []).length
        const words = (plain.replace(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, ' ').match(/[A-Za-z0-9_]+/g) ?? []).length
        return {
          title: String(fm.title ?? post.url),
          url: post.url,
          time: Math.floor(d.getTime() / 1000),
          date: Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10),
          categories: toArray(fm.categories),
          tags: toArray(fm.tags),
          wordCount: cjk + words,
          readingTime: Math.max(1, Math.ceil(cjk / 300 + words / 200)),
          summary: plain.slice(0, 150),
        }
      })
      .sort((a, b) => b.time - a.time)
  },
})
