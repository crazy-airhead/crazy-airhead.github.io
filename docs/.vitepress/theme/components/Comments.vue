<script setup lang="ts">
// Gitalk 评论（沿用 Hexo/NexT 时代的 GitHub OAuth App 与 issue 仓库）
// 旧文章通过 comments-map.json 找回旧 issue 的 id，老评论得以保留；
// 新文章用当前路径作 id，另起新线程。
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const container = ref<HTMLElement>()
const rendered = ref(false)
const enabled = computed(() => route.data.relativePath.startsWith('posts/'))

async function render() {
  if (!container.value) return
  container.value.innerHTML = ''
  const [{ default: Gitalk }, { default: map }] = await Promise.all([
    import('gitalk'),
    import('../../generated/comments-map.json'),
  ])
  const gitalk = new Gitalk({
    clientID: '2932e376382d4c4a1dba',
    clientSecret: '01d2eef214d2f8f9e5c65a19790794d3734775a6',
    repo: 'crazy-airhead.github.io',
    // 仓库实际归属 crazy-airhead(旧配置里的 airhead 是改名前的账号)
    owner: 'crazy-airhead',
    admin: ['crazy-airhead'],
    // 旧站 NexT 的 id 为旧 URL 路径；映射表由 tools/generate-comments-map.mjs 生成
    id: map[route.path] ?? route.path,
    language: 'zh-CN',
    distractionFreeMode: true,
  })
  gitalk.render(container.value)
  rendered.value = true
}

onMounted(render)
watch(() => route.path, render)
</script>

<template>
  <div v-if="enabled" ref="container" class="gitalk-container nex-card"></div>
</template>
