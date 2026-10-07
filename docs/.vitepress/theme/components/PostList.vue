<script setup lang="ts">
import { computed } from 'vue'
import type { PostData } from '../../loaders/posts.data'
import PostMeta from './PostMeta.vue'

const props = withDefaults(
  defineProps<{
    posts: PostData[]
    page?: number
    perPage?: number
  }>(),
  { page: 1, perPage: 10 }
)

const total = computed(() => Math.ceil(props.posts.length / props.perPage))
const visible = computed(() => {
  const start = (props.page - 1) * props.perPage
  return props.posts.slice(start, start + props.perPage)
})

function pageLink(n: number) {
  return n <= 1 ? '/' : `/page/${n}/`
}

/** 分页按钮序列，超出范围用省略号，参考 NexT 的简洁分页 */
const pager = computed<(number | '…')[]>(() => {
  const t = total.value
  const cur = props.page
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  const pages = new Set([1, 2, cur - 1, cur, cur + 1, t - 1, t])
  const list = [...pages].filter(n => n >= 1 && n <= t).sort((a, b) => a - b)
  const out: (number | '…')[] = []
  let prev = 0
  for (const n of list) {
    if (n - prev > 1) out.push('…')
    out.push(n)
    prev = n
  }
  return out
})
</script>

<template>
  <div>
    <article v-for="post in visible" :key="post.url" class="nex-card post-block post-item">
      <h2 class="post-item-title">
        <a :href="post.url">{{ post.title }}</a>
      </h2>
      <PostMeta :post="post" />
      <p v-if="post.summary" class="post-item-summary">{{ post.summary }} …</p>
      <p class="post-item-more">
        <a :href="post.url">阅读全文 »</a>
      </p>
    </article>

    <div v-if="total > 1" class="nex-card pagination">
      <a v-if="page > 1" class="page-nav" :href="pageLink(page - 1)">« 上一页</a>
      <template v-for="(n, i) in pager" :key="`${n}-${i}`">
        <span v-if="n === '…'" class="page-ellipsis">…</span>
        <a v-else-if="n === page" class="page-num current">{{ n }}</a>
        <a v-else class="page-num" :href="pageLink(n)">{{ n }}</a>
      </template>
      <a v-if="page < total" class="page-nav" :href="pageLink(page + 1)">下一页 »</a>
    </div>
  </div>
</template>
