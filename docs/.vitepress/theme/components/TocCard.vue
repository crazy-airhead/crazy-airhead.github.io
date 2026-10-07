<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

interface Header {
  level: number
  title: string
  slug?: string
  link?: string
}

const props = defineProps<{ headers: Header[] }>()

const visible = ref(false)
const activeSlug = ref('')
let observer: IntersectionObserver | null = null

// 只取 h2/h3，与 VitePress 默认 outline 行为一致
const flat = props.headers.filter(h => h.level >= 2 && h.level <= 3)
const tree = flat.map(h => ({ ...h, children: [] as Header[] }))
for (let i = 1; i < flat.length; i++) {
  if (flat[i].level === 3 && tree.length && tree[tree.length - 1].level === 2) {
    tree[tree.length - 1].children.push(flat[i])
  }
}
const items = tree.filter(h => h.level === 2)

function slugOf(h: Header) {
  return (h.slug ?? h.link ?? '').replace(/^#/, '')
}

function setupObserver() {
  observer?.disconnect()
  if (!flat.length) return
  visible.value = true
  observer = new IntersectionObserver(
    entries => {
      for (const e of entries) {
        if (e.isIntersecting) activeSlug.value = e.target.id
      }
    },
    { rootMargin: '0px 0px -70% 0px' }
  )
  for (const h of flat) {
    const el = document.getElementById(slugOf(h))
    if (el) observer.observe(el)
  }
}

onMounted(setupObserver)
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div v-if="items.length" class="nex-card toc-card">
    <p class="toc-title">页面目录</p>
    <ul class="toc-list">
      <li v-for="h in items" :key="slugOf(h)">
        <a :href="'#' + slugOf(h)" :class="{ active: activeSlug === slugOf(h) }">{{ h.title }}</a>
        <ul v-if="h.children.length">
          <li v-for="c in h.children" :key="slugOf(c)">
            <a :href="'#' + slugOf(c)" :class="{ active: activeSlug === slugOf(c) }">{{ c.title }}</a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
