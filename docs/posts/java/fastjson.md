---
date: '2019-06-13T09:37:29'
title: FastJson使用整理
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
