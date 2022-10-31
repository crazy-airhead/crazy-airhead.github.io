---
title: 系统升级TDengine3.0
toc: true
date: 2022-10-30 21:25:42
categories:
- tdengine
- elasticsearch
tags:
- tdengine
- elasticsearch
---

# 背景

公司的一款产品是面向中小企业的内网安全日志采集与分析产品，使用Spring Boot & Spring Cloud框架搭建，使用ElasticSearch进行存储，采用一体机的服务器（配置为4核CPU，32G，1T硬盘），使用CentOS7.8+Docker方式部署应用。

该产品的主要业务流程是，通过探针（探针会部署在多个工控机上）采集触发安全引擎的扫描，产生日志，之后探针采集这些日志并将其推送Kafka，平台端消费Kafka，解析和分析日志并存储到ElasticSearch，之后通过分析查询服务提供最终数据展示。

系统一直运行相对比较平稳，直到产品对日志增加了事件分组的要求，即当日志事件产生时，需要根据一定的规则判断是否当前日志与前一条日志是否未同一组事件。因为需要实时的判断事件的分组，在数据入库ES时，增加了大量的聚合运算。此时ES开始占用大量内存，整体响应慢，造成日志数据入库延时，和分析查询业务无法正常返回数据。

# 方案

分析业务的特点：

1. 多个日志采集探针。

2. 日志事件是基于IP分类。

考虑在探针端对日志进行事件分组，需要在探针端增加存储，考虑到日志有时序性且写入后不修改的特点，之前关注的TDengine成为一个选择。通过一段时间的学习，注意到TDengine的超级表，支持多采集点和时间窗口统计，这些都符合我们的业务要求，同时考虑其高性能，数据压缩，支持 SQL等方面的优势，于是考虑探针端使用TDengine进行存储，同时平台端的内网分析部分用TDengine替换ES，进行测试。

# 配置

## 安装TDengine

平台端使用Docker进行安装，探针端使用`tar.gz`方式安装。

```bash
docker run -d --name=topcloud-tdengine \
-p 6030-6049:6030-6049 \
-p 6030-6049:6030-6049/udp \
-v /home/bigdata/taos/data:/var/lib/taos/ \
-v /home/bigdata/taos/log:/var/log/taos/ \
-v /etc/localtime:/etc/localtime:ro \
tdengine/tdengine:2.6.0.10
```

## 创建数据库

```bash
docker exec -it topcloud-tdengine /bin/bash

# 连接taos
taos

CREATE DATABASE IF NOT EXISTS platform PRECISION 'ns' UPDATE 2;

# 创建数据数据库，只保留1天的数据，允许局部更新数据
CREATE DATABASE IF NOT EXISTS agent days 1 keep 1 PRECISION 'ns' UPDATE 2;
```

探针端的数据因为是临时计算，只并留一天即可。

# 实现

