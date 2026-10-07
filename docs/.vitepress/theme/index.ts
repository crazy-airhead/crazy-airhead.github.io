// CrazyAirhead 主题：复刻 Hexo NexT(Gemini) 的博客形态
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import MermaidBlock from './components/MermaidBlock.vue'
import './styles/main.css'

export default {
  // 继承默认主题只为复用 Shiki 代码高亮等基础样式变量，布局完全自定义
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('MermaidBlock', MermaidBlock)
  },
} satisfies Theme
