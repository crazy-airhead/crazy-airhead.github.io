---
title: batch-indexing - 批量索引
toc: true
p: hbase/hbase-indexer/batch-indexing
date: 2019-04-16 16:00
categories:
- hbase
- hbase indexer
tags:
- hbase
- hbase indexer
---

In addition to indexing HBase updates in near-real-time, it's also possible to run a batch indexing job that will index data already contained within an HBase table. The batch indexing tool operates with the same indexing semantics as the near-real-time indexer, and it is run as a MapReduce job.

In its most basic running mode, the batch indexing can be run as multiple indexers that run over HBase regions and write data directly to Solr, as follows:

```
hadoop jar hbase-indexer-mr-*-job.jar \ 
    --hbase-indexer-zk zk01 \
    --hbase-indexer-name docindexer
    --reducers 0
```
It is also possible to generate offline index shards in HDFS by supplying -1 or a positive integer for the --reducers argument, as shown below:

```
hadoop jar hbase-indexer-mr-*-job.jar \ 
    --hbase-indexer-zk zk01 \
    --hbase-indexer-name docindexer \
    --reducers -1 \
    --output-dir hdfs://namenode/solroutput
```
Finally, indexing shards can be generated offline and then merged into a running SolrCloud cluster using the --go-live flag as follows:

```
hadoop jar hbase-indexer-mr-*-job.jar \
    --hbase-indexer-zk zk01 \
    --hbase-indexer-name docindexer \
    --go-live
```