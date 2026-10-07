---
date: '2018-11-29T13:30:00'
title: Hbase同步Solr数据缺失问题验证
categories:
  - hbase
  - hbase indexer
tags:
  - hbase
  - hbase indexer
---
# 背景
公司使用Hbase indexer做二级索引，最近在做数据统计时发现，数据存在有缺失的情况。在网上查找时发现可能是Hbase Indexer的一个BUG，详情看[这里](https://www.cnblogs.com/kekukekro/p/6340922.htm)。大意是说修改read-row="never"或者修改源码。我们使用的组件不是完全开源的Hbase Indexer，有被提供商做了部分调整，为了保险起见，自己还是做了一次测试。同时也是进一步了解Hbase和Habse Indexer的机会。

# 验证方案
1. 把ES的qc索引做为数据来源，数据量比较大
2. 写测试程序从ES拉数据，100万条。
3. 调整不同的read-row方式
4. 修改程序验证部分更新。
# 验证准备
## 创建Hbase表
```sh
create 'qc',{NAME =>'d', REPLICATION_SCOPE =>1}
```
此处需要，注意设置REPLICATION_SCOPE为1，第一次验证时未开启。如果未开启的情况，可以进行如下操作：
```sh
disable 'qc'
alter 'qc',{NAME =>'d', REPLICATION_SCOPE =>1}
enable 'qc'
```
## 配置Hbase Indexer
之前已经有配置，拷贝一份及可
```sh
cd  /opt/morphline_config
cp -a xyz.xml qc.xml
cp -a xyz.conf qc.conf
```

### 修改qc.xml
```xml
<indexer table="qc" unique-key-field="rowkey"
        unique-key-formatter="com.ngdata.hbaseindexer.uniquekey.StringUniqueKeyFormatter"
        mapper="com.ngdata.hbaseindexer.morphline.MorphlineResultToSolrMapper" read-row="never">
        <param name="morphlineFile" value="/opt/morphline_config/qc.conf" />
</indexer>
```
### 修改qc.conf
可以把文件下载回来修改
```
sz qc.conf
```
通过'rz'可以上传修改后的配置文件。

#### 调整后的qc.conf
```json
morphlines : [
  {
    id : morphline1
    importCommands : ["org.kitesdk.morphline.**", "com.ngdata.**"]

    commands : [
        {
                extractHBaseCells {
                  mappings : [
                        {
                                inputColumn : "d:_id"
                                outputField : "_id"
                                type : string
                                isAllowEmpty : true
                                source : value
                        },
                        {
                                inputColumn : "d:code"
                                outputField : "code"
                                type : string
                                isAllowEmpty : true
                                source : value
                        },
                        {
                                inputColumn : "d:errorCode"
                                outputField : "errorCode"
                                type : string
                                isAllowEmpty : true
                                source : value
                        },
                        {
                                inputColumn : "d:errorMsg"
                                outputField : "errorMsg"
                                type : string
                                isAllowEmpty : true
                                source : value
                        },
                        {
                                inputColumn : "d:eventNo"
                                outputField : "eventNo"
                                type : string
                                isAllowEmpty : true
                                source : value
                        },
                        {
                                inputColumn : "d:eventTime"
                                outputField : "eventTime"
                                type : string
                                isAllowEmpty : true
                                source : value
                        },
                        {
                                inputColumn : "d:orgCode"
                                outputField : "orgCode"
                                type : string
                                isAllowEmpty : true
                                source : value
                        },
                        {
                                inputColumn : "d:patientId"
                                outputField : "patientId"
                                type : string
                                isAllowEmpty : true
                                source : value
                        },
                        {
                                inputColumn : "d:receiveTime"
                                outputField : "receiveTime"
                                type : string
                                isAllowEmpty : true
                                source : value
                        },
                        {
                                inputColumn : "d:rowKey"
                                outputField : "rowKey"
                                type : string
                                isAllowEmpty : true
                                source : value
                        },
                        {
                                inputColumn : "d:table"
                                outputField : "table"
                                type : string
                                isAllowEmpty : true
                                source : value
                        },
                        {
                                inputColumn : "d:value"
                                outputField : "value"
                                type : string
                                isAllowEmpty : true
                                source : value
                        },
                        {
                                inputColumn : "d:version"
                                outputField : "version"
                                type : string
                                isAllowEmpty : true
                                source : value
                        }                                          
                        ]		
                }
        }
        
        { logTrace { format : "output record: {}", args : ["@{}"] } }
    ]
  }
]
```

### 添加映射
```sh
hbase-indexer add-indexer -c qc.xml -n qc -z node1,node3,node2  -cp solr.zk=node1:2181,node3:2181,node2:2181/solr -cp solr.collection=qc
```
### 检查配置是否生效
```sh
hbase-indexer list-indexers -dump
```
### 删除映射
如果配置没有生效的情况，最好先删掉映射后重新添加。
```
hbase-indexer delete-indexer --name 'qc'
```

### 重新拉取Hbase数据

```
nohup hadoop jar /opt/hbase-indexer/latest/tools/hbase-indexer-mr-1.6-ngdata-job.jar  --conf /etc/hbase/conf/hbase-site.xml -D 'mapred.child.java.opts=-Xmx500m' --hbase-indexer-file /opt/morphline_config/qc.xml --zk-host node1/solr --collection qc  --reduce 0 &
```
## 配置Solr
### 修改配置
之前有配置的，可直接拷贝一份开始配置
```
cd /root
cp -a xyz qc
```
#### 修改后的scheme.xml
```xml
<?xmlversion="1.0"encoding="UTF-8"standalone="no"?>
<schemaname="qc"version="1.5">
        <field indexed="true" name="_version_" stored="true" type="long"/>
        <field indexed="true"name="_root_"stored="false" type="string"/>
        <field indexed="true"multiValued="false"name="_id"stored="true" type="string"/>
        <field indexed="true" multiValued="false" name="rowkey" stored="true" type="string"/>
        <field indexed="true" name="code" stored="false" type="string"/>
        <field indexed="true" name="errorCode" stored="true" type="string"/>
        <field indexed="true" name="errorMsg" stored="true" type="string"/>
        <field indexed="true" name="eventNo" stored="true" type="string"/>
        <field indexed="true" name="eventTime" stored="true" type="string"/>
        <field indexed="true" name="orgCode" stored="true" type="string"/>
        <field indexed="true" name="patientId" stored="true" type="string"/>
        <field indexed="true" name="receiveTime" stored="false" type="string"/>
        <field indexed="true" name="rowKey" stored="true" type="string"/>
        <field indexed="true" name="table" stored="true" type="string"/>
        <field indexed="true" name="value" stored="true" type="string"/>
        <field indexed="true" name="version" stored="true" type="string"/>
        <uniqueKey>rowkey</uniqueKey>
</schema>
```
此处注意配置rowkey字段，之前一就因为rowkey没有导致创建索引失败
## 上传配置
```sh
/opt/solr/latest/server/scripts/cloud-scripts/zkcli.sh -zkhost node1:2181/solr -cmd upconfig --confdir /root/qc/conf/ --confname qc
```
## 创建索引
```sh
/opt/solr/latest/bin/solr create_collection -c qc -d /root/qc/conf/ -n qc
```
## 修改ES配置
拉取测试数据时，提示只有10000的窗口数据，需要设计max_result_window，修改方法如下：
```
curl -XPOST 'http://xx:9200/qc/_close'
curl -XPUT 'http://xx:9200/qc/_settings?preserve_existing=true' -d '{"max_result_window" : "1000000"}'
curl -XGET 'http://xx:9200/qc/_settings?preserve_existing=true'
curl -XPOST 'http://xx:9200/qc/_open' 
```

# 测试
## read-row为never
1. 测试数据为100万条，全量数据更新。
数据测试，导入数据时出现服务连接问题，中间出现Hbase Indexer异常停止，重启后，数据能对上。
1. 测试数据为100万条，部分数据更新。
数据字段出现丢失情况，
1. 验证配置字段顺序问题。
## 清理Hbase数据
```
truncate 'qc'
```
## 清理Solr数据
```
hdfs dfs -rm -r /solr/qc
hdfs dfs -ls /solr
```
验证的情况，与配置文件的顺序无关


## 验证重跑MapRedurce
### 删除solr中qc的记录
```xml
<delete><query>*:*</query></delete>
<commit/>
```
### 重跑
```sh
nohup hadoop jar /opt/hbase-indexer/latest/tools/hbase-indexer-mr-1.6-ngdata-job.jar  --conf /etc/hbase/conf/hbase-site.xml -D 'mapred.child.java.opts=-Xmx500m' --hbase-indexer-file /opt/morphline_config/qc.xml --zk-host node1/solr --collection qc  --reduce 0 &
```
测试时发现可以正常拉取数据，正式线发现不能拉取到之前遗漏的数据。

# 解决方案
1. 修改read-row为never
2. 重新检查写入Hbase相关代码，确保数据是整条记录更新（即需要合并旧数据的方式进行更新）
**注意事项**，采用read-row为never时，只会从WAL中获取数据去更新Solr，也就是说如果，数据只更新部分，Solr也只会有最后更新的那部分数据。
3. 通过写程序将缺失数据提取出来重新更新Hbase，该工作已让郑维协助处理，保持跟进。

## 参考链接
[Lily HBase Indexer同步HBase二级索引到Solr丢失数据的问题分析](https://www.cnblogs.com/kekukekro/p/6340922.html) 
