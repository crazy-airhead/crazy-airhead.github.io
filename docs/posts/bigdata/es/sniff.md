---
date: '2019-04-16T11:38:18'
title: client.transport.sniff配置引起的问题
categories:
  - ElasticSearch
tags:
  - ElasticSearch
---
## 问题
之前基于Docker搭建了ES环境，也能正常使用，这周突然程序能正常启动，但实际发生ES调用时出错，错误如下：
```java
org.elasticsearch.client.transport.NoNodeAvailableException: None of the configured nodes are available: [{#transport#-1}{zYhliWDFSRGpbaB371OV-g}{172.26.0.251}{172.26.0.251:9300}]
	at org.elasticsearch.client.transport.TransportClientNodesService.ensureNodesAreAvailable(TransportClientNodesService.java:349)
	at org.elasticsearch.client.transport.TransportClientNodesService.execute(TransportClientNodesService.java:247)
	at org.elasticsearch.client.transport.TransportProxyClient.execute(TransportProxyClient.java:60)
	at org.elasticsearch.client.transport.TransportClient.doExecute(TransportClient.java:381)
	at org.elasticsearch.client.support.AbstractClient.execute(AbstractClient.java:407)
	at org.elasticsearch.client.support.AbstractClient.execute(AbstractClient.java:396)
	at org.elasticsearch.action.ActionRequestBuilder.execute(ActionRequestBuilder.java:46)
	at org.elasticsearch.action.ActionRequestBuilder.get(ActionRequestBuilder.java:53)
	...
```
现在将问题做下记录，主要是`client.transport.sniff`的使用问题。

## 环境
基于Docker的ES，[官网](https://www.elastic.co/guide/en/elasticsearch/reference/5.1/docker.html#docker-cli-run-prod-mode?tdsourcetag=s_pctim_aiomsg)
```
docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:6.5.4
```
## 客户端
客户端代码基本参照了ES[官网](https://www.elastic.co/guide/en/elasticsearch/client/java-api/current/transport-client.html)。
```java
@Bean(destroyMethod = "close")
public TransportClient client() throws Exception {
	TransportClient client = new PreBuiltTransportClient(settings());

	String clusterNodes = elasticsearchProperties.getClusterNodes();
	Assert.hasText(clusterNodes, "[Assertion failed] clusterNodes settings missing.");

	for (String clusterNode : split(clusterNodes, ElasticsearchProperties.COMMA)) {
		String hostName = substringBeforeLast(clusterNode, ElasticsearchProperties.COLON);
		String port = substringAfterLast(clusterNode, ElasticsearchProperties.COLON);
		Assert.hasText(hostName, "[Assertion failed] missing host name in 'clusterNodes'");
		Assert.hasText(port, "[Assertion failed] missing port in 'clusterNodes'");
		logger.info("adding transport node : " + clusterNode);
		client.addTransportAddress(new TransportAddress(InetAddress.getByName
				(hostName), Integer.valueOf(port)));
	}
	client.connectedNodes();
	return client;
}

private Settings settings() {
	return Settings.builder()
			.put("cluster.name", elasticsearchProperties.getClusterName())
			.put("client.transport.sniff", elasticsearchProperties.getClientTransportSniff())
			.put("client.transport.ignore_cluster_name", elasticsearchProperties
					.getClientIgnoreClusterName())
			.put("client.transport.ping_timeout", elasticsearchProperties
					.getClientPingTimeout())
			.put("client.transport.nodes_sampler_interval", elasticsearchProperties
					.getClientNodesSamplerInterval())
			.build();
}
```
## 问题处理
因为之前可以访问，例常的检查了cluster.name和配置的服务器和端口，一切正常。

经过一些搜索后发现这篇文章，[NoNodeAvailableException](https://discuss.elastic.co/t/transport-client-nonodeavailableexception-none-of-the-configured-nodes-are-available/92000/2)，其中提到了配置了`client.transport.sniff`为`true`。

检查代码，自己默认配置也是`true`。调整`client.transport.sniff`为`false`，一切正常了。

## 分析及处理
`client.transport.sniff`的作用是：使客户端去嗅探整个集群的状态，把集群中其它机器的ip地址加到客户端中。这样做的好处是，一般你不用手动设置集群里所有集群的ip到连接客户端，它会自动帮你添加，并且自动发现新加入集群的机器。

但使用该参数时有个注意事项。当ES服务器监听（publish_address ）使用内网服务器IP，而访问（bound_addresses ）使用外网IP时，不要设置client.transport.sniff为true。不设置client.transport.sniff时，默认为false(关闭客户端去嗅探整个集群的状态)。因为在自动发现时会使用内网IP进行通信，导致无法连接到ES服务器。因此此时需要直接使用addTransportAddress方法把集群中其它机器的ip地址加到客户端中。
然后检查了下Docker的启动日志：
```
[2019-04-16T05:45:56,427][INFO ][o.e.n.Node               ] [ehrCloud] starting ...
[2019-04-16T05:45:56,648][INFO ][o.e.t.TransportService   ] [ehrCloud] publish_address {172.17.0.3:9300}, bound_addresses {0.0.0.0:9300}
[2019-04-16T05:45:56,796][INFO ][o.e.x.s.t.n.SecurityNetty4HttpServerTransport] [ehrCloud] publish_address {172.17.0.3:9200}, bound_addresses {0.0.0.0:9200}
[2019-04-16T05:45:56,797][INFO ][o.e.n.Node               ] [ehrCloud] started
```
之后做了如下尝试，修改配置：
```
network.public_host: 172.26.0.251
```
重新运行程序，此时无论`client.transport.sniff`的配置为何，都可正常使用。

不过为什么之前可以，现在不行这个问题还是不清楚。

## 参考链接
[ES版本问题](https://wenchao.ren/2019/01/org-elasticsearch-client-transport-NoNodeAvailableException-None-of-the-configured-nodes-are-available/)

[elasticsearch中client.transport.sniff的使用方法和注意事项](https://blog.csdn.net/J_bean/article/details/79507559?tdsourcetag=s_pctim_aiomsg)
