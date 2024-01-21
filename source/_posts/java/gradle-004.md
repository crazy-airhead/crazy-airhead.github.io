---
title: Gradle 实现类 Maven 的 profile功能
toc: true
date: 2024-01-21 11:22:32
categories:
- 
tags:
---

# 说明

使用 Maven 时可以通过配置 Profile，进行不同环境变量的编辑，同时可以在资源配置文件中通过@@的方式profile定义的变量。
在查看 Solon 的开发文档时发现 Gradle 使用属性参数也能支持类似 Profile 的扩展。于是做了验证，并记录其中碰到的问题。

<!-- more -->

# Gradle 属性参数

Gradle 的参数配置是通过命令行参数和 `gradle.properties` 来决定的。如果一个参数的优先级如下：

1. 命令行中通过 `-P`或 `--project-prop` 配置的变量参数

2. 项目根目录`gradle.properties`中的属性

3. Gradle 用户目录（GRADLE_USER_HOME）中的 `gradle.properties`中的属性

4. Gradle 安装目录中`gradle.properties`中的属性

# 基础配置

首先项目根目录定义`gradle.properties`文件，增加属性， 如 `profileEnv`。

```properties
profileEnv = dev
```

修改`build.gradle`， 

```groovy
// 此处测试，只是简单打印，如果有更多需求，可以结合自己的情况
println("profileEnv:${profileEnv}")
```

执行不同的gradle命令，可以看到命令行窗口输出不同。

```bash
# 使用默认配置
gradle build

# 指定配置
gradle build -PprofileEnv=prod
```

# 配置使用 Gradle 属性

Gradle 默认支持对资源文件的属性扩展机制，但和 Maven 的 profile功能不是完全一致。只需要修改`build.gradle`，增加如下配置即可。

```groovy
processResources {
    expand(project.properties)
}
```

此时在配置文件中就可以通过`${...}`的方式替换 gradle 属性了。但默认的方式存在以下的问题：

- 属性不支持点（.），Gradle是把点当作对象属性分隔符的。

- 会过滤所有的资源文件，而不是特定的文件。

- 使用`${...}`的方式，会和 Solon 默认配置文件的配置的占位符冲突，如果配置中占位符，可能导致编译失败。

# 调整

保留使用`@...@`的占位符，调整`build.gradle`，并只处理app.yml文件。

```groovy
import org.apache.tools.ant.filters.ReplaceTokens
processResources {
    filesMatching('app.yml') {
        def tokens = [:]
        project.properties.each { key, value ->
            if (value != null) {
                tokens[key] = value.toString()
            }
        }

        filter(ReplaceTokens, tokens: tokens)
    }
}
```

修改配置文件，`app.yml`

```yml
server.port: 8080

solon:
  env: @profileEnv@
  app:
    name: 'demo-app'
    group: 'demo'
    file: app-${solon.env}.ym
```



使用`gradle build`编译，可以看到编译的生成文件的resources目录中的yml文件，已经是具体的Gradle 属性，而不是占位符。

```yml
server.port: 8080

solon:
  env: dev
  app:
    name: 'demo-app'
    group: 'demo'
    file: app-${solon.env}.yml
```

# 参考链接

[Automatic Property Expansion with Spring Boot](https://www.baeldung.com/spring-boot-auto-property-expansion)


