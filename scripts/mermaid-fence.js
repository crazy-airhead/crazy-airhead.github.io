'use strict';

/**
 * 把文章里的 ```mermaid 代码围栏转换成 NexT 主题识别的 <pre class="mermaid">。
 * 源文件保持通用围栏写法（gmark、GitHub、VS Code 等可直接预览），
 * 博客端由本过滤器在渲染前转换，交给主题的 mermaid 脚本渲染，
 * 无需安装额外渲染插件。
 */
// 优先级设为 5，确保先于 hexo 内置的 backtick_code_block 过滤器执行
// （它会把所有 ``` 围栏转成高亮代码块，晚于它就看不到围栏了）
hexo.extend.filter.register('before_post_render', data => {
  if (!data.content) return data;
  data.content = data.content.replace(
    /(^|\n)```mermaid\n([\s\S]*?)\n```/g,
    (match, lead, code) => `${lead}<pre class="mermaid">\n${code.replace(/^\n+|\n+$/g, '')}\n</pre>`
  );
  return data;
}, 5);
