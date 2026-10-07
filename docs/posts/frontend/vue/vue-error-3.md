---
date: '2020-10-19T21:50:44'
title: VUE踩坑记-03
categories:
  - vue
tags:
  - vue
---
## 背景

使用最新版本[vue-typescript-admin-template](https://github.com/Armour/vue-typescript-admin-template)进行项目二次开发，其对应的开发文档没有描述如何配置VS Code调试。
自己在取消Mock后，对接服务端时，碰到了登录后无法调整首页的问题，配置了调试也不能准确定位，提示的错误提示不能明确问题出在哪里。后经过同事的帮忙和自己的尝试最终定位问题，于是整理了本文用于记录VS Code的调试配置。

## 配置VS Code 调试
根据vue官方文档[在 VS Code 中调试](https://cn.vuejs.org/v2/cookbook/debugging-in-vscode.html)，以下内容是对自官网文档的摘录。
### 先决条件
安装VS Code的Debugger扩展[Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)

### 在浏览器中展示源代码
在可以从 VS Code 调试你的 Vue 组件之前，你需要更新 webpack 配置以构建 source map。做了这件事之后，我们的调试器就有机会将一个被压缩的文件中的代码对应回其源文件相应的位置。这会确保你可以在一个应用中调试，即便你的资源已经被 webpack 优化过了也没关系。

因为使用的是Vue CLI 3，需要设置并更新`vue.config.js`内的 devtool property：
```js
module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  }
}
```
### 从 VS Code 启动应用
点击在 Activity Bar 里的 Debugger 图标来到 Debug 视图，然后点击那个齿轮图标来配置一个`launch.json`的文件，选择 Chrome：Launch 环境。然后将生成的 launch.json 的内容替换成为相应的配置：
```json
{
    "version": "0.2.0",
    "configurations": [
            {
                "type": "chrome",
                "request": "launch",
                "name": "vuejs: chrome",
                "url": "http://localhost:8080",
                "webRoot": "${workspaceFolder}/src",
                "breakOnLoad": true,
                "sourceMapPathOverrides": {
                    "webpack:///src/*": "${webRoot}/*"
            }
        }
    ]
}
```

## 问题代码
经过以上配置是可以做调试了，但很多时候断点的位置不对，给代码跟踪造成问题。比如：按F10时，应该往下一行，但断点位置跳来跳去；if语句也无法断点，提示`unbounded breakpoint`，调试的时候断点就跑类名上去。

### `user.ts`文件
虽然不知道具体的原因，但还是能把问题的主函数定位出来。然后在同事的提醒下开始逐行写日志，定位问题是`data.user`，返回的数据没有`user`属性。
```ts
  @Action
  public async GetUserInfo() {
    if (this.token === '') {
      throw Error('GetUserInfo: token is undefined!')
    }
    
    const { data } = await getUserInfo({ id: this.id })
    if (!data) {
      throw Error('Verification failed, please Login again.')
    }

    const { roles, name, avatar, email } = data.user
    // roles must be a non-empty array
    if (!roles || roles.length <= 0) {
      throw Error('GetUserInfo: roles must be a non-null array!')
    }

    this.SET_ROLES(roles)
    this.SET_NAME(name)
    this.SET_AVATAR(avatar)
    this.SET_EMAIL(email)
  }

```

于是只能继续检索文档，其中的两篇文章对我帮助比较大：
- [vue 在 vscode 中断点调试问题](https://www.jianshu.com/p/d3329e9cd126)
- [Vue.js debugging in Chrome and VS Code isn't working #201](https://github.com/Microsoft/vscode-recipes/issues/201)。

## 最终配置
### 调整`babel.config.js`文件
根据《vue 在 vscode 中断点调试问题》的描述是不能断点在async await的代码上，自己验证的情况是不加也可以了。因为自己对前端不熟悉，为了保险起见，还是统一加上的好。
```js
module.exports = {
  "env": {
    "development": {
      "sourceMaps": true,
      "retainLines": true, 
    }
  },
  presets: [
    '@vue/cli-plugin-babel/preset'
  ]
}
```
### 调整`vue.config.js`文件
使用官方的配置就可以了，也可以按下面的方式进行调整，打开注释就可以了。
```js
// https://webpack.js.org/configuration/devtool/#development
// Change development env source map if you want.
// The default in vue-cli is 'eval-cheap-module-source-map'.
config
    .when(process.env.NODE_ENV === 'development',
    config => config.devtool('source-map')
    )
```

### 调整`launch.json`文件
调整`sourceMapPathOverrides`的配置，主要是给自己编写的代码打断点。
```json
{
    "version": "0.2.0",
    "configurations": [
            {
                "type": "chrome",
                "request": "launch",
                "name": "vuejs: chrome",
                "url": "http://localhost:8080",
                "webRoot": "${workspaceFolder}/src",
                "breakOnLoad": true,
                "sourceMapPathOverrides": {
                    "webpack:///./src/*": "${webRoot}/*",
                    "webpack:///src/*": "${webRoot}/*",
                    "webpack:///*": "*",
                    "webpack:///./~/*": "${webRoot}/node_modules/*"
            }
        }
    ]
}
```

### 遗留问题

如果像`data.user`这样发生异常时，断点的位置还是会出现错乱的情况，暂时不知道如何调整。

