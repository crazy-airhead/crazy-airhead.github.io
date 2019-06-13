---
title: FastJson使用整理
toc: true
p: /java/fastjson
date: 2019-06-13 09:37:29
categories:
- java
- fastjson
tags:
- java
- fastjson
---
- 将对象序列化为String时出现`$ref`对象。
可能通过禁用，DisableCircularReferenceDetect来解决。
```
JSON.toJSONString(object, SerializerFeature.DisableCircularReferenceDetect)
```
