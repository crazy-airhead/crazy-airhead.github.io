---
title: metrics - 指标
toc: true
p: hbase/hbase-indexer/metrics
date: 2019-04-16 15:41
categories:
- hbase
- hbase indexer
tags:
- hbase
- hbase indexer
---
The HBase Indexer publishes a number of metrics for each of its indexer processes. These metrics can be useful for getting an idea of how much data is being indexed, keeping track of the health of indexing processes, and troubleshooting problems.

Hbase Indexer发布了一些索引生成时的指标数据。些指标可用于了解索引了多少数据、跟踪索引进程的运行状况和故障排除问题。

By default, all metrics are published via [JMX](http://www.oracle.com/technetwork/java/javase/tech/javamanagement-140525.html). The indexer can also be configured to publish metrics to [Ganglia](http://ganglia.sourceforge.net/) (see below).

默认情况下，所有的指标是通过JMX发布的。也可以通过配置将指标发布到Ganglia中（配置看下文）。

Besides these metrics, you can monitor the replication status using the [SEP tools](https://github.com/NGDATA/hbase-indexer/tree/master/hbase-sep/hbase-sep-tools).

除了这些指标，还可以通过SEP tools来监控复制集的状态。

## 可用指标一览（Overview of available metrics）
### HBase to Solr mapping
Each indexer has a metric under `hbaseindexer/DefaultResultToSolrMapper/<indexer_name>/HBase Result to Solr Mapping time`.

每个索引在`hbaseindexer/DefaultResultToSolrMapper/<indexer_name>/HBase Result to Solr Mapping time`下用一个指标。

This metric lists information about the amount of time taken (in milliseconds) for converting an HBase update event into a Solr document, as well as a rate (in documents/second) for the general throughput of the process.

这个指标列出了将Hbase转换成Solr文档的总耗费时间（毫秒），以及文档吐吞率（文档数/秒）。

### Incoming and applicable Events
Under `hbaseindexer/(Row|Column)BasedIndexer/<indexer_name>`, there are a pair of metrics about incoming events and applicable events. These metrics list the rate of incoming HBase update events, as well as the rate of incoming HBase events that are considered applicable for indexing.

在`hbaseindexer/(Row|Column)BasedIndexer/<indexer_name>`下， 是一对关于输入事件和可用事件的指标。这些指标列出了输入HBASE更新事件的速率，以及被认为可用索引的输入HBASE事件的速率。

### Solr writing
Under `hbaseindexer/SolrWriter/<indexer_name>`, there are a number of metrics around the rate of adds and delete to Solr.

在`hbaseindexer/SolrWriter/<indexer_name>`下，是一些关于数据添加和删除到Solr速率的指标。

There are also metrics about "document add/delete errors" and "Solr add/delete errors". Document-based errors are errors that have occurred where the problem has been determined to be in the Solr document itself. Solr-based errors are errors that have occurred within Solr.

也包含了“文档添加/删除错误”和“Solr添加/删除错误”。基于文档发错误是指发生在Solr文档本身中的错误。基于Solr的错误是在Solr中发生的错误。

## Ganglia配置（Ganglia）
Reporting of metrics to Ganglia can be configured in the `hbase-indexer-site.xml` file (in the conf directory).

通过配置`hbase-indexer-site.xml`文件（在conf目录下）可以把指标生成到Ganglia中。

In order to configure reporting in Ganglia, the following three configuration keys must be supplied:
- hbaseindexer.metrics.ganglia.server - Ganglia server to report to
- hbaseindexer.metrics.ganglia.port - port on the Ganglia server
- hbaseindexer.metrics.ganglia.interval - interval for reporting, in seconds

为了配置Ganglia，下面三个配置需要被指定：
- hbaseindexer.metrics.ganglia.server - Ganglia服务器地址
- hbaseindexer.metrics.ganglia.port - Ganglia服务器端口
- hbaseindexer.metrics.ganglia.interval - 生成报告时间间隔

An example Ganglia reporting configuration would look like this
以下是一个生成Ganglia报告的配置：
```xml
<property>
  <name>hbaseindexer.metrics.ganglia.server</name>
  <value>mygangliaserver</value>
</property>
<property>
  <name>hbaseindexer.metrics.ganglia.port</name>
  <value>8649</value>
<property>
<property>
  <name>hbaseindexer.metrics.ganglia.interval</name>
  <value>60</value>
</property>
```