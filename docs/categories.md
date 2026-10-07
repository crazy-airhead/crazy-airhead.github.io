---
---

<script setup>
import TaxonomyPage from './.vitepress/theme/components/TaxonomyPage.vue'
import { data as posts } from './.vitepress/loaders/posts.data'
</script>

<TaxonomyPage :posts="posts" mode="categories" />
