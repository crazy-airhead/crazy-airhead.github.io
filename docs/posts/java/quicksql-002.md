---
date: '2021-05-15T13:34:24'
title: Windows编译QuickSQL问题记录
categories:
  - Java
  - QuickSQL
tags:
  - Java
  - QuickSQL
---

## 环境

Windows 10

IDEA Comunity 2021.1

JAVA 1.8.0_281

<!-- more -->

## 问题及处理

1. 编译时无法下载依赖

> 配置阿里云仓库，需要在Maven的settgins.xml中指定

```
<mirrors>

    <mirror>

        <id>aliyunmaven</id>

        <mirrorOf>*</mirrorOf>

        <name>阿里云公共仓库</name>

        <url>https://maven.aliyun.com/repository/public</url>

    </mirror>

</mirrors>
```

打开QuickSQL项目，直接编译即可。

```
mvn -DskipTests clean package
```

1. 配置Spark和Hadoop环境

> QuickSQL对要求的Spark版本是2.3+，我这里使用了2.4.7版本，

> https://www.apache.org/dyn/closer.lua/spark/spark-2.4.7/spark-2.4.7-bin-hadoop2.7.tgz

> 同时依赖的hadoop版本2.7，我选择的是为hadoop2.7.5

> http://archive.apache.org/dist/hadoop/core/hadoop-2.7.5/hadoop-2.7.5.tar.gz

