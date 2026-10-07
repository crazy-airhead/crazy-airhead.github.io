---
date: '2021-07-30T17:47:01'
title: 基于Mybatis的多租户实现方法
categories:
  - Spring
  - Mybatis
tags:
  - Spring
  - Mybatis
---

## 背景

对公司的一个项目进行多租户改造，当前系统采用Springboot（2.1.1.RELESE）+MybatisPlus（3.4.2）的微服务架构结构体系，因此在此基础上找多租户的解决方案，看到Mybtis-Plus已经支持[多租户](https://baomidou.com/guide/interceptor-tenant-line.html)。这个方案采用的是共享服务，共享数据的方式，当前公司应用面向企业用户，整理数据量也不会太大，使用这种方式实现多租户是可行的。

<!-- more -->

## 方法

通过过滤器获取Token信息，并设置ThreadLocal，实现租户信息的统一传递，SQL语法是交由MybaitsPlus的TenantLineInnerInterceptor进行拦截增加租户信息。

以下为主要代码：

- 过滤器

```java
public class TenantFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, FilterChain filterChain) throws ServletException, IOException {
        String tenantId = httpServletRequest.getHeader("tenantId");
        if (StrKit.isBlank(tenantId)) {
            filterChain.doFilter(httpServletRequest, httpServletResponse);
            return;
        }

        ContextKit.set(ContextKit.TENANT_ID, orgId));

        filterChain.doFilter(httpServletRequest, httpServletResponse);

    }
}
```

- 注册过滤器

```java
@Configuration
public class TenantConfiguration {
    @Bean
    public FilterRegistrationBean<TenantFilter> tenantFilterRegistrationBean() {
        return new FilterRegistrationBean<>(new TenantFilter());
    }
}
```



- ContextKit

```java
public class ContextKit {
    private static final ThreadLocal<Kv> THREAD_LOCAL = new ThreadLocal();
    public static final String TENANT_ID = "tenantId";

    public ContextKit() {
    }

    public static void set(Kv kv) {
        THREAD_LOCAL.set(kv);
    }

    public static Kv get() {
        Kv kv = THREAD_LOCAL.get();
        if (kv == null) {
            return Kv.create();
        }
        
        return kv;
    }

    public static void remove() {
        THREAD_LOCAL.remove();
    }
    
    public static String getTenantId() {
        Kv kv = get();
        return kv.getStr("tenantId");
    }
 }
```

- Mybatis插件

```java
@Configuration
public class MybatisPlusConfig {
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(new TenantLineHandler() {
            @Override
            public Expression getTenantId() {
                return new StringValue(ContextKit.getTenantId());
            }

            @Override
            public String getTenantIdColumn() {
                return "tenant_id";
            }

            // 这是 default 方法,默认返回 false 表示所有表都需要拼多租户条件
            @Override
            public boolean ignoreTable(String tableName) {
                Set<String> ignoreTableSet = new HashSet<String>() {{
                    add("global_user");
                }};

                return ignoreTableSet.contains(tableName.toLowerCase());
            }
        }));

        // 如果用了分页插件注意先 add TenantLineInnerInterceptor 再 add PaginationInnerInterceptor
        // 用了分页插件必须设置 MybatisConfiguration#useDeprecatedExecutor = false
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor());
        return interceptor;
    }
}
```

 

------

欢迎联系我

微信号 ：Crazy_Airhead

Mixin ID :  1091586

定投课堂邀请码：6DYMBFP061

李笑来写作课邀请码：38MDGFYZK8

水龙头邀请码：FDJQHJ

### 

