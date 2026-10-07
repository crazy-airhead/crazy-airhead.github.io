---
date: '2024-01-18T19:54:02'
title: 使用Gradle 编译 uber/fat JARS
categories:
  - Gradle
tags:
  - Gradle
---

# 说明

使用 Solon 初始化工具的生成的Gradle项目，打包后生成的是的单个 Jar 文件，一开始以为是Fat Jar，但解压包之后，发现里面包含的是classes文件，而不是Jar文件。这不是像Spring Boot一样的Fat Jar，而是一种 Uber Jar 的格式。

## Fat Jar

Fat Jar很好理解，一个 “肥胖的”  Jar，指的是 Jar 包里面包含所有依赖包的 Jar 包。

## Uber Jar

Uber Jar的原单词是Über Jar，是德语单词，但是大多数输入法上德语Ü很难打出来，所以就成了"Uber"，可以解释为 "Over" ，可以理解位为 “完整或全部” 的意思。

Uber Jar指将所有依赖项和自己的代码打包到一个Jar包里面。

和Fat Jar一样，是一个可以执行的Jar，只是包里面的是Classes文件，而不是Jar文件。如果不特别对比的情况下，可以把 Uber Jar 和 Fat Jar 等同对待。

<!-- more -->

# 打包

Solon 生成的代码的`build.gradle`如下:

```groovy
jar {
    manifest {
        attributes "Main-Class": "com.example.demo.App"
    }

    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    from(configurations.runtimeClasspath.collect {
        if (it.isDirectory()) it else zipTree(it)
    }){
        exclude 'META-INF/MANIFEST.MF'
        exclude 'META-INF/*.SF'
        exclude 'META-INF/*.DSA'
        exclude 'META-INF/*.RSA'
    }

    def sourcesMain = sourceSets.main
    sourcesMain.allSource.forEach { println("add from sources: ${it.name}") }
    from(sourcesMain.output)
}
```

单模块项目编译的时候，没有问题，所以一开始也没注意这个编译Uber Jar的方式。

但引入多模块后，全新编译(gradle clean 之后)的时候会提示如下错误：

```
Execution failed for task ':demo:jar'.
> Cannot expand ZIP 'xxx.jar' as it does not exist
```

其中还有一段告警：

```
Task :demo:jar FAILED
Execution optimizations have been disabled for task ':demo:jar' to ensure correctness due to the following reasons:
  - Gradle detected a problem with the following location: 'xxx.jar'. 
Reason: Task ':demo:jar' uses this output of task ':xxx:jar' without declaring an explicit or implicit dependency. 
This can lead to incorrect results being produced, depending on what order the tasks are executed. 
Please refer to https://docs.gradle.org/7.5.1/userguide/validation_problems.html#implicit_dependency for more details about this problem.
```

大意是说打包的时候没有对应的jar，没有显式的申明或者隐式需要的对应的模块的jar命令。

通过提供的参考链接，增加如下配置，可以正常编译。

```groovy
jar {
    manifest {
        attributes "Main-Class": "com.example.demo.App"
    }

    dependsOn(":xxx:jar")

    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    from(configurations.runtimeClasspath.collect {
        if (it.isDirectory()) it else zipTree(it)
    }){
        exclude 'META-INF/MANIFEST.MF'
        exclude 'META-INF/*.SF'
        exclude 'META-INF/*.DSA'
        exclude 'META-INF/*.RSA'
    }

    def sourcesMain = sourceSets.main
    sourcesMain.allSource.forEach { println("add from sources: ${it.name}") }
    from(sourcesMain.output)
}
```

但还是存在疑惑，如果是多个模块，每个模块都这样单独配置么？

继续查找Gradle的官方文档，找到了这个链接[Creating "uber" or "fat" JARs](https://docs.gradle.org/current/userguide/working_with_files.html#sec:creating_uber_jar_example)，里面介绍了这段脚本的具体含义，还解决了我碰到的依赖问题。

于是重新调整编译脚本，并增加注释。

```groovy
jar {
    // 指定主类
    manifest {
        attributes "Main-Class": "com.example.demo.App"
    }

    // 编译依赖文件，确保生成jar文件
    dependsOn(configurations.runtimeClasspath)

    // 文件复制策略，重复时忽略
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    from(configurations.runtimeClasspath.collect {
        // 如果是目录直接复制，如果是jar，通过 zipTree 解压
        if (it.isDirectory()) it else zipTree(it)
    }){
        // 如果存在签名文件，忽略
        exclude 'META-INF/MANIFEST.MF'
        exclude 'META-INF/*.SF'
        exclude 'META-INF/*.DSA'
        exclude 'META-INF/*.RSA'
    }

    // 复制资源文件（删掉了打印资源文件名称的脚本）
    from(sourceSets.main.output)
}
```

# 参考链接

[java - Executable Jar/Uber Jar/Shade Jar/Shadow Jar/Fat Jar 到底是什么东西？](https://segmentfault.com/a/1190000039149043)

[mplicit_dependency](https://docs.gradle.org/7.5.1/userguide/validation_problems.html#implicit_dependency)

[Working With Files](https://docs.gradle.org/current/userguide/working_with_files.html#sec:creating_uber_jar_example)
