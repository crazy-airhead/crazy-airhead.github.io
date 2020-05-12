---
title: Jfinal前后端分离项目CORS问题处理
toc: true
p: /java/cors
date: 2020-02-22 10:11:09
categories:
- jfinal
- vue
- cors
tags:
- jfinal
- vue
- cors
---

## 概要

对于前后端分离的项目，无论是开发还是部署，可能都会碰到CORS问题。采用Jfinal-undertow方式发布的应用来说，通常是不需要考虑CORS的，因为前端与后端是一起发布的，但在开发时或采用分离部署时，还是会碰到的这个问题，因此在这里按开发和部署两部分讲解如何解决CORS问题。

首先我们简单的了解下什么是CORS，完整的资料可以自己查看[wikipedia](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)。

## CORS

跨域资源共享（**CORS，Cross-origin resource sharing**），它是一种允许**受限的访问第一个访问资源域**以外的资源（如字体）的机制。一张网页通常包含了很多跨域的图片，样式，脚本，iframes，或者视频，但一些跨域请求，尤其是Ajax请求，会因为默认的[同源安全策略](https://en.wikipedia.org/wiki/Same-origin_policy)（简单来说就是绝对路径，需要是协议，域名，端口号三者与第一个访问的资源（浏览器中输入的URL）相同，才被认为是同源）而被禁止访问。

CORS定义了浏览器和服务器如何来决定一个跨域请求是安全的。它比完全同源请求有更多的自由和功能，但不要只是简单地允许所有跨源请求。CORS规范最初是作为W3C推荐标准发布的，但该文档已经过时。 [Fetch Living Standard](https://fetch.spec.whatwg.org/)是当前维护活跃的规范。

对于程序开发来说，可能知道与CORS相关的请求头与响应头，已经够用了。如果需要更细的控制，可以进一步的阅读文档。

### 请求头

- Origin

- Access-Control-Request-Method

- Access-Control-Request-Headers

### 响应头

- Access-Control-Allow-Origin

- Access-Control-Allow-Credentials

- Access-Control-Expose-Headers

- Access-Control-Max-Age

- Access-Control-Allow-Methods

- Access-Control-Allow-Headers

我们通常使用的是`Access-Control-Allow-Origin: *`。

## 开发阶段

### 前端处理

如果后端没有做任何处理的情况，前端通常使用设置Chrome跨域选项和配置vue-cli代理模式这两种方式。推荐使用配置vue-cli代理模式，因为测试人员就可以不需要修改选项了。

#### 修改Chrome跨域选项

对于Windows用户来说，创建个Chrome的快捷方式，target后中增加`--disable-web-security --user-data-dir=`即可，如：

```sh
"...\chrome.exe" --disable-web-security --user-data-dir=
```

对于MacOS用户来说，需要创建好用户数据目录，否则可能无法打开。

```
open -n /Applications/Google\ Chrome.app/ --args --disable-web-security --user-data-dir=/Users/work/ChromeDevUserData
```

#### vue-cli修改代理模式

参照vue-cli3的文档中的[devServer.proxy](https://cli.vuejs.org/zh/config/#devserver-proxy)配置即可。

```javascript
module.exports = {
  /**
   * vue-cli3跨域的全配置！
   */
  devServer: {
     proxy:  'http://172.26.0.252:8881'
  }
}
```

### 后端处理

当然我们是希望前端不需要做任何配置，此时后端需要做些开发。实现的方式有很多，这里只展示一种方式简单的实现方式，通过扩展`Interceptor`实现`CorsInterceptor`，代码如下：

```java
public class CorsInterceptor implements Interceptor {
  @Override
  public void intercept(Invocation inv) {
    inv.invoke();
    addCorsHead(inv.getController().getResponse());
  }

  private void addCorsHead(HttpServletResponse response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET");
    response.setHeader("Access-Control-Max-Age", "3600");
    response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  }
}

//针对性的提供Cors支持
@Before(CorsInterceptor.class)
public class IndexController extends Controller {
  public void index() {
    renderJson(Ret.ok());
  }
}

public class DemoConfig extends JFinalConfig {
  @Override
  @Override
  public void configInterceptor(Interceptors me) {
    //此处可以加个参数判断，是否加载CorsInterceptor
    me.addGlobalActionInterceptor(new CorsInterceptor());
  }
} 
```

## 部署阶段

### Jfinal-undertow部署目录结构

jfinal-undertow推荐采用目录结构部署系统，当然也支持`fatjar`打包，可以参看[jfinal-undertow 下部署](https://jfinal.com/doc/1-3)。以下是就打包好后的目录格式。

```sh
.app
├──config
├──lib
├──webapp
|  └──index.html
└──jfinal.sh
```

采用这种方式部署是没有跨域问题的。

### Nginx部署

正式环境更多的可能会用Nginx来做反向代理，将不同域名整一起。以下是简单示例，仅供参考：

```nginx
server {
  listen 80;
  server_name demo.com;
  client_max_body_size 50m;

  location / {
    proxy_pass http://172.17.0.1:80;
  }

  location /api {
    proxy_pass http://172.17.0.1:81/api;
  }
}
```

## 参考链接

[CORS 跨域资源共享](https://l4qiang.me/2018/05/12/frontend/security/cors/)
