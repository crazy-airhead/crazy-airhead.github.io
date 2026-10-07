---
date: '2019-04-23T14:37:37'
title: Spring boot无法启动
categories:
  - Spring Boot
---
今天启动Spring boot的一个项目时，提示“Process finished with exit code 1”，项目无法启动。
初步分析可能是没有配置环境变了，检查了下是有的，加了debug=true，也没出提示日志。

于是上网查了下，确实说的是环境变量`spring.profiles.active`没在配置，重新检查配置时发现，之前的环境变量居然是`spring.active.profiles`。因为换电脑，没有在这台机器运行不同环境，没有发现错误。

提醒下自己，检查配置内容还是要认真些。

## 参考
[解决 Spring boot 启动报 Process finished with exit code 1 问题](https://www.xttblog.com/?p=2992)
