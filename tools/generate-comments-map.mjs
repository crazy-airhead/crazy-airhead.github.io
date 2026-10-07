#!/usr/bin/env node
/**
 * 生成评论映射表：从 GitHub issues 拉取 Gitalk 建的旧 issue，
 * 按 issue 标题匹配新站文章，产出 新页面URL → 旧Gitalk id 的映射。
 *
 * 背景：NexT 时代 Gitalk 的 id = 旧站 URL 路径（如 /2019/05/30/misc/navicat/），
 * issue 的 label = md5(id)，body 里含创建时的页面 URL。新站 URL 结构变了，
 * 评论组件按这个映射表找回旧 issue，老评论得以保留。
 *
 * 产物：docs/.vitepress/generated/comments-map.json
 * 匹配不上的文章（标题重复等）不在表里 → 新 issue 新线程。
 *
 * 用法: node tools/generate-comments-map.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const md5 = s => crypto.createHash('md5').update(s).digest('hex')

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = 'crazy-airhead/crazy-airhead.github.io'
const OUT = path.join(ROOT, 'docs/.vitepress/generated/comments-map.json')
const SITE_SUFFIX = ' | CrazyAirhead'

async function fetchAllIssues() {
  const issues = []
  for (let page = 1; ; page++) {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/issues?per_page=100&state=all&page=${page}`
    )
    if (!res.ok) throw new Error(`GitHub API ${res.status}`)
    const batch = await res.json()
    if (!batch.length) break
    issues.push(...batch)
    if (batch.length < 100) break
  }
  return issues
}

// 收集新站文章: 标题 → [新页面URL]
function collectPosts(dir = path.join(ROOT, 'docs/posts'), prefix = '/posts') {
  const map = new Map()
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      for (const [t, urls] of collectPosts(p, `${prefix}/${e.name}`)) {
        map.has(t) ? map.get(t).push(...urls) : map.set(t, urls)
      }
    } else if (e.name.endsWith('.md')) {
      const fm = fs.readFileSync(p, 'utf8').slice(0, 400)
      const tm = fm.match(/^title:\s*(.+)$/m)
      const title = (tm?.[1] ?? '').trim().replace(/^['"]|['"]$/g, '')
      if (!title) continue
      const url = `${prefix}/${e.name.replace(/\.md$/, '')}.html`
      map.has(title) ? map.get(title).push(url) : map.set(title, [url])
    }
  }
  return map
}

const issues = await fetchAllIssues()
const gitalkIssues = issues.filter(i => i.labels.some(l => l.name === 'Gitalk'))
const posts = collectPosts()

const map = {}
let matched = 0, ambiguous = 0, unmatched = 0, labelMismatch = 0
for (const i of gitalkIssues) {
  const title = i.title.endsWith(SITE_SUFFIX) ? i.title.slice(0, -SITE_SUFFIX.length) : i.title
  const bodyUrl = i.body?.match(/^https?:\/\/\S+/)?.[0]
  if (!bodyUrl) { labelMismatch++; continue }
  // 旧 id = 旧 URL 路径；label = md5(id)。用 label 反向校验路径的斜杠变体
  const label = i.labels.map(l => l.name).find(n => n !== 'Gitalk')
  let pathname
  try {
    pathname = new URL(bodyUrl).pathname
  } catch {
    labelMismatch++
    continue
  }
  const variants = [...new Set([pathname, pathname.replace(/\/+$/, '') + '/', pathname.replace(/\/+$/, '')])]
  const ok = variants.find(v => md5(v) === label)
  if (!ok) { labelMismatch++; console.error(`label 校验失败,跳过: ${title} (${bodyUrl})`); continue }
  // Gitalk 按 label(即传入的 id 本身)查找 issue，所以映射表存 hex label 而非路径
  const oldId = label

  const urls = posts.get(title)
  if (!urls || urls.length === 0) { unmatched++; continue }
  if (urls.length > 1) { ambiguous++; console.error(`标题重复,跳过: ${title} → ${urls.join(', ')}`); continue }
  map[urls[0]] = oldId
  matched++
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(map, null, 2))
console.log(`issue 总数: ${gitalkIssues.length}, 匹配: ${matched}, 标题重复跳过: ${ambiguous}, 未匹配: ${unmatched}`)
console.log(`映射表: ${path.relative(ROOT, OUT)} (${Object.keys(map).length} 条)`)
