---
id: sess_869afab1878ddf7e1d7ed235b060a525
title: '@/Users/airhead/WorkSpace/l4qiang/source…'
engine: claude
model: claude-code|1|glm-5.3[1m]
created: "2026-10-04T14:39:32+08:00"
updated: "2026-10-04T15:40:56+08:00"
summary: '@/Users/airhead/WorkSpace/l4qiang/source/_posts/course100/066.md 合并 一、旧栈没坏和二、为什么…'
---

## 👤 用户（06:40）

@/Users/airhead/WorkSpace/l4qiang/source/_posts/course100/066.md 合并 一、旧栈没坏和二、为什么是 Confucius4-R2T2。

## 🤖 助手（06:42）

合并完成。改动如下：
- **一、二两节合并**为一节，标题取 **「一、旧栈没坏,为什么是 Confucius4-R2T2」**，保留了「旧栈没坏」这个叙事钩子(与后文「压垮旧栈的最后一根稻草」呼应)；原二节的标题行删除，正文直接衔接在过渡句之后。
-顺手把过渡句里的「做同题对」补全为「做同题对比」(与第五节用法一致)。
- 后续各节编号依次前移：三→二、四→三、五→四、六→五、七→六、八→七、九→八，全文从九节变为八节。
正文中「第4 条是整个架构的支点」指的是侦察结论列表项，与章节编号无关，未改动。

## 👤 用户（06:48）

文档后半段是不是格式有问题？ @source/_posts/course100/066.md

## 🤖 助手（06:51）

是的，后半段有两是的，后半段有两处实处实打实的格式问题，打实的格式问题，而且它们而且它们会让会让渲染渲染整个整个坏坏掉掉：
1. **bash：
1. **bash代码块的闭合围栏粘代码块的闭合围栏粘在命令末尾**(第99 行):`docker run ... r2t2-gguf:latest``` ` ——在命令末尾**(第99 行):`docker run ... r2t2-gguf:latest``` ` —— Markdown 的闭合 ``` Markdown 的闭合 ```必须独必须独占一行，行占一行，行中中出现的 ``` 不算数出现的 ``` 不算数。于是。于是这个代码这个代码块一直块一直没闭合没闭合，**，**从 docker命令从 docker命令到到文末的全部文末的全部内容(内容(第六第六节剩余节剩余、七、八节、七、八节)都被吞)都被吞进了一个巨型进了一个巨型代码块**；代码块**；文末第文末第140 行那个孤立的140 行那个孤立的 ``` ```恰好成了恰好成了它的意外终止符它的意外终止符。
2. **文末第。
2. **文末第140 行有个140 行有个游离游离的 ```**:的 ```**:修好第1修好第1处后它会变成一个新的处后它会变成一个新的未未闭合代码块开头闭合代码块开头，必须删掉。
另外第三节那张架构图(第48，必须删掉。
另外第三节那张架构图(第48-49 行)被压-49 行)被压成成了一行，`了一行，`┐ ├ │┘` 的分组┐ ├ │┘` 的分组完全完全乱乱掉，一并掉，一并还原还原成成多行。这三多行。这三处在我合并处在我合并章节章节之前就存在，不是之前就存在，不是刚才刚才的的编辑编辑引入的。现在引入的。现在修复修复：：

