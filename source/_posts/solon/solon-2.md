---
title: 使用 Solon Cloud Gateway 替换 Spring Gateway
toc: true
date: 2025-01-10 14:43:07
categories:
- solon
- gateway
tags:
- solon
- gateway
---

## 说明

在「使用国产化框架 Solon 的一些开发经验」中提到，我们只是在平台的一个应用开始使用 Solon 框架，并非一次性的完全替换。但随着 solon cloud gateway 官方版本发布，替换Spring Gateway 也成为可能，于是开始相关的替换工作。

我们的网关主要提供了统计授权和鉴权的功能，及最基础的服务路由能力。另外系统中个问卷功能是对外提供服务的，当时为了提供对外服务和减少Gateway的路由判断逻辑，增加一个api-gateway。

此次使用 solon gateway 进行替换需要完整的实现旧有Spring Gateway的功能，同时想利用 solon 的本地 gateway 的路由分组功能合并api-gateway。

一样的，在开发前，需要完整阅读，Solon Gateway 的官网文档 （https://solon.noear.org/article/804）。一样的文档说明简单，集成也不难。

Solon 版本：3.0.5

## 实现过程

### 引入依赖包

```groovy
dependencies {
    implementation platform(project(":ficus-parent"))

    implementation("org.noear:solon-web")
    implementation("org.noear:nacos2-solon-cloud-plugin")
    implementation("org.noear:solon.cloud.gateway")
}
```

注意：为了简单起见，已经省去其他依赖；使用`ficus-parent`进行统一的版本管理，如果没有使用版本管理，添加对应依赖时需要设置版本号。

### 通用Web授权

#### 管理端授权

提供用户密码授权和基于Token的切换租户。

```java
@Api("管理端授权服务")
@Component(tag = "adminApi")
@Mapping("/auth")
public class AdminAuthController {
  @Inject private AdminAuthService service;

  @Post
  @Mapping("login")
  @ApiOperation("login")
  public CommonResult<UserLoginRes> login(@Body LoginReq loginReq) {
    return CommonResult.success(service.login(loginReq));
  }

  @Post
  @Mapping("changeLoginOrg")
  @ApiOperation("changeLoginOrg")
  public CommonResult<UserLoginRes> changeLoginOrg(@Body ChangeOrgReq changeOrgReq) {
    return null;
  }
}
```

#### 应用端授权

提供基于域名的租户识别，用户密码授权及手机授权和用户注册等功能。

```java
@Api("应用端授权服务")
@Component(tag = "appApi")
@Mapping("/auth")
public class AppAuthController {
  @Inject private AppAuthService authService;

  @Post
  @Mapping("/getOrgByDomain")
  @ApiOperation("getOrgByDomain")
  public CommonResult<SimpleOrgRes> getOrgByDomain(@Body GetOrgReq getOrgReq) {
    return CommonResult.success(authService.getOrgByDomain(getOrgReq));
  }

  @Post
  @Mapping("/login")
  @ApiOperation("login")
  public CommonResult<MemberLoginRes> login(Context context, @Body LoginReq loginReq) {
    Ret ret = checkLoginReq(loginReq);
    if (ret.isFail()) {
      ErrorCode error = ret.getAs("error");
      return CommonResult.error(error);
    }

    return authService.login(context, loginReq);
  }

  @Post
  @Mapping("/smsLogin")
  @ApiOperation("smsLogin")
  public CommonResult<MemberLoginRes> smsLogin(Context context, @Body SmsLoginReq smsLoginReq) {
    Ret ret = checkSmsLoginReq(smsLoginReq);
    if (ret.isFail()) {
      ErrorCode error = ret.getAs("error");
      return CommonResult.error(error);
    }

    return authService.smsLogin(context, smsLoginReq);
  }

  @Post
  @Mapping("/register")
  @ApiOperation("register")
  public CommonResult<MemberLoginRes> register(Context context, @Body RegisterReq registerReq) {
    return authService.register(context, registerReq);
  }

  @Post
  @Mapping("/sendSms")
  @ApiOperation("sendSms")
  public CommonResult<Boolean> sendSms(Context context, @Body SendSmsReq sendSmsReq) {
    return authService.sendSms(context, sendSmsReq);
  }
}
```

#### 路由分组

- 管理端路由分组

```java
/**
 * @author airhead
 */
@Mapping("/**")
@Component
public class AdminGateway extends Gateway {
  @Override
  protected void register() {
    // admin的异常抛出，可能包含SQL，起码更详细
    filter(-1, new AdminExceptionFilter());
    filter(0, new TenantFilter());

    addBeans(bw -> "adminApi".equals(bw.tag()));
  }
}
```

- 应用端路由分组

