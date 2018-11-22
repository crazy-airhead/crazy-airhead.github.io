---
title: metrics
toc: true
p: hbase/hbase-indexer/metrics
categories:
tags:
---
The HBase Indexer publishes a number of metrics for each of its indexer processes. These metrics can be useful for getting an idea of how much data is being indexed, keeping track of the health of indexing processes, and troubleshooting problems.

By default, all metrics are published via JMX. The indexer can also be configured to publish metrics to Ganglia (see below).

Besides these metrics, you can monitor the replication status using the SEP tools.

Overview of available metrics
HBase to Solr mapping
Each indexer has a metric under hbaseindexer/DefaultResultToSolrMapper/<indexer_name>/HBase Result to Solr Mapping time.

This metric lists information about the amount of time taken (in milliseconds) for converting an HBase update event into a Solr document, as well as a rate (in documents/second) for the general throughput of the process.

Incoming and applicable Events
Under hbaseindexer/(Row|Column)BasedIndexer/<indexer_name>, there are a pair of metrics about incoming events and applicable events. These metrics list the rate of incoming HBase update events, as well as the rate of incoming HBase events that are considered applicable for indexing.

Solr writing
Under hbaseindexer/SolrWriter/<indexer_name>, there are a number of metrics around the rate of adds and delete to Solr.

There are also metrics about "document add/delete errors" and "Solr add/delete errors". Document-based errors are errors that have occurred where the problem has been determined to be in the Solr document itself. Solr-based errors are errors that have occurred within Solr.

Ganglia
Reporting of metrics to Ganglia can be configured in the hbase-indexer-site.xml file (in the conf directory).

In order to configure reporting in Ganglia, the following three configuration keys must be supplied:

hbaseindexer.metrics.ganglia.server - Ganglia server to report to
hbaseindexer.metrics.ganglia.port - port on the Ganglia server
hbaseindexer.metrics.ganglia.interval - interval for reporting, in seconds
An example Ganglia reporting configuration would look like this

<property>
  <name>hbaseindexer.metrics.ganglia.server</name>
  <value>mygangliaserver</value>
</property>
<property>
  <name>hbaseindexer.metrics.ganglia.port</name>
  <value>8649</value>
<property>
<property>
  <name>hbaseindexer.metrics.ganglia.interval</name>
  <value>60</value>
</property>