修 flag the possible typo.修好了，三处改动好了，三处改动：
1. **bash：
1. **bash块闭合围栏**：把块闭合围栏**：把 ``` ```移到 `移到 `docker run`docker run`命令的命令的下一行独占，下一行独占，第六节之后的标题第六节之后的标题、列表、段落恢复正常渲染；
2. **删除、列表、段落恢复正常渲染；
2. **删除文末游离的 ```**:文末游离的 ```**:否则否则修修好上一好上一处后处后它会新它会新开一个空开一个空代码块；
代码块；
3. **3. **架构图还原架构图还原为多为多行**：按行**：按原文原文的缩进和的缩进和 `┐ ├ │ `┐ ├ │┘` 分┘` 分组恢复组恢复((三条三条预处理步骤被预处理步骤被花花括号框括号框住、住、注注记记“毫秒级小模型 CPU随便跑”)，对“毫秒级小模型 CPU随便跑”)，对齐列齐列做了做了统一统一。
顺。
顺带发现带发现一处疑似一处疑似文字文字问题，没动，你确认问题，没动，你确认下：第六下：第六节 bug节 bug段里段里「「所谓所谓“运行时免下载”“运行时免下载”其实从未成立，一直**靠镜像站在在线拉**其实从未成立，一直**靠镜像站在在线拉**小模型」小模型」——“——“靠镜像站在在线拉”靠镜像站在在线拉”读不通，疑似读不通，疑似多多打打了一个“在”或漏了字(了一个“在”或漏了字(比如“一直比如“一直靠镜像在靠镜像在运行时在线拉小模型运行时在线拉小模型”)。要”)。要改的话告诉我用改的话告诉我用哪个措哪个措辞。辞。

## 👤 用户（07:05）

音频/视频 → ffmpeg 转 16k 单声道
    → fsmn-vad 按静音切段                ┐
    → cam++ 说话人嵌入 + 层次聚类         ├ 毫秒级小模型,CPU 随便跑
      (<2s 碎段就近继承邻段标签)          │
    → 相邻同说话人段合并为 ≤55s 转写块    ┘
    → llama.cpp GGUF(Q8_0)逐块转写    ← 重活交给量化后的大模型
    → 输出:JSON 说话人轮次 + Markdown 文稿
换成 Mermaid 图来显示。

## 🤖 助手（07:23）

/Users/airhead/WorkSpace/l4qiang/.gmark/sessions/2026-08-24-source-posts-course100-062-md-从为aifei-sess_273.md
/Users/airhead/WorkSpace/l4qiang/source/_posts/course100/062.md
/Users/airhead/WorkSpace/l4qiang/themes/next/_config.yml
/Users/airhead/WorkSpace/l4qiang/themes/next/layout/_third-party/index.swig
/Users/airhead/WorkSpace/l4qiang/themes/next/layout/_third-party/tags/mermaid.swig
/Users/airhead/WorkSpace/l4qiang/themes/next/scripts/tags/mermaid.js

/Users/airhead/WorkSpace/l4qiang/.gmark/sessions/2026-08-24-source-posts-course100-062-md-从为aifei-sess_273.md
/Users/airhead/WorkSpace/l4qiang/source/_posts/course100/062.md
/Users/airhead/WorkSpace/l4qiang/themes/next/_config.yml
/Users/airhead/WorkSpace/l4qiang/themes/next/layout/_third-party/index.swig
/Users/airhead/WorkSpace/l4qiang/themes/next/layout/_third-party/tags/mermaid.swig
/Users/airhead/WorkSpace/l4qiang/themes/next/scripts/tags/mermaid.js

/Users/airhead/WorkSpace/l4qiang/.gmark/sessions/2026-08-24-source-posts-course100-062-md-从为aifei-sess_273.md
/Users/airhead/WorkSpace/l4qiang/source/_posts/course100/062.md
/Users/airhead/WorkSpace/l4qiang/themes/next/_config.yml
/Users/airhead/WorkSpace/l4qiang/themes/next/layout/_third-party/index.swig
/Users/airhead/WorkSpace/l4qiang/themes/next/layout/_third-party/tags/mermaid.swig
/Users/airhead/WorkSpace/l4qiang/themes/next/scripts/tags/mermaid.js

主题主题主题是是是 NexT, NexT, NexT,自带 Mer自带 Mer自带 Mermaid 支持，而且062.md 用maid 支持，而且062.md 用maid 支持，而且062.md 用过——过——过——看看看下它的写法是下它的写法是下它的写法是代码代码代码围栏还是标签插件，围栏还是标签插件，围栏还是标签插件，保持一致：保持一致：保持一致：

