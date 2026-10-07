---
date: '2018-11-21T17:14:33'
title: YARN命令
categories:
  - frentend
  - nodejs
tags:
  - nodejs
  - yarn
---
## 为什么

自己用Hexo来做博客而用到了nodejs和npm。但npm生成的`node-modules`层次过深，时常打开文件夹时会很慢。

后来了解到了yarn，在yarn发布之前，所有Nodejs开发者用的都是npm包管理工具，而npm工具存在挺多难以忍受的诟病，包括安装速度慢、每次都要在线重新安装等问题，而yarn也是为了解决npm当前所存在的问题而出现的。

为了方便自己使用，整理了下安装和基本操作。

## 安装

- 如果原先有npm工具的话，安装yarn很简单，只需要一行命令即可：

```shell
npm install -g yarn
```

- 如果没有npm工具，安装yarn可参照[各平台下yarn工具安装方式](https://yarnpkg.com/en/docs/install)。

## 更换安装源

安装yarn之后默认的包安装源是https://registry.yarnpkg.com，可用查看命令

```shell
yarn config get registry 
```

若想提高yarn安装的速度，可将包安装源修改为cnpm的安装源，执行以下命令即可

```shell

yarn config set registry https://registry.npm.taobao.org --global 
yarn config set disturl https://npm.taobao.org/dist --global

```

## 操作及对比

| 操作                                     | npm                           | yarn                        |
| ---------------------------------------- | ----------------------------- | --------------------------- |
| 初始化项目                               | npm init                      | yarn init                   |
| 安装依赖操作                             | npm install/link              | yarn install/link           |
| 安装某个依赖，并且默认保存到package      | npm install xxx —save         | yarn add xxx                |
| 移除某个依赖项目                         | npm uninstall xxx   —save     | yarn remove xxx             |
| 安装某个开发时依赖项目                   | npm install --save   -dev xxx | yarn add xxx —dev           |
| 更新某个依赖项目                         | npm update --save xxx         | yarn upgrade xxx            |
| 安装某个全局依赖项目                     | npm install -g xxx            | yarn global add xxx         |
| 发布/登录/登出，一系列NPM   Registry操作 | npm   publish/login/logout    | yarn   publish/login/logout |
| 运行某个命令                             | npm run/test                  | yarn run/test               |
| 查看帮助                                 | npm -h                        | yarn -h                     |

## 注意事项

### yarn global

yarn 的全局安装并不是加 -g 或者 --global 这样的参数，它使用 [yarn global](https://yarnpkg.com/en/docs/cli/global) 命令。用 yarn global --help 可以看到子命令列表



这些子命令的用法和非 global 的同名命令用法差不多。

### 指定bin目录

对于一些带 CLI 的模块，通过 yarn global add 可能会出问题，yarn global bin查看目录，并把该目录添加到Path中。



### 指定registry但没有效果

1. yarn.lock中包含的registry信息与设置的registry不同，删除yarn.lock重新生成即可。

## 参考

[yarn —— Nodejs包新管理工具](https://segmentfault.com/a/1190000007189426)

[使用 yarn global 代替 npm -g](https://segmentfault.com/a/1190000008489881)

["yarn config set registry" is not work · Issue #4862 · yarnpkg/yarn (github.com)](https://github.com/yarnpkg/yarn/issues/4862)





