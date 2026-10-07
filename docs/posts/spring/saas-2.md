---
date: '2024-07-20T20:52:14'
title: 多租户的技术实现
categories:
  - Spring Boot
  - Mybatis Plus
  - Redis
  - ElasticSearch
  - Job
  - Kafka
tags:
  - Spring Boot
  - Mybatis Plus
  - Redis
  - ElasticSearch
  - Job
  - Kafka
---

# 背景

上一篇「[基于Mybatis的多租户实现方法](https://l4qiang.goldsyear.com/2021/07/30/spring/saas/)」介绍的是Spring Boot使用 Mybatis Plus实现Db层的数据隔离。但在实际的实现过程中，除了涉及Db层的数据隔离，还会涉及租户的识别，缓存的数据隔离，ElasticSearch的数据隔离，任务的数据隔离、消息队列的隔离，同时也包括租户的切换与忽略租户等。

因此在上一篇的基础上，这次尝试把多租户的技术实现写得更完整些，如有不足支持欢迎指正。

<!-- more -->

# 多租户

多租户技术（英语：multi-tenancy technology），是一种软件架构技术，它是在探讨与实现如何于多用户的环境下共用相同的系统或程序组件，并且可确保各用户间数据的隔离性。多租户简单来说是指一个业务系统可以为多个用户（或组织）服务。多租户技术要求所有用户共用同一个数据中心，但能为多个客户端提供相同甚至定制化的服务，并且仍然可以保障客户的数据隔离。

多租户的数据隔离有许多种方案，包括DataSource模式，独立数据库，即一个租户一个数据库；Schema模式，共享数据库，独立Schema，即租户共享数据库，单每个租户使用不同的scheme。各种方案都各有优缺点，其中以 Column 模式最为常见。公司的多租户方案也是采用的 Column 模式。

# 主要原理

识别租户后通过 ThreadLocal 存储租户ID，使得该线程随后的整个调用方法堆栈中的任何一个点都能获取到租户ID，从而执行租户隔离所需要的操作。

# 实现方法

如背景中介绍，要完整的实现多租户涉及到系统使用到的多个技术组件，因此需要对相应的技术组件进行封装，减少租户对开发的干扰，从而尽可能只关注业务的实现。

## 租户识别

通常情况下，不同的租户有独立的二级域名或域名，此时可以通过域名来识别租户，需要管理后台创建租户时维护好租户的域名。

前端调用接口获取对应的租户id，之后的请求中增加tenant-id的请求头（请求头名称可根据自己的实际情况定）。

```java
@GetMapping("/getTenantIdByDomain")
public ApiResponses<SimpleOrgRes> getOrgByDomain(@RequestParam String domain) {
  return ApiResponses.success(authService.getTenantIdByDomain(domain));
}
```

当然也可以采用在Filter中对域名进行解析，从而获取租户ID。

我们公司侧重企业内部的观察，暂时不需要分配域名，因此不能根据域名获取租户ID。根据这个情况，我们把用户做成全局表，这样在用户登录是可以根据用户信息来确定租户ID，另外通过JWT Token的方式进行租户ID的前后端传递，而没有使用tenant-id。

## 租户上下文

TenantContext负责存储tenant-id和tenant-ignore标识。这里使用了TransmittableThreadLocal， 它是ThreadLocal的一个增强版本，在使用线程池等会池化复用线程的执行组件情况下，提供`ThreadLocal`值的传递功能，解决异步执行时上下文传递的问题。

```java
public class TenantContext {
  /** 当前租户编号 */
  private static final ThreadLocal<String> TL_TENANT_ID = new TransmittableThreadLocal<>();

  private static final ThreadLocal<Boolean> TL_TENANT_IGNORE = new TransmittableThreadLocal<>();

  public static void enableTenant(String tenantId) {
    if (StrUtil.isNullOrUndefined(tenantId)) {
      tenantId = "";
    }

    TL_TENANT_ID.set(tenantId);
    TL_TENANT_IGNORE.set(Boolean.FALSE);
  }

  public static void ignoreTenant() {
    TL_TENANT_ID.set("");
    TL_TENANT_IGNORE.set(Boolean.TRUE);
  }

  public static String getTenantId() {
    return TL_TENANT_ID.get();
  }

  public static Boolean getTenantIgnore() {
    return TL_TENANT_IGNORE.get();
  }

  public static void clear() {
    TL_TENANT_ID.remove();
    TL_TENANT_IGNORE.remove();
  }
}
```

## 隔离逻辑

### Web 接口隔离

默认情况下，前端的每个请求 Header 必须带上 `tenant-id`，值为租户编号。通过配置或注解等方式在租户过滤器中过滤无需租户隔离的接口。

```java
@Slf4j
public class TenantFilter extends BaseFilter {
  private Set<String> ignoreSet = new HashSet<>();
  private AntPathMatcher pathMatcher = new AntPathMatcher();

  public TenantFilter() {}

  public TenantFilter ignorePath(String path) {
    this.ignoreSet.add(path);
    return this;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
    String path = request.getRequestURI();
    return ignoreSet.stream().anyMatch(p -> pathMatcher.match(p, path));
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest httpServletRequest,
      HttpServletResponse httpServletResponse,
      FilterChain filterChain)
      throws ServletException, IOException {
    String orgId = httpServletRequest.getHeader(TenantContextKit.ORG_ID);
    if (StrKit.notBlank(orgId)) {
      Kv kv = Kv.create();
      kv.set(TenantContextKit.TENANT_ID, orgId);
      TenantContextKit.set(kv);
    } else {
      log.warn("没有租户信息, path: {}", httpServletRequest.getRequestURI());
    }

    try {
      filterChain.doFilter(httpServletRequest, httpServletResponse);
    } finally {
      TenantContextKit.remove();
    }
  }
}
```

### MySQL 数据隔离

使用了MybatisPlus组件，默认支持租户隔离，只要指定隔离的租户列。MybatisPlus的租户处理的一个好处是会对SQL进行语法分析，每次执行数据库操作时，就会自动拼接tenant-id=? 条件来进行租户的过滤，并支持所有的SQL场景，也就是说配置了租户列之后，编写代码时无须关心租户的隔离问题。

```java
@Configuration
@ConditionalOnClass(value = {PaginationInnerInterceptor.class})
public class MybatisPlusConfig {
  @Bean
  public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(
        new TenantLineInnerInterceptor(
            new TenantLineHandler() {
              @Override
              public Expression getTenantId() {
                String tenantId = TenantUtils.getTenant().getId();
                if (tenantId == null) {
                  tenantId = "";
                }

                return new StringValue(tenantId);
              }

              @Override
              public String getTenantIdColumn() {
                return "tenant_id";
              }

              // 这是 default 方法,默认返回 false 表示所有表都需要拼多租户条件
              @Override
              public boolean ignoreTable(String tableName) {
                if (Boolean.TRUE.equals(TenantUtils.getTenant().getIgnore())) {
                  return true;
                }

                Set<String> ignoreTableSet =
                    new HashSet<String>() {
                      private static final long serialVersionUID = -2972814786092179290L;
                    };
                final String skipTablePrefix = "global_";
                if (tableName.toLowerCase().startsWith(skipTablePrefix)) {
                  return true;
                }

                return ignoreTableSet.contains(tableName.toLowerCase());
              }
            }));

    interceptor.addInnerInterceptor(new DataScopeInterceptor(new DefaultDataScopeHandler()));

    // 如果用了分页插件注意先 add TenantLineInnerInterceptor 再 add PaginationInnerInterceptor
    // 用了分页插件必须设置 MybatisConfiguration#useDeprecatedExecutor = false
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor());
    return interceptor;
  }
}
```

### ElasitcSearch数据隔离

ES也采用增加租户列的方式进行数据的隔离。插入数据时ES可以Map或JSON方式进行插入，增加tenant-id相对容易。

ES查询时，同时使用 BoolQueryBuilder 增加其他查询条件的方式，编写一个辅助类。

```java
public static BoolQueryBuilder tenantQueryBuilder() {
  BoolQueryBuilder boolQueryBuilder = QueryBuilders.boolQuery();
  TermQueryBuilder termQuery = QueryBuilders.termQuery("tenant_id", TenantUtils.getTenantId());
  boolQueryBuilder.must(termQuery);
  return boolQueryBuilder;
}
```

### Redis 数据隔离

Redis 通过Key的方式进行数据存储与查询，因此租户隔离时，通过在Key中增加租户id实现租户的隔离。主要分成两部分。

使用Spring Cache 注解方式，需要重写 RedisCacheManager。例如说 `@Cachable`、`@CachePut`、`@CacheEvict`，使用方法保持不变。

```java
@Bean
@Primary // 引入租户时，tenantRedisCacheManager 为主 Bean
public RedisCacheManager tenantRedisCacheManager(
    RedisTemplate<String, Object> redisTemplate,
    RedisCacheConfiguration redisCacheConfiguration) {
  // 创建 RedisCacheWriter 对象
  RedisConnectionFactory connectionFactory =
      Objects.requireNonNull(redisTemplate.getConnectionFactory());
  RedisCacheWriter cacheWriter = RedisCacheWriter.nonLockingRedisCacheWriter(connectionFactory);
  // 创建 TenantRedisCacheManager 对象
  return new TenantRedisCacheManager(cacheWriter, redisCacheConfiguration);
}
```

```java
@Slf4j
public class TenantRedisCacheManager extends TimeoutRedisCacheManager {

  public TenantRedisCacheManager(
      RedisCacheWriter cacheWriter, RedisCacheConfiguration defaultCacheConfiguration) {
    super(cacheWriter, defaultCacheConfiguration);
  }

  @Override
  public Cache getCache(String name) {
    // 如果开启多租户，则 name 拼接租户后缀
    TenantUtils.Tenant tenant = TenantUtils.getTenant();
    if (tenant != null
        && Boolean.FALSE.equals(tenant.getIgnore())
        && StrUtil.isNotBlank(tenant.getId())) {
      name = String.format("tenantId:%s:%s", TenantUtils.getTenantId(), name);
    }

    // 继续基于父方法
    return super.getCache(name);
  }
}
```

手动方式的缓存，创建辅助工具类，写入和读取时统一增加对key增加租户id的处理。

```java
/**
 * @author airhead
 */
public class BaseRedisUtils {
  protected static final Map<String, RedisPro> REDIS_TEMPLATE_MAP = new ConcurrentHashMap<>();
  protected static RedisPro MAIN;

  public static void json(RedisTemplate<String, Object> redisTemplate) {
    REDIS_TEMPLATE_MAP.put(JSON_VALUE, new RedisPro(JSON_VALUE, redisTemplate));
  }

  public static void plain(RedisTemplate<String, Object> redisTemplate) {
    MAIN = new RedisPro(PLAIN_VALUE, redisTemplate);
    REDIS_TEMPLATE_MAP.put(PLAIN_VALUE, MAIN);
  }

  public static RedisPro use() {
    return use(PLAIN_VALUE);
  }

  public static RedisPro use(String type) {
    RedisPro redisPro = REDIS_TEMPLATE_MAP.get(type);
    if (redisPro == null) {
      return REDIS_TEMPLATE_MAP.get(PLAIN_VALUE);
    }

    return redisPro;
  }

  public static RedisPro plain() {
    return REDIS_TEMPLATE_MAP.get(PLAIN_VALUE);
  }

  public static RedisPro json() {
    return REDIS_TEMPLATE_MAP.get(JSON_VALUE);
  }
}

/**
 * 租户redis工具类，
 *
 * @author airhead
 */
public class TenantRedisUtils extends BaseRedisUtils {
  private static final String TENANT_KEY = "tenanId:%s:%s";

  private static String getTenantKey(String key) {
    return String.format(TENANT_KEY, TenantUtils.getTenant().getId(), key);
  }

  public static Set<String> keys(String key) {
    String tenantKey = getTenantKey(key);
    return MAIN.keys(tenantKey);
  }

  public static void delete(String key) {
    String tenantKey = getTenantKey(key);
    MAIN.delete(tenantKey);
  }

  public static void delete(Set<String> keys) {
    Set<String> tenantKeys = new HashSet<>();
    for (String key : keys) {
      String tenantKey = getTenantKey(key);
      tenantKeys.add(tenantKey);
    }
    MAIN.delete(tenantKeys);
  }

  public static Object get(String key) {
    String tenantKey = getTenantKey(key);
    return MAIN.get(tenantKey);
  }

  public static void set(String key, Object value) {
    String tenantKey = getTenantKey(key);
    MAIN.set(tenantKey, value);
  }

  public static Set<Object> hashKeys(String key) {
    String tenantKey = getTenantKey(key);
    return MAIN.hashKeys(tenantKey);
  }

  public static void hashSet(String key, Map<?, ?> value) {
    String tenantKey = getTenantKey(key);
    MAIN.hashSet(tenantKey, value);
  }

  public static void hashPut(String key, Object hKey, String hValue) {
    String tenantKey = getTenantKey(key);
    MAIN.hashPut(tenantKey, hKey, hValue);
  }

  public static Object hashGet(String key, Object hKey) {
    String tenantKey = getTenantKey(key);
    return MAIN.hashGet(tenantKey, hKey);
  }

  public static void hashDelete(String key, Object hKey) {
    String tenantKey = getTenantKey(key);
    MAIN.hashDelete(tenantKey, hKey);
  }

  /**
   * 避免与get/set方法混淆，使用hset代表set操作
   *
   * @param key
   * @param value
   */
  public static Long hsetAdd(String key, Object... value) {
    String tenantKey = getTenantKey(key);
    return MAIN.hsetAdd(tenantKey, value);
  }

  /**
   * 避免与get/set方法混淆，使用hset代表set操作
   *
   * @param key
   */
  public static Set<Object> hsetGet(String key) {
    String tenantKey = getTenantKey(key);
    return MAIN.hsetGet(tenantKey);
  }

  /**
   * 避免与get/set方法混淆，使用hset代表set操作
   *
   * @param key
   */
  public static void hsetDelete(String key, String hKey) {
    String tenantKey = getTenantKey(key);
    MAIN.hsetDelete(tenantKey, hKey);
  }
}
```

### 任务调度

任务调度时因为是从后台启动，此时无法传入租户id，因为MySQL、ES、Redis的租户隔离处理，要么是无法取到数据，要么取到全部数据，导出无法实际的进行租户隔离。

因此需要先获取所有的租户信息，然后利用AOP的方式针对每个租户执行任务的调度。

```java
/**
 * 多租户 Job 注解
 *
 * @author airhead
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface TenantJob {}
```

```java
@Aspect
@RequiredArgsConstructor
@Slf4j
public class TenantJobAspect {

  @Around("@annotation(tenantJob)")
  public String around(ProceedingJoinPoint joinPoint, TenantJob tenantJob) {
    // 获得租户列表
    List<String> tenantIds = TenantUtils.getTenantIds();
    if (CollUtil.isEmpty(tenantIds)) {
      return null;
    }

    // 逐个租户，执行 Job
    Map<String, String> results = new ConcurrentHashMap<>();
    tenantIds.parallelStream()
        .forEach(
            tenantId -> {
              TenantUtils.execute(
                  tenantId,
                  () -> {
                    try {
                      joinPoint.proceed();
                    } catch (Throwable e) {
                      results.put(tenantId, ExceptionUtil.getRootCauseMessage(e));
                    }
                  });
            });

    return JSON.toJSONString(results);
  }
}
```

### 消息队列

通过租户对 MQ 层面的封装，实现租户上下文，可以继续传递到 MQ 消费的逻辑中，避免丢失的问题。实现原理是：

- 发送消息时，MQ 会将租户上下文的租户编号，记录到 Message 消息头 `tenant-id` 上。

- 消费消息时，MQ 会将 Message 消息头 `tenant-id`，设置到租户上下文的租户编号。

## 切换/忽略租户

租户的切换与忽略通过工具类实现。

```java
public class TenantUtils {

  private static Supplier<List<String>> tentantSupplier;

  public static void setTenantSupplier(Supplier<List<String>> tenantSupplier) {
    TenantUtils.tentantSupplier = tenantSupplier;
  }

  /**
   * 使用指定租户，执行对应的逻辑
   *
   * <p>注意，如果当前是忽略租户的情况下，会被强制设置成不忽略租户 当然，执行完成后，还是会恢复回去
   *
   * @param tenantId 租户编号
   * @param runnable 逻辑
   */
  public static void execute(String tenantId, Runnable runnable) {
    Tenant tenant = getTenant();

    try {
      setTenant(Tenant.builder().id(tenantId).ignore(false).build());
      // 执行逻辑
      runnable.run();
    } finally {
      restoreTenant(tenant);
    }
  }

  public static void executeWithoutTenant(Runnable runnable) {
    Tenant tenant = getTenant();
    try {
      setTenant(Tenant.builder().id("").ignore(true).build());
      // 执行逻辑
      runnable.run();
    } finally {
      restoreTenant(tenant);
    }
  }

  public static <T> T execute(String tenantId, Supplier<T> supplier) {
    Tenant tenant = getTenant();
    try {
      setTenant(Tenant.builder().id(tenantId).ignore(false).build());
      // 执行逻辑
      return supplier.get();
    } finally {
      restoreTenant(tenant);
    }
  }

  public static <T> T executeWithoutTenant(Supplier<T> supplier) {
    Tenant tenant = getTenant();
    try {
      setTenant(Tenant.builder().id("").ignore(true).build());
      // 执行逻辑
      return supplier.get();
    } finally {
      restoreTenant(tenant);
    }
  }

  public static String getTenantId() {
    Tenant tenant = getTenant();
    if (tenant == null) {
      return "";
    }

    return tenant.getId();
  }

  public static Boolean getTenantIgnore() {
    Tenant tenant = getTenant();
    if (tenant == null) {
      return true;
    }

    return tenant.getIgnore();
  }

  public static Tenant getTenant() {
    String tenantId = TenantContextKit.getTenantId();
    Boolean tenantIgnore = TenantContextKit.getTenantIgnore();
    return Tenant.builder().id(tenantId).ignore(tenantIgnore).build();
  }

  public static void setTenant(String tenantId) {
    setTenant(Tenant.builder().id(tenantId).ignore(false).build());
  }

  public static void setTenant(Tenant tenant) {
    if (tenant == null) {
      return;
    }

    TenantContextKit.setTenantId(tenant.getId());
    TenantContextKit.setTenantIgnore(tenant.getIgnore());
  }

  private static void restoreTenant(Tenant tenant) {
    if (tenant == null) {
      return;
    }

    TenantContextKit.setTenantId(tenant.getId());
    TenantContextKit.setTenantIgnore(tenant.getIgnore());
  }

  public static void clearContext() {
    TenantContextKit.remove();
    ContextKit.remove();
  }

  public static List<String> getTenantIds() {
    if (tentantSupplier == null) {
      return new ArrayList<>();
    }

    return tentantSupplier.get();
  }

  @Data
  @Builder
  public static class Tenant {
    private String id;
    private Boolean ignore;
  }
}
```

通过注解方式使用AOP方式忽略租户

```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
public @interface TenantIgnore {
}
```

```java
@Aspect
@Slf4j
public class TenantIgnoreAspect {

    @Around("@annotation(tenantIgnore)")
    public Object around(ProceedingJoinPoint joinPoint, TenantIgnore tenantIgnore) throws Throwable {
        Boolean oldIgnore = TenantContextHolder.isIgnore();
        try {
            TenantContextHolder.setIgnore(true);
            // 执行逻辑
            return joinPoint.proceed();
        } finally {
            TenantContextHolder.setIgnore(oldIgnore);
        }
    }

}
```

# 总结

本文从涉及系统涉及到在技术组件出发，描述了对应的技术封装，实现多租户的数据隔离。虽然通过技术的封装开发人员能减少对租户的处理，但多租户的封装并非一劳永逸的，在实际的开发过程中，还是需要根据实际的业务情况进行租户的忽略，切换等处理。
