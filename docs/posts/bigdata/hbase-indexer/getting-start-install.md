---
date: '2018-12-05T12:32:00'
title: Hbase Indexer - 安装
categories:
  - hbase
  - hbase indexer
tags:
  - hbase
  - hbase indexer
---

This page explains how to do a basic installation of the HBase Indexer on a single machine.

这篇会讲解如何在单机中进行Hbase Indexer的基础安装。

Before you start, make sure that you have the [required software](https://github.com/NGDATA/hbase-indexer/wiki/Requirements) installed (they can all be running on single machine).

在开始之前，请确认你已经安装了所有需要的软件（他们可以都可以在单机运行）。

## 获取Hbase Indexer（Get the HBase Indexer）
Check out the code and build the tar.gz distribution.

签出代码并生成tar.gz的发布包。
```
git clone git://github.com/NGDATA/hbase-indexer.git
mvn clean package -Pdist -DskipTests
```

Next, unpackage the tar.gz distribution (in the example below it is unpacked under your $HOME directory).

接下来，解压tar.gz发布包（这个例子中，他被解压到`$HOME`目录）。
```
tar zxvf hbase-indexer-dist/target/hbase-indexer-1.0-SNAPSHOT.tar.gz -C ~
cd ~/hbase-indexer-1.0-SNAPSHOT
```

## 配置Hbase Indexer（Configure HBase Indexer）
In the hbase-indexer directory, edit the file `conf/hbase-indexer-site.xml` and configure the ZooKeeper connection string (twice, once for hbase-indexer, and once for hbase, alternatively you can copy your `hbase-site.xml`to the conf directory).

在`hbase-indexer`目录，编辑`conf/hbase-indexer-site.xml` 文件并配置ZooKeeper的连接串（两次，一次用于hbase-indexer,一次用于Hbase，或者你可以拷贝你的`hbase-site.xml`到你的`conf`目录）。
```xml
<property>
  <name>hbaseindexer.zookeeper.connectstring</name>
  <value>zookeeperhost</value>
</property>
<property>
  <name>hbase.zookeeper.quorum</name>
  <value>zookeeperhost</value>
</property>
```
If you have not defined `JAVA_HOME` globally, and the `bin/hbase-indexer` script would complain it doesn't find you Java, you can set the JAVA_HOME in the script `conf/hbase-indexer-env.sh`.

如果你没有定义全局的`JAVA_HOME`，`bin/hbase-indexer`脚本会报没有找到Java，你可以通过运行`conf/hbase-indexer-env.sh`来设置`JAVA_HOME`。

## 配置Hbase（Configure HBase）
In order to use the HBase Indexer, [replication](http://hbase.apache.org/replication.html) must be enabled in HBase. There are also a number of other HBase settings that can be set to optimize the working of the HBase indexer.

为了运行Hbase Indexer，[复制集](http://hbase.apache.org/replication.html)必须开启。同时还有一些HBase的设置需要配置以便优代Hbase Indexer的运行。

Add the settings below to your hbase-site.xml configuration on all HBase region servers, and restart HBase.
所有的分区服务上的`hbase-site.xml`添加如下配置，然后重启Hbase。
```xml
<configuration>
  <!-- SEP is basically replication, so enable it -->
  <property>
    <name>hbase.replication</name>
    <value>true</value>
  </property>
  <!-- Source ratio of 100% makes sure that each SEP consumer is actually
       used (otherwise, some can sit idle, especially with small clusters) -->
  <property>
    <name>replication.source.ratio</name>
    <value>1.0</value>
  </property>
  <!-- Maximum number of hlog entries to replicate in one go. If this is
       large, and a consumer takes a while to process the events, the
       HBase rpc call will time out. -->
  <property>
    <name>replication.source.nb.capacity</name>
    <value>1000</value>
  </property>
  <!-- A custom replication source that fixes a few things and adds
       some functionality (doesn't interfere with normal replication
       usage). -->
  <property>
    <name>replication.replicationsource.implementation</name>
    <value>com.ngdata.sep.impl.SepReplicationSource</value>
  </property>
</configuration>
```
## 添加Indexer jar到HBase（Add indexer jars to HBase）
The HBase Indexer includes two jar files that need to be in the classpath of HBase. Copy these from the lib directory of the unpacked hbase-indexer installation into the lib directory of HBase for each region server.

Hbase Indexer包含两个jar文件需要在Hbase的类目录下。将解压目录hbase-indexer下的lib中的这些文件拷贝到所有Hbase分区服务器的lib目录。
```
cp lib/hbase-sep-* $HBASE_HOME/lib
```
## 启动Solr（Start Solr）
Ensure that Solr is running. In general, it's easiest to have Solr use the same ZooKeeper instance as HBase.

确保Solr已经运行。通常，很容易让Hbase和Solr共用相同的ZooKeeper。

Assuming that you've downloaded Solr 4.2.0 and you're running ZooKeeper on the current machine, you can start up the base Solr in cloud mode using the example schema as follows:

假设你已经下载了Solr 4.2.0并且ZooKeeper运行在当前机器，你可能通过下列脚本在云模式运行Solr。
```
cd $SOLR_HOME/example
java -Dbootstrap_confdir=./solr/collection1/conf -Dcollection.configName=myconf -DzkHost=localhost:2181/solr  -jar start.jar
```
