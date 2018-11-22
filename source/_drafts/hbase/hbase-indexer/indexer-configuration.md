---
title: indexer-configuration
toc: true
p: hbase/hbase-indexer/indexer-configuration
categories:
tags:
---
The most basic indexer configuration only requires a table name and a single field. However, there are many configuration settings that can be used in an indexer configuration file to customize behavior.

<indexer table="mytable">
  <field name="fieldname" value="columnfamily:qualifier" type="string"/>
</indexer>
Global indexer attributes
The following is a list of attributes that can be set on the top-level <indexer> element in an indexer configuration.

table
The table attribute specifies the name of the HBase table to be indexed by the indexer. It is the only mandatory attribute in the indexer element.

mapping-type
The mapping-type attribute has two possible values: row, or column. This attribute specifies whether row-based or column-based indexing is to be performed.

Row-based indexing treats all data within a single HBase row as input for a single document in Solr. This is the kind of indexing that would be used for an HBase table that contains a separate entity in each row, e.g. a table containing users.

Column-based indexing treats each HBase cell as input for a single document in Solr. This approach could be used for example in a messaging platform where a single user's messages are all stored in a single row, with each message being stored in a separate cell.

The default mapping-type value is row.

read-row
The read-row attribute has two possible values: dynamic, or never.

This attribute is only important when using row-based indexing. It specifies whether or not the indexer should re-read data from HBase in order to perform indexing.

When set to "dynamic", the indexer will read the necessary data from a row if a partial update to the row is performed in HBase. In dynamic mode, the row will not be re-read if all data needed to perform indexing is included in the row update.

If this attribute is set to never, a row will never be re-read by the indexer.

The default setting is "dynamic".

mapper
The mapper attribute allows the user to specify a custom mapper class that will create a Solr document from a HBase Result object. The mapper class must implement the com.ngdata.hbaseindexer.parse.ResultToSolrMapper interface.

By default, the built-in com.ngdata.hbaseindexer.parse.DefaultResultToSolrMapper is used.

unique-key-formatter
The unique-key-formatter attribute specifies the name of the class used to format HBase row keys (as well as column families and column qualifiers) as text. A textual representation of these pieces of information is needed for indexing in Solr, as all data in Solr is textual, but row keys, column families, and column qualifiers are byte arrays.

A unique-key-formatter class must implement the com.ngdata.hbaseindexer.uniquekey.UniqueKeyFormatter interface.

The default value of this attribute is com.ngdata.hbaseindexer.uniquekey.StringUniqueKeyFormatter. The StringUniqueKey formatter simply treats row keys and other byte arrays as strings.

If your row keys, column families, or qualifiers can't simply be used as strings, consider using the com.ngdata.hbaseindexer.uniquekey.HexUniqueKeyFormatter.

unique-key-field
This attribute specifies the name of the document identifier field used in Solr.

The default value for this field is "id".

row-field
The row-field attribute specifies the name of the Solr field to be used for storing an HBase row key.

This field is only important when doing column-based indexing. In order for the indexer to be able to delete all documents for a single row from the index, it needs to be able to find all documents for the row in Solr. When this attribute is populated in the indexer definition, it's value is used as the name of a field in Solr to store the encoded row key.

By default, this attribute is empty, meaning that the row key is not stored in Solr. The consequence of this is that deleting a complete row or complete column family in HBase will not delete the indexed documents in Solr.

column-family-field
The column-family-field specifies the name of the Solr field to be used for storing the HBase column family name.

See the description of the row-field attribute for more information.

By default, this attribute is empty, so the column-family name is not saved in Solr.

table-name-field
The table-name-field specifies the name of the Solr field to be used for storing the name of the HBase table where a record is stored.

By default, this attribute is empty, so the name of the HBase table is not stored unless this setting is explicitly set in the indexer config.

Elements within the indexer definition
There are three types of elements that can be used within an indexer configuration: <field>, <extract>, and <param>.

<field>
The field element defines a single field to be indexed in Solr, as well as where its contents are to be taken from and interpreted from HBase. There are typically one or more fields listed in an indexer configuration -- one for each Solr field to be stored.

The field attribute has four attributes, listed below.

name
The name attribute specifies the name of a Solr field in which to store data. A field with a matching name should be defined in the Solr schema.

The name attribute is mandatory.

value
The value attribute specifies the data to be used from HBase for populating the field in Solr. It takes the form of a column family name and qualifier, separated by a colon.

The qualifier portion can end in an asterisk, which is interpreted as a wildcard. In this case, all matching column-family and qualifier expressions will be used.

The following are examples of valid value attributes:

mycolumnfamily:myqualifier
mycolumnfamily:my*
mycolumnfamily:*
source
The source attribute determines what portion of an HBase KeyValue will be used as indexing content.

It has two possible values: value and qualifier.

When value is specified (which is the case by default), then the cell value is used as input for indexing.

When qualifier is specified, then the column qualifier is used as input for indexing.

type
The type attribute defines the datatype of the content in HBase.

Because all data is stored in HBase as byte arrays, but all content in Solr is indexed as text, a method for converting from byte arrays to the actual datatype is needed.

The value of this field can be one of any of the datatypes supported by the HBase Bytes class: int, long, string, boolean, float, double, short, or bigdecimal.

If the Bytes-based representation has not been used for storing data in HBase, the name of a custom class can be specified for this attribute. The custom class must implement the com.ngdata.hbaseindexer.parse.ByteArrayValueMapper interface.

<param>
The <param> element defines a key-value pair that will be supplied to custom classes that implement the com.ngdata.hbaseindexer.Configurable interface.

<param> elements can also be nested in a <field> element.

The element has two attributes: name and value. Both are mandatory.

Example configuration
The example configuration below demonstrates all elements and attributes that can be used to configure an indexer.

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