```java
@Mapping("/app-api/**")
@Component
public class AppGateway extends Gateway {
  @Override
  protected void register() {
    // app的异常抛出不应该暴露SQL等
    filter(-1, new AppExceptionFilter());
    filter(0, new TenantFilter());

    addBeans(bw -> "appApi".equals(bw.tag()));
  }
}
```

### 响应式路由

#### 实现

通过RouteFilterFactory定制路由过滤规则，实现不同类型的接口过滤。

```java
@Component
@Slf4j
public class AuthFilterFactory implements RouteFilterFactory {
  public static final String ADMIN = "admin";
  public static final String APP = "app";
  public static final String OPEN = "open";

  @Inject private JwtConfig jwtConfig;
  @Inject private AdminAuthConfig adminAuthConfig;
  @Inject private AdminAuthService adminAuthService;

  @Inject private AppAuthConfig appAuthConfig;
  @Inject private AppAuthService appAuthService;

  @Inject private OpenAuthConfig openAuthConfig;
  @Inject private OpenAuthService openAuthService;

  public static Completable error(ExContext ctx, ErrorCode errorCode) {
    String resultStr = ONode.stringify(CommonResult.error(errorCode));
    ctx.newResponse().header("Content-Type", "application/json;charset=UTF-8");
    ctx.newResponse().body(Buffer.buffer(resultStr));
    if (errorCode.getCode() < HTTP_STATUS_MAX) {
      // http status的正常范围的错误
      ctx.newResponse().status(errorCode.getCode());
    } else {
      ctx.newResponse().status(HTTP_INTERNAL_SERVER_ERROR);
    }

    return Completable.complete();
  }

  @Override
  public String prefix() {
    return "Auth";
  }

  @Override
  public ExFilter create(String config) {
    if (ADMIN.equals(config)) {
      return new AdminAuthFilter(jwtConfig, adminAuthConfig, adminAuthService);
    } else if (APP.equals(config)) {
      return new AppAuthFilter(jwtConfig, appAuthConfig, appAuthService);
    } else if (OPEN.equals(config)) {
      return new OpenAuthFilter(jwtConfig, openAuthConfig, openAuthService);
    } else {
      return new EmptyAuthFilter();
    }
  }

  /** 默认的空鉴权 */
  public static class EmptyAuthFilter implements ExFilter {
    public EmptyAuthFilter() {}

    @Override
    public Completable doFilter(ExContext ctx, ExFilterChain chain) {
      log.info("empty filter");
      return error(
          ctx,
          ErrorCode.builder()
              .code(HTTP_NOT_FOUND)
              .error(NOT_FOUND_ERROR)
              .msg(NOT_FOUND_ERROR)
              .build());
    }
  }
}
```

注意：这里AdminAuthFilter、AppAuthFilter和OpenAuthFilter未提供实现，可参考EmptyAuthFilter实现具体业务逻辑，或者参考官网例子。

#### 配置

```yaml
solon.cloud:
  nacos:
    server: ${NACOS_SERVER:127.0.0.1:8848}
  gateway:
    httpClient:
      responseTimeout: 180 #单位：秒
    routes:
      # app-api 用index=-1
      - id: topcloud-oa-api
        target: lb://topcloud-oa
        index: -1
        predicates:
          - Path=/OA/app-api/**
        filters:
          - Auth=app

      # open-api 用index=-1
      - id: topcloud-uac-open
        target: lb://topcloud-uac
        index: -1
        predicates:
          - Path=/UAC/open-api/**
        filters:
          - Auth=open

      # admin-api 用index=0
      - id: topcloud-uac-admin
        target: lb://topcloud-uac
        index: 0
        predicates:
          - Path=/UAC/**
        filters:
          - Auth=admin
```

注意：3.0.5 版本如果路由存在包含关系，必须指定index，越具体的地址优先级要越高优先级（也就是index越小）。

## 可能碰到的问题

### 端口冲突

如果使用较低版本的 solon 时，提示端口冲突时，注意排除 solon-boot-xxx。

```groovy
    implementation("org.noear:solon-web") {
			exclude group: "org.noear", module: "solon-boot-smarthttp"
		}
```

### 路由匹配未按预期

3.0.5 版本如果路由存在包含关系，必须指定index，越具体的地址优先级要越高优先级（也就是index越小）。

#### 配置多个 predicates 的 Path导致路由无法匹配

3.0.5 版本不支持配置多个路由的匹配，3.0.6版本将支持，需要匹配多个Path时，配置多个路由。

## 效果

新版的 Solon Gateway 已经在开发线稳定运行一个多月，另外内存使用方面比Spring Gateway 少了五百兆左右。

- Spring-gateway

![](solon-2/spring-gateway.png)

- Solon-gateway

![](solon-2/solon-gateway.png)









