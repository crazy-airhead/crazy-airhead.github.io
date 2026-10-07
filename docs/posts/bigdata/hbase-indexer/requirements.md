---
date: '2018-12-05T12:30:00'
title: Hbase Indexer - 要求
categories:
  - hbase
  - hbase indexer
tags:
  - hbase
  - hbase indexer
---
The following software is required for running the HBase Indexer:

运行Hbase Indexer需要下面的这些软件:
- HBase 0.94.x
- Solr 4.x in cloud mode
- ZooKeeper 3.x (required by the two above packages)

All components can be run on a single machine, or they can be run on multiple machines on a cluster.

所有的组件可以运行在单机，也可运行在多台机器的集群上。

## 详情（Details）
### HBase
HBase 0.94.x is the supported version of HBase for the HBase Indexer. It is recommended to use the version of HBase 0.94.2 that is bundled with Cloudera CDH 4.2. However, other versions of HBase 0.94.x may also work. CDH 4.2 is currently used for testing.

Hbase 0.94.x是Hbase Indexer支持的版本。推荐使用Cloudera CDH 4.2附带的HBase 0.94.2版本。尽管，其他的0.94.x版本也能正常工作，但CDH 4.2被用于当前的测试。

HBase should be configured to use HDFS as its filesystem -- HBase Indexer is not fully functional if the local filesystem implementation is used instead of HDFS.

Hbase要配置HDFS做为它的文件系统，如果使用本地文件系统而不是HDFS，HBase Indexer就不行完全运行了。

## Solr
Solr 4.x is required for the HBase Indexer, and it must be configured to run in cloud mode. Solr 4.2.0 is currently used for development testing.

Hbase Indexer 需要Solr 4.x版本，并且要求配置在云模式下运行。Solr 4.2.0是当并开发测试的版本。

## ZooKeeper
It is recommended that the version of ZooKeeper that is bundled in CDH 4.2 is used.

推荐使用和CDH4.2附带的ZooKeeper版本。
