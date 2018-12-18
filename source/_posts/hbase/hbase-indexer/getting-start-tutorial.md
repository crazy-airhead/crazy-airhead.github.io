---
title: Hbase Indexer - 教程
toc: true
p: hbase/hbase-indexer/getting-start-tutorial
date: 2018-12-05 12:33:00
categories:
- hbase
- hbase indexer
tags:
- hbase
- hbase indexer
---
This page explains how to start doing basic indexing in HBase. Before following this tutorial, make sure that the HBase Indexer and other required software is installed and running as explained in the [installation instructions](https://github.com/NGDATA/hbase-indexer/wiki/Installation).

这篇解释如何在Hbase中开始基础索引。在开始教程之前，请确保Hbase Indexer和其他需要的软件已经[安装]()和运行。

At this point, HBase and Solr (in cloud mode) should be running, and the HBase Indexer should be unpacked in a directory (which we'll call $INDEXER_HOME). For this tutorial, it is assumed that the default example index schema is being used by Solr (as explained on the [installation page](https://github.com/NGDATA/hbase-indexer/wiki/Installation)).

此时，Hbasa和Solr（云模式）已经行行，并且Hbase Indexer已经解压到一个目录中（这是我们称为`$INDEXER_HOME`）。在这个教程中，我们假设用的是Solr的默认example索引（就像[安装](https://github.com/NGDATA/hbase-indexer/wiki/Installation)中说的那样）。

## 启动Hbase Indexer（Start the HBase Indexer daemon）
In a terminal, execute the following (assuming $INDEXER_HOME points to the directory where the hbase-indexer tar.gz distribution was unpacked).

在终端中，运行如下命令（假定`$INDEXER_HOME`指向hbase-indexer tar.gz解压的目录）。
```
cd $INDEXER_HOME
./bin/hbase-indexer server
```

## 创建需要索引的表（Create a table to be indexed in HBase）
In the HBase shell, create a table. For this tutorial, we'll create a table named "indexdemo-user", with a single column family named "info". Note that the `REPLICATION_SCOPE` of the column family of the table must be set to 1.

在Hbase shell，创建一个表。在这里，我们创建一个“indexdemo-user”的表，有一个“info”的列簇。注意列簇的`REPLICATION_SCOPE`必须设置成1。
```
$ hbase shell
hbase> create 'indexdemo-user', { NAME => 'info', REPLICATION_SCOPE => '1' }
```
## 添加索引器（Add an indexer）
Now we'll create an indexer that will index the the indexdemo-user table as its contents are updated.

现在我们创建一个索引器，在indexdemo-user表的内容被更新是他会进行索引。

In your favourite text editor, create a new xml file called indexdemo-indexer.xml, with the following content:

用你喜欢的编辑器，创建一个新的xml文件，命名为`indexdemo-indexer.xml`，添加如下内容：
```xml
<?xml version="1.0"?>
<indexer table="indexdemo-user">
  <field name="firstname_s" value="info:firstname"/>
  <field name="lastname_s" value="info:lastname"/>
  <field name="age_i" value="info:age" type="int"/>
</indexer>
```
The above file defines three pieces of information that will be used for indexing, how to interpret them, and how they will be stored in Solr.

上面的文件定义了三个索引字段的信息，如何解析，如何在Solr中存储。

Next, create an indexer based on the created indexer xml file.

接下来，基于xml文件创建一个索引器。
```
./bin/hbase-indexer add-indexer -n myindexer -c indexdemo-indexer.xml \
        -cp solr.zk=localhost:2181/solr -cp solr.collection=collection1
```

Note that the above command assumes that ZooKeeper is running on localhost on port 2181, and that there is a Solr Core called "collection1" configured. If you are doing this tutorial on an existing HBase/Solr environment, you may need to use different settings.

注意上面的命令假设，ZooKeeper运行要本机的2181端口上，并且Solr Core已经创建了一个名为“collection1”的索引。如果你在一个现有的Hbase/Solr环境运行本教程，你需要修改配置。

## 更新表内容（Update the table content）
In the HBase shell, try adding some data to the indexdemo-user table
在Hbase shell中，尝试给`indexdemo-user`添加一些数据。
```
hbase> put 'indexdemo-user', 'row1', 'info:firstname', 'John'
hbase> put 'indexdemo-user', 'row1', 'info:lastname', 'Smith'
```
After adding this data, take a look in Solr (i.e. http://localhost:8983/solr/#/collection1/query). You should see a single document in Solr that has the firstname_s field set to "John", and the lastname_s field set to "Smith".

添加数据之后，来看一下Solr（i.e. http://localhost:8983/solr/#/collection1/quer），你应该能看到一个文档，这个文档的firstname_s字段值为“John”，同时lastname_s字段值为“Smith”。

Note If you don't have autoCommit enabled in Solr, you won't be able to see the updated contents immediately in Solr. The demo environment has autoCommit enabled for a commit every second.

**注意**如果没有开启`autoCommit`，你不会马上在Solr看到更新的内容。这例子的环境`autoCommit`已经开启并设置为每秒自动提交1次。

Now try updating the data you've just added

现在尝试更新你刚才添加的数据

```
hbase> put 'indexdemo-user', 'row1', 'info:firstname', 'Jim'
```
And now check the content in Solr. The document's firstname_s field now contains the string "Jim".

然后在Solr有检查内容。看下文档的firstname_s是不是变成了“Jim”

Finally, delete the row from HBase.

最后，删除Hbase的这条记录。

```
hbase> deleteall 'indexdemo-user', 'row1'
```

You can now verify that the data has been deleted from Solr.

你可以验证下Solr中的数据是不是已经删除了。