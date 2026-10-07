<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { PostData } from '../../loaders/posts.data'

const props = defineProps<{
  posts: PostData[]
  /** tags：词条大小按数量加权；categories：统一大小按字母序 */
  mode: 'tags' | 'categories'
}>()

const selected = ref('')

const counts = computed(() => {
  const map = new Map<string, number>()
  for (const p of props.posts) {
    for (const t of props.mode === 'tags' ? p.tags : p.categories) {
      map.set(t, (map.get(t) ?? 0) + 1)
    }
  }
  return map
})

const entries = computed(() => {
  const list = [...counts.value.entries()]
  return props.mode === 'tags'
    ? list.sort((a, b) => b[1] - a[1])
    : list.sort((a, b) => a[0].localeCompare(b[0], 'zh'))
})

const max = computed(() => Math.max(1, ...entries.value.map(e => e[1])))

/** 词条字号 13~24px，按数量对数加权 */
function sizeOf(n: number) {
  const r = Math.log(n + 1) / Math.log(max.value + 1)
  return Math.round(13 + r * 11)
}

const filtered = computed(() =>
  selected.value
    ? props.posts.filter(p =>
        props.mode === 'tags' ? p.tags.includes(selected.value) : p.categories.includes(selected.value)
      )
    : []
)

function pick(name: string) {
  selected.value = selected.value === name ? '' : name
  // 词条卡较高，选中后滚到结果区便于查看
  if (selected.value) {
    nextTick(() => {
      document.querySelectorAll('.nex-card').forEach((el, i, all) => {
        if (i === all.length - 1) el.scrollIntoView({ block: 'start' })
      })
    })
  }
}
</script>

<template>
  <div>
    <div class="nex-card post-block">
      <h1 class="page-title">{{ mode === 'tags' ? '标签' : '分类' }}</h1>
      <p class="page-subtitle">共 {{ entries.length }} 个{{ mode === 'tags' ? '标签' : '分类' }}，点击词条查看相关文章</p>
      <div class="chip-cloud" :class="{ plain: mode === 'categories' }">
        <button
          v-for="[name, n] in entries"
          :key="name"
          class="chip"
          :class="{ active: selected === name }"
          :style="mode === 'tags' ? { fontSize: sizeOf(n) + 'px' } : undefined"
          @click="pick(name)"
        >
          {{ name }}<sup v-if="mode === 'tags'">{{ n }}</sup><span v-else class="chip-count">{{ n }}</span>
        </button>
      </div>
    </div>

    <div v-if="selected" class="nex-card post-block">
      <p class="page-subtitle">
        「{{ selected }}」下的 {{ filtered.length }} 篇文章
        <button class="chip-clear" @click="selected = ''">清除筛选</button>
      </p>
      <ul class="archive-list">
        <li v-for="p in filtered" :key="p.url">
          <span class="archive-date">{{ p.date }}</span>
          <a :href="p.url">{{ p.title }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>
