---
title: 使用Github Pages和Hexo搭建个人博客
toc: true
date: 2016-10-05 22:36
categories:
- misc
tags: [Github Pages, hexo]
---

本文是自己在使用Github Pages和Hexo搭建个人博客时的一些经验记录和总结，并非手把手搭建的过程。

## 为什么
之前在博客大巴上是有写一些博客的，不过因为己写作能力的一些原因，实际上写的也不多，后面也基本上就断了。最近跳槽到一家互联网公司，语言也转了Java，又学习了一些Web知识，所以也就想多试一些东西。

选Github Pages呢，是因为自己在搜索一些资料时时常会到Github上，当时也不知道这是Github Pages，虽然有使用Github，是有点Out了。后面又机缘巧合的看到了一些使用Github Pages搭建个人博客的文章，也就来了兴趣。

> GitHub Pages sites are subject to the following usage limits:
> 
> GitHub Pages source repositories have a recommended limit of 1GB .
Published GitHub Pages sites may be no larger than 1 GB.
>
> GitHub Pages sites have a bandwidth limit of 100GB or 100,000 requests per month.
>
> GitHub Pages sites have a limit of 10 builds per hour.

这些限制对我来说，都不是大问题，没有这么大的访问量。

## 创建Github Pages仓库

因为本身有使用过Github，所以直接从创建仓库开始，如果是完全的新手建议看这篇[如何搭建一个独立博客——简明Github Pages与Hexo教程](http://www.jianshu.com/p/05289a4bc8b2)，我也基本上是参考这篇来搭建的。创建以`<username>.github.io`为名的仓库，对于我来说是*enderjo.github.io*。一开始看博文是没看懂，以为是用户名的仓库。后面也多搜了几篇，多看了几遍才明白，也可以直接看[Configuring a publishing source for GitHub Pages](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/)
除了仓库名，也就没有什么特别的注意点了，从推荐的几个模板中选择一个模板。要不了几分钟，就可以使用[https://enderjo.github.io](https://enderjo.github.io)来访问页面了。

**注意**如果用户名包含大小写时，需要按用户名的全部小写来创建仓库名。

## 绑定域名
在没有配置CNAME之前可以之接填写*enderjo.github.io*的域名，会自动解析。
对于Github来说，绑定域名是非常简单的。创建一个`CNAME`的文件，写上域名，上传就可以了。可以在`blog`的`source`放置该文件，生成发布时会被生成到`pubic`目录下，避免因`hexo clean`重新生成文件时引起域名不可解析问题。

``` bash
l4qiang.me
```

### 域名解析
我是在阿里云买的`l4qiang.me`域名，也就可以使用阿里云的域名解析服务。
简要的说，就是自定义域名解析增加如下4条A记录中的一个就自动开启了。参考文档[Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site)
- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

### 开启HTTPS
参考[这里](https://blog.github.com/2018-05-01-github-pages-custom-domains-https/)，[Securing your GitHub Pages site with HTTPS](https://docs.github.com/en/github/working-with-github-pages/securing-your-github-pages-site-with-https开启HTTPS。

以上已经能通过域名正常访问博客了。

## 使用Hexo
Github推荐使用的是Jekyll做为静态网站生成器，但是因为用的是Ruby，没怎么接触，就找到了[Hexo](https://hexo.io/zh-cn/)做为替代。

### 安装Nodejs
下载[Nodejs 6.7](https://nodejs.org/dist/v6.7.0/node-v6.7.0-x64.msi)，默认安装就可以了。

### 安装hexo

``` bash
npm install hexo-cli -g
hexo init blog
cd blog
npm install
hexo server
```
### Hexo配置

在blog的根目录可以看到Hexo配置文件`_config.yml`，基本上的配置都是修改这个文件。

需要修改内容如下，其他内容可以不修改：

``` yml
# Site
title: CrazyAirhead
subtitle: 疯狂的傻瓜，傻瓜也疯狂————傻方能执著，疯狂才专注!
description: 记录点滴，注重积累。
author: L4qiang
email: L4qiang@gmail.com
language: zh-CN
timezone: 

# URL
## If your site is put in a subdirectory, set url as 'http://yoursite.com/child' and root as '/child/'
url: http://l4qiang.me
root: /

# Extensions
## Plugins: https://hexo.io/plugins/
## Themes: https://hexo.io/themes/
theme: gstyle

# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  type: git
  repo: https://github.com/enderjo/enderjo.github.io.git
  branch: master

```
### 选择模板与配置
根据选择的模板，修改配置。我选择了[gstyle](https://github.com/wayou/hexo-theme-gstyle)，下载后解压到themes文件夹下（一般文件名比较长，需重命名）。

需要修改Hexo`_config.yml`的内容有:

```
# add caption for iamges
image_caption:
  enable: true
  class_name:

prism_plugin:
  mode: 'preprocess'    # realtime/preprocess 
  theme: 'default'

active_nav: false
```

需要修改themes配置文件，在对应的模板目录下，也是`_config.yml`。

#### 修改评论
这里使用了多说，需要修改配置

```
duoshuo_shortname: enderjo
``` 

需要注册并[创建站点](http://duoshuo.com/create-site/)，`duoshuo_shortname`中填写的就是多说站点的二级域名需要填写的部分。

因为多说停服务，所以这部分内容需要更新，暂时未更新。

### hexo基本操作

```
hexo help
Usage: hexo <command>

Commands:
  clean     Removed generated files and cache.
  config    Get or set configurations.
  deploy    Deploy your website.
  generate  Generate static files.
  help      Get help on a command.
  init      Create a new Hexo folder.
  list      List the information of the site
  migrate   Migrate your site from other system to Hexo.
  new       Create a new post.
  publish   Moves a draft post from _drafts to _posts folder.
  render    Render files with renderer plugins.
  server    Start the server.
  version   Display version information.

Global Options:
  --config  Specify config file instead of using _config.yml
  --cwd     Specify the CWD
  --debug   Display all verbose messages in the terminal
  --draft   Display draft posts
  --safe    Disable all plugins and scripts
  --silent  Hide output on console

For more help, you can use 'hexo help [command]' for the detailed information
or you can check the docs: http://hexo.io/docs/
```

#### 写作
```bash
$ hexo new [layout] <title>
```
如果需要更好的进行写作的管理可以使用-p参数
```bash
$ hexo new -p zeronet/zernet-1 zeronet-1
```

#### 分类
```bash
$ hexo new page categroies
```
在生成的index.md文件下增加type: categroies

#### 标签
```bash
$ hexo new page tags
```
在生成的index.md文件下增加
```
type: tags
comments: false
```
#### 测试
```bash
$ hexo server
$ hexo s
```
如果运行时浏览器无法打开，可能是默认端口（4000）被占用了，换个端口试试。
```bash
$ hexo s -p 5000
```
可以通过`netstat -ano`来查看占用端口的进程。本机是被Foxit Service给占用了，禁用该进程。

#### 生成与发布

```bash
$ hexo generate --deploy
$ hexo deploy --generate
```

简写

```bash
$ hexo g -d
$ hexo d -g
```

生成发布时可能会出现找不到用户名的问题，可以修改git配置

```
git config --global credential.helper wincred
```

### 图床
使用了[七牛](https://www.qiniu.com/)的空间，使用`qrsbox`进行同步。

### 源码托管
使用了[Gitee](https://gitee.com/)的私有库，Gitee个人开发者可免费创建 1000 个项目（不限公有、私有），提供最多5G的免费代码存储空间。这样将整个博客的源码按版本管理起来。

## 总结
对于使用Github Pages和Hexo搭建个人博客，整体配置下来是难度不会大，主要是因为有些东西没有接触过会多花一些时间来理解。另外就是一些博文不一定会有及时的更新，一些操作也是会不一样的，所有对自己来说，能找到原始出处的就尽量用原始内容。