53-规范把写作经验沉淀了下来，让下一篇的起点更高。但光有规范还不够 —— AI 的输出是基于概率的，「抽卡」式的不确定性不会因为换了任务就消失。git 历史里躺着证据：首次部署之后，紧跟一串提交 —— 更新 Logo、更新文档图、把 Actions 升级到 Node 24 运行时、修 Markdown 语法错误、修 index.md 语法错误。所以要有验收闭环：构建、校验、人工过目，一轮下来，概率性的输出才算变成确定性的成品。
54-
55:最让我意外的是 `scripts/check-mermaid.mjs`。VitePress 构建时并不校验 mermaid 图表的语法，错了要到浏览器渲染时才暴露。这件事我没有让 AI 做，是它自己想到的：文档里有图、图会坏、坏了要在上线前发现 —— 于是有了这个脚本：jsdom 搭环境，调 `mermaid.parse` 把 docs 下所有 mermaid 代码块逐个校验，内部文件自动跳过。这种「想到你没让它想的事」，是完整性的另一个来源：人容易在「能用」的地方停下来；AI 不会累，也就没有「差不多得了」。
56-
57-## 过程留痕，成品干净
58-
59-仓库里有个 `docs/issues/` 目录，编号归档了移植过程中发现的十九个缺陷：enjoy 的算术精度降级、for 循环迭代不了 map、内置指令缺失、db 缺方言……每一条都是留了案的复盘。这些记录通过 `srcExclude` 排除在发布站点之外 —— 对外的成品要干净，对内的过程要留痕。完整，不是把所有东西都端出去，而是该在的都在。
60-
61-## 完整是长出来的
62-
63-有了 AI 的帮助，让自己做事情更完整 —— 改变的到底是什么？不是 AI 会写文档了，文档它一直会写；是**完整性的成本变了**。以前文档、CI、校验、sitemap、孤儿分支，这些收尾活最劝退；现在它们的边际成本趋近于零，「能用」和「完整」之间的那段距离，走着走着就走完了。
---config---
813:# Mermaid tag
814:mermaid:
815-  enable: false
816-  # Available themes: default | dark | forest | neutral
817-  theme: forest
818-
819-
820-# ---------------------------------------------------------------
--
960:  # Mermaid
961:  # mermaid: //cdn.jsdelivr.net/npm/mermaid@8/dist/mermaid.min.js
962:  # mermaid: //cdnjs.cloudflare.com/ajax/libs/mermaid/8.4.8/mermaid.min.js
963:  mermaid:
964-
965-  # Internal version: 1.2.1
966-  # velocity: //cdn.jsdelivr.net/npm/velocity-animate@1/velocity.min.js
967-  # velocity: //cdnjs.cloudflare.com/ajax/libs/velocity/1.2.1/velocity.min.js
968-  # velocity_ui: //cdn.jsdelivr.net/npm/velocity-animate@1/velocity.ui.min.js
969-  # velocity_ui: //cdnjs.cloudflare.com/ajax/libs/velocity/1.2.1/velocity.ui.min.js

