---
title: illegal-reflective-access警告
toc: true
p: java/illegal-reflective-access
date: 2018-12-26 11:58:38
categories:
- java
tags:
- java
---
## 问题

升级Java11时，启动Jfinal-club提示如下警告：
```
WARNING: An illegal reflective access operation has occurred
WARNING: Illegal reflective access by net.sf.cglib.core.ReflectUtils$1 (file:/C:/.m2/repository/cglib/cglib-nodep/3.2.5/cglib-nodep-3.2.5.jar) to method java.lang.ClassLoader.defineClass(java.lang.String,byte[],int,int,java.security.ProtectionDomain)
WARNING: Please consider reporting this to the maintainers of net.sf.cglib.core.ReflectUtils$1
WARNING: Use --illegal-access=warn to enable warnings of further illegal reflective access operations
WARNING: All illegal access operations will be denied in a future release
```

## 解决
增加JVM选项--add-opens java.base/java.lang=ALL-UNNAMED

## 参考链接[https://stackoverflow.com/questions/46671472/illegal-reflective-access-by-org-springframework-cglib-core-reflectutils1](https://stackoverflow.com/questions/46671472/illegal-reflective-access-by-org-springframework-cglib-core-reflectutils1)
