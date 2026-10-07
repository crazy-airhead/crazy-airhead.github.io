---
date: '2020-03-01T14:13:25'
title: Jfinal如何为不同的应用提供不同的认证与授权
categories:
  - jfinal
  - Authentication
  - Authorization
tags:
  - jfinal
  - Authentication
  - Authorization
---

## 背景

我们需要先了解下认证和授权，因为这两个概念常常被混淆。认证是鉴定用户身份的过程，它通常使用一个标识符 （如用户名或电子邮件地址）和一个加密令牌（比如密码或者存取令牌）来 鉴别用户身份（处理我是谁的问题）。授权是指验证用户是否允许做某件事的过程（处理我能做什么的问题）。更详细描述可以参看[这里](https://insights.thoughtworks.cn/api-2/)。

接下来说说，我们可能碰到的问题，一个产品可能会发布多个前端应用，比如Web，APP，小程序（微信，百度等），管理后台，不同的前端应用可能会有不同需求的。比如微信的授权认证和App的认证就不一致，Web和APP因为能力不同，需要的接口也可能不同，而管理后台可能要基于角色进行授权。

## 解决方案

面对这些问题的时候我们使用Jfinal该如何解决呢？

首先需要参看文档，[配置路由](https://jfinal.com/doc/2-3)，[Routes 级别拦截器](https://jfinal.com/doc/4-7)。

我们可以针对不同的前端应用进行路由拆分和模块化，同时为不同的Routes添加各自的拦截器，实现不同的级别的认证与授权。

```java
public class WebRoutes extends Routes {
    public void config() {
      addInterceptor(new JwtInterceptor());
      add("/api/web/demo", DemoWebController.class);
    }
}

public class AppRoutes extends Routes {
    public void config() {
      addInterceptor(new JwtInterceptor());
      add("/api/app/demo", DemoController.class);
    }
}

public class WechatRoutes extends Routes {
    public void config() {
      addInterceptor(new WechatInterceptor());
      addInterceptor(new JwtInterceptor());
      add("/api/wechat/demo", DemoController.class);
    }
}

public class AdminRoutes extends Routes {
    public void config() {
      addInterceptor(new AdminAuthInterceptor());
      add("/admin/api/demo", DemoAdminController.class);
    }
}

public class JwtInterceptor implements Interceptor {
    public void intercept(Invocation inv) {
       System.out.println("Verify Jwt");
       inv.invoke();
    }
}

public class JwtInterceptor implements Interceptor {
    public void intercept(Invocation inv) {
       System.out.println("Verify Wechat");
       inv.invoke();
    }
}

public class AdminAuthInterceptor implements Interceptor {
    public void intercept(Invocation inv) {
       System.out.println("Verify Admin");
       inv.invoke();
    }
}

public class DemoController extends Controller {
  //登录接口，清理指定拦截器
  @Clear({WechatInterceptor.class, JwtInterceptor.class})
  public void login() {
  }
}

public class DemoConfig extends JFinalConfig {
    public void configRoute(Routes me) {
      me.add(new WebRoutes());  // Web路由
      me.add(new AppRoutes());  // App路由
      me.add(new WechatRoutes());  // App路由
      me.add(new AdminRoutes());  // 后端路由
    }
    public void configConstant(Constants me) {}
    public void configEngine(Engine me) {}
    public void configPlugin(Plugins me) {}
    public void configInterceptor(Interceptors me) {}
    public void configHandler(Handlers me) {}
}
```

以上代码并非完整代码，也没有实现实际的拦截器逻辑，只是为了简要的说明问题，如果你在实际的实现过程中碰到问题，可以和我联系，或许能帮上忙。通过配置不同的路由和拦截器，我们还可以尽可能多的复用代码（Controller和Service）。

## 参看资料

https://insights.thoughtworks.cn/api-2/

https://jfinal.com/doc

https://www.yiiframework.com/doc/guide/2.0/zh-cn
