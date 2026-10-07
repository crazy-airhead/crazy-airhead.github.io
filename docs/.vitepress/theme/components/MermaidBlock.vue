<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{ code: string }>()

const el = ref<HTMLElement>()
const failed = ref(false)
const { isDark } = useData()
let seq = 0

async function render() {
  if (!el.value) return
  try {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: isDark.value ? 'dark' : 'default',
      fontFamily: 'inherit',
    })
    const id = `mermaid-${++seq}-${Date.now()}`
    const { svg } = await mermaid.render(id, decodeURIComponent(props.code))
    el.value.innerHTML = svg
    failed.value = false
  } catch {
    // 语法错误等场景回退为源码展示
    failed.value = true
  }
}

onMounted(render)
watch(isDark, render)
</script>

<template>
  <div class="mermaid-block">
    <div v-show="!failed" ref="el" class="mermaid-target">图表渲染中…</div>
    <pre v-if="failed" class="mermaid-fallback">{{ decodeURIComponent(code) }}</pre>
  </div>
</template>
