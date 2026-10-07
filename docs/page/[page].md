---
---

<script setup>
import { useData } from 'vitepress'
import PostList from '../.vitepress/theme/components/PostList.vue'
import { data as posts } from '../.vitepress/loaders/posts.data'

const { frontmatter } = useData()
</script>

<PostList :posts="posts" :page="Number(frontmatter.page) || 2" />
