---
date: '2018-12-05T12:34:00'
title: Hbase Indexer - 索引器配置
categories:
  - hbase
  - hbase indexer
tags:
  - hbase
  - hbase indexer
---
The most basic indexer configuration only requires a table name and a single field. However, there are many configuration settings that can be used in an indexer configuration file to customize behavior.

最基础索引器配置只需要一个表名和一个字段名就可以。但是，有很多配置可以用于配置可以自定义解析器的行为。
```xml
<indexer table="mytable">
  <field name="fieldname" value="columnfamily:qualifier" type="string"/>
</indexer>
```
## 全局索引器属性（Global indexer attributes）
The following is a list of attributes that can be set on the top-level &lt;indexer&gt; element in an indexer configuration.

以下列出的属性可以在顶层`&lt;indexer&gt;`节点中配置。

### table
The table attribute specifies the name of the HBase table to be indexed by the indexer. It is the only mandatory attribute in the indexer element.

table属性用于指定HBase需要索引器索引的表名。这个indexer节点中强制要求的属性。

### mapping-type
The mapping-type attribute has two possible values: row, or column. This attribute specifies whether row-based or column-based indexing is to be performed.

mapping-type属性有两种值：row和column。这个属性用于指定是基于行还是基于列的索引方式。

Row-based indexing treats all data within a single HBase row as input for a single document in Solr. This is the kind of indexing that would be used for an HBase table that contains a separate entity in each row, e.g. a table containing users.

基于行索引方式把Hbase一行当中的所有数据当成Solr的一个文档输入。这种方式用于索引一行就表示一个独立的实体的Hbase表，比如包含用户的表。

Column-based indexing treats each HBase cell as input for a single document in Solr. This approach could be used for example in a messaging platform where a single user's messages are all stored in a single row, with each message being stored in a separate cell.

基于列索引方式把Hbase的一个列当作Solr的一个文档输入。这种处理可以用于消息平台，一个用户的所有消息存在同一行中，而每条消息存在一个单独的列上。

The default mapping-type value is row.

默认的mapping-type是row。

### read-row
The read-row attribute has two possible values: dynamic, or never.

read-row属性有两种值：dyamic和never。

This attribute is only important when using row-based indexing. It specifies whether or not the indexer should re-read data from HBase in order to perform indexing.

这个属性中对基于行索引的方式才是重要的。它指定索引器为了进行索引是否需要从Hbase重新读取数据。

When set to "dynamic", the indexer will read the necessary data from a row if a partial update to the row is performed in HBase. In dynamic mode, the row will not be re-read if all data needed to perform indexing is included in the row update.

当被设置为“dynamic”时，如果HBase是一行数据的部分数据更新时，索引器会读取这一行中需要的数据。dynamic模式下，如果是一行的全部数据的更新，索引器不会重新读取Hbase的数据。

If this attribute is set to never, a row will never be re-read by the indexer.

如果这个属性被设置为never，索引器不会重读行数据。

The default setting is "dynamic".

默认的设置是“dynamic”。

### mapper
The mapper attribute allows the user to specify a custom mapper class that will create a Solr document from a HBase Result object. The mapper class must implement the com.ngdata.hbaseindexer.parse.ResultToSolrMapper interface.

mapper属性允许用户指定一个自定义的类通过Hbase结果对象来创建Solr文档。但这个mapper类必需实现`com.ngdata.hbaseindexer.parse.ResultToSolrMapper`接口。

By default, the built-in com.ngdata.hbaseindexer.parse.DefaultResultToSolrMapper is used.

默认情况，使用的是内署的`com.ngdata.hbaseindexer.parse.DefaultResultToSolrMapper`。

### unique-key-formatter
The unique-key-formatter attribute specifies the name of the class used to format HBase row keys (as well as column families and column qualifiers) as text. A textual representation of these pieces of information is needed for indexing in Solr, as all data in Solr is textual, but row keys, column families, and column qualifiers are byte arrays.

unique-key-formatter指定了用于格式化Hbase rowkeys（列簇和列限定符也一样）为文本的类名。在Solr中索引需要这些信息的文本表示，因为Solr中的所有数据都是文本数据，但是行键、列族和列限定符是字节数组。

