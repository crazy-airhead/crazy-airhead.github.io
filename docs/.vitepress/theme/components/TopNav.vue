<script setup lang="ts">
import { ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'

const { isDark } = useData()
const route = useRoute()
const path = ref(route.path)
watch(() => route.path, v => (path.value = v))

const menus = [
  { text: '首页', link: '/', match: ['/', /^\/page\//] },
  { text: '标签', link: '/tags/', match: [/^\/tags/] },
  { text: '分类', link: '/categories/', match: [/^\/categories/] },
  { text: '归档', link: '/archives/', match: [/^\/archives/] },
]

function isActive(m: (typeof menus)[number]) {
  return m.match.some(p => (typeof p === 'string' ? path.value === p : p.test(path.value)))
}

function toggleDark() {
  isDark.value = !isDark.value
}
</script>

<template>
  <header class="site-header">
    <div class="site-header-inner">
      <a class="site-brand" :href="withBase('/')">CrazyAirhead</a>
      <nav class="site-nav">
        <a
          v-for="m in menus"
          :key="m.link"
          :class="{ active: isActive(m) }"
          :href="withBase(m.link)"
        >{{ m.text }}</a>
      </nav>
      <button class="dark-toggle" title="切换明暗" @click="toggleDark">
        <svg v-if="!isDark" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-14a1 1 0 0 1-1-1V1a1 1 0 0 1 2 0v2a1 1 0 0 1-1 1zm0 20a1 1 0 0 1-1-1v-2a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1zM5 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm18 0a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zM6.8 6.8a1 1 0 0 1-1.4 0L4 5.4a1 1 0 0 1 1.4-1.4l1.4 1.4a1 1 0 0 1 0 1.4zm12.8 12.8a1 1 0 0 1-1.4 0l-1.4-1.4a1 1 0 0 1 1.4-1.4l1.4 1.4a1 1 0 0 1 0 1.4zM6.8 17.2a1 1 0 0 1 0 1.4l-1.4 1.4A1 1 0 0 1 4 18.6l1.4-1.4a1 1 0 0 1 1.4 0zM19.6 4a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 1 1-1.4-1.4L18.2 4a1 1 0 0 1 1.4 0z"/></svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
      </button>
    </div>
  </header>
</template>
