---
title: notepad++添加插件管理
toc: true
p: misc/notepad-plus
date: 2018-11-27 15:07:40
categories:
- misc
tags:
- notepad++
---

使用Notepad++有挺长一段时间了。因为打开速度快，经常会用它来编绎有一些小文本，或者文件的格式化。在一次升级后发现Json Viwer插件不见了。
当时也没太在意，换了一台电脑用了。最近因为查问题需要格式化的JSON也多了起来，就想查查到底是怎么回事，顺便记录下处理方式。

网上一搜还有不少碰到这个问题的人[notepad++64位添加Plugin Manager](https://www.cnblogs.com/holab/p/8593359.html)。大意是64位已经不提供plugin manager了。可以通过[https://github.com/bruderstein/nppPluginManager/releases](https://github.com/bruderstein/nppPluginManager/releases)下载Plugin Manager。下载之后，用覆盖的方式粘贴plugins和updater文件夹，重新启动就可以。

启动之后提示，32位Notepad++不能运行64位插件。索性重新下载了个新版本的Notepad++64位，plugin manager已经改名为Plugin Admin了。下载我自己需要的插件，一切正常。



