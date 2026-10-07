<script setup lang="ts">
import { computed } from 'vue'
import type { PostData } from '../../loaders/posts.data'

const props = defineProps<{ posts: PostData[] }>()

const years = computed(() => {
  const map = new Map<number, PostData[]>()
  for (const p of props.posts) {
    const y = Number(p.date.slice(0, 4))
    if (!map.has(y)) map.set(y, [])
    map.get(y)!.push(p)
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]).map(([year, list]) => ({ year, list }))
})
</script>

<template>
  <div class="nex-card post-block archive-block">
    <h1 class="page-title">归档</h1>
    <p class="page-subtitle">共 {{ posts.length }} 篇文章</p>

    <section v-for="y in years" :key="y.year" class="archive-year">
      <h2 class="archive-year-title">{{ y.year }}<small>（{{ y.list.length }}）</small></h2>
      <ul class="archive-list">
        <li v-for="p in y.list" :key="p.url">
          <span class="archive-date">{{ p.date.slice(5) }}</span>
          <a :href="p.url">{{ p.title }}</a>
        </li>
      </ul>
    </section>
  </div>
</template>
