---
date: '2019-09-30T15:33:22'
title: 替换jar包类实现
categories:
  - java
  - jfinal
tags:
  - java
  - jfinal
---
# 背景
因为开发中使用到了jfinal-weixin，但jfinal-weixin对多公众号（或者小程序）的支持还不是太好，需要自己增加一些处理来更好的使用。如果你使用Java有些时日了，一定会想到重写jar包的类方法。
# 步骤
1. 确定需要重写类的包路径
2. 在项目的src目录下创建同名包
3. 将需要重写的类拷贝到刚创建的目录，有源码使用源码，无源码可采用反编译的代码(IDEA一般会帮你反编译)
4. 重写或者增加自己需要的方法

# 问题及处理

当你一套组合拳打完，准备部署收工的时候，却报错了。

```bash
java.lang.NoSuchMethodError:com....
```

教科书里总是骗人的。这个时候你需要看看下面的文档。

https://docs.oracle.com/javase/7/docs/technotes/tools/windows/java.html

https://docs.oracle.com/javase/8/docs/technotes/tools/windows/classpath.html

只是自己读书不够多而已，此时可能过指定-cp的方式来确定加载顺序。

 
