#!/usr/bin/env node
/**
 * 一键发布：提交所有改动并推送，推送后 CI 自动构建部署到 gh-pages。
 *
 *   pnpm pub                # 自动生成提交信息
 *   pnpm pub "docs: add 067"
 *
 * 自动信息规则（对齐既有提交风格）：
 *   - docs/posts 下有新增文章 → docs: add <slug>...
 *   - docs/posts 下仅修改     → docs: update <slug>...
 *   - 其他改动               → chore: update site
 */
import { execSync } from 'node:child_process'
import path from 'node:path'

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim()
}

const status = sh('git status --porcelain')
if (!status) {
  console.log('没有待发布的改动')
  process.exit(0)
}

const lines = status.split('\n')
const slugsOf = pred =>
  lines
    .filter(l => pred(l.slice(0, 2)))
    .map(l => l.slice(3))
    .filter(p => p.startsWith('docs/posts/') && p.endsWith('.md'))
    .map(p => path.basename(p, '.md'))

const isNew = xy => xy === '??' || xy.includes('A')
const isChanged = xy => !isNew(xy) && /M|D|R/.test(xy)

const added = slugsOf(isNew)
const updated = slugsOf(isChanged)

const msg = process.argv[2] ?? (added.length
  ? `docs: add ${added.join(' ')}`
  : updated.length
    ? `docs: update ${updated.join(' ')}`
    : 'chore: update site')

console.log(`提交: ${msg}`)
sh('git add -A')
execSync(`git commit -m ${JSON.stringify(msg)}`, { stdio: 'inherit' })
execSync('git push', { stdio: 'inherit' })
console.log('已推送,CI 构建部署中(GitHub Actions → gh-pages)')
