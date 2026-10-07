#!/usr/bin/env node
/**
 * 新建文章，对齐 Hexo `hexo new post <title>` 的使用习惯：
 *
 *   pnpm new <标题>                  # 创建 docs/posts/<标题>.md
 *   pnpm new <标题> -c misc          # 创建 docs/posts/misc/<标题>.md
 *   pnpm new <标题> -c misc -t go,笔记
 *
 * 同时创建同名资源文件夹（对齐 post_asset_folder: true），
 * 图片放里面，正文用 ./<标题>/xxx.png 引用。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const POSTS = path.join(ROOT, 'docs/posts')

function usage() {
  console.log('用法: pnpm new <标题> [-c 分类] [-t 标签1,标签2]')
  process.exit(1)
}

const args = process.argv.slice(2)
const name = args.find(a => !a.startsWith('-'))
if (!name) usage()
if (path.isAbsolute(name) || name.split('/').includes('..')) {
  console.error('标题不能是绝对路径或包含 ..')
  process.exit(1)
}

function opt(flag) {
  const i = args.indexOf(flag)
  return i !== -1 ? args[i + 1] : undefined
}

const category = opt('-c')
const tags = opt('-t')?.split(',').map(s => s.trim()).filter(Boolean) ?? []

const dir = category ? path.join(POSTS, category) : POSTS
const file = path.join(dir, `${name}.md`)
if (fs.existsSync(file)) {
  console.error(`已存在: ${path.relative(ROOT, file)}`)
  process.exit(1)
}

// 本地时间，格式与既有文章一致: 'YYYY-MM-DDTHH:mm:ss'
const d = new Date()
const pad = n => String(n).padStart(2, '0')
const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

// 标题可带子目录（如 course100/067），父目录按需创建
fs.mkdirSync(path.dirname(file), { recursive: true })

// 模板：优先用 scaffolds/post.md（对齐 Hexo，可自行加字段），缺失时用内置模板
const scaffold = path.join(ROOT, 'scaffolds/post.md')
const template = fs.existsSync(scaffold)
  ? fs.readFileSync(scaffold, 'utf8')
  : `---
title: {{ title }}
date: {{ date }}
categories:
tags:
---
`

let content = template.replaceAll('{{ title }}', path.basename(name)).replaceAll('{{ date }}', date)
// -c/-t 注入模板中的空 categories/tags 字段
if (category) content = content.replace(/^categories:\s*$/m, `categories:\n  - ${category}`)
if (tags.length) content = content.replace(/^tags:\s*$/m, `tags:\n${tags.map(t => `  - ${t}`).join('\n')}`)
fs.writeFileSync(file, content)

// 同名资源文件夹（Hexo post_asset_folder 的等价物）
const assetDir = path.join(dir, name)
fs.mkdirSync(assetDir, { recursive: true })

console.log(`已创建: ${path.relative(ROOT, file)}`)
console.log(`资源目录: ${path.relative(ROOT, assetDir)}/`)