53-规范把写作经验沉淀了下来，让下一篇的起点更高。但光有规范还不够 —— AI 的输出是基于概率的，「抽卡」式的不确定性不会因为换了任务就消失。git 历史里躺着证据：首次部署之后，紧跟一串提交 —— 更新 Logo、更新文档图、把 Actions 升级到 Node 24 运行时、修 Markdown 语法错误、修 index.md 语法错误。所以要有验收闭环：构建、校验、人工过目，一轮下来，概率性的输出才算变成确定性的成品。
54-
55:最让我意外的是 `scripts/check-mermaid.mjs`。VitePress 构建时并不校验 mermaid 图表的语法，错了要到浏览器渲染时才暴露。这件事我没有让 AI 做，是它自己想到的：文档里有图、图会坏、坏了要在上线前发现 —— 于是有了这个脚本：jsdom 搭环境，调 `mermaid.parse` 把 docs 下所有 mermaid 代码块逐个校验，内部文件自动跳过。这种「想到你没让它想的事」，是完整性的另一个来源：人容易在「能用」的地方停下来；AI 不会累，也就没有「差不多得了」。
56-
57-## 过程留痕，成品干净
58-
59-仓库里有个 `docs/issues/` 目录，编号归档了移植过程中发现的十九个缺陷：enjoy 的算术精度降级、for 循环迭代不了 map、内置指令缺失、db 缺方言……每一条都是留了案的复盘。这些记录通过 `srcExclude` 排除在发布站点之外 —— 对外的成品要干净，对内的过程要留痕。完整，不是把所有东西都端出去，而是该在的都在。
60-
61-## 完整是长出来的
62-
63-有了 AI 的帮助，让自己做事情更完整 —— 改变的到底是什么？不是 AI 会写文档了，文档它一直会写；是**完整性的成本变了**。以前文档、CI、校验、sitemap、孤儿分支，这些收尾活最劝退；现在它们的边际成本趋近于零，「能用」和「完整」之间的那段距离，走着走着就走完了。
---config---
813:# Mermaid tag
814:mermaid:
815-  enable: false
816-  # Available themes: default | dark | forest | neutral
817-  theme: forest
818-
819-
820-# ---------------------------------------------------------------
--
960:  # Mermaid
961:  # mermaid: //cdn.jsdelivr.net/npm/mermaid@8/dist/mermaid.min.js
962:  # mermaid: //cdnjs.cloudflare.com/ajax/libs/mermaid/8.4.8/mermaid.min.js
963:  mermaid:
964-
965-  # Internal version: 1.2.1
966-  # velocity: //cdn.jsdelivr.net/npm/velocity-animate@1/velocity.min.js
967-  # velocity: //cdnjs.cloudflare.com/ajax/libs/velocity/1.2.1/velocity.min.js
968-  # velocity_ui: //cdn.jsdelivr.net/npm/velocity-animate@1/velocity.ui.min.js
969-  # velocity_ui: //cdnjs.cloudflare.com/ajax/libs/velocity/1.2.1/velocity.ui.min.js

53-规范把写作经验沉淀了下来，让下一篇的起点更高。但光有规范还不够 —— AI 的输出是基于概率的，「抽卡」式的不确定性不会因为换了任务就消失。git 历史里躺着证据：首次部署之后，紧跟一串提交 —— 更新 Logo、更新文档图、把 Actions 升级到 Node 24 运行时、修 Markdown 语法错误、修 index.md 语法错误。所以要有验收闭环：构建、校验、人工过目，一轮下来，概率性的输出才算变成确定性的成品。
54-
55:最让我意外的是 `scripts/check-mermaid.mjs`。VitePress 构建时并不校验 mermaid 图表的语法，错了要到浏览器渲染时才暴露。这件事我没有让 AI 做，是它自己想到的：文档里有图、图会坏、坏了要在上线前发现 —— 于是有了这个脚本：jsdom 搭环境，调 `mermaid.parse` 把 docs 下所有 mermaid 代码块逐个校验，内部文件自动跳过。这种「想到你没让它想的事」，是完整性的另一个来源：人容易在「能用」的地方停下来；AI 不会累，也就没有「差不多得了」。
56-
57-## 过程留痕，成品干净
58-
59-仓库里有个 `docs/issues/` 目录，编号归档了移植过程中发现的十九个缺陷：enjoy 的算术精度降级、for 循环迭代不了 map、内置指令缺失、db 缺方言……每一条都是留了案的复盘。这些记录通过 `srcExclude` 排除在发布站点之外 —— 对外的成品要干净，对内的过程要留痕。完整，不是把所有东西都端出去，而是该在的都在。
60-
61-## 完整是长出来的
62-
63-有了 AI 的帮助，让自己做事情更完整 —— 改变的到底是什么？不是 AI 会写文档了，文档它一直会写；是**完整性的成本变了**。以前文档、CI、校验、sitemap、孤儿分支，这些收尾活最劝退；现在它们的边际成本趋近于零，「能用」和「完整」之间的那段距离，走着走着就走完了。
---config---
813:# Mermaid tag
814:mermaid:
815-  enable: false
816-  # Available themes: default | dark | forest | neutral
817-  theme: forest
818-
819-
820-# ---------------------------------------------------------------
--
960:  # Mermaid
961:  # mermaid: //cdn.jsdelivr.net/npm/mermaid@8/dist/mermaid.min.js
962:  # mermaid: //cdnjs.cloudflare.com/ajax/libs/mermaid/8.4.8/mermaid.min.js
963:  mermaid:
964-
965-  # Internal version: 1.2.1
966-  # velocity: //cdn.jsdelivr.net/npm/velocity-animate@1/velocity.min.js
967-  # velocity: //cdnjs.cloudflare.com/ajax/libs/velocity/1.2.1/velocity.min.js
968-  # velocity_ui: //cdn.jsdelivr.net/npm/velocity-animate@1/velocity.ui.min.js
969-  # velocity_ui: //cdnjs.cloudflare.com/ajax/libs/velocity/1.2.1/velocity.ui.min.js

