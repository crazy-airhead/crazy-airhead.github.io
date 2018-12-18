---
title: Hbase Index - 首页
toc: true
p: hbase/hbase-indexer/home
date: 2018-12-05 12:20:00
categories:
- hbase
- hbase indexer
tags:
- hbase
- hbase indexer
---
## 简介（Introduction）
The HBase Indexer project provides indexing (via [Solr](http://lucene.apache.org/solr/)) for content stored in [HBase](http://hbase.apache.org/). It provides a flexible and extensible way of defining indexing rules, and is designed to scale.

Hbase Indexer项目可以为存储在HBase中的内容提供[Solr](http://lucene.apache.org/solr/)索引。它提供灵活的可扩展的方式来定义索引规则，且为大规模而生。

Indexing is performed asynchronously, so it does not impact write throughput on HBase. SolrCloud is used for storing the actual index in order to ensure scalability of the indexing.

索引是异步的，所以不会影响Hbase的写入吞吐量。SolrCloud用于存储实际的索引，以确保索引的可伸缩性。

## 开始使用Hbase Indexer（Getting started with the HBase Indexer）
1. Make sure you've got the required software installed, as detailed on the [Requirements](https://github.com/NGDATA/hbase-indexer/wiki/Requirements) page.
2. Follow the Tutorial to get a feel for how to use the HBase Indexer.
3. Customize your indexing setup as needed using the other reference documentation provided here.

1. 确认所有要求的软件已经安装，具体内容在[要求]页。
2. 按照教程来体验下如何使用Hbase Indexer。
3. 通过提供的文档来调整索引的配置。
   
## 工作原理（How it works）
The HBase Indexer works by acting as an HBase replication sink. As updates are written to HBase region servers, they are "replicated" asynchronously to the HBase Indexer processes.

Hbase Indxer扮演了Hbase复制集的角色。当数据写入Hbase的分区时，数据被异步的“复制”给Hbase Indexer处理器。

The indexer analyzes incoming HBase mutation events, and where applicable it creates Solr documents and pushes them to SolrCloud servers.

Hbase Indexer分析从Hbase发送过来的变化事件，当合适的时候创建Solr文档并发送给SolrCloud服务器。

The indexed documents in Solr contain enough information to uniquely identify the HBase row that they are based on, allowing you to use Solr to search for content that is stored in HBase.

Solr文档维护了足够多的信息用于唯一标识一条Hbase记录，这样允许你可能通过Solr来检索Hbase内容。

HBase replication is based on reading the HBase log files, which are the precise source of truth of the what is stored in HBase: there are no missing or no extra events. In various cases, the log also contains all the information needed to index, so that no expensive random-read on HBase is necessary (see the `read-row`attribute in the [Indexer Configuration](https://github.com/NGDATA/hbase-indexer/wiki/Indexer-configuration)).

HBase复制集是通过读取Hbase的日志文件，这些日志文件是HBASE中存储内容的精确来源：没有遗漏也没有额外的事件。在大多数情况下，日志含了索引需要的全部信息，因此不需要对Hbase进行昂贵的随机读取。（在[Indexer配置]中可查看`read-row`属性）。

HBase replication delivers (small) batches of events. HBase-indexer exploits this by avoiding double-indexing of the same row if it would have been updated twice in a short time frame, and as well will batch/buffer the updates towards Solr, which gives important performance gains. The updates are applied to Solr before confirming the processing of the events to HBase, so that no event loss is possible.

Hbase复制集（小规模）批量分发事件。Hbase indexer利用这一特性用于避免在一个很小的时间窗口期一条记录被更新两次而引起重复索引，也通过批量/缓存的方式来更新Solr，这样可以获得更好的性能。所有的更新会在Hbase处理确认之前更新到Solr中，因此不会出现丢失数据的情况。

## 横向扩展（Horizontal scalability）
All information about indexers is stored in ZooKeeper. New indexer hosts can always be added to a cluster, in the same way that HBase regionservers can be added to to an HBase cluster.

所有的索引信息都是保存在ZooKeeper中的。新的Indexer主机可以被添加为一个集群中，就像Hbase的分区服务器被添加到Hbase集群一样。

All indexing work for a single configured indexer is shared over all machines in the cluster. In this way, adding additional indexer nodes allows horizontal scaling.

同一索引配置的所有索引工作被分配给集群中的所有机器。这样说来，添加额外的索引节点就可以横向扩展。

## 自动的错误处理（Automatic failure handling）
The HBase replication system upon which the HBase Indexer is based is designed to handle hardware failures. Because the HBase Indexer is based on this system, it also benefits from the same ability to handle failures.

Hbase复制集系统为硬件错误处理做了设计。Hbase Indexer其于此系统，因此也从中获得了错误处理的能力。

In general, indexing nodes going down or Solr nodes going down will not result in any lost data in the HBase Indexer.

通常情况，索引节点或者Solr宕机不会导致Hbase Indexer中的数据丢失。