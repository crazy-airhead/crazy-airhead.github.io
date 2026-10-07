#!/usr/bin/env node
/**
 * 一次性迁移脚本：Hexo source/_posts → VitePress docs/posts
 *
 * 做四件事：
 * 1. 复制 source/_posts 整棵树（md + 资源文件夹）到 docs/posts
 * 2. frontmatter 规范化：date 转 ISO、丢弃 Hexo 专属字段（toc/p 等）
 * 3. 扫描并报告问题：相对引用缺失、Windows 反斜杠路径、内部旧链接、{{ }} 冲突
 * 4. 复制 source/images → docs/public/images、根 assets/ → docs/public/assets
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const matter = require('gray-matter')

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'source/_posts')
const DEST = path.join(ROOT, 'docs/posts')
const KEEP_KEYS = new Set(['title', 'date', 'categories', 'tags'])

/** 需要丢弃的 Hexo/Gmark 专属字段（date 已按需转换，其余整体不保留） */
const report = { copied: 0, droppedFields: [], problems: [] }

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  )
}

function copyTree(from, to) {
  fs.cpSync(from, to, { recursive: true })
}

/** 规范化 frontmatter */
function normalizeFrontmatter(file) {
  const raw = fs.readFileSync(file, 'utf8')
  const parsed = matter(raw)

  const fm = {}
  // 日期：Hexo "2026-10-04 14:21:40" → ISO "2026-10-04T14:21:40"
  const d = parsed.data.date
  if (d instanceof Date) {
    fm.date = d.toISOString().slice(0, 19)
  } else if (typeof d === 'string' && d.trim()) {
    fm.date = d.trim().replace(' ', 'T')
  } else {
    report.problems.push({ type: 'no-date', file })
  }
  for (const k of ['title', 'categories', 'tags']) {
    if (parsed.data[k] != null) fm[k] = parsed.data[k]
  }
  if (!fm.title) report.problems.push({ type: 'no-title', file })

  const dropped = Object.keys(parsed.data).filter(k => !KEEP_KEYS.has(k))
  return { content: matter.stringify(parsed.content, fm), dropped }
}

/** 扫描单篇文章的问题 */
function scanProblems(rel, content) {
  // 1. Windows 反斜杠路径
  for (const m of content.matchAll(/\]\(([^)\s]*\\[^)\s]*)\)/g)) {
    report.problems.push({ type: 'backslash-path', file: rel, detail: m[1] })
  }
  // 2. 相对路径引用（非 http、非根路径），检查目标是否存在
  const postDir = path.dirname(path.join(DEST, rel))
  for (const m of content.matchAll(/\]\(([^)]+)\)/g)) {
    const url = m[1].trim().replace(/^<|>$/g, '')
    if (!url || url.startsWith('http') || url.startsWith('#') || url.startsWith('/')) continue
    if (/\.(md|html)([#)]|$)/.test(url)) continue
    const clean = decodeURIComponent(url.split('#')[0])
    if (!fs.existsSync(path.join(postDir, clean))) {
      report.problems.push({ type: 'missing-asset', file: rel, detail: url })
    }
  }
  // 3. 指向旧 Hexo 日期式 permalink 的内部链接
  for (const m of content.matchAll(/\]\((\/20\d\d\/[^)]*)\)/g)) {
    report.problems.push({ type: 'old-permalink', file: rel, detail: m[1] })
  }
  // 4. 正文里的 {{ }}（Vue 模板插值冲突，VitePress 构建会报错）
  const withoutFences = content.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
  for (const m of withoutFences.matchAll(/\{\{[\s\S]{0,80}?\}\}/g)) {
    report.problems.push({ type: 'mustache', file: rel, detail: m[0].slice(0, 60) })
  }
}

/**
 * Hexo post_asset_folder 的资源在渲染后位于文章 permalink 目录下，
 * 所以正文里常写裸文件名 ![](img.png)。VitePress 按文件相对路径解析，
 * 需要把裸文件名改写成 <资源文件夹>/img.png。
 * 另处理 loan.md 这种以 _posts 根为基准的多级路径 <dir>/<资源夹>/<file>。
 */
