---
title: tutorial
toc: true
p: hbase/hbase-indexer/getting-start-tutorial
categories:
tags:
---
This page explains how to start doing basic indexing in HBase. Before following this tutorial, make sure that the HBase Indexer and other required software is installed and running as explained in the installation instructions.

At this point, HBase and Solr (in cloud mode) should be running, and the HBase Indexer should be unpacked in a directory (which we'll call $INDEXER_HOME). For this tutorial, it is assumed that the default example index schema is being used by Solr (as explained on the installation page).

Start the HBase Indexer daemon
In a terminal, execute the following (assuming $INDEXER_HOME points to the directory where the hbase-indexer tar.gz distribution was unpacked).

cd $INDEXER_HOME
./bin/hbase-indexer server
Create a table to be indexed in HBase
In the HBase shell, create a table. For this tutorial, we'll create a table named "indexdemo-user", with a single column family named "info". Note that the REPLICATION_SCOPE of the column family of the table must be set to 1.

$ hbase shell
hbase> create 'indexdemo-user', { NAME => 'info', REPLICATION_SCOPE => '1' }
Add an indexer
Now we'll create an indexer that will index the the indexdemo-user table as its contents are updated.

In your favourite text editor, create a new xml file called indexdemo-indexer.xml, with the following content:

<?xml version="1.0"?>
<indexer table="indexdemo-user">
  <field name="firstname_s" value="info:firstname"/>
  <field name="lastname_s" value="info:lastname"/>
  <field name="age_i" value="info:age" type="int"/>
</indexer>
The above file defines three pieces of information that will be used for indexing, how to interpret them, and how they will be stored in Solr.

Next, create an indexer based on the created indexer xml file.

./bin/hbase-indexer add-indexer -n myindexer -c indexdemo-indexer.xml \
        -cp solr.zk=localhost:2181/solr -cp solr.collection=collection1
Note that the above command assumes that ZooKeeper is running on localhost on port 2181, and that there is a Solr Core called "collection1" configured. If you are doing this tutorial on an existing HBase/Solr environment, you may need to use different settings.

Update the table content
In the HBase shell, try adding some data to the indexdemo-user table

hbase> put 'indexdemo-user', 'row1', 'info:firstname', 'John'
hbase> put 'indexdemo-user', 'row1', 'info:lastname', 'Smith'
After adding this data, take a look in Solr (i.e. http://localhost:8983/solr/#/collection1/query). You should see a single document in Solr that has the firstname_s field set to "John", and the lastname_s field set to "Smith".

Note If you don't have autoCommit enabled in Solr, you won't be able to see the updated contents immediately in Solr. The demo environment has autoCommit enabled for a commit every second.

Now try updating the data you've just added

hbase> put 'indexdemo-user', 'row1', 'info:firstname', 'Jim'
And now check the content in Solr. The document's firstname_s field now contains the string "Jim".

Finally, delete the row from HBase.

hbase> deleteall 'indexdemo-user', 'row1'
You can now verify that the data has been deleted from Solr.