---
title: List.addAll抛出UnsupportedOperationException
toc: true
p: java/list
date: 2018-12-24 16:01:22
categories:
- java
- list
tags:
---
- java
- list

## 问题
```java
String to = "1;2;3";
String cc = "1;2;3";
String[] toSplit = to.split(";");
List<String> list = Arrays.asList(toSplit);
String[] ccSplit = cc.split(";");
List<String> temp = Arrays.asList(ccSplit);
list.addAll(temp);
```
## 原因
List.addAll的文档中说，如果列表不支持时，抛出UnsupportedOperationException。

Arrays.asList返回的是一个定长的列表，不能往这个列表添加数据。
## 解决
```java
List<String> list = new ArrayList<>(Arrays.asList(toSplit));
```

## 参考链接[https://stackoverflow.com/questions/25624251/list-addall-throwing-unsupportedoperationexception-when-trying-to-add-another-li](https://stackoverflow.com/questions/25624251/list-addall-throwing-unsupportedoperationexception-when-trying-to-add-another-li)