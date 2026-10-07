import{_ as s,o as n,c as e,a5 as p}from"./chunks/framework.BPFk9-tb.js";const g=JSON.parse('{"title":"如何开始使用Gradle","description":"","frontmatter":{"date":"2021-05-15T13:07:27","title":"如何开始使用Gradle","categories":["Gradle"],"tags":["Gradle"]},"headers":[{"level":2,"title":"如何安装Gradle","slug":"如何安装gradle","link":"#如何安装gradle","children":[]},{"level":2,"title":"如何创建Gradle项目","slug":"如何创建gradle项目","link":"#如何创建gradle项目","children":[]},{"level":2,"title":"如何转换Maven项目为Gradle项目","slug":"如何转换maven项目为gradle项目","link":"#如何转换maven项目为gradle项目","children":[]},{"level":2,"title":"如何配置仓库","slug":"如何配置仓库","link":"#如何配置仓库","children":[]},{"level":2,"title":"如何配置插件仓库","slug":"如何配置插件仓库","link":"#如何配置插件仓库","children":[]},{"level":2,"title":"如何将模块上传到私服","slug":"如何将模块上传到私服","link":"#如何将模块上传到私服","children":[]},{"level":2,"title":"如何引用本地jar文件","slug":"如何引用本地jar文件","link":"#如何引用本地jar文件","children":[]},{"level":2,"title":"如何生成BOM管理依赖","slug":"如何生成bom管理依赖","link":"#如何生成bom管理依赖","children":[]},{"level":2,"title":"如何忽略测试","slug":"如何忽略测试","link":"#如何忽略测试","children":[]},{"level":2,"title":"如何清理缓存","slug":"如何清理缓存","link":"#如何清理缓存","children":[]},{"level":2,"title":"如何强制更新缓存","slug":"如何强制更新缓存","link":"#如何强制更新缓存","children":[]},{"level":2,"title":"如何处理IDEA编译时在Configurate projects卡住问题","slug":"如何处理idea编译时在configurate-projects卡住问题","link":"#如何处理idea编译时在configurate-projects卡住问题","children":[]},{"level":2,"title":"如果打包成可执行Jar","slug":"如果打包成可执行jar","link":"#如果打包成可执行jar","children":[]},{"level":2,"title":"如何打包成Fat jar","slug":"如何打包成fat-jar","link":"#如何打包成fat-jar","children":[]},{"level":2,"title":"参考链接","slug":"参考链接","link":"#参考链接","children":[]}],"relativePath":"posts/java/gradle-001.md","filePath":"posts/java/gradle-001.md"}'),l={name:"posts/java/gradle-001.md"};function i(t,a,r,c,d,o){return n(),e("div",null,[...a[0]||(a[0]=[p(`<h2 id="如何安装gradle" tabindex="-1">如何安装Gradle <a class="header-anchor" href="#如何安装gradle" aria-label="Permalink to &quot;如何安装Gradle&quot;">​</a></h2><p>如果安装了IDEA，正确不需要安装，因为项目一般通过gradle wrapper的方式自动下载。但为了更方便的使用gradle命令行，就建议安装了，比如需要转换Maven项目时。</p><p><a href="https://gradle.org/install/" target="_blank" rel="noreferrer">Gradle安装官网教程</a></p><h2 id="如何创建gradle项目" tabindex="-1">如何创建Gradle项目 <a class="header-anchor" href="#如何创建gradle项目" aria-label="Permalink to &quot;如何创建Gradle项目&quot;">​</a></h2><p>使用IDEA，File-&gt;New-&gt;Project...，选择Gradle创建项目即可。</p><p>可以看到与Gradle相关的文件有</p><div class="language-tex vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">tex</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|--gradle</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|  |--wrapper</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|  |  |--gradle-wrapper.jar</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|  |  |--gradle-wrapper.properties</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|--build.gradle</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|--gradle.properties</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|--gradlew</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|--gradlew.bat</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|--settings.gradle</span></span></code></pre></div><p>其中build.gradle文件最为重要。</p><h2 id="如何转换maven项目为gradle项目" tabindex="-1">如何转换Maven项目为Gradle项目 <a class="header-anchor" href="#如何转换maven项目为gradle项目" aria-label="Permalink to &quot;如何转换Maven项目为Gradle项目&quot;">​</a></h2><p>在项目根目录，运行如下命令，按提示进行转换即可。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>gradle init</span></span></code></pre></div><p>转换后如果有提示错误，可根据相关提示进行修改。</p><h2 id="如何配置仓库" tabindex="-1">如何配置仓库 <a class="header-anchor" href="#如何配置仓库" aria-label="Permalink to &quot;如何配置仓库&quot;">​</a></h2><p>在build.grale中增加，仓库地址，此处以阿里云为例</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>repositories {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    maven {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        url &#39;https://maven.aliyun.com/repository/public/&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    mavenLocal()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    mavenCentral()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="如何配置插件仓库" tabindex="-1">如何配置插件仓库 <a class="header-anchor" href="#如何配置插件仓库" aria-label="Permalink to &quot;如何配置插件仓库&quot;">​</a></h2><p>在settings.gradle中增加，插件仓库地址，此处以阿里云为例</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pluginManagement {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    repositories {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        maven {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            url &quot;https://maven.aliyun.com/repository/gradle-plugin&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="如何将模块上传到私服" tabindex="-1">如何将模块上传到私服 <a class="header-anchor" href="#如何将模块上传到私服" aria-label="Permalink to &quot;如何将模块上传到私服&quot;">​</a></h2><p>引入maven-publish插件，并定义发布配置</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>publishing {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    publications {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        maven(MavenPublication) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            //指定group/artifact/version信息，可以不填。默认使用项目group/name/version作为groupId/artifactId/version</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            //如果是war包填写components.web，如果是jar包填写components.java</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            from components.java</span></span>
<span class="line"><span></span></span>
<span class="line"><span>//</span><span>            //配置上传源码</span></span>
<span class="line"><span></span></span>
<span class="line"><span>//            artifact sourceJar {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>//                classifier &quot;sources&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>//            }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    repositories {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        maven {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            //指定要上传的maven私服仓库</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            url = &quot;http://ip:port/repository/releases/&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            //认证用户和密码</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            credentials {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                username &#39;username&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                password &#39;password&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="如何引用本地jar文件" tabindex="-1">如何引用本地jar文件 <a class="header-anchor" href="#如何引用本地jar文件" aria-label="Permalink to &quot;如何引用本地jar文件&quot;">​</a></h2><p>与build.grdle同级目录创建libs文件夹，将本地jar放到该目录下，libs文件夹名可根据实际情况进行调整。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>dependencies {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    implementation fileTree(include: [&#39;*.jar&#39;], dir: &#39;libs&#39;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="如何生成bom管理依赖" tabindex="-1">如何生成BOM管理依赖 <a class="header-anchor" href="#如何生成bom管理依赖" aria-label="Permalink to &quot;如何生成BOM管理依赖&quot;">​</a></h2><p>使用java-platform插件进行依赖的管理</p><p><a href="https://ytq6nfyc5n.feishu.cn/docs/doccnVAamaPCJ5BjSY4fXT4z7me" target="_blank" rel="noreferrer">使用Gradle生成BOM管理依赖</a></p><h2 id="如何忽略测试" tabindex="-1">如何忽略测试 <a class="header-anchor" href="#如何忽略测试" aria-label="Permalink to &quot;如何忽略测试&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>gradle build -x test</span></span></code></pre></div><h2 id="如何清理缓存" tabindex="-1">如何清理缓存 <a class="header-anchor" href="#如何清理缓存" aria-label="Permalink to &quot;如何清理缓存&quot;">​</a></h2><p>gradle的默认位置为\${user.home}/.gradle，依赖的缓存位置为\${user.home}/.gradle/caches/modules-2/files-2.1，找到对应的依赖包删除即可。</p><h2 id="如何强制更新缓存" tabindex="-1">如何强制更新缓存 <a class="header-anchor" href="#如何强制更新缓存" aria-label="Permalink to &quot;如何强制更新缓存&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>gradle build --refresh-dependencies</span></span></code></pre></div><h2 id="如何处理idea编译时在configurate-projects卡住问题" tabindex="-1">如何处理IDEA编译时在Configurate projects卡住问题 <a class="header-anchor" href="#如何处理idea编译时在configurate-projects卡住问题" aria-label="Permalink to &quot;如何处理IDEA编译时在Configurate projects卡住问题&quot;">​</a></h2><p>通常情况下为相关的依赖无法下载的问题，检查配置的参考是否正确，尤其注意仓库地址的配置。</p><h2 id="如果打包成可执行jar" tabindex="-1">如果打包成可执行Jar <a class="header-anchor" href="#如果打包成可执行jar" aria-label="Permalink to &quot;如果打包成可执行Jar&quot;">​</a></h2><p>使用applcation插件，之后可以看到<code>distribution</code>的任务组，可以选择不同的任务。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>plugins {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    id &#39;java&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    id &#39;application&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>application {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    mainClass = &#39;com.digi.QuickSqlClient&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><p><img src="https://ytq6nfyc5n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjZiYzE3YjdkZDA2NWI0MGVjZTg1ZTY4Mzg3MjNiZGZfNVdQbWRNRFVNMmVwQTlidURtdjBJN1pwNFVRaFRlbHNfVG9rZW46Ym94Y25Sb3dvSTJBdUVQSkIza09MakdWY3hiXzE2MjEwNTUzMDM6MTYyMTA1ODkwM19WNA" alt="img"></p><p>参考链接<a href="https://docs.gradle.org/current/userguide/application_plugin.html" target="_blank" rel="noreferrer">The Application Plugin (gradle.org)</a></p><h2 id="如何打包成fat-jar" tabindex="-1">如何打包成Fat jar <a class="header-anchor" href="#如何打包成fat-jar" aria-label="Permalink to &quot;如何打包成Fat jar&quot;">​</a></h2><p>Spring项目默认就是FatJar了。</p><p><a href="https://www.baeldung.com/gradle-fat-jar" target="_blank" rel="noreferrer">Creating a Fat Jar in Gradle | Baeldung</a></p><h2 id="参考链接" tabindex="-1">参考链接 <a class="header-anchor" href="#参考链接" aria-label="Permalink to &quot;参考链接&quot;">​</a></h2><p><a href="https://howtodoinjava.com/gradle/convert-maven-project-to-gradle-project/" target="_blank" rel="noreferrer">Gradle - Convert Maven Project to Gradle Project</a></p><p><a href="https://zhuanlan.zhihu.com/p/185013144" target="_blank" rel="noreferrer">手把手，一步步教你将Maven项目迁移到Gradle</a></p><p><a href="https://www.jianshu.com/p/c7f94a1e3fbd" target="_blank" rel="noreferrer">Gradle依赖缓存的清除</a></p><p><a href="https://blog.csdn.net/u013066244/article/details/113444036" target="_blank" rel="noreferrer">Gradle全局配置国内镜像</a></p><hr><p>欢迎联系我</p><p>微信号 ：Crazy_Airhead</p><p>Mixin ID : 1091586</p><p>定投课堂邀请码：6DYMBFP061</p><p>李笑来写作课邀请码：38MDGFYZK8</p><p>水龙头邀请码：FDJQHJ</p>`,55)])])}const u=s(l,[["render",i]]);export{g as __pageData,u as default};
