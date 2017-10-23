---
title: [Camel]第2章 快速入门
date: 2017-08-08 20:04:24
tags:
---

## 快速入门
通过阅读本章的一些简单的例子，你可以快速的开始使用Apache Camel。对于想全面了解的读者来说，可以跳到时第3章。

## 从例子开始
通过源码我们来看一个例子。
Camel可以用Spring，或者直接用Java来配置。本例就是用Java的。
这个例子在Camel的发布包的`examples\camel\example-jms-file`目录下可以找到。
首来我们来创建一个CamelContex，这个CamelContext可以装载组件和路由等。
```java
CamelContext context= new DefaultCamelContext();
```
有很多中方式将组件添加到CamelContext中。你可以在设置路由隐式的添加组件，就像我们这里添加FileCompnent一样：
```java
context.addRoutes(new RouteBuilder()) {
    public void configure() {
        from("test-jms:queue:test.queue").to("file://test");
    }
});
```
也可就显示的添加，就像们这里添加JMS Component一样：
```java
ConnectionFactroy connectionFactory = new ActiveMQConnectionFactory("vm://localhost?broker.persistent=false");
// Note we can explicit name the component
context.addComponent("test-jms", JmsComponent.jmsComponentAutoAcknowledge(connectionFactory));
```
上面的代码对所有的JMS提供者都是可用的。如果我们知道我们使用的是ActiveMQ，我们可以使用`activeMQComponent`方法来指定服务地址，连接到ActiveMQ。
```java
camelContext.addComponent("activemq", activeMQComponent("vm://localhost?broker.persistent=false"));
```
通常情况下，一个外部系统会通过Camel的一个组件来触发消息或者事件到Camel中，但是我们要用`ProducerTemplate`这种非简单的方式来测试我们的配置：
```java
ProducerTemplate template = context.createProducerTemplate();
```
接下来你必须启动Camel Context。如果你使用Spring的配置方式，Camel Context已经自动启动了。但是如果你使用纯Java的方式，你也只需要调用下start()方法。
```java
camleContext.start();
```
这会启动所有已经配置好的流程。
所以当CamelContext启动以后，我们就可以触发对象到Camel中了：
```java
for(int i = 0; i < 10; i++) {
    template.sendBody("test-jms:queue:test.queue", "Test Message: " + i);
}
```
## 发生了什么？
我们使用生产者模板来发送对象（这里是文本）到CamelContext中，到组件test-jms:queue:test.queue.这些文本对象会被自动转换为JMS的消息并推送到test.queue的消息列中。当我们设置一个路由时，我们指定文件组件来监听test.queue.