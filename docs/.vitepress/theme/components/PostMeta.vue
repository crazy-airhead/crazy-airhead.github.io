<script setup lang="ts">
import type { PostData } from '../../loaders/posts.data'

defineProps<{ post: PostData }>()

function fmtDate(s: string) {
  return s.replaceAll('-', '-')
}
</script>

<template>
  <div class="post-meta">
    <span class="meta-item">
      <svg class="meta-icon" viewBox="0 0 1024 1024" width="14" height="14"><path fill="currentColor" d="M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768zm0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896z"/><path fill="currentColor" d="M480 256a32 32 0 0 1 32 32v256a32 32 0 0 1-64 0V288a32 32 0 0 1 32-32z"/><path fill="currentColor" d="M480 512h256a32 32 0 1 1 0 64H480a32 32 0 0 1 0-64z"/></svg>
      发表于 {{ fmtDate(post.date) }}
    </span>
    <span v-if="post.categories.length" class="meta-item">
      <svg class="meta-icon" viewBox="0 0 1024 1024" width="14" height="14"><path fill="currentColor" d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-40 208H136c-4.4 0-8-3.6-8-8v-88c0-4.4 3.6-8 8-8h752c4.4 0 8 3.6 8 8v88c0 4.4-3.6 8-8 8z"/></svg>
      {{ post.categories.join(' · ') }}
    </span>
    <span class="meta-item">约 {{ post.readingTime }} 分钟</span>
    <span class="meta-item">{{ post.wordCount }} 字</span>
  </div>
</template>
