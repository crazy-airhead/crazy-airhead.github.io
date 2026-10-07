---
date: '2019-09-30T15:02:13'
title: jdk8-apline需要注意的问题
categories:
  - java
  - docker
tags:
  - java
  - docker
---

## 背景

因为需要部署一台新的测试机，之前知道apline比较小巧，于是选用了java:jdk8-apline的基础镜像。但我们在部署Jfinal项目(采用undertow文件夹方式部署，通过start.sh启动并后台运行)的过程碰到一些问题。小巧注定很多组件需要自己安装。

## 问题

- 编写好Dockerfile后，无法启动容器

  > 1. apline未完装bash，需要安装`apk add bash`
  > 2. start.sh为后台运行，需要改为直接运行，去掉启动命令中的`&`

- 时间为UTC，而不是北京时间

  > 这个问题实际是Docker镜像问题，和apline无关。因为编写Dockerfile时做了处理，所以一并列出。
  >
  > ```bash
  > apk add tzdata
  > cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
  > echo "Asia/shanghai" >> /etc/timezone
  > ```

- 验证码无法使用，提示如下：

  ```bash
  Caused by: java.lang.NullPointerException
  	at sun.awt.FontConfiguration.getVersion(FontConfiguration.java:1264)
  	at sun.awt.FontConfiguration.readFontConfigFile(FontConfiguration.java:219)
  	at sun.awt.FontConfiguration.init(FontConfiguration.java:107)
  ```

  > 网上搜索发现为apline缺少字库导致
  >
  > ```bash
  > apk add font-adobe-100dpi ttf-dejavu fontconfig
  > ```

- 下载源速度慢

  > 使用阿里云镜像加速
  >
  > ```shell
  > echo http://mirrors.aliyun.com/alpine/v3.7/main/ >> /etc/apk/repositories
  > apk update
  > ```

## 镜像

最后的Dockerfile，需要增加的处理如下：

```bash
FROM daocloud.io/library/java:8-jdk-alpine
LABEL maintainer="L4qiang@gmail.com"

RUN echo http://mirrors.aliyun.com/alpine/v3.7/main/ >> /etc/apk/repositories
RUN apk update
RUN apk add bash tzdata font-adobe-100dpi ttf-dejavu fontconfig
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo "Asia/shanghai" >> /etc/timezone

...
```



