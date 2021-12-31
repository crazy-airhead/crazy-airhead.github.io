---
title: 使用Gradle生成BOM管理依赖
toc: true
date: 2021-05-15 13:12:08
categories:
- Gradle
tags:
- Gradle
---

## 什么BOM

BOM (The Bill of Materials in Maven) 是Maven中的概念，是一个 pom.xml 文件，主要用来管理项目的依赖版本、插件等构建配置信息。其它项目可以在使用 BOM 时，无需定义已在 BOM 中定义依赖的版本号，即可获取版本号，可理解为统一依赖版本的用途。

<!-- more -->

## Gradle

Gradle被认为是更好的Maven替代，但在BOM的支持上不是太友好，管理多模块项目就会使用难度。我自己就在这个多模块管理被耽误的。实际上，Gradle 6开始可以通过[java-platform](https://docs.gradle.org/current/userguide/java_platform_plugin.html)插件定义和发布BOM文件。这样完全可以只通过Gradle就靠可以管理多模块项目。

## 要点说明

以下的操作都是在项目的`build.gradle`进行。

### 引入插件

```groovy
plugins {
    id 'java-platform'
}
```

**注意** java-platform不能与java插件一起使用。

### 申明api或runtime约束

```groovy
dependencies {
    constraints {
        api 'commons-httpclient:commons-httpclient:3.1'
        runtime 'org.postgresql:postgresql:42.2.5'
    }
}
```

###将约束转为依赖

默认情况下，constraions只是申明了版本关系，并不是依赖关系，如果需要引入为依赖关系，需要做如下的指定：

 ```
 javaPlatform {
     allowDependencies()
 }
 ```

### 使用第三方BOM

```
dependencies {
    api platform('com.fasterxml.jackson:jackson-bom:2.9.8')
}
```



### 发布

```
publishing {
    publications {
        myPlatform(MavenPublication) {
            from components.javaPlatform
        }
    }
}
```



### 引入BOM

在其他项目中通过`api flatform`的方式引入BOM，具体引入某个依赖包时就可以不指定版本号。

```
dependencies {
    // get recommended versions from the platform project
    api platform(project(':platform'))
    // no version required
    api 'commons-httpclient:commons-httpclient'
}
```

------

欢迎联系我

微信号 ：Crazy_Airhead

Mixin ID :  1091586

定投课堂邀请码：6DYMBFP061

李笑来写作课邀请码：38MDGFYZK8

水龙头邀请码：FDJQHJ

