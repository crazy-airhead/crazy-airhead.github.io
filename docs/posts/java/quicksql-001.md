---
date: '2021-05-15T13:34:12'
title: Centos7部署QuickSQL
categories:
  - Java
  - QuickSQL
tags:
  - Java
  - QuickSQL
---

## 准备

- Java SDK 1.8

- Spark 2.4 https://www.apache.org/dyn/closer.lua/spark/spark-2.4.7/spark-2.4.7-bin-hadoop2.7.tgz

```
tar -xzvf spark-2.4.7-bin-hadoop2.7.tgz -C /usr/local
```

- https://github.com/Qihoo360/Quicksql/releases，当前版本为0.7.0

<!-- more -->

## 安装

解压quicksql.

```
tar -xzvf quicksql-0.7.0.tar.gz -C /usr/local
```

进入qsql-0.7.0目录

```
cd /usr/local/qsql-0.7.0
```

配置quicksql-env.sh，开启SPARK_HOME和JAVA_HOME，并设置正确的值。

```
 vi ./conf/quicksql-env.sh #Set Your Basic Environment.
export SPARK_HOME=/usr/local/spark-2.4.7-bin-hadoop2.7  # [Required] - SPARK_HOME, to set spark home for quicksql running. quicksql needs spark 2.0 or above. 

export JAVA_HOME=/usr/java/jdk1.8.0_261-amd64   # [Required] - JAVA_HOME, to set java home for quicksql running. quicksql needs java 1.8 or above. 
```

## 测试

可执行quicksql-example进行测试

```
./bin/quicksql-example.sh --class com.qihoo.qsql.CsvJoinWithEsExample --runner spark
```

如果能够显示以下表格，说明环境构建完毕，可以尝试新的操作。

```
+------+-------+----------+--------+------+-------+------+ 

|deptno|   name|      city|province|digest|   type|stu_id| 

+------+-------+----------+--------+------+-------+------+ 

|    45| Master|   CONCORD|      NH| 34035| Master|  null| 

|    40|Scholar|  BROCKTON|      MA| 59498|Scholar|  null| 

|    40|Scholar|FRAMINGHAM|      MA| 65046|Scholar|  null| 

+------+-------+----------+--------+------+-------+------+ 
```

## 替换Mysql驱动

只要替换lib中的mysql驱动就可以了，其他驱动类似，部分驱动不支持更高版本。

```
cd lib

rm -f mysql-connector-java-5.1.20.jar

cp mysql-connector-java-8.0.20.jar ./
```

如果使用了spark引擎，在lib/spark目录下也有个mysql-connector-java-5.1.20.jar需要一起替换。



## 采集元数据

在Quicksql上运行查询前需要将连接信息以及表、字段信息采集入库。默认元数据库使用Derby（官网说明是Sqlite）。

Quicksql提供了众多标准数据源的采集脚本，通过脚本批量拉取元数据。

目前支持通过脚本录入元数据的数据源有**Hive, MySQL, Kylin, Elasticsearch, Oracle,Postgresql,Gbase-8s, MongoDB**。也就是-d参数&lt;DATA-SOURCE&gt;，测试发现对数据源的大小写无要求。

执行方式如下（注意：-r 参数可以使用LIKE语法，['%': 全部匹配，'_': 占位匹配，'?': 可选匹配]）

```
$ ./metadata-extract.sh -p "<SCHEMA-JSON>" -d "<DATA-SOURCE>" -r "<TABLE-NAME-REGEX>"
```

**注意，采集数据元时需要进入到bin目录。**

### 使用示例

- 从**MySQL**数据库中采集元数据

```
./metadata-extract.sh -p "{\"jdbcDriver\": \"com.mysql.jdbc.Driver\", \"jdbcUrl\": \"jdbc:mysql://${IP}:${PORT}/${DATABASE}\", \"jdbcUser\": \"${USERNAME}\",\"jdbcPassword\": \"${PASSWORD}\"}" -d "mysql" -r "${TABLE_NAME}"
```

替换${}内容为实际值就可以了。

## 命令行执行

从命令行查询是Quicksql提供的最基本的查询方式之一。

像Hive和MySQL一样，使用quicksql.sh -e "YOUR SQL"就可以完成查询，结果集将打印在终端上。

### **使用示例**

1. 一个简单的查询，将在Quicksql内核中被执行；

```
$ ./bin/quicksql.sh -e "SELECT 1"
```

## **从应用提交查询**

Quicksql支持使用Client/Server模式的JDBC连接进行查询，用户的应用可以通过引入Driver包与Server建立连接进行联邦查询。

### **Server端**

