---
title: YARN命令
date: 2018-11-21 17:14:33
categories:
- frentend
- nodejs
tags: [nodejs, yarn]
---
## 说明
用Hexo来做博客而用到了npm。但npm生成的`node-modules`导次过深，时常打开文件夹时会很慢。
后面发现其实yarn也挺好用的，为了不要每次搜索命令，自己做个备份。
## 命令
- 安装
```
npm install yarn -g
```

- 更换安装源
```
yarn config set registry 'https://registry.npm.taobao.org'  
```
- 初始化新项目
```
yarn init
```

- 添加依赖包
```
yarn add [package]
yarn add [package]@[version]
yarn add [package]@[tag]
```
将依赖项添加到不同依赖项类别
分别添加到 devDependencies、peerDependencies 和 optionalDependencies：
```
yarn add [package] --dev
yarn add [package] --peer
yarn add [package] --optional
```

- 升级依赖包
```
yarn upgrade [package]
yarn upgrade [package]@[version]
yarn upgrade [package]@[tag]
```

- 移除依赖包
```
yarn remove [package]
```

- 安装项目的全部依赖
```
yarn
```
或者
```
yarn install
```