A unique-key-formatter class must implement the com.ngdata.hbaseindexer.uniquekey.UniqueKeyFormatter interface.

一个unique-key-formatter类必须实现`com.ngdata.hbaseindexer.uniquekey.UniqueKeyFormatter`接口。

The default value of this attribute is com.ngdata.hbaseindexer.uniquekey.StringUniqueKeyFormatter. The StringUniqueKey formatter simply treats row keys and other byte arrays as strings.

这个属性的默认值是`com.ngdata.hbaseindexer.uniquekey.StringUniqueKeyFormatter`。StringUniqueKeyFormatter只是简单的把rowkey或者其他字节数据当成字符串。

If your row keys, column families, or qualifiers can't simply be used as strings, consider using the com.ngdata.hbaseindexer.uniquekey.HexUniqueKeyFormatter.

如果你的rowkey，列簇，或者限定符不能简单的用字符串表示，就你需要考虑使用`com.ngdata.hbaseindexer.uniquekey.HexUniqueKeyFormatter`。

### unique-key-field
This attribute specifies the name of the document identifier field used in Solr.

这个属性指定Solr中文档的标识字段。

The default value for this field is "id".

默认值是“id”。

### row-field
The row-field attribute specifies the name of the Solr field to be used for storing an HBase row key.

row-field属性指定了Solr中用于存储Hbase rowkey的安段名。

This field is only important when doing column-based indexing. In order for the indexer to be able to delete all documents for a single row from the index, it needs to be able to find all documents for the row in Solr. When this attribute is populated in the indexer definition, it's value is used as the name of a field in Solr to store the encoded row key.

这个字段对于基于列索引方式才很重要。索引器为了能够从索引中删除一行的所有文档，它一个字段能在Solr中找到该行的所有文档。在索引器定义中设置这个属性时，它的值将用作Solr中字段的名称，以存储编码的行键。

By default, this attribute is empty, meaning that the row key is not stored in Solr. The consequence of this is that deleting a complete row or complete column family in HBase will not delete the indexed documents in Solr.

默认情况，这个属性为空，这意味着rowkey不会被存储在Solr里面。这样的结果就是在Hbase中删除一个完整的行或者列并不删除Solr中的已经索引的文档。

### column-family-field
The column-family-field specifies the name of the Solr field to be used for storing the HBase column family name.

column-family-field指定Solr中用于存储HBase列簇名的字段名。

See the description of the row-field attribute for more information.

查看row-field属性查看更多的信息。

By default, this attribute is empty, so the column-family name is not saved in Solr.

默认情况，这个属性为空，也就是说，列簇不会被Solr存储。

### table-name-field
The table-name-field specifies the name of the Solr field to be used for storing the name of the HBase table where a record is stored.

table-name-field指定Solr中用于存储Hbase表名的字段名。

By default, this attribute is empty, so the name of the HBase table is not stored unless this setting is explicitly set in the indexer config.

默认情况，这个属性是空，也就是说Hbase的表名不会被存储除非在indexer节点中明确指定。

## indxer内定义的节点（Elements within the indexer definition）
There are three types of elements that can be used within an indexer configuration: &lt;field&gt;, &lt;extract&gt;, and &lt;param&gt;.

在indexer节点有三种类型的节点：&lt;field&gt;, &lt;extract&gt;和&lt;param&gt;

### &lt;field&gt;
The field element defines a single field to be indexed in Solr, as well as where its contents are to be taken from and interpreted from HBase. There are typically one or more fields listed in an indexer configuration -- one for each Solr field to be stored.

field节点定义了要在Solr中索引的单个字段，以及要从Hbase获取和解析的内容。索引器配置中通常列出一个或多个字段——每个Solr字段都要存储一个字段。

The field attribute has four attributes, listed below.

field有如下的四个属性。

#### name
The name attribute specifies the name of a Solr field in which to store data. A field with a matching name should be defined in the Solr schema.

name属性指定了Solr的中存储数据的字段名。这个字段需要在Solr的Schema中有匹配的字段名。

The name attribute is mandatory.

name属性是必须的。

#### value
The value attribute specifies the data to be used from HBase for populating the field in Solr. It takes the form of a column family name and qualifier, separated by a colon.

