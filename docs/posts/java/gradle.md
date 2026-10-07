---
date: '2020-07-17T17:11:17'
title: Maven项目升级为Gradle项目
categories:
  - Gradle
tags:
  - Gradle
---
## 说明
Maven用得好好的，为什么要换Gradle呢？因为Maven不够灵活，就如Ant过于复杂一样。随着持续集成与交付的流行，构建脚步的能力会变得越来越重要，而Maven的在这方面做得比较薄弱。而我们团队呢，一方面也在积极准备推进持续集成，另一方面也为保持团队内开发工具的一致（部分线上项目已经采用了Gradle了），减少学习成本。其实呢，早在 2012 年，ThoughtWorks技术雷达就将Maven放到了暂缓（HOLD）里面，也就是说，能不用就不用。在看看SpringBoot在2.3.0之后也改用Gradle编译了，而且还提到编译速度提升了。何乐而不为呢？
<!-- more -->

## 开发环境
- IntelliJ IDEA Community Edition 2020.1.3
- JDK：1.8
- SpringBoot： 2.3.1.RELEASE
## 转换
其实转换的过程是非常简单的：一条命令搞定，之后使用IDEA打开build.gradle打开就可以了。
```shell
gradle init --type pom
```
但是，我们打开项目之后发现，Maven的parent pom，没有起作用，各个功能模块的版本是独立管理的。

## 解决
基于SpringBoot开发，有什么不懂就看SpringBoot他是如何做的就好。我们发现其实SpringBoot提供了`io.spring.dependency-management`插件，让我们可以像在Maven中的方式统一管理第三方包。官网说明在[这里](https://docs.spring.io/dependency-management-plugin/docs/current-SNAPSHOT/reference/html/)。

主要的思路是
- 维护统一的parent pom，依然使用maven管理。
- 使用subprojects及mavenBom的方式引入依赖包。
- 子项目就不需要编写增加版本号了。
以下为部分Gradle代码
### 父级build.gradle的配置
```groovy
buildscript {
#变量定义
    ext {
        springBootVersion = '2.3.1.RELEASE'
        dependencyVersion = '1.0.9.RELEASE'
        tangoParentBomVersion = '1.0.1'
    }

#插件库
    repositories {
        gradlePluginPortal()
    }

#引入插件
    dependencies {
        classpath "io.spring.gradle:dependency-management-plugin:$dependencyVersion"
        classpath "org.springframework.boot:spring-boot-gradle-plugin:$springBootVersion"
    }
}
# 子项目需要的配置
subprojects {
#子项目引用插件
    apply plugin: 'java'
    apply plugin: 'maven-publish'
    apply plugin: 'io.spring.dependency-management'
#子项目仓库指定
    repositories {
        mavenLocal()
        maven {
            url = 'https://maven.aliyun.com/repository/public/'
        }
        maven {
            url = 'http://repo.maven.apache.org/maven2'
        }
    }
#我们生成的自定义 maven-bom
    dependencyManagement {
        imports {
            mavenBom "com.tango:parent-starter-bom:$tangoParentBomVersion"
        }
    }
}
```
### 子项目build.gradle的配置
```groovy
dependencies {
    compile 'org.springframework.boot:spring-boot-starter-web'
    compile 'org.springframework.boot:spring-boot-starter-actuator'
    compile 'org.springframework.boot:spring-boot-starter-aop'
    compile 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    compile 'org.apache.commons:commons-lang3'
    compile 'org.springframework.boot:spring-boot-starter-validation'
    testCompile 'org.springframework.boot:spring-boot-starter-test'
    testCompile 'junit:junit'
}
description = 'service-api'
```

## 注意事项
### Gradle发布本地Maven仓库
如果是多模块项目，且使用了自定义的setting.xml是需要注意。
Gradle读取setting文件的顺序是：USER_HOME/.m2 >M2_HOME/config > USER_HOME/.m2/repository。
也就是说`USER_HOME/.m2`目录下最好放上你自定义的setting.xml。

### SpringBoot项目打包
SpringBoot项目需要使用`org.springframework.boot`插件进行打包，否则可能找不到主类。
```groovy
jar.enabled = true
apply plugin: 'org.springframework.boot'
```

## 总结
在Gradle统一管理方面，网上一般使用settings.gradle的方式，对于我们来说不够合理，当前Spring的方式不仅减少了转换成本，还比较优雅。

## 参考链接
[【采坑记录】maven项目转gradle](https://www.jianshu.com/p/cecc1e8da33b)

[【采坑记录】gradle publishToMavenLocal 打包到本地仓库问题](https://www.jianshu.com/p/031f858f08bb)