function fixAssetRefs(rel, content) {
  const file = path.join(DEST, rel)
  const dirName = path.basename(rel, '.md')
  const assetDir = path.join(path.dirname(file), dirName)
  const fileDir = path.dirname(rel) // 相对 posts 根的目录，如 finance 或 .
  let fixed = 0
  let out = content

  if (fs.existsSync(assetDir) && fs.statSync(assetDir).isDirectory()) {
    out = out.replace(/\]\(([^)\s]+)\)/g, (whole, url) => {
      if (url.startsWith('http') || url.startsWith('#') || url.startsWith('/') || url.includes('/')) {
        // 以 _posts 根为基准的 <fileDir>/<dirName>/<file> 写法 → 去掉 fileDir 前缀
        const prefix = fileDir === '.' ? `${dirName}/` : `${fileDir}/${dirName}/`
        if (url.startsWith(prefix) && fs.existsSync(path.join(assetDir, decodeURIComponent(url.slice(prefix.length)).split('#')[0]))) {
          fixed++
          return `](${url.slice(fileDir === '.' ? 0 : fileDir.length + 1)})`
        }
        return whole
      }
      const bare = decodeURIComponent(url.split('#')[0])
      if (fs.existsSync(path.join(assetDir, bare)) && !fs.existsSync(path.join(path.dirname(file), bare))) {
        fixed++
        return `](${dirName}/${url})`
      }
      return whole
    })
  }

  // 统一给指向真实文件的图片引用加 ./ 前缀：裸相对路径会被 Rollup 当作包名解析失败
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (whole, alt, url) => {
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url) || url.startsWith('#') || url.startsWith('/') ||
        url.startsWith('./') || url.startsWith('../')) {
      return whole
    }
    const clean = decodeURIComponent(url.split('#')[0])
    if (fs.existsSync(path.join(path.dirname(file), clean))) {
      fixed++
      return `![${alt}](./${url})`
    }
    return whole
  })

  if (fixed) console.log(`  修正 ${rel}: ${fixed} 处资源引用`)
  return out
}

/** 已知的一次性路径修复（Windows 反斜杠 → public 下的站点路径） */
function fixKnownPaths(content) {
  return content.replace(
    /\.\.\\geek-time-ads\\技术管理实战36讲\.jpg/g,
    '/images/geek-time-ads/技术管理实战36讲.jpg'
  )
}

/**
 * 正文里的字面量尖括号写法（占位符 <hash>、泛型 Array<String>、XML 节点名等）。
 * VitePress 把 markdown 当 Vue 模板编译，未闭合的裸标签会导致构建失败。
 * 用栈式解析找出所有未闭合的裸标签并包上行内代码：
 * - 只处理代码围栏之外的内容
 * - void 元素（br/img/source 等）与自闭合标签跳过
 * - 跨行配对的合法 HTML（如 <video>...</video>）不受影响
 */
const VOID_TAGS = new Set([
  'br', 'hr', 'img', 'source', 'meta', 'link', 'input', 'wbr', 'col', 'embed', 'track', 'area', 'base',
])

/** 按 CommonMark 语义找出行内代码区间（转义反引号、等长配对、失败 run 跳过） */
export function codeSpanRanges(line) {
  const ranges = []
  const n = line.length
  let i = 0
  while (i < n) {
    if (line[i] === '\\' && line[i + 1] === '`') {
      i += 2
      continue
    }
    if (line[i] !== '`') {
      i++
      continue
    }
    let len = 1
    while (line[i + len] === '`') len++
    // 找等长的闭合 run，中间不同长度的 run 视为内容
    let closer = -1
    for (let k = i + len; k < n; ) {
      if (line[k] !== '`') {
        k++
        continue
      }
      let l2 = 1
      while (line[k + l2] === '`') l2++
      if (l2 === len) {
        closer = k
        break
      }
      k += l2
    }
    if (closer >= 0) {
      ranges.push([i, closer + len])
      i = closer + len
    } else {
      i += len // 未闭合的 run 整体视为字面量
    }
  }
  return ranges
}

export function fixLiteralTags(content) {
  const lines = content.split('\n')
  let inFence = false
  const spans = [] // 需要包裹的 [start, end)
  const stack = [] // 跨行维护，合法的跨行 HTML 块能正确配对
  let offset = 0
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      offset += line.length + 1
      continue
    }
    if (!inFence) {
      const protectedRanges = codeSpanRanges(line)
      for (const m of line.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^<>]*)?>/g)) {
        const [, close, tag, rest] = m
        const start = offset + m.index
        const end = start + m[0].length
        if (protectedRanges.some(([s, e]) => start >= s && end <= e)) continue
        // markdown 尖括号自动链接（](<https://...>)）不是 HTML 标签
        if (rest?.startsWith(':')) continue
        const t = tag.toLowerCase()
        if (VOID_TAGS.has(t) || rest?.endsWith('/')) continue
        if (close) {
          const top = stack.pop()
          if (top && top.tag !== t) stack.length = 0 // 配对错乱，放弃
        } else {
          stack.push({ tag: t, start, end })
        }
      }
    }
    offset += line.length + 1
  }
  spans.push(...stack.map(s => [s.start, s.end]))
  let out = content
  // 用 HTML 实体而非行内代码包裹：紧邻的路径反斜杠会转义反引号、破坏 code span
  for (const [start, end] of spans.reverse()) {
    const literal = out
      .slice(start, end)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    out = out.slice(0, start) + literal + out.slice(end)
  }
  return out
}