0606062.md 里只是2.md 里只是2.md 里只是文字文字文字提到 Mer提到 Mer提到 Mermaid,并没有maid,并没有maid,并没有真正嵌入过真正嵌入过真正嵌入过图；而图；而图；而 NexT NexT NexT主题的 mermaid标主题的 mermaid标主题的 mermaid标签插件在签插件在签插件在配置里是配置里是配置里是 ** ** **```enable: false`**,enable: false`**,enable: false`**,CDN 也留CDN 也留CDN 也留空。看下标签空。看下标签空。看下标签插件的用法和插件的用法和插件的用法和加载加载加载条件条件条件：：：

1	/**
2	 * mermaid.js | https://theme-next.org/docs/tag-plugins/mermaid
3	 */
4	
5	/* global hexo */
6	
7	'use strict';
8	
9	function mermaid(args, content) {
10	  return `<pre class="mermaid" style="text-align: center;">
11	            ${args.join(' ')}
12	            ${content}
13	          </pre>`;
14	}
15	
16	hexo.extend.tag.register('mermaid', mermaid, {ends: true});
17	

1	/**
2	 * mermaid.js | https://theme-next.org/docs/tag-plugins/mermaid
3	 */
4	
5	/* global hexo */
6	
7	'use strict';
8	
9	function mermaid(args, content) {
10	  return `<pre class="mermaid" style="text-align: center;">
11	            ${args.join(' ')}
12	            ${content}
13	          </pre>`;
14	}
15	
16	hexo.extend.tag.register('mermaid', mermaid, {ends: true});
17	

1	/**
2	 * mermaid.js | https://theme-next.org/docs/tag-plugins/mermaid
3	 */
4	
5	/* global hexo */
6	
7	'use strict';
8	
9	function mermaid(args, content) {
10	  return `<pre class="mermaid" style="text-align: center;">
11	            ${args.join(' ')}
12	            ${content}
13	          </pre>`;
14	}
15	
16	hexo.extend.tag.register('mermaid', mermaid, {ends: true});
17	

1	{%- if theme.mermaid.enable %}
2	{%- set mermaid_uri = theme.vendors.mermaid or '//cdn.jsdelivr.net/npm/mermaid@8/dist/mermaid.min.js' %}
3	<script{{ pjax }}>
4	if (document.querySelectorAll('pre.mermaid').length) {
5	  NexT.utils.getScript('{{ mermaid_uri }}', () => {
6	    mermaid.initialize({
7	      theme    : '{{ theme.mermaid.theme }}',
8	      logLevel : 3,
9	      flowchart: { curve     : 'linear' },
10	      gantt    : { axisFormat: '%m/%d/%Y' },
11	      sequence : { actorMargin: 50 }
12	    });
13	  }, window.mermaid);
14	}
15	</script>
16	{%- endif %}
17	