```
$ ./bin/quicksql-server.sh start -p 5888 -R spark -m yarn-client
```

启动参数包括start|stop|restart|status，-p/-r/-m为可选项，分别对应端口号，执行引擎和任务调度方式，

-p：指定server端口号，默认为5888

-r：指定执行引擎，支持spark/flink

-m：指定spark任务资源调度方式，yarn-client或yarn-cluster等，默认为local[1]

### **Client端**

项目手动加入Quicksql driver包 qsql-client-0.7.1.jar，下载地址：https://github.com/Qihoo360/Quicksql/releases；

Java代码示例：

```
 public static void main(String[] args) throws SQLException, ClassNotFoundException {

        Class.forName("com.qihoo.qsql.client.Driver"); //注入Drvier



        Properties properties = new Properties();

        properties.setProperty("runner","jdbc");

        String url = "jdbc:quicksql:url=http://localhost:5888";

        Connection connection = DriverManager.getConnection(url,properties);

        Statement pS = connection.createStatement();

        String sql = "select * from (values ('a', 1), ('b', 2))";

        ResultSet rs =  pS.executeQuery(sql);

        while (rs.next()) {

            System.out.println(rs.getString(1));

            System.out.println(rs.getString(2));

        }

        rs.close();

        pS.close();

}
```

因为替换了驱动8.0.20，查询导入的表会报错，但使用quicksql.sh时却是正常的。判断应该时程序BUG。

```
java.lang.RuntimeException: java.lang.ClassNotFoundException: com.mysql.jdbc.Driver 

        at com.qihoo.qsql.exec.JdbcPipeline.createSpecificConnection(JdbcPipeline.java:132) 

        at com.qihoo.qsql.exec.JdbcPipeline.getConnection(JdbcPipeline.java:389) 

        at com.qihoo.qsql.exec.JdbcPipeline.establishStatement(JdbcPipeline.java:336) 

        at com.qihoo.qsql.exec.JdbcPipeline.collect(JdbcPipeline.java:266) 

        at com.qihoo.qsql.server.QuicksqlServerMeta.getJDBCResultSet(QuicksqlServerMeta.java:807) 

        at com.qihoo.qsql.server.QuicksqlServerMeta.getExecuteResultSet(QuicksqlServerMeta.java:768) 

        at com.qihoo.qsql.server.QuicksqlServerMeta.prepareAndExecute(QuicksqlServerMeta.java:747) 

        at org.apache.calcite.avatica.remote.LocalService.apply(LocalService.java:206) 

        at org.apache.calcite.avatica.remote.Service$PrepareAndExecuteRequest.accept(Service.java:927) 

        at org.apache.calcite.avatica.remote.Service$PrepareAndExecuteRequest.accept(Service.java:879) 

        at org.apache.calcite.avatica.remote.AbstractHandler.apply(AbstractHandler.java:94) 

        at org.apache.calcite.avatica.remote.JsonHandler.apply(JsonHandler.java:52) 

        at org.apache.calcite.avatica.server.AvaticaJsonHandler.handle(AvaticaJsonHandler.java:130) 

        at org.eclipse.jetty.server.handler.HandlerList.handle(HandlerList.java:52) 

        at org.eclipse.jetty.server.handler.HandlerWrapper.handle(HandlerWrapper.java:97) 

        at org.eclipse.jetty.server.Server.handle(Server.java:499) 

        at org.eclipse.jetty.server.HttpChannel.handle(HttpChannel.java:311) 

        at org.eclipse.jetty.server.HttpConnection.onFillable(HttpConnection.java:257) 

        at org.eclipse.jetty.io.AbstractConnection$2.run(AbstractConnection.java:544) 

        at org.eclipse.jetty.util.thread.QueuedThreadPool.runJob(QueuedThreadPool.java:635) 

        at org.eclipse.jetty.util.thread.QueuedThreadPool$3.run(QueuedThreadPool.java:555) 

        at java.lang.Thread.run(Thread.java:748) 
```

尝试升级Pom文件的mysql版本，似乎没有作用。需要更进一步学习尝试修改。

使用MySQL5的驱动，测试连接5版本的数据库，正常。但连接8版本数据库提示的时密码策略不支持。当然可以通过修改Mysql8连接用的的密码策略来调整，但不是一个好主意。

## 参考链接

[Getting Started - Quick SQL](https://quicksql.readthedocs.io/en/latest/reference/getting-started/)

------

欢迎联系我

微信号 ：Crazy_Airhead

Mixin ID :  1091586

定投课堂邀请码：6DYMBFP061

李笑来写作课邀请码：38MDGFYZK8

水龙头邀请码：FDJQHJ
