---
title: 如何开始使用Gradle
toc: true
date: 2021-05-15 13:07:27
categories:
- Gradle
tags:
- Gradle
---

## 如何安装Gradle

如果安装了IDEA，正确不需要安装，因为项目一般通过gradle wrapper的方式自动下载。但为了更方便的使用gradle命令行，就建议安装了，比如需要转换Maven项目时。

[Gradle安装官网教程](https://gradle.org/install/)

<!-- more -->

## 如何创建Gradle项目

使用IDEA，File->New->Project...，选择Gradle创建项目即可。

可以看到与Gradle相关的文件有

```tex
/

|--gradle

|  |--wrapper

|  |  |--gradle-wrapper.jar

|  |  |--gradle-wrapper.properties

|--build.gradle

|--gradle.properties

|--gradlew

|--gradlew.bat

|--settings.gradle
```

其中build.gradle文件最为重要。

## 如何转换Maven项目为Gradle项目

在项目根目录，运行如下命令，按提示进行转换即可。

```
gradle init
```

转换后如果有提示错误，可根据相关提示进行修改。

## 如何配置仓库

在build.grale中增加，仓库地址，此处以阿里云为例

```
repositories {

    maven {

        url 'https://maven.aliyun.com/repository/public/'

    }

    mavenLocal()

    mavenCentral()

}
```

## 如何配置插件仓库

在settings.gradle中增加，插件仓库地址，此处以阿里云为例

```
pluginManagement {

    repositories {

        maven {

            url "https://maven.aliyun.com/repository/gradle-plugin"

        }

    }

}
```

## 如何将模块上传到私服

引入maven-publish插件，并定义发布配置

```
publishing {

    publications {

        maven(MavenPublication) {

            //指定group/artifact/version信息，可以不填。默认使用项目group/name/version作为groupId/artifactId/version

            //如果是war包填写components.web，如果是jar包填写components.java

            from components.java

//            //配置上传源码

//            artifact sourceJar {

//                classifier "sources"

//            }

        }

    }

    repositories {

        maven {

            //指定要上传的maven私服仓库

            url = "http://ip:port/repository/releases/"

            //认证用户和密码

            credentials {

                username 'username'

                password 'password'

            }

        }

    }

}
```

## 如何引用本地jar文件

与build.grdle同级目录创建libs文件夹，将本地jar放到该目录下，libs文件夹名可根据实际情况进行调整。

```
dependencies {

    implementation fileTree(include: ['*.jar'], dir: 'libs')

}
```

## 如何生成BOM管理依赖

使用java-platform插件进行依赖的管理

[使用Gradle生成BOM管理依赖](https://ytq6nfyc5n.feishu.cn/docs/doccnVAamaPCJ5BjSY4fXT4z7me)

## 如何忽略测试

```
gradle build -x test
```

## 如何清理缓存

gradle的默认位置为${user.home}/.gradle，依赖的缓存位置为${user.home}/.gradle/caches/modules-2/files-2.1，找到对应的依赖包删除即可。

## 如何强制更新缓存

```
gradle build --refresh-dependencies
```

## 如何处理IDEA编译时在Configurate projects卡住问题

通常情况下为相关的依赖无法下载的问题，检查配置的参考是否正确，尤其注意仓库地址的配置。

## 如果打包成可执行Jar

使用applcation插件，之后可以看到`distribution`的任务组，可以选择不同的任务。

```
plugins {

    id 'java'

    id 'application'

}



application {

    mainClass = 'com.digi.QuickSqlClient'

}
```

![img](https://ytq6nfyc5n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjZiYzE3YjdkZDA2NWI0MGVjZTg1ZTY4Mzg3MjNiZGZfNVdQbWRNRFVNMmVwQTlidURtdjBJN1pwNFVRaFRlbHNfVG9rZW46Ym94Y25Sb3dvSTJBdUVQSkIza09MakdWY3hiXzE2MjEwNTUzMDM6MTYyMTA1ODkwM19WNA)

参考链接[The Application Plugin (gradle.org)](https://docs.gradle.org/current/userguide/application_plugin.html)

## 如何打包成Fat jar

Spring项目默认就是FatJar了。

[Creating a Fat Jar in Gradle | Baeldung](https://www.baeldung.com/gradle-fat-jar)

## 参考链接

[Gradle - Convert Maven Project to Gradle Project](https://howtodoinjava.com/gradle/convert-maven-project-to-gradle-project/)

[手把手，一步步教你将Maven项目迁移到Gradle](https://zhuanlan.zhihu.com/p/185013144)

[Gradle依赖缓存的清除](https://www.jianshu.com/p/c7f94a1e3fbd)

[Gradle全局配置国内镜像](https://blog.csdn.net/u013066244/article/details/113444036)

------

欢迎联系我

微信号 ：Crazy_Airhead

Mixin ID :  1091586

定投课堂邀请码：6DYMBFP061

李笑来写作课邀请码：38MDGFYZK8

水龙头邀请码：FDJQHJ