/**
 * 引用了本机绝对路径（Typora 用户图片目录等）的配图：
 * 图片还在本机的 → 拷入文章资源文件夹并改写引用；已丢失的 → 占位说明。
 */
const LOCAL_IMAGE_DIRS = ['/Users/airhead/Library/Application Support/typora-user-images']

function fixLocalImages(rel, content) {
  const file = path.join(DEST, rel)
  return content.replace(
    /!\[([^\]]*)\]\(\/Users\/[^)]*?\/([^/)]+\.(?:png|jpe?g|gif|webp))\)/g,
    (whole, alt, fname) => {
      for (const dir of LOCAL_IMAGE_DIRS) {
        const src = path.join(dir, fname)
        if (fs.existsSync(src)) {
          const destDir = path.join(path.dirname(file), path.basename(rel, '.md'))
          fs.mkdirSync(destDir, { recursive: true })
          fs.copyFileSync(src, path.join(destDir, fname))
          return `![${alt}](./${path.basename(rel, '.md')}/${fname})`
        }
      }
      return `*（此处配图缺失）*`
    }
  )
}

/** 个别文件的一次性修复 */
function fixSpecialCases(rel, content) {
  if (rel === 'course100/045.md') {
    // 视频文件从未提交过（指向作者桌面路径），替换为说明
    content = content.replace(
      /<video src="\/Users\/[^"]*"[^>]*><\/video>/,
      '> 演示视频未随博客发布。'
    )
  }
  if (rel === 'bigdata/dss/install.md') {
    // 表格内联样式交给主题统一样式，<style> 标签会破坏 Vue 模板编译
    content = content.replace(/<style>[^<]*<\/style>\n?/g, '')
  }
  // 站点绝对路径但文件不存在的死图（Hexo 时代就已失效）→ 占位说明
  content = content.replace(/!\[([^\]]*)\]\(\/([^/)][^)]*)\)/g, (whole, alt, p) => {
    return fs.existsSync(path.join(ROOT, 'docs/public', p)) ? whole : '*（此处配图缺失）*'
  })
  // 飞书 blob 等无法渲染的协议死图 → 占位说明（保留为 import 会让 SSR 构建崩溃）
  content = content.replace(/!\[([^\]]*)\]\(blob:[^)]*\)/g, '*（此处配图缺失）*')
  return content
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error('source/_posts 不存在，请确认在 master 分支状态')
    process.exit(1)
  }
  fs.rmSync(DEST, { recursive: true, force: true })
  fs.mkdirSync(DEST, { recursive: true })

  // 跳过 _drafts 和非 md 文件先复制（整树复制再改写 md）
  copyTree(SRC, DEST)
  fs.rmSync(path.join(DEST, '_drafts'), { recursive: true, force: true })

  const mdFiles = walk(DEST).filter(f => f.endsWith('.md'))
  for (const file of mdFiles) {
    const rel = path.relative(DEST, file)
    let content = fs.readFileSync(file, 'utf8')
    const { content: normalized, dropped } = normalizeFrontmatter(file)
    content = fixSpecialCases(rel, fixLiteralTags(fixAssetRefs(rel, fixLocalImages(rel, fixKnownPaths(normalized)))))
    fs.writeFileSync(file, content)
    report.copied++
    scanProblems(rel, content)
    if (dropped.length) report.droppedFields.push({ file: rel, dropped })
  }

  // 站点静态资源
  if (fs.existsSync(path.join(ROOT, 'source/images'))) {
    fs.cpSync(path.join(ROOT, 'source/images'), path.join(ROOT, 'docs/public/images'), { recursive: true })
  }
  if (fs.existsSync(path.join(ROOT, 'assets'))) {
    fs.cpSync(path.join(ROOT, 'assets'), path.join(ROOT, 'docs/public/assets'), { recursive: true })
  }
  // CNAME
  const cname = path.join(ROOT, 'CNAME')
  if (fs.existsSync(cname)) {
    fs.cpSync(cname, path.join(ROOT, 'docs/public/CNAME'))
  }

  console.log(`已迁移 ${report.copied} 篇文章，${mdFiles.length ? '' : ''}`)
  const byType = {}
  for (const p of report.problems) byType[p.type] = (byType[p.type] || 0) + 1
  console.log('问题统计:', JSON.stringify(byType))
  for (const p of report.problems) {
    console.log(`[${p.type}] ${p.file} :: ${p.detail ?? ''}`)
  }
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main()
}
