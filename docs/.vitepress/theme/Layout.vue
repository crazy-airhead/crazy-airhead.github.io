<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { Content } from 'vitepress/dist/client/app/components/Content.js'
import TopNav from './components/TopNav.vue'
import ProfileCard from './components/ProfileCard.vue'
import TocCard from './components/TocCard.vue'
import PostMeta from './components/PostMeta.vue'
import { data as posts } from '../loaders/posts.data'

const { frontmatter, page } = useData()
const route = useRoute()

const isPost = computed(() => route.data.relativePath.startsWith('posts/'))
const currentPost = computed(() => {
  const url = '/' + route.data.relativePath.replace(/\.md$/, '')
  return posts.find(p => p.url === url || p.url === url + '.html') ?? null
})
</script>

<template>
  <div class="site">
    <TopNav />

    <div class="site-body">
      <main class="site-main">
        <!-- 文章页：标题与元信息渲染在正文卡片顶部，对齐 NexT 的 post-block -->
        <article v-if="isPost" class="nex-card post-block">
          <header class="post-header">
            <h1 class="post-title">{{ frontmatter.title }}</h1>
            <PostMeta v-if="currentPost" :post="currentPost" />
          </header>
          <div class="markdown-body">
            <Content />
          </div>
        </article>

        <!-- 列表类页面（首页/分页/归档/标签/分类）由各 md 页面自行组织卡片 -->
        <div v-else class="markdown-body">
          <Content />
        </div>
      </main>

      <aside class="site-sidebar">
        <ProfileCard />
        <TocCard v-if="isPost" :headers="page.headers ?? []" />
      </aside>
    </div>

    <footer class="site-footer">
      <p>© 2019 - {{ new Date().getFullYear() }} CrazyAirhead</p>
      <p>
        <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>
        · Powered by <a href="https://vitepress.dev" target="_blank" rel="noopener">VitePress</a>
      </p>
    </footer>
  </div>
</template>
