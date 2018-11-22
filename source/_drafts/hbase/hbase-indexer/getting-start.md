---
title: getting-start
toc: true
p: hbase/hbase-indexer/getting-start
categories:
tags:
---

Building the binary distribution
Use the following command to build the binary distribution (.tar.gz & rpm):

mvn -DskipTests -Pdist install
Testing
These steps assume a running HBase 0.94.x installation (preferably CDH 4.2), as well as a running Solr installation. For this example, the configured Solr schema will need to have a multi-valued field called "data", as well as a unique key field called "id".

Enable replication and other settings that are outlined in the hbase-sep demo instructions

Unzip the binary distribution (instructions for creating the binary distribution are listed above).

 $ tar zxvf hbase_indexer.tar.gz
Copy the hbase-sep jar files from the lib directory of the binary distribution into the lib directory of HBase.

 $ cd hbase_indexer
 $ sudo cp lib/hbase-sep-* /usr/lib/hbase/lib
Create a table in HBase that has replication enabled. For this example, we'll create a table called "record" with a single column family called 'data'.

 hbase> create 'record', {NAME => 'data', REPLICATION_SCOPE => 1}
Start the hbase-indexer server

 $ ./bin/hbase-indexer server
Create an indexer definition. For this example, we'll just index anything in the data column family into the "data" field in Solr. Save the below contents in a file called 'sample.xml'.

 <?xml version="1.0"?>
 <indexer table="record">
   <field name="data" value="data:*" type="string"/>
 </indexer>
Add the indexer definition to the indexer server. The following command assumes that the Solr ZooKeeper is running on the current host, and the name of the collection to be used for indexing is "core0".

 $ ./bin/hbase-indexer add-indexer  -n sampleindex -c sample.xml --cp solr.collection=core0 
Add some data to the record table in HBase. The data added to the data column family in the record table should show up in the Solr index.

 hbase> put 'record', 'row1', 'data:value', 'Test of HBase Indexer'