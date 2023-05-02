---
title: 单机部署Spark On Yarn
toc: true
date: 2023-02-22 22:04:31
categories:
- 大数据
- hadoop
- course
- dds
tags:
- 大数据
- hadoop
- course
- dds
---

# 说明

需要部署大数据治理平台，查看了一些开源版本之后发现微众银行的[DataSphereStudio](https://github.com/WeBankFinTech/DataSphereStudio)(DSS)比较符合我们的预期，于是着手部署该数据平台。

因为DSS默认支持的Spark2.0以上版本，于是本次的安装也用[3.3.2-hadoop2](https://dlcdn.apache.org/spark/spark-3.3.2/spark-3.3.2-bin-hadoop2.tgz)版本。

参考安装文档[Running Spark on YARN - Spark 2.4.3 Documentation (apache.org)](https://spark.apache.org/docs/2.4.3/running-on-yarn.html)。

# 基础软件

- [Scala2.12.17](https://downloads.lightbend.com/scala/2.12.17/scala-2.12.17.rpm)

```bash
yum install -y scala-2.12.17.rpm
```

# 基础配置

- 设置

# 配置

- 解压

```bash
tar -zxvf spark-3.3.2-bin-hadoop2.tgz
mv spark-3.3.2-bin-hadoop2 /home/spark
```

- 配置spark-env.sh

```properties
# Options read in any cluster manager using HDFS
# - HADOOP_CONF_DIR, to point Spark towards Hadoop configuration files
HADOOP_CONF_DIR=/home/bigdata/hadoop/etc/hadoop

# Options read in YARN client/cluster mode
# - YARN_CONF_DIR, to point Spark towards YARN configuration files when you use YARN
YARN_CONF_DIR=/home/bigdata/hadoop/etc/hadoo
```

- 编辑`/home/hadoop/etc/hadoop/yarn-site.xml`

```xml
        <property>
                <name>yarn.nodemanager.pmem-check-enabled</name>
                <value>false</value>
        </property>
        <property>
                <name>yarn.nodemanager.vmem-check-enabled</name>
                <value>false</value>
        </property>
```

# 运行

- 启动dfs

```bash
start-dfs.sh
```

- 启动yarn

```bash
start-yarn.sh
```

- 运行sprk-shell

```bash
spark-shell --master yarn --deploy-mode client
```

- 验证yarn

```
http://hadoop0:8088/cluster
```
