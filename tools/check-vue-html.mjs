#!/usr/bin/env node
/**
 * 用 Vue 编译器预检所有 markdown 渲染后的 HTML，
 * 找出会让 vitepress build 失败的模板编译错误（未闭合标签等）。
 * 用法：node tools/check-vue-html.mjs [目录]
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { createMarkdownRenderer } = await import('vitepress')
const { parse } = require('@vue/compiler-dom')

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const target = path.join(ROOT, process.argv[2] ?? 'docs')

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  )
}

const md = await createMarkdownRenderer(path.join(ROOT, 'docs'), { html: true }, '/', { warn: () => {} })

const files = walk(target).filter(f => f.endsWith('.md'))
let bad = 0
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  const html = md.render(src)
  const errors = []
  parse(html, { onError: e => errors.push(e) })
  if (errors.length) {
    bad++
    const first = errors[0]
    const loc = first.loc ? { line: first.loc.start.line, column: first.loc.start.column, offset: first.loc.start.offset } : null
    let snippet = ''
    if (loc) {
      const lineStr = html.slice(html.lastIndexOf('\n', loc.offset - 1) + 1, html.indexOf('\n', loc.offset))
      snippet = lineStr.slice(Math.max(0, loc.column - 60), loc.column + 60)
    }
    console.log(`✗ ${path.relative(ROOT, file)}`)
    console.log(`  ${first.message}${loc ? ` @ ${loc.line}:${loc.column}` : ''}`)
    console.log(`  …${snippet}…`)
  }
}
console.log(bad ? `\n共 ${bad} 个文件存在编译问题` : '\n全部通过')
