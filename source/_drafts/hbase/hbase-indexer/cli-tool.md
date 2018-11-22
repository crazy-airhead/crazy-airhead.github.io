---
title: cli-tool
toc: true
p: hbase/hbase-indexer/cli-tool
categories:
tags:
---
The HBase Indexer includes a number of command line tools for adding, updating, listing, and deleting indexers. All of these tools are executed by supplying a command name to the hbase-indexer tool. For example, to use the list-indexers command, you would enter the following:

./bin/hbase-indexer list-indexers
Running any of the commands below with the --help parameter will show a listing of possible command parameters.

add-indexer
The "add-indexer" command is used for configuring a new indexer.

When adding an indexer, you need to supply at least the following:

the name of the indexer
the indexer's definition (in the form of an xml file)
connection information to the ZooKeeper used by Solr
In order to add a basic indexer named "myindexer" whose definition is saved in a file called myindexer.xml, with ZooKeeper running on a server named myzkhost:2181/solr and a Solr collection named mycollection, you would execute the following:

./bin/hbase-indexer add-indexer \
                      --name myindexer \
                      --indexer-conf myindexer.xml \
                      --cp solr.zk=myzkhost:2181/solr \
                      --cp solr.collection=mycollection
update-indexer
The update-indexer command is used for updating the definition or the state of an indexer.

This command is most typically used for updating the definition of an indexer -- for example, changing the list of fields to be indexed.

The parameters to the update-indexer tool are generally the same as those for the add-indexer tool, but none of them are mandatory except for the name field.

To update the definition of the indexer that was created in the example for add-indexer, you would run the following:

./bin/hbase-indexer update-indexer --name myindexer --indexer-conf myupdatedindexer.xml
Any parameters (other than the name parameter) that you supply to the update-indexer command will overwrite existing parameters for the indexer.

list-indexers
The list-indexer command lists all currently configured indexers, including various status information about them.

This command can be run without any additional parameters.

delete-indexer
The delete-indexer command removes an indexer and stops all indexing processes for that indexer.

The --name parameter is mandatory for this command.