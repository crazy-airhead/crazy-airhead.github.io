import fs from 'node:fs'
import path from 'node:path'

const PER_PAGE = 10

function countPosts(dir) {
  let n = 0
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_') || e.name.startsWith('.')) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) n += countPosts(p)
    else if (e.name.endsWith('.md')) n++
  }
  return n
}

export default {
  paths() {
    const total = Math.ceil(countPosts(new URL('../posts', import.meta.url).pathname) / PER_PAGE)
    return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
      params: { page: String(i + 2) },
      frontmatter: { page: i + 2 },
    }))
  },
}
