---
title: 一次Jfinal使用ehcache的错误记录
toc: true
p: java/ehcache
date: 2020-03-07 11:11:38
categories:
- jfinal
- ehcache
tags:
- jfinal
- ehcache
---

## 问题

Jfinal已经集成了EhCache缓存，只要简单配置就可以使用EhCache。最近的一个字典表数据量比较大，于是开启了EhCache，页面加载速度明显变快。昨日服务突然无法正常启动，错误如下（非法完整错误日志）：

```bash
net.sf.ehcache.CacheException: java.io.InvalidClassException: com.xxx.model.Concept; local class incompatible: stream classdesc serialVersionUID = -1234, local class serialVersionUID = -5678
```

看提示我们知道是serialVersionUID版本引起的问题。我们知道ehcache就会进行存盘的，如果保存的对象版本不一致就有可能出现这个问题，此时回忆起对`Concept`所在的表做了修改和重新生成。

## 解决

问题基本清晰了，那解决方法其实是相对简单的，把缓存的文件删除就可以了。

具体做法是这样的，找到`ehcache.xml`配置文件的的存盘位置，这里我用了`java.io.tmpdir`，不同操作系统类型此路径可能不一致，可以在程序中打印出来看下， 我这里是`/var/folders/d0/..`。

```java
System.out.println(System.getProperty("java.io.tmpdir"));
```

删除临时文件，需要根据自己的实际路径进行删除。

```bash
cd /var/folders
rm -rf d0
```

重新启动服务，正常启动。

### 更好的方式
因为系统是可以正常使用的，可以编写个清理的接口，这样可以在数据结构调整时及时清理缓存。
