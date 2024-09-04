---
title: 使用国产化框架 Solon 的一些开发经验
toc: true
date: 2024-08-31 15:00:14
categories:
- solon
- cmdb
tags:
- solon
- cmdb
---

# 背景

公司的数字安全运营平台是基于 Spring Boot 和 Spring Cloud 进行构建的。考虑到公司有企事业单位的客户，陆续对产品提国产信创的要求。虽然当前信创可能只要求硬件，操作系统和数据库是国产化即可，但底层框架也是国产化的，可以给客户提供更多的国产化保证。

Solon 就是这样的一个选择，Solon 的官网介绍说，Solon 是 Java 「新式」应用开发框架，从零开始构建，有自主的标准规范与开放生态。追求更快、更小、更简单； 提倡克制、简洁、高效、开放、生态；是信通院可信开源社区成员、可信开源项目。Solon 有以下的特色：拥有更高的计算性价比，并发高 2～3 倍，内存省 50%；更快的开发效率：内核小，入门快，调试重启可快至 10 倍；更好的生成和部署体验：打包最多缩小 90%； 更大的兼容范围：非 java-ee 框架，同时支持 java8～java22，graalvm native image。

<!-- more -->

Solon 生态图谱

![](https://solon.noear.org/img/369a9093918747df8ab0a5ccc314306a.png)

Solon Cloud 生态图谱

![](https://solon.noear.org/img/131eb0de975b43fcb1c5cd55bc0da888.png)

Water 是 Solon 作者的另一个作品，Water 是 Java 服务开发和治理的一站式解决方案（可以理解为微服务架构基础套件）。基于 Solon 框架开发，并支持完整的 Solon Cloud 规范。功能相当于：consul + rabbitmq + elk + prometheus + openFaas + quartz + 等等，并有机结合在一起。对 k8s 友好，支持 ip 漂移、支持 k8s svc 映射。也就是说 Water 在功能上包含了：服务注册与发现，配置服务，消息服务，定时任务，健康检测，数据监视等。

如果基于 Water 构建应用平台，整个平台将更加一体化和统一，而且 Water 采用 Apache 2.0 协议开源，对修改代码友好。此外作者在 Water 的基础上构建了Marsh的微服务开发脚手架，虽然不是前后端分离方式构建，但依然可以参考其代码。结合 Solon 的特点，整体构建一个更轻量的融合平台是可能的。

作者介绍 Water 时说水孕育万物，于是有了将新平台命名为Ficus（榕树是福州市树）的想法，水生木，而榕树有独木成林的说法，除了可以理解为技术的框架统一，也可理解为平台不断长出新的服务。

以上算是基础的背景说明，经过初步的技术验证后，开始整合我们的公司内部的技术框架。原本计划使用 Water 整个平台性的替换，最终考虑到公司的资源情况及替换成本，没有选择 Water，然后从微服务开始逐个替换，此次优先从我们需要改造的资源管理系统出发进行改造。

# 整体开发体验

Solon 的学习成本，对于有 Spring Boot 开发经验的开发人员来说，把官网的「学习」章节看完，基本就能上手。Solon 的概念少，注解也少，而且不少注解与Spring Boot 的名称一致，整体上来说，切换 Solon 没有太多迁移的成本。

在开发资源管理系统时，我是先基于 Solon 搭建了公司的技术框架，定义项目结构，封装基础组件，简化（或约定）配置，提供代码生成工具（也是遵守代码规范的一致方式）。从开发人员的角度，在生成代码之后，编写业务代码基本和原来 Spring Boot 中一致，可以说是直接上手。

Solon 的生态相对是完整的，平台有使用的中间件都有对应的集成的组件，比如redis，kafka，mysql，nacos，swagger等，只需要做部分的配置即可使用。

我们的系统有探针模块，用来采集数据，需要通过WebSocket进行通信。Solon 的能轻松提供 WebSocket 服务，Solon 的 「三源合一」也是一个特色。

因为系统是混合了 Spring Cloud 和 Solon，因此需要提供 FeinClient 和 Nami Client，这个算是开发过程当中多增加的一点工作量。

Solon 的本地Gateway，实现路由分组是一个很好的功能，不同的分组可以提供不同的拦截器，相对Spring的配置就容易多了。这个和Jfinal的route功能很像，方便。

但作为一款比较新的框架，也是会碰到一些问题，比如说，集成的组件配置的参数说明不足，部分组件需要查看源码才知道有哪些配置；插件的优先级没有明确标出，可能导致集成时一些依赖类找不到的问题，虽然可以通过修改插件优先级解决，但也是增加了部分心智负担。有些集成的功能不够细致，开始时Swagger文档功能比较弱。此次碰到比较大的一个问题是从 Gateway 发消息到具体的微服务时，参数解析错误，接口无法正确返回，提示 404 或者 500 等错误。后面通过切换为 undertow 组件解决。当然作者后续提供了新版本。

Solon 框架作者跟进问题积极，发版快，及时修复问题。

# 开发过程

为了使新开发的资源管理顺利的接入原有的平台中，需要解决处理发现服务、配置中心，服务网关、数据接入、SQL 版本管理、消息总线、任务调度、日志服务、日志审计等技术或业务组件。开发过程中统一使用 Gradle （Groove）进行编译。

## 注册与发现服务和配置中心

原平台使用使用 Nacos2 作为服务发现和配置中心，Ficus 需要接入Nacos2 即可。引入Solon Cloud 的nacos2 插件进行配置即可。

### 依赖

```groovy
implementation("org.noear:nacos2-solon-cloud-plugin")
```

### 配置

```yml
solon:
  app:
   # 注册的服务名
    name: ficus-facilty
    # 分组名，可以不用填写，此处只是示例，方便理解。
    group: DEFAULT_GROUP 

solon.cloud.nacos:
  server: 127.0.0.1:8848
  config:
    # 可以是多个文件，多个文件用逗号（,）分割
    load: ficus-cmdb.yml
```

## 网关服务

因为暂时没有对平台进行完整的完整的替换，此处说的并非应用网关，而是服务内网关，提供统一的异常处理，统一的租户拦截，统一的鉴权处理。

### 代码

```java
@Component
@Mapping("/admin-api/**")
public class AdminGateway extends Gateway {
  @Inject private TenantProperties tenantProperties;
  @Inject private SecurityProperties securityProperties;
  @Inject private WebProperties webProperties;

  /** index 越小优先级越高 */
  @Override
  protected void register() {
    filter(-1, new FicusTraceFilter());
    filter(0, new FicusExceptionFilter());

    if (tenantProperties.getEnabled()) {
      filter(2, new FicusTenantFilter(tenantProperties));
    }

    filter(3, new FicusJwtFilter(securityProperties));

    // 增加性能统计
    if (webProperties.getEnabledMonitor()) {
      before(new StartHandler());
      after(new EndHandler());
    }

    // 添加Bean
    addBeans(bw -> "adminApi".equals(bw.tag()));
  }
}
```

## 数据接入

我们主要使用了MySQL，Redis 和 ElasticSearch的数据中间件。

### MySQL

原系统使用Mybatis-plus组件，Solon 也提供了对应的组件，引入对应的配置即可。

#### 依赖

```groovy
api("org.noear:mybatis-plus-extension-solon-plugin")
api("com.zaxxer:HikariCP")
api("mysql:mysql-connector-java")
```

#### 代码

```java
@Configuration
@Slf4j
public class FicusMybatisPlusConfig {
  @Bean(name = MasterDb.DB, typed = true)
  public DataSource db(@Inject("${ficus.db.master}") HikariDataSource dataSource) {
    return dataSource;
  }
}
```

#### 配置

```yml
ficus:
  db:
    master:
      jdbcUrl: jdbc:mysql://127.0.0.1:3307/top_cmdb
      username: root
      password: passord

#默认
mybatis:
  # 注意这里是dataSource的bean name
  masterDb:
    typeAliases: #支持包名 或 类名 //支持 ** 和 *
      - "com.jishunetwork.ficus.**.model"
    mappers: #支持包名 或 类名 或 xml（.xml结尾）//支持 ** 和 *
      - "classpath:/mapper/**/*.xml"
    configuration:
      cacheEnabled: false
      mapperVerifyEnabled: false
      mapUnderscoreToCamelCase: true
      #      logImpl: org.apache.ibatis.logging.nologging.NoLoggingImpl
      logImpl: org.apache.ibatis.logging.stdout.StdOutImpl
    globalConfig:
      banner: false
```

### Redis

引入配置即可。

#### 依赖

```groovy
api("org.noear:jedis-solon-cloud-plugin")
```

#### 代码

```java
@Configuration
@Slf4j
public class FicusRedisConfig {
  /**
   * // typed 表示可类型注入, 即默认
   *
   * @param cache
   * @return
   */
  @Bean(typed = true)
  public CacheService cache(@Inject("${ficus.redis}") RedisCacheService cache) {
    return cache;
  }

  /**
   * typed 表示可类型注入, 使用与cache不同的对象
   *
   * @param client
   * @return
   */
  @Bean(typed = true)
  public RedisClient redis(@Inject("${ficus.redis}") RedisClient client) {
    return client;
  }
}
```

#### 配置

```yml
ficus:
  redis:
    driverType: redis #驱动类型
    server: 127.0.0.1:6666
    db: 0 #默认为 0，可不配置
    password: password
    defSeconds: 30 #默认为 30，可不配置
    idleConnectionTimeout: 10000
    connectTimeout: 10000
```

### ElasticSearch

原系统使用的是ElasticSearh的RestHighLevelClient，大家也比较习惯相关的api，虽然引入了 esearchx 但系统中使用不多。

### 依赖

```groovy
api("org.elasticsearch.client:elasticsearch-rest-high-level-client")
api("org.noear:esearchx")
```

#### 代码

```java
@Configuration
@Slf4j
public class FicusElasticsearchConfig {
  @Bean
  public RestHighLevelClient client(@Inject("${ficus.es}") EsProperties properties) {
    RestHighLevelClient restHighLevelClient =
        new LifecycleRestHighLevelClient(clientBuilder(properties));

    EsClientKit.init(restHighLevelClient);
    TenantEsClientKit.init(restHighLevelClient);

    return restHighLevelClient;
  }

  @Bean
  public EsContext esContext(@Inject("${ficus.es}") EsProperties properties) {
    return new EsContext(properties.getUrl(), properties.getUsername(), properties.getPassword());
  }
}
```

#### 配置

```yml
ficus:
  es:
    hostname: 127.0.0.1
    port: 9200
    scheme: http
    username: jishu
    password: password
```

## SQL 版本管理

使用 Flyway 做SQL 版本管理，Solon 没有集成，自己实现一个。

### 代码

```java
@Slf4j
public class XPluginImp implements Plugin {

  @Override
  public void start(AppContext context) throws Throwable {
    Props props = context.cfg();

    context.subWrapsOfType(
        DataSource.class,
        (bw) -> {
          String named = bw.name();
          log.info("异步订阅 DataSource({}), 执行 flyway 动作", named);

          String keyStarts = "flyway." + named;
          boolean isEnabled = props.getBool(keyStarts + ".enabled", true);
          if (isEnabled) {
            Properties properties = new Properties();
            Props flayWayProps = Solon.cfg().getProp(keyStarts);
            for (Map.Entry<Object, Object> objectObjectEntry : flayWayProps.entrySet()) {
              String key = (String) objectObjectEntry.getKey();
              Object value = objectObjectEntry.getValue();
              // 配置不处理 -
              if (!StrUtil.containsAnyIgnoreCase(key, "-")) {
                properties.put("flyway." + key, value);
              }
            }

            FluentConfiguration fluentConfiguration = new FluentConfiguration();
            fluentConfiguration.configuration(properties);
            fluentConfiguration.dataSource(bw.raw());
            fluentConfiguration.callbacks(new FicusFlywayCallback());

            Flyway flyway = fluentConfiguration.load();
            flyway.migrate();
          }
        });

    context.beanScan(XPluginImp.class);
  }

  @Override
  public void stop() throws Throwable {
    Plugin.super.stop();
  }
}
```

### 配置

```yml
flyway:
  enabled: true
  dbMaster:
    encoding: UTF-8
    cleanDisabled: true
    baselineOnMigrate: true
    locations: classpath:db/migration
    sqlMigrationPrefix: v
    sqlMigrationSeparator: __
    sqlMigrationSuffixes: .sql
    validateOnMigrate: true
    baselineVersion: 1.0.0
```

## 消息总线

Ficus中消息总线分成两个部分：

- 服务间的消息总线，通过kafka实现，用于微服务间的事件处理。

- 服务内的消息总线，通过dami实现，用于服务内的事件处理。

### Kafka

提供了一些常用的消息格式和消息发送类。

#### 依赖

```groovy
api("org.noear:kafka-solon-cloud-plugin")
```

#### 配置

```yml
solon.cloud:
  kafka:
    event:
    server: "172.18.22.21:9092"
    publishTimeout: 3000 #单位：ms
    producer: #生产者属性（参考 org.apache.kafka.clients.producer.ProducerConfig 里的配置项）
      acks: "all"
      retries: 0
      batch.size: 16384
```

### Dami

通过统一的消息和发送类。

#### 代码

```java
public class EventUtils {
  private static final DamiBus<Kv, Ret> BUS = Dami.bus();

  public static boolean send(final String topic, final Kv event) {
    return sendAndSubscribe(topic, event, ret -> {});
  }

  public static boolean sendAndSubscribe(
      final String topic, final Kv ev, final Consumer<Ret> consumer) {
    return BUS.sendAndSubscribe(topic, ev, consumer);
  }

  public static Ret sendAndRequest(final String topic, final Kv event) {
    return sendAndRequest(topic, event, 3000L);
  }

  public static Ret sendAndRequest(final String topic, final Kv event, long timeout) {
    return BUS.sendAndRequest(topic, event, timeout);
  }

  public static void listen(final String topic, final TopicListener<Payload<Kv, Ret>> listener) {
    listen(topic, 0, listener);
  }

  public static void listen(
      final String topic, final int index, final TopicListener<Payload<Kv, Ret>> listener) {
    BUS.listen(topic, index, listener);
  }

  public static void unlisten(final String topic, final TopicListener<Payload<Kv, Ret>> listener) {
    BUS.unlisten(topic, listener);
  }

  public static void unlisten(final String topic) {
    BUS.unlisten(topic);
  }
}
```

#### 初始化

```java
@Configuration
public class ResourceConfig {
  @Bean
  public void initListener() {
    EventUtils.listen(ResourceConstant.TOPIC_RESOURCE, new ResourceListener());
  }
}
```

## 任务调度

平台使用 xxljob 进行调度。

### 依赖

```groovy
api("org.noear:xxl-job-solon-cloud-plugin")
```

### 配置

```yml
solon.cloud:
  xxljob:
    server: http://127.0.0.1:1150/Job
    token: default_token
```

### 日志服务

​日志服务主要参考了 Water 的实现，主要代码是实现AppenderBase，然后可以看 Water 的批量写入日志部分。

#### 代码

```java
public class CloudLogAppender extends AppenderBase {
    @Override
    public Level getDefaultLevel() {
        return Level.INFO;
    }

    @Override
    public void append(LogEvent logEvent) {
        if (CloudClient.log() != null) {
            CloudClient.log().append(logEvent);
        }
    }
}
```

### 日志审计

通过拦截器实现，去除了部分业务代码。

### 代码

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AuditLog {

  /**
   * 如果是模版是使用#(name??)的形式书写，避免报错
   *
   * @return
   */
  String operation();

  OperationType operationType();

  LogType logType();

  /**
   * 应用id
   *
   * @return
   */
  String appId() default "${ficus.id}";
}



@Component
public class AuditLogInterceptor implements RouterInterceptor {
  @Inject private AuditLogProxyService proxyService;

  private static boolean isAuditLogEnable(Context ctx, AuditLog auditLog) {
    return auditLog != null;
  }

  private static AuditLog getAuditLog(Context ctx) {
    Action action = ctx.action();
    MethodWrap method = action.method();
    return method.getAnnotation(AuditLog.class);
  }

  @Override
  public void doIntercept(Context ctx, Handler mainHandler, RouterInterceptorChain chain)
      throws Throwable {
    chain.doIntercept(ctx, mainHandler);
  }

  @Override
  public Object postResult(Context ctx, Object result) throws Throwable {
    try {
      AuditLog auditLog = getAuditLog(ctx);
      if (isAuditLogEnable(ctx, auditLog)) {
        OperateLog operateLog = buildLog(ctx, auditLog, result);
        proxyService.log(operateLog);
      }

      return result;
    } finally {
      AuditLogContext.clear();
    }
  }
}
```

# 关于公司

福建极数网络科技有限公司是一家具有云计算、大数据、人工智能能力的高科技创新企业。公司从2016年9月创立至今，一直专注于数字经济时代下的数字安全运营管理、业务智能运营管理、多源异构大规模数据关联分析与挖掘分析等技术领域。我们用心扎根业务场景创新，为客户交付专而精的人工智能相关产品解决方案与专业贴心的数字化服务。

公司已荣获国家与省级高新技术企业证书，通过ISO/IEC20000、ISO/IEC27001等多项体系认证，并取得100+资质证书，包括软件著作权、商标权、发明专利等。