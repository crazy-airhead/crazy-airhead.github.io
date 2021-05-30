---
title: Jfinal前后端分离项目指南
toc: true
p: java/frontend
date: 2020-02-18 21:57:46
categories:
- jfinal
- vue
tags:
- jfinal
- vue
---

## 概要

本指南只针对使用jfinal开发后端，vue开发前端，使用undertow方式部署的项目。对于非undertow部署项目，可能有所区别，可参考本文自行调整。对使用了Ningx的用户，可以参看Vue文档进行配置。

本文主要针对vue-router采用不同的[HTML5 History 模式](https://router.vuejs.org/zh/guide/essentials/history-mode.html#后端配置例子)时的不同处理方法。此处假定你已按undertow方式正常运行后台项目。

<!-- more -->

## hash模式

`vue-router` 默认 hash 模式 —— 使用 URL 的 hash 来模拟一个完整的 URL，于是当 URL 改变时，页面不会重新加载。

jfinal默认不会对静态页面进行处理（严格一点来说是不会对有“.”路由进行处理）。所以对于hash模式时，你只要把前端页面放置到`webapp`目录下即可，为了更好管理可以增加个目录，如`web`。

为了可以直接访问根路径，可以增加一个IndexController，并增加路由。

```java
public class IndexController extends Controller {
  @Clear
  public void index() {
    render("index.html");
  }
}

public class DemoConfig extends JFinalConfig {
  @Override
  public void configRoute(Routes me) {
    me.add("/", IndexController.class, "/web");
  }
} 
```

## history模式

当你使用 history 模式时，URL 就像正常的 url，例如 `http://yoursite.com/user/id`，也好看！不过这种模式要玩好，还需要后台配置支持。因为我们的应用是个单页客户端应用，如果后台没有正确的配置，当用户在浏览器直接访问 `http://oursite.com/user/id` 就会返回 404，这就不好看了。

对于Jfinal官网中反馈（详见参考链接），发现更简单的方式还是增加Handler定向转发。此时需要和前端约定好转发路由，如`/web`。

### 前端配置

需要参考[publicPath](https://cli.vuejs.org/zh/config/#publicpath),将发布目录配置成`/web`(该值默认为`/`)。

```javascript
module.exports = {
  publicPath: "/web"
}
```

### 后端修改

参考`FakeStaticHandler`(com.jfinal.ext.handler)，实现`FakeIndexHandler`并增加配置。

```java
public class FakeIndexHandler extends Handler {
  protected static final RenderManager renderManager = RenderManager.me();
  private String route;
  private String viewPath;

  public FakeIndexHandler(String route, String viewPath) {
    this.route = route;
    this.viewPath = viewPath;
  }

  @Override
  public void handle(
      String target,
      HttpServletRequest request,
      HttpServletResponse response,
      boolean[] isHandled) {
    if (!target.startsWith(route)) {
      next.handle(target, request, response, isHandled);
      return;
    }

    if (target.indexOf('.') != -1) {
      return;
    }

    isHandled[0] = true;
    renderManager.getRenderFactory().getRender(viewPath).setContext(request, response).render();
  }
}

public class DemoConfig extends JFinalConfig {
  @Override
  public void configHandler(Handlers me) {
    me.add(new FakeIndexHandler("/web", "/web/index.html"));
  }
} 


```

## 小结

Jfinal-undertow可以轻松应对HTML5 History的不同模式，如果是hash模式，可以说是原生支持，如果是History模式，也相对简单。但对于初次使用者来说，可能还是会碰上问题。对于我来说写`FackIndexHandler`时，就忘记处理静态资源和设置`isHandled[0]=true`。

希望本文对你有帮助，本文首发[https://l4qiang.me/2020/02/18/java/frontend/](https://l4qiang.me/2020/02/18/java/frontend/)。

## 参考链接

[波总您好，jfinal-undertow下前后端分离项目合并部署访问不到页面](http://www.jfinal.com/feedback/5623)