> 整体的配置过程参考《[解决报错：Failed to locate the winutils binary in the hadoop binary path](https://blog.csdn.net/sugar_HIT/article/details/102807103)》

1. 运行CsvScanExample报错，主要提示

```
Error while running command to get file permissions : ExitCodeException exitCode=-1073741515
```

> winutils.exe需要VS2010的dll依赖，需要安装[VCRedist_x64.exe](https://download.microsoft.com/download/3/2/2/3224B87F-CFA0-4E70-BDA3-3DE650EFEBA5/vcredist_x64.exe)。

> 参考链接

> [hadoop - java.lang.RuntimeException: Error while running command to get file permissions : ExitCodeException exitCode=-1073741515 - Stack Overflow](https://stackoverflow.com/questions/53341528/java-lang-runtimeexception-error-while-running-command-to-get-file-permissions)

> 但文章给出的链接以及失效，从如下链接找到可以的地址，

> [Visual C++ 2010 Runtime Redistributable Package (x86, x64, ia64) Free Download](https://www.mydigitallife.net/visual-c-2010-runtime-redistributable-package-x86-x64-ia64-free-download/?__cf_chl_jschl_tk__=a24fd359c8fbe4c6a7788c3ce9d57ffdbab3fe1f-1620712374-0-AZYJc0Ntpg0hidcMK1EFZdFw61J_ha4pnuzPFyEDAdTek2OLmcaOnq0bbXzgMYZdTp4V9CZBJnoeJ-DZP5wWrkXTxxxevlTYt_JZwwAOy6jswqH3mkMujtCaB3ej-pIKskHufltqkKBbZeoNQtq3ZW-tyaytAzodAyXMCMcibpz7nlVgDX9ebaHBpi2FJWMIbRSXfFXsrL99__agN_COXxLfqyJCOLY6BHBYNfngd3xekZKSBkRjcz7nYRm7c5AVDyVGxxoFYu6LzqwzBoMf7VTXRriHnxH-ytG7R70R5af52jzGrOycW4l1CxUDdTkarMrmeLsKiJJ6QytnoEfILdCevo_8AWOdrEKM35XQExwBIc4MjoRBUtpItoqlC24yc7bn9ByuyBcmuoEawssi6jkcGxuyCKv0irzrYMaifzYKNF_LTxfUJAtGoSu4fJrDtkq3gexBuQEDjeb9FjvkEPY9qhxtSA8HbmDOcbf1aLg5)

> [点击下载，VCRedist_x64.exe](https://download.microsoft.com/download/3/2/2/3224B87F-CFA0-4E70-BDA3-3DE650EFEBA5/vcredist_x64.exe)。

1. 运行CsvScanExample报错，主要提示

```
java.lang.RuntimeException: java.lang.UnsupportedOperationException 

        at jdk.compiler/com.sun.tools.javac.api.JavacTaskImpl.handleExceptions(JavacTaskImpl.java:163) 

        at jdk.compiler/com.sun.tools.javac.api.JavacTaskImpl.doCall(JavacTaskImpl.java:100) 

        at jdk.compiler/com.sun.tools.javac.api.JavacTaskImpl.call(JavacTaskImpl.java:94) 

        at com.qihoo.qsql.codegen.ClassBodyWrapper$WithClassPathInMemoryCompiler.compile(ClassBodyWrapper.java:156) 

        at com.qihoo.qsql.codegen.ClassBodyWrapper$WithClassPathInMemoryCompiler.singleCompile(ClassBodyWrapper.java:123) 

        at com.qihoo.qsql.codegen.ClassBodyWrapper.compileSourceAndLoadClass(ClassBodyWrapper.java:64) 

        at com.qihoo.qsql.codegen.ClassBodyWrapper.compile(ClassBodyWrapper.java:101) 

        at com.qihoo.qsql.exec.AbstractPipeline.compileRequirement(AbstractPipeline.java:51) 

        at com.qihoo.qsql.exec.spark.SparkPipeline.show(SparkPipeline.java:105) 

        at com.qihoo.qsql.CsvJoinWithEsExample.main(CsvJoinWithEsExample.java:29)
```

> 检查IDEA的Project Struct，找到Project SDK，可能默认选中了JDK11，需要选择JDK8，包括Project language level，也需要选择8。

![img](https://ytq6nfyc5n.feishu.cn/space/api/box/stream/download/asynccode/?code=OTJkYjBkZDFkMGQ3ZmVkYjEwNjZiZmU5MTNjNjIzZWVfMWM2bHc2SnZWSTlXS05paTF6SGx6STRJaHVWaDBveTRfVG9rZW46Ym94Y25YTE15Z3VUT1BWN25USWw0MUwwOTdLXzE2MjEwNTcwMjM6MTYyMTA2MDYyM19WNA)

1. 运行CsvScanExample报错，主要提示

```
The root scratch dir: /tmp/hive on HDFS should be writable. Current permissions are: ---------;
```

> 进入%HADOOP_HOME%/bin目录，执行如下命令：

```
winutils.exe chmod 777 D:\tmp\hive
```

> /tmp/hive目录是否在D盘需要自行确认。

> 参考链接

> [The root scratch dir: /tmp/hive on HDFS should be writable. Current permissions are: rw-rw-rw- (on Windows) - Stack Overflow](https://stackoverflow.com/questions/34196302/the-root-scratch-dir-tmp-hive-on-hdfs-should-be-writable-current-permissions)



1. 运行CsvScanExample报错，主要提示

```
 java.lang.NoSuchMethodError: net.jpountz.lz4.LZ4BlockInputStream.<init>(Ljava/io/InputStream;Z)V
```

> 此时为spark引用的net.jpountz.lz4:lz4的引起的，排除qsql-core的net.jpountz.lz4依赖

> 参考链接

> [java.lang.NoSuchMethodError: net.jpountz.lz4.LZ4BlockInputStream.＜init＞(Ljava/io/InputStream；Z)V](https://blog.csdn.net/qq_42164977/article/details/108324203)

```
<dependency>

    <groupId>com.qihoo.qsql</groupId>

    <artifactId>qsql-core</artifactId>

    <version>${project.parent.version}</version>

    <exclusions>

        <exclusion>

            <groupId>net.jpountz.lz4</groupId>

            <artifactId>lz4</artifactId>

        </exclusion>

    </exclusions>

</dependency>
```

1. 运行CsvScanExample报错，主要提示

```
ANTLR Tool version 4.7 used for code generation does not match the current runtime version 4.5.3ANTLR Runtime version 4.7 used for parser compilation does not match the current runtime version 4.5.3Exception in thread "main" java.lang.ExceptionInInitializerError
```

> 与spark引用的org.antlr:antlr4-runtime引起的，排除相关依赖。

```
<dependency>

    <groupId>org.codelibs.elasticsearch.module</groupId>

    <artifactId>lang-painless</artifactId>

    <version>${elasticsearch.version}</version>

    <exclusions>

        <exclusion>

            <artifactId>antlr4-runtime</artifactId>

            <groupId>org.antlr</groupId>

        </exclusion>

    </exclusions>

</dependency>
```

------

欢迎联系我

微信号 ：Crazy_Airhead

Mixin ID :  1091586

定投课堂邀请码：6DYMBFP061

李笑来写作课邀请码：38MDGFYZK8

水龙头邀请码：FDJQHJ