代码参看官网[springbootdemo](https://github.com/taosdata/TDengine/tree/develop/examples/JDBC/springbootdemo)，主要代码为`Mapper`和`Mapper.xml`

## 添加依赖

`gradle.build`

```groovy
dependencies {
    implementation("com.baomidou:mybatis-plus-boot-starter:3.5.1")
    implementation("com.baomidou:mybatis-plus-generator:3.5.2")
    implementation("com.alibaba:druid-spring-boot-starter:1.2.9")
    implementation("com.baomidou:dynamic-datasource-spring-boot-starter:3.5.1")
    // 增加taos引擎
    implementation("com.taosdata.jdbc:taos-jdbcdriver:2.0.38")
}
```

## 修改配置

`application.yml`

```yaml
spring:
  datasource:
    dynamic:
      datasource:
        tdengine:
          username: root
          password: taosdata
          driver-class-name: com.taosdata.jdbc.rs.RestfulDriver
          url: jdbc:TAOS-RS://ip:6041/top_security?timezone=UTC-8&charset=UTF-8&locale=en_US.UTF-8
          druid: # 以下参数针对每个库可以重新设置druid参数
            initial-size:
            public-key:
            validation-query: select server_status()
            wall:
              variantCheck: false
              noneBaseStatementAllow: true
              commentAllow: true
              multiStatementAllow: true
```

此处注意设置`driver-class-name`、`url`和`validation-query`，其中url支持JDBC原生连接和JDBC的REST连接，这里使用了REST连接，这样省去[客户端驱动](https://www.taosdata.com/all-downloads)（暂未看到mac版本客户端）配置问题。

## 配置方言

Mybatits Plus目前还不支持TDengine的方言，使用MySQL方言，这样对原有数据库连接也不影响（官网例子用的是Postgrep）。

```java
@Configuration
public class MybatisPlusConfig {
  @Bean
  public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    PaginationInnerInterceptor paginationInterceptor = new PaginationInnerInterceptor();
    paginationInterceptor.setDialect(new MySqlDialect());
    interceptor.addInnerInterceptor(paginationInterceptor);
    return interceptor;
  }
}
```

## Mapper.java

```java
@Mapper
@Repository
@DS("tdengine")
public interface IntranetFlowMapper extends BaseMapper<IntranetFlow> {
  /** 创建超级表 */
  void createSuperTable();

  /** 创建资本 */
  void createTable(IntranetFlow intranetFlow);

  /**
   * @param intranetFlow 实体对象
   * @return
   */
  int insert(IntranetFlow intranetFlow);
}
```

## Mapper.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.jswl.topcloud.provider.receiver.dal.mapper.IntranetFlowMapper">
    <update id="createSuperTable">
        create table if not exists xxx
        (
        ts timestamp,
        ) tags
        (
        group_id bigint
        )
    </update>
    <update id="createTable" parameterType="com.jswl.topcloud.provider.receiver.dal.model.IntranetFlow">
        create table if not exists xxx_#{groupId} using xxx tags
        (
        #{groupId}
        )
    </update>
    <insert id="insert" parameterType="com.jswl.topcloud.provider.receiver.dal.model.IntranetFlow">
        insert into xxx_#{groupId} (ts)
        values (#{ts})
    </insert>
</mapper>
```

使用update方式创建超级表和子表，创建子表时使用了#{groupId}进行拼接，需要根据实际的业务来配置。

# 新的问题

通过测试运行一段时间发现，探针端虽然只保留一天的数据，但在数据增加到一定程度时，事件分类的时间增长，导致一定量的数据堆积。保留的临时数据能否更短呢？此时涛思刚好发布了3.0版本，看到数据文件存储数据的时间跨度和数据文件保存可以按分钟进行设置，于是开始尝鲜，将探针端的升级到3.0版本。

```bash
tar xvzf TDengine-servr-3.0.0.1-Linux-x64.tar.gz
ll
cd TDengine-server-3.0.0.0/ 
sudo ./install.sh

sudo systemctl start taosd
sudo systemctl enable taosd

systemctl start taosadapter
systemctl enable taosadapter


# 连接taos
taos

# 创建数据数据库，只保留1天的数据，允许局部更新数据
CREATE DATABASE IF NOT EXISTS agent DURATION 60m keep 1d PRECISION 'ns' CACHEMODEL 'both';

```

修改数据库驱动为3.0版本即可，代码基本不需要做过多调整，部分语法不兼容问题需要按3.0语法规则调整语法。

## 修改依赖

  `gradle.build`

```groovy
{
    implementation("com.taosdata.jdbc:taos-jdbcdriver:3.0.0")
}
```

## 升级碰到的问题

在升级的过程中，涛思技术人员通过远程调试和指导编写SQL语法的方式解决，支持的力度时很大的。以下是主要碰到的问题：

### 出现taosd崩溃

升级3.0之后，运行一段时间发现，发现涛思技术人员通过远程GDB调试的方式进行BUG的修复，其中一些原因时因为探针端的资源有限，td导出的core文件把磁盘占满。

### cpu高的情况

针对tdadaptercpu占用率高的情况，部署时本地连接方式处理。

事件分类语法执行时间长，调整SQL语法，将Group By修改为PARTITON BY。

### SQL语法不兼容

部分SQL语法在嵌套查询中不支持，如FIRST(ts)，LAST(ts)，需要修改为MIN(ts)，（一开始办法对时间戳的min需要格式转换，之后可以直接转换）。

查询语法Group By，根据部分情况需要调整为PARTITON BY。

# 效果

目前该产品引入TD已经一段时间，通过引入TDengine，并将事件分类逻辑下放到探针端（TD3.0），探针端采集推送数据到平台基本无延时的情况，平台（TD2.6）的查询分析基本可在秒级内返回。

## 后续

- 事件分类使用TD3.0的流式计算。

- 平台端升级3.0。




