---
title: VUE踩坑记-02
toc: true
p: frontend/vue/vue-error-2
date: 2019-05-13 15:42:18
categories:
tags:
---
## 背景
上一篇说到使用vue-element-admin来做后端管理，经同事的介绍可以使用Muse-ui来做前端应用。查看了Muse的官网后，准备踩坑下。

## 快速入门
在Github上看到MuseUI的模板[nuxt-template](https://github.com/museui/nuxt-template)。
```sh
vue init museui/nuxt-tempalte myproject
cd my-project
yarn instll
yarn run dev
```
一切看起来很美好，http://localhost:3000可直接看页面了。

## Nuxt.js
一看源码，连App.vue都没有，刚有点基础的我慌了。赶紧查查是什么？

简单点说[Nuxt.js](https://github.com/nuxt/nuxt.js)是一个基于Vue.js的通用应用框架，重点关注应用的UI渲染（支持客户端和服务端渲染），另外它像Maven一样规定了项目的目录结构，对于初学者来说，看懂文档，还是相对容易创建一个新的项目的。这里有它的[文档](https://zh.nuxtjs.org/)，可以自行了解。

## 将项目转成TypeScript
之前说过，ts更接近java，为了统一，我准备将项目转换成ts的，顺便多熟悉下Nuxt。
### 创建
```sh
mkdir myproject2
```
用VSCode打开空目录，`myproject2`
### 新建package.json文件
package.json 文件用来设定如何运行 nuxt：
```json
{
  "name": "myproject2",
  "scripts": {
    "dev": "nuxt"
  }
}
```

### 安装Nux

```sh
yarn add nuxt
```

### pages目录

Nuxt.js 会依据 `pages` 目录中的所有 `*.vue` 文件生成应用的路由配置。

创建 `pages` 目录：

```sh
mkdir pages
```

创建我们的第一个页面 `pages/index.vue`：

```vue
<template>
  <h1>Hello world!</h1>
</template>
```

### 启动

```sh
yarn run dev
```

此时我们的应用运行在 [http://localhost:3000](http://localhost:3000/) 上运行。

### 支持TypeScript

为了能够在项目中使用TypeScript，您需要将`@nuxt/typescript`和`ts-node`作为开发依赖项安装：

```sh
yarn add -D @nuxt/typescript
yarn add ts-node
```

需要创建一个空的`tsconfig.json`文件，`tsconfig.json`文件将在您第一次运行`nuxt`命令时使用默认值自动更新。

```sh
touch tsconfig.json
```

### 配置文件

为了能够在配置文件中使用TypeScript，您只需要将`nuxt.config.js`重命名为`nuxt.config.ts`。

### 使用ESLint

```
yarn add -D @typescript-eslint/eslint-plugin
```

然后，通过添加`@typescript-eslint`插件并使`@typescript-eslint/parser`作为默认解析器来编辑ESLint配置(`.eslintrc.js`)。

```js
module.exports = {
  plugins: ['@typescript-eslint'],
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  extends: [
    '@nuxtjs'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error'
  }
}
```

最后，添加或编辑`package.json`的`lint`脚本：

```json
"lint": "eslint --ext .ts,.js,.vue --ignore-path .gitignore ."
```

### 使用MuseUI

#### 拷贝pages文件

将myproject下的about.vue和index.vue拷到pages下

#### 拷贝plugins文件

将myproject下的muse-ui.js拷贝过来并重命名为muse-ui.ts

#### 修改配置文件

将`nuxt.config.js`拷贝过来重命名为`nuxt.config.ts`。其中去掉eslint的相关配置。修改vendor为

```typescript
    vendor: [
      '~/plugins/muse-ui'
    ]
```

#### 问题

此时通过`yarn run dev`已经可正常编译，但运行时会页面会提示错误。大致错误

```
SyntaxError
Invalid or unexpected token

vm.js
Missing stack framesJS 
new Script@80:7
```

查官网[issues](<https://github.com/museui/muse-ui/issues/1347>)，说是还不支持ssr，调整plugins配置就可以了。

```typescript
  plugins: [
    {
      src: '~plugins/muse-ui',
      ssr: false
    }
  ]
```

最终的`nuxt.config.ts`文件

```typescript
module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'myproject2',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js Muse-UI project' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  plugins: [
    {
      src: '~plugins/muse-ui',
      ssr: false
    }
  ],
  /*
  ** Build configuration
  */
  build: {
    babel: {
      plugins: [
        ['import', {
          libraryName: 'muse-ui',
          libraryDirectory: 'lib',
          camel2DashComponentName: false
        }]
      ]
    },
    vendor: [
      '~/plugins/muse-ui'
    ],
    extractCSS: true
  }
}

```

经过以上的修改已经可以通过nuxt来管理vue项目，并能过ts来写代码了。





