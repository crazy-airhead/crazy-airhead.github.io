---
title: Kotlin开发SpringBoot的应用
toc: true
p: kotlin/spring-boot
date: 2019-01-05 21:09:27
categories:
- SpringBoot
- kotlin
tags:
---
- SpringBoot
- kotlin

# Kotlin简介
Kotlin是JetBrains公司开发的静态编程语言，它运行在JVM之上，它是面向对象的语言但吸收了很多函数式编程的特性。以下是一些它比较有趣的特性：
- Kotlin是一种静态类型语言，但因为它的类型推断，能有动态语言的编程体验，同时性能也和纯Java一样。
- 支持属性
- 相对轻量型的标准库
- 易学，Java开发者可以快速理解这门语言
- 支持Java互操作，100%兼容Java
- 对Android开发友好
- 内置不变性和空安全支持
- 代码易读，编码高效
- 拓展类库不需要继承或者装饰模式
- 不需要分号（;）

# 创建项目
使用IDEA的安装向导创建应用，File>New>Project, 然后选择Spring Initializr。接着按向导进行设置如下参数：
- Package name: "blog"
- Artifact: "blog"
- Type: Gradle Project
- Language: Kotlin
- Name: "Blog"
- Dependencies: "Web", "Mustache", JPA" and "H2"
# 项目结构
## Gradle构建
### 插件
`build.gradle`

```Groovy
buildscript {
  ext {
    kotlinVersion = '1.2.41'
    springBootVersion = '2.0.2.RELEASE'
  }
  repositories {
    mavenCentral()
  }
  dependencies {
    classpath("org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${kotlinVersion}")
    classpath("org.jetbrains.kotlin:kotlin-allopen:${kotlinVersion}")
  }
}

apply plugin: 'kotlin'
apply plugin: 'kotlin-spring'
apply plugin: 'org.springframework.boot'
apply plugin: 'io.spring.dependency-management'
```

### 编译选项
`build.gradle`
```Groovy
sourceCompatibility = 1.8
compileKotlin {
  kotlinOptions {
    freeCompilerArgs = ["-Xjsr305=strict"]
    jvmTarget = "1.8"
  }
}
compileTestKotlin {
  kotlinOptions {
    freeCompilerArgs = ["-Xjsr305=strict"]
    jvmTarget = "1.8"
  }
}
```

### 依赖
`build.gradle`
```Groovy
dependencies {
  compile('org.springframework.boot:spring-boot-starter-data-jpa')
  compile('org.springframework.boot:spring-boot-starter-web')
  compile('org.springframework.boot:spring-boot-starter-mustache')
  compile('com.fasterxml.jackson.module:jackson-module-kotlin')
  compile("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
  compile("org.jetbrains.kotlin:kotlin-reflect")
  testCompile('org.springframework.boot:spring-boot-starter-test')
}
```

### 应用
`src/main/kotlin/blog/BlogApplication.kt`
```Kotlin
package blog

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BlogApplication

fun main(args: Array<String>) {
  runApplication<BlogApplication>(*args)
}
```

`src/main/kotlin/blog/BlogApplication.kt`
```Kotlin
fun main(args: Array<String>) {
  runApplication<BlogApplication>(*args) {
    setBannerMode(Banner.Mode.OFF)
  }
}
```
## 创建Controller
`src/main/kotlin/blog/HtmlController.kt`
```Kotlin
package blog

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.ui.set
import org.springframework.web.bind.annotation.GetMapping

@Controller
class HtmlController {

  @GetMapping("/")
  fun blog(model: Model): String {
    model["title"] = "Blog"
    return "blog"
  }

}
```
## 创建模板
使用Mustache templates.
`src/main/resources/templates/header.mustache`
```html
<html>
<head>
  <title>{{title}}</title>
</head>
<body>
```
`src/main/resources/templates/footer.mustache`
```html
</body>
</html>
```
`src/main/resources/templates/blog.mustache`
```html
{{> header}}

<h1>{{title}}</h1>

{{> footer}}
```
通过运行`BlogApplication.kt`的main函数启动应用, 打开http://localhost:8080/, 我们就可以看到标题"Blog"。

# 小结
本文主要内容来自Spring官网案例，可能过参考链接查看详细内容。通过IDEA简单的配置和简单的Kotlin代码编写，我们就可构建一个基于SpringBoot的样例，能过这个样例是否对Kotlin感兴趣了呢，可以扫码订阅《快速上手Kotlin开发》。

# 参考链接
[https://spring.io/blog/2016/02/15/developing-spring-boot-applications-with-kotlin](https://spring.io/blog/2016/02/15/developing-spring-boot-applications-with-kotlin)
[https://spring.io/guides/tutorials/spring-boot-kotlin/](https://spring.io/guides/tutorials/spring-boot-kotlin/)
[tut-spring-boot-kotlin](https://github.com/spring-guides/tut-spring-boot-kotlin.git)


