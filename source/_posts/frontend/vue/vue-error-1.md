---
title: VUE踩坑记-01
toc: true
p: /frontend/vue/vue-error-1
date: 2019-05-09 13:36:47
categories:
- vue
tags:
- vue
---
## 背景

因为公司目前暂时没的前端，于是准备自己用Vue和TypeScript入手公司项目的管理后台。因为Vue已经有很多UI框架了（比如Element），而TypeScript呢，引入了类等概念，对于Java开发人员来说是比较容易入手的。而后端开发人员可能最头疼的是CSS布局吧，于是找了vue-element-admin来抄，当然有人改了个TypeScript版本[vue-typescript-admin-template](<https://github.com/Armour/vue-typescript-admin-template>)。

## 问题

经过一段时间的熟悉yarn和代码结构，我们开始了服务端的调用。

### 跨域问题

本地服务开发我们是可以设置Chrome的跨域的（--disable-web-security
--user-data-dir=），但为了后面更好的开发和及时发现问题，我们还是使用了Proxy方式，按vue-cli的文档，增加`vue.config.js`的devServer配置就要可以，如下：

```js
module.exports = {
  /**
   * vue-cli3跨域的全配置！
   */
  devServer: {
     proxy:  'http://172.26.0.252:8881'
  }
}

```

但我们还是出现了问题，原来在`request.ts`中也设置了服务器地址

```typescript
const service = axios.create({
  baseURL: 'http://172.26.0.252:8881',
  timeout: 5000
})
```

其实呢这个值应该设置在`.env`中，设置VUE_APP_BASE_API

```properties
VUE_APP_BASE_API=http://172.26.0.252:8881
```

### 远程调用

解决了跨域之后，开始了实际的接口调用，修改的是登录页面，一测试，报这样的错。

```typescript
login error:Error: ERR_ACTION_ACCESS_UNDEFINED: Are you trying to access this.someMutation() or this.someGetter inside an @Action? 
That works only in dynamic modules. 
If not dynamic use this.context.commit("mutationName", payload) and this.context.getters["getterName"]
Error: Could not perform action Login
    at Store.eval (webpack-internal:///./node_modules/vuex-module-decorators/dist/esm/index.js:333:37)
    at step (webpack-internal:///./node_modules/vuex-module-decorators/dist/esm/index.js:114:23)
    at Object.eval [as throw] (webpack-internal:///./node_modules/vuex-module-decorators/dist/esm/index.js:95:53)
    at rejected (webpack-internal:///./node_modules/vuex-module-decorators/dist/esm/index.js:86:65)
Error: error with code: undefined
    at __webpack_exports__.default (webpack-internal:///./src/utils/request.ts:48:133)
```

嗯，完全没在头绪，查了下呢看到这篇[Rejected action throws ERR_ACTION_ACCESS_UNDEFINED](<https://github.com/championswimmer/vuex-module-decorators/issues/26>)，说是增加rawError，因为对Vuex不熟悉，也还是不知道怎么加。

之后查看了[[vuex-module-decorators](https://championswimmer.in/vuex-module-decorators/)](<https://championswimmer.in/vuex-module-decorators/pages/installation.html>)的基本文档。

回头重新看[issues](<https://github.com/championswimmer/vuex-module-decorators/issues>)，搜索`ERR_ACTION_ACCESS_UNDEFINED`，记录还是不少的，一条条的看，终于看到rawError如何设置。

```typescript
@Action({ rawError: true })
```

修改代码，测试这个时候报错

```typescript
code undifined
```

问题于是又定位到了`request.ts`上。

查看代码，如下：

```typescript
service.interceptors.response.use(
  (response) => {
    // Some example codes here:
    // code == 20000: valid
    // code == 50008: invalid token
    // code == 50012: already login in other place
    // code == 50014: token expired
    // code == 60204: account or password is incorrect
    // You can change this part for your own usage.
    const res = response.data
    if (res.code !== 20000) {
      Message({
        message: res.message,
        type: 'error',
        duration: 5 * 1000
      })
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        MessageBox.confirm(
          '你已被登出，可以取消继续留在该页面，或者重新登录',
          '确定登出',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          UserModule.FedLogOut().then(() => {
            location.reload() // To prevent bugs from vue-router
          })
        })
      }
      return Promise.reject(new Error('error with code: ' + res.code))
    } else {
      return response.data
    }
  },
  (error) => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)
```

是的，我们的返回值没有返回code，错误被上一层的Module给捕获了，接下来改代码就好了。

## 小结

实操才会碰到问题，才能解决问题，看文档时你是不会知道有多少坑的，你以为你会了实际上你还不会。