1	{%- if theme.mermaid.enable %}
2	{%- set mermaid_uri = theme.vendors.mermaid or '//cdn.jsdelivr.net/npm/mermaid@8/dist/mermaid.min.js' %}
3	<script{{ pjax }}>
4	if (document.querySelectorAll('pre.mermaid').length) {
5	  NexT.utils.getScript('{{ mermaid_uri }}', () => {
6	    mermaid.initialize({
7	      theme    : '{{ theme.mermaid.theme }}',
8	      logLevel : 3,
9	      flowchart: { curve     : 'linear' },
10	      gantt    : { axisFormat: '%m/%d/%Y' },
11	      sequence : { actorMargin: 50 }
12	    });
13	  }, window.mermaid);
14	}
15	</script>
16	{%- endif %}
17	

1	{%- if theme.mermaid.enable %}
2	{%- set mermaid_uri = theme.vendors.mermaid or '//cdn.jsdelivr.net/npm/mermaid@8/dist/mermaid.min.js' %}
3	<script{{ pjax }}>
4	if (document.querySelectorAll('pre.mermaid').length) {
5	  NexT.utils.getScript('{{ mermaid_uri }}', () => {
6	    mermaid.initialize({
7	      theme    : '{{ theme.mermaid.theme }}',
8	      logLevel : 3,
9	      flowchart: { curve     : 'linear' },
10	      gantt    : { axisFormat: '%m/%d/%Y' },
11	      sequence : { actorMargin: 50 }
12	    });
13	  }, window.mermaid);
14	}
15	</script>
16	{%- endif %}
17	

