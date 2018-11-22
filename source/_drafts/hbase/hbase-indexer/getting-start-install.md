---
title: getting-start-installj
toc: true
p: hbase/hbase-indexer/getting-start-install
categories:
tags:
---

This page explains how to do a basic installation of the HBase Indexer on a single machine.

Before you start, make sure that you have the required software installed (they can all be running on single machine).

Get the HBase Indexer
Check out the code and build the tar.gz distribution.

git clone git://github.com/NGDATA/hbase-indexer.git
mvn clean package -Pdist -DskipTests
Next, unpackage the tar.gz distribution (in the example below it is unpacked under your $HOME directory).

tar zxvf hbase-indexer-dist/target/hbase-indexer-1.0-SNAPSHOT.tar.gz -C ~
cd ~/hbase-indexer-1.0-SNAPSHOT
Configure HBase Indexer
In the hbase-indexer directory, edit the file conf/hbase-indexer-site.xml and configure the ZooKeeper connection string (twice, once for hbase-indexer, and once for hbase, alternatively you can copy your hbase-site.xml to the conf directory).

<property>
  <name>hbaseindexer.zookeeper.connectstring</name>
  <value>zookeeperhost</value>
</property>
<property>
  <name>hbase.zookeeper.quorum</name>
  <value>zookeeperhost</value>
</property>
If you have not defined JAVA_HOME globally, and the bin/hbase-indexer script would complain it doesn't find you Java, you can set the JAVA_HOME in the script conf/hbase-indexer-env.sh.

Configure HBase
In order to use the HBase Indexer, replication must be enabled in HBase. There are also a number of other HBase settings that can be set to optimize the working of the HBase indexer.

Add the settings below to your hbase-site.xml configuration on all HBase region servers, and restart HBase.

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
Add indexer jars to HBase
The HBase Indexer includes two jar files that need to be in the classpath of HBase. Copy these from the lib directory of the unpacked hbase-indexer installation into the lib directory of HBase for each region server.

cp lib/hbase-sep-* $HBASE_HOME/lib
Start Solr
Ensure that Solr is running. In general, it's easiest to have Solr use the same ZooKeeper instance as HBase.

Assuming that you've downloaded Solr 4.2.0 and you're running ZooKeeper on the current machine, you can start up the base Solr in cloud mode using the example schema as follows:

cd $SOLR_HOME/example
java -Dbootstrap_confdir=./solr/collection1/conf -Dcollection.configName=myconf -DzkHost=localhost:2181/solr  -jar start.jar