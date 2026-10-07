---
---

<script setup>
import PostList from './.vitepress/theme/components/PostList.vue'
import { data as posts } from './.vitepress/loaders/posts.data'
</script>

<PostList :posts="posts" :page="1" />
