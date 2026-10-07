---
date: '2019-09-11T10:18:30'
title: 升级Mysql8
categories:
  - mysql
tags:
  - mysql
---
# 说明
最近项目迁移，顺便将Mysql数据库从5.7升级到8.0，记录下升级中的碰到的问题和一些处理。采用SpringBoot集成Jfinal，使用Druid管理数据库连接，同样适用于只使用Jfinal的用户。
# 准备Mysql
使用Docker来完成Mysql8的环境准备（这里假设你已安装好Docker CE），可以到DockerHub上看是否有最新版本。
```sh
docker run --name mysql8 -p 3306:3306 MYSQL_ROOT_PASSWORD=123456 -d mysql:8.0
```
# 修改pom.xml
```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.12</version>
</dependency>
```
# 修改DruidPlugin配置
```java
DruidPlugin druidPlugin = new DruidPlugin("jdbcUrl", "user", "password", "com.mysql.cj.jdbc.Driver");
```
## 问题
此处一定要增加驱动名`com.mysql.cj.jdbc.Driver`，否则会报`Cannot resolve com.mysq.jdbc.Connection.ping method. Will use 'SELECT 1' instead`错。
# 修改配置
```yaml  
activerecord:
    url: jdbc:mysql://ip:port/db?characterEncoding=utf8&useSSL=false&zeroDateTimeBehavior=CONVERT_TO_NULL&serverTimezone=GMT
    username: user
    password: password
```
## 问题
- 5.7版本时使用`zeroDateTimeBehavior=convertToNull`，需要调整为`zeroDateTimeBehavior=CONVERT_TO_NULL`。
- 如果提示`MySQLNonTransientConnectionException: Public Key Retrieval is not allowed`，增加`allowPublicKeyRetrieval=true`或者增加Timezone设置，如`serverTimezone=GMT`。具体原因可能参看[https://mysqlconnector.net/connection-options/](https://mysqlconnector.net/connection-options/)。
- 如果使用了asText()，需要修改成ST_asText()。

暂未发现其他问题，如遇到会进一步更新本文档。

# Mysql8新特性
以下简要列出Mysql8.0的一些新特性，主要参考[这里](https://www.jianshu.com/p/be29467c2b0c),建议直接看Mysql官网说明。
- 默认字符集由latin1变为utf8mb4
- MyISAM系统表全部换成InnoDB表
- 自增变量持久化
- DDL原子化
- 参数修改持久化
- 新增降序索引
- group by 不再隐式排序
- JSON特性增强
- redo & undo 日志加密
- innodb select for update跳过锁等待
- 增加SET_VAR语法
- 支持不可见索引
- 支持直方图
- 新增innodb_dedicated_server参数
- 日志分类更详细
- undo空间自动回收
- 增加资源组
- 增加角色管理