value属性指定了Hase用于填充Solr字段的数据。它采用列族名和限定符的形式，用冒号分隔。

The qualifier portion can end in an asterisk, which is interpreted as a wildcard. In this case, all matching column-family and qualifier expressions will be used.

限定符部分可以星号结尾，该星号被解释为通配符。在这种情况下，将使用所有匹配的列族表达式和限定符表达式。

The following are examples of valid value attributes:

以下是有效值属性的示例：
- mycolumnfamily:myqualifier
- mycolumnfamily:my*
- mycolumnfamily:*

#### source
The source attribute determines what portion of an HBase KeyValue will be used as indexing content.

Source属性确定HBASE KeyValue的哪个部分将用作索引内容。

It has two possible values: value and qualifier.、

它有两个可能的值：value和qualifier。

When value is specified (which is the case by default), then the cell value is used as input for indexing.

当指定值时(默认情况下是这种情况)，则使用单元格值作为索引的输入。

When qualifier is specified, then the column qualifier is used as input for indexing.

当指定限定符时，列限定符将用作索引的输入。

#### type
The type attribute defines the datatype of the content in HBase.

type属性定义HBASE中内容的数据类型。

Because all data is stored in HBase as byte arrays, but all content in Solr is indexed as text, a method for converting from byte arrays to the actual datatype is needed.

因为所有数据都以字节数组的形式存储在HBASE中，但是Solr中的所有内容都被索引为文本，所以需要一个方法将字节数组转换为实际的数据类型。

The value of this field can be one of any of the datatypes supported by the HBase Bytes class: int, long, string, boolean, float, double, short, or bigdecimal.

该字段的值可以是HBASE Bytes类支持的任何数据类型之一：int、long、string、boole、Float、Double、Short或Big十进制。

If the Bytes-based representation has not been used for storing data in HBase, the name of a custom class can be specified for this attribute. The custom class must implement the com.ngdata.hbaseindexer.parse.ByteArrayValueMapper interface.

如果没有使用基于Bytes的表示形式在HBASE中存储数据，则可以为该属性指定自定义类的名称。自定义类必须实现com.ngdata.hbaseindexer.parse.ByteArrayValueMapper接口。

### &lt;param&gt;
The &lt;param&gt; element defines a key-value pair that will be supplied to custom classes that implement the com.ngdata.hbaseindexer.Configurable interface.

&lt;param&gt;节点定义了一个键值对，它将提供给实现com.ngdata.hbase indexer.Configable接口的自定义类。

&lt;param&gt; elements can also be nested in a &lt;field&gt; element.

&lt;param&gt;元素也可以嵌套在&lt;field&gt;元素中。

The element has two attributes: name and value. Both are mandatory.

访节点有两个属性：name和value。两者都是必须的。

## 配置样例（Example configuration）
The example configuration below demonstrates all elements and attributes that can be used to configure an indexer.

下面的示例配置演示了可用于配置索引器的所有元素和属性。

```xml
<!--
   Do row-based indexing on table "table1", never re-reading updated content.
   Store the unique document id in Solr field called "custom-id".
   Additionally store the row key in a Solr field called "custom-row", and store the 
   column family in a Solr field called "custom-family".
  
   Perform conversion of byte array keys using the class "com.mycompany.MyKeyFormatter".
--> 
<indexer
    table="table1"
    mapping-type="row"
    read-row="never"
    unique-key-field="custom-id"
    row-field="custom-row"
    column-family-field="custom-family"
    table-name-field="custom-table"
    unique-key-formatter="com.mycompany.MyKeyFormatter"
    >

  <!-- A float-based field taken from any qualifier in the column family "colfam" -->
  <field name="field1" value="colfam:*" source="qualifier" type="float"/>
  
  <param name="globalKeyA" value="globalValueA"/>
  <param name="globalKeyB" value="globalValueB"/>

</indexer>
```

## 参考
[morphlines](http://cloudera.github.io/cdk/docs/0.8.0/cdk-morphlines/index.html)
![morphlines-architecture](http://cloudera.github.io/cdk/docs/0.8.0/cdk-morphlines/images/morphlines-architecture.jpg)
