---
---

<script setup>
import ArchiveList from './.vitepress/theme/components/ArchiveList.vue'
import { data as posts } from './.vitepress/loaders/posts.data'
</script>

<ArchiveList :posts="posts" />
