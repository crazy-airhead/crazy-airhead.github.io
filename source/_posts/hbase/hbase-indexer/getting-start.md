---
title: Hbase Indexer - 入门
toc: true
p: hbase/hbase-indexer/getting-start
date: 2018-12-05 12:31:00
categories:
- hbase
- hbase indexer
tags:
- hbase
- hbase indexer
---

## 构建（Building the binary distribution）
Use the following command to build the binary distribution (.tar.gz & rpm):

使用如下命令构建生成二进制发布包（.tar.gz & rpm）:
```
mvn -DskipTests -Pdist install
```

## 测试（Testing）
These steps assume a running HBase 0.94.x installation (preferably CDH 4.2), as well as a running Solr installation. For this example, the configured Solr schema will need to have a multi-valued field called "data", as well as a unique key field called "id".

以下这此步骤假定已经安装了Hbase 0.94.x(最好是CDH 4.2)和Solr。在这个例子中，Solr的映射，需要配置多值字段“data”和唯一键字段“id”。

1. Enable replication and other settings that are outlined in the [hbase-sep demo instructions](https://github.com/NGDATA/hbase-indexer/blob/master/hbase-sep/hbase-sep-demo/README.md)
1. 按[hbase-sep demo instructions](https://github.com/NGDATA/hbase-indexer/blob/master/hbase-sep/hbase-sep-demo/README.md)的配置复制集和其他设置。

2. Unzip the binary distribution (instructions for creating the binary distribution are listed above).
2. 解压发布包（生成发布包的方式已经在上文列出）。
```
 $ tar zxvf hbase_indexer.tar.gz
```

3. Copy the hbase-sep jar files from the lib directory of the binary distribution into the lib directory of HBase.
3. 将发布包下的lib目录的hbase-sep jar文件拷贝到Hbase的lib目录。
```
 $ cd hbase_indexer
 $ sudo cp lib/hbase-sep-* /usr/lib/hbase/lib
```

4. Create a table in HBase that has replication enabled. For this example, we'll create a table called "record" with a single column family called 'data'.
4. 创建一个开启复制集功能的表。这个例子中，我们会创建“record”表，有一个列簇“data”。
```
 hbase> create 'record', {NAME => 'data', REPLICATION_SCOPE => 1}
```

5. Start the hbase-indexer server
5. 启动hbase-indexer服务
```
 $ ./bin/hbase-indexer server
```

6. Create an indexer definition. For this example, we'll just index anything in the data column family into the "data" field in Solr. Save the below contents in a file called 'sample.xml'.
6. 创建索引器定义。在这个例子中，我们只是把data列簇中所有内容都放到Solr的“data”字段中进行索引。将以下内容保存为"sample.xml"。
```xml
 <?xml version="1.0"?>
 <indexer table="record">
   <field name="data" value="data:*" type="string"/>
 </indexer>
 ```
7. Add the indexer definition to the indexer server. The following command assumes that the Solr ZooKeeper is running on the current host, and the name of the collection to be used for indexing is "core0".
7. 把索引定义添加到inderxer服务中。下面的命令假设Solr ZooKeeper运行在当前的主机中，并且用于索引的集合名为“core0”。
```
 $ ./bin/hbase-indexer add-indexer  -n sampleindex -c sample.xml --cp solr.collection=core0 
```
8. Add some data to the record table in HBase. The data added to the data column family in the record table should show up in the Solr index.
8. 向Hbase的recode表添加一些数据。添加到record表中的数据应该会出现在Solr的索引中。
```
 hbase> put 'record', 'row1', 'data:value', 'Test of HBase Indexer'
```