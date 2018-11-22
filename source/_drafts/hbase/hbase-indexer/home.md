---
title: 首页
toc: true
p: hbase/hbase-indexer/home
date: 2018-11-22 15:20:59
categories:
tags:
---
## 简介（Introduction）
The HBase Indexer project provides indexing (via [Solr](http://lucene.apache.org/solr/)) for content stored in [HBase](http://hbase.apache.org/). It provides a flexible and extensible way of defining indexing rules, and is designed to scale.

Hbase Indexer项目可以为存储在HBase中的内容提供Solr索引。它提供

Indexing is performed asynchronously, so it does not impact write throughput on HBase. SolrCloud is used for storing the actual index in order to ensure scalability of the indexing.

Getting started with the HBase Indexer
Make sure you've got the required software installed, as detailed on the Requirements page.
Follow the Tutorial to get a feel for how to use the HBase Indexer.
Customize your indexing setup as needed using the other reference documentation provided here.
How it works
The HBase Indexer works by acting as an HBase replication sink. As updates are written to HBase region servers, they are "replicated" asynchronously to the HBase Indexer processes.

The indexer analyzes incoming HBase mutation events, and where applicable it creates Solr documents and pushes them to SolrCloud servers.

The indexed documents in Solr contain enough information to uniquely identify the HBase row that they are based on, allowing you to use Solr to search for content that is stored in HBase.

HBase replication is based on reading the HBase log files, which are the precise source of truth of the what is stored in HBase: there are no missing or no extra events. In various cases, the log also contains all the information needed to index, so that no expensive random-read on HBase is necessary (see the read-row attribute in the Indexer Configuration).

HBase replication delivers (small) batches of events. HBase-indexer exploits this by avoiding double-indexing of the same row if it would have been updated twice in a short time frame, and as well will batch/buffer the updates towards Solr, which gives important performance gains. The updates are applied to Solr before confirming the processing of the events to HBase, so that no event loss is possible.

Horizontal scalability
All information about indexers is stored in ZooKeeper. New indexer hosts can always be added to a cluster, in the same way that HBase regionservers can be added to to an HBase cluster.

All indexing work for a single configured indexer is shared over all machines in the cluster. In this way, adding additional indexer nodes allows horizontal scaling.

Automatic failure handling
The HBase replication system upon which the HBase Indexer is based is designed to handle hardware failures. Because the HBase Indexer is based on this system, it also benefits from the same ability to handle failures.

In general, indexing nodes going down or Solr nodes going down will not result in any lost data in the HBase Indexer.