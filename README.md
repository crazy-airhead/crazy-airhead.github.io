# CrazyAirhead 的博客

个人博客，基于 [VitePress](https://vitepress.dev)，自定义主题复刻 Hexo NexT(Gemini) 的观感。

## 结构

```
docs/
├── .vitepress/
│   ├── config.mts          # 站点配置（mermaid、视频、死链忽略等）
│   ├── loaders/posts.data.ts  # 构建时聚合全部文章（排序/字数/摘要）
│   └── theme/              # 自定义 NexT 风格主题（Layout + 组件 + 样式）
├── posts/                  # 文章（按分类目录组织，可带同名资源文件夹）
├── public/                 # 静态资源（favicon、打赏码、CNAME）
├── index.md                # 首页（文章列表）
├── page/[page].md          # 分页（动态路由，每页 10 篇）
├── archives.md             # 归档（按年时间线）
├── tags.md / categories.md # 标签云 / 分类，点击筛选
└── ...
```

## 常用命令

```bash
pnpm install     # 安装依赖(需要 Node 22+ 与 pnpm 11+)
pnpm dev         # 本地写作预览
pnpm build       # 构建(产物在 docs/.vitepress/dist)
pnpm preview     # 本地预览构建产物
```

## 写作

- 新建 `docs/posts/<分类>/<标题>.md`，frontmatter 写 `title`、`date`、`categories`、`tags`
- 图片等资源放在同名资源文件夹（如 `docs/posts/misc/foo/`），正文用 `./foo/xxx.png` 引用
- `​```mermaid` 围栏自动渲染成图表

## 发布

推送到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）自动构建并把产物推到 `gh-pages` 分支，GitHub Pages 从该分支发布，自定义域名 l4qiang.goldsyear.com。

## 历史

2022 ~ 2026.10 使用 Hexo + NexT（见 `master` 分支）；2026.10 迁移到 VitePress。`tools/migrate-posts.mjs` 是迁移脚本，`tools/check-vue-html.mjs` 用于预检文章的 Vue 模板编译问题。