NexT 的 Mermaid走的是**标签插件**(`{% mermaid %}...{% endmermaid %}`),不是 ```围栏，.NexT 的 Mermaid走的是**标签插件**(`{% mermaid %}...{% endmermaid %}`),不是 ```围栏，.NexT 的 Mermaid走的是**标签插件**(`{% mermaid %}...{% endmermaid %}`),不是 ```围栏，而且而且而且目前目前目前主题配置里 `主题配置里 `主题配置里 `enable: false`、enable: false`、enable: false`、CDNCDNCDN留空(留留空(留留空(留空会空会空会走走走 jsdelivr 的 jsdelivr 的 jsdelivr 的 mermaid@8默认值 mermaid@8默认值 mermaid@8默认值)。我把)。我把)。我把图换成标签图换成标签图换成标签写法，并把写法，并把写法，并把插件插件插件打开。先确认根配置打开。先确认根配置打开。先确认根配置没有覆盖项没有覆盖项没有覆盖项：：：

808	pdf:
809	  enable: false
810	  # Default height
811	  height: 500px
812	
813	# Mermaid tag
814	mermaid:
815	  enable: false
816	  # Available themes: default | dark | forest | neutral
817	  theme: forest
818	
819	
820	# ---------------------------------------------------------------
821	# Animation Settings

808	pdf:
809	  enable: false
810	  # Default height
811	  height: 500px
812	
813	# Mermaid tag
814	mermaid:
815	  enable: false
816	  # Available themes: default | dark | forest | neutral
817	  theme: forest
818	
819	
820	# ---------------------------------------------------------------
821	# Animation Settings

808	pdf:
809	  enable: false
810	  # Default height
811	  height: 500px
812	
813	# Mermaid tag
814	mermaid:
815	  enable: false
816	  # Available themes: default | dark | forest | neutral
817	  theme: forest
818	
819	
820	# ---------------------------------------------------------------
821	# Animation Settings

(Bash completed with no output)

(Bash completed with no output)

(Bash completed with no output)

根 in one block.根 in one block.根配置没有覆盖,配置没有覆盖,配置没有覆盖,直接直接直接改两处:改两处:改两处:

0606066.md6.md6.md换好了换好了换好了;;;主题配置的编辑超时主题配置的编辑超时主题配置的编辑超时了,重试:了,重试:了,重试:

Edit工具在这个文件上连续Edit工具在这个文件上连续Edit工具在这个文件上连续超时,超时,超时,改用 sed改用 sed改用 sed按行号改按行号改按行号改(813(813(813 行 行 行注释注释注释、、、88815 行是15 行是15 行是目标目标目标),),),改改改完立刻验证完立刻验证完立刻验证:::

<tool_use_error>Error calling tool (Bash): The operation timed out.</tool_use_error>

<tool_use_error>Error calling tool (Bash): The operation timed out.</tool_use_error>

<tool_use_error>Error calling tool (Bash): The operation timed out.</tool_use_error>

写入写入写入类类类操作连续操作连续操作连续超时(超时(超时(只只只读命令之前读命令之前读命令之前都都都正常)。先探正常)。先探正常)。先探一下 shell一下 shell一下 shell 是否还 是否还 是否还活着：活着：活着：

ok
17:  enable: true
75:    enable: false
193:  enable: true

ok
17:  enable: true
75:    enable: false
193:  enable: true

ok
17:  enable: true
75:    enable: false
193:  enable: true

Shell.Shell.Shell 正 正 正常——常——常——有可能有可能有可能刚才那条刚才那条刚才那条 sed sed sed实际已执行、实际已执行、实际已执行、只是结果没返回只是结果没返回只是结果没返回。直接。直接。直接查目标查目标查目标行：行：行：

# Mermaid tag
mermaid:
  enable: false
  # Available themes: default | dark | forest | neutral
  theme: forest

# Mermaid tag
mermaid:
  enable: false
  # Available themes: default | dark | forest | neutral
  theme: forest

# Mermaid tag
mermaid:
  enable: false
  # Available themes: default | dark | forest | neutral
  theme: forest

sed after.sed after.sed没生效(没生效(没生效(写操作被挂起)。换 python 试写操作被挂起)。换 python 试写操作被挂起)。换 python 试一次，一次，一次，写完立即写完立即写完立即回回回读验证读验证读验证：：：

## 👤 用户（07:31）

@source/_posts/course100/066.md，审核，修订，使用最终态，不要有中间的修订痕迹。

## 🤖 助手（07:40）

我先确认两个环境事实：第29 行附近的精确空白（历史遗留了多余空行），以及上一轮没改完的 NexT主题 mermaid 开关状态。

27:
28:
29:
30:
31:
32:
33:

813:# Mermaid tag
814-mermaid:
815-  enable: false
816-  # Available themes: default | dark | forest | neutral
817-  theme: forest

两点都确认了：29 行后有三个多余空行；主题的 mermaid 开关仍是 `enable: false`（上一轮超时没改成，不改的话 `{% mermaid %}` 会以源码形式裸露在页面上）。现在一次性完成所有修订：

16处编辑全部成功。最后做一次全量核验，确认没有残留：

7:- FunAsr
11:- FunAsr
21:这套转写栈已经是第三代了。一代 whisper：识别不准、没有标点、时不时蹦出繁体，最难受的是会在结尾冒出些奇怪的内容 —— 长期靠 LLM 修正表兜底。二代 FunASR(aliyun funasr runtime: Paraformer-large + VAD + 标点 + ngram 语言模型 + 数字规整)就是为了治这些毛病换的：检测、识别、标点、数字规整一站式，服务端自带 ffmpeg，还支持热词；WebSocket 协议，单容器，RTF≈0.05(Real-Time Factor,实时率 = 转写耗时 ÷ 音频时长，小于 1 即比实时快，越小越快) —— 3.7 分钟的音频 11 秒转完。一用就是七个多月，看起来够用了。
89:| 维度     | aliyun funasr              | R2T2(Q8_0)                |
124:顺带记录一个值得警惕的 bug:早期 Dockerfile 里多源 `COPY fsmn-vad campplus /models/funasr/` 会把两个目录的**内容摊平**进同一层,子目录从未真正存在;而 FunASR 收到不存在的本地路径时会**静默回退到在线下载** —— 所谓"运行时免下载"其实从未成立,小模型一直是运行时在线拉的,只是恰好没人断网发现过。修复后加了显式路径检查才算闭环。这类"静默降级"比直接报错可怕得多,值得每个做离线镜像的人警惕。  
---
16-cache:
17:  enable: true
18-
19-# Remove unnecessary files after hexo generate.
--
192-social_icons:
193:  enable: true
194-  icons_only: false

验证干净：正文中的大小写残留只剩三处刻意保留的（`aliyun funasr runtime`镜像名、表格列名 `aliyun funasr`、Dockerfile路径 `/models/funasr/`），残缺句和病句已无痕迹。再确认一下 frontmatter标签与旧文章的一致性：

/Users/airhead/WorkSpace/l4qiang/source/_posts/course100/066.md
---
2

旧文章没有用过 `FunAsr`标签，不存在标签分裂问题，frontmatter顺手与正文的 `FunASR`统一：

审核完成，17处修订全部落盘，文件现在是干净的最终态。修订明细：
**硬伤修复**
- 第一节末段整句重组：原句括号里「是可以更换的，比如）」在“比如”处戛然而止，句子残缺；且「更确切的说是」应为「更确切地说」。补全为「（比如换成 Paraformer、SenseVoice）」——Paraformer 与前文旧栈模型呼应。段后三个多余空行清为一个。
- 第六节 bug段「一直**靠镜像站在在线拉**小模型」读不通（上轮遗留问题）→改为「小模型一直是运行时在线拉的」。
**表述精度**
- 第五节「快10倍和快0.4倍没有本质区别」——RTF0.42 并非“快0.4倍”（实为比实时快约2.4倍），且与“快10倍”参照系混乱 →「RTF0.05 和0.42 都远快于实时」。
- 「与预估命中；首尾干净收尾」→「与预估一致；首尾干净」（去掉重复的“尾”）。
**一致性**
- `FunAsr`/`funasr`/`FunASR` 三种写法混用，正文9处 + frontmatter2处统一为 **FunASR**；刻意保留小写的三处是实体名：镜像名 `aliyun funasr runtime`、表格列名 `aliyun funasr`、Dockerfile路径 `/models/funasr/`。确认过旧文章没用过 `FunAsr`标签，不存在标签分裂。
- 「**FunAsr调用** Confucius4-R2T2 大模型」→「**用 FunASR跑** Confucius4-R2T2 大模型」。
**润色**：「转写栈这已经是第三代了」→「这套转写栈」；「然后我把同一批音频喂给」→「就把同一批音频……做了同题对比」；「让我心动的还是有生态，我的Mac能跑得起来」→「还是生态 —— 我的 Mac 能跑得起来」；「—— 当然，别人愿意真花时间适配」改为句号衔接。
**Mermaid 相关**
- 图重排：把 P1/P2/P3 的定义和内部边收进 subgraph、`B --> P1`跨组边后置——对 NexT默认 CDN 的旧版 mermaid@8渲染更稳（旧写法“先外部引用、后入组”在8.x偶发节点归属错乱）。
- `themes/next/_config.yml` 的 `mermaid.enable` 上轮超时没改成，仍为 `false`——已改为 `true`。不改的话 `{% mermaid %}` 会以源码文本裸露在页面上。
**核对过未动的**：各处数字自洽（0.462=1751.6s÷63.1min、0.447=835.8s÷31.2min、RTF>2 与3 token/s衰减吻合、≤270s 单发相对312s 上限留有余量）；whisper 全文统一小写；行尾双空格是刻意的 Markdown硬换行，全部保留。

