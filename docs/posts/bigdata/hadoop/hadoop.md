---
date: '2023-02-22T20:04:43'
title: 单机部署Hadoop
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

因为DSS默认支持的是Hadoop2.7.2，于是本次的安装也用[2.7.2](https://archive.apache.org/dist/hadoop/common/hadoop-2.7.2/hadoop-2.7.2.tar.gz)版本。

参考安装文档[Apache Hadoop 2.7.2 – Hadoop: Setting up a Single Node Cluster.](https://hadoop.apache.org/docs/r2.7.2/hadoop-project-dist/hadoop-common/SingleCluster.html)。

<!-- more -->

# 基础软件

- CentOS7

- ssh

- rsync

- java（1.8）[Hadoop Java Versions - Hadoop - Apache Software Foundation](https://cwiki.apache.org/confluence/display/HADOOP/Hadoop+Java+Versions)

```bash
yum install -y ssh rsync

yum install -y jdk-8u181-linux-x64.rpm
```

# 基础配置

- 设置JAVA_HOME

```properties
export JAVA_HOME=/user/java/latest
```

- 设置hostname

```bash
vi /etc/hosts


# 增加配置hadoop0

172.18.23.219 hadoop0
```

- 设置免密登录

```bash
ssh-keygen -r rsa
cat ~/.ssh/id_dsa.pub >> ~/.ssh/authorized_keys
chmod 0600 ~/.ssh/authorized_keys
```

- 关闭防火墙

```bash
systemctl disable firewalld
```

# 配置

- 解压

```bash
tar -xzvf hadoop-2.7.2.tar.gz
mv hadoop-2.7.2 /home/hadoop
```

- 修改`etc/hadoop/core-site.xml`

```xml
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://hadoop0:9000</value>
    </property>
</configuration>
```

- 修改`etc/hadoop/hdfs-site.xml`

```xml
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
</configuration>
```

- 增加PATH

```properties
vi ~/.bashrc


export PATH=$PATH:/home/hadoop/bin


source ~/.bashrc
```

# 运行

- 格式化

```bash
hdfs namenode -format
```

- 运行

```bash
sbin/start-dfs.sh
```

- 验证NameNode

```
http://hadoop0:50070

# 查看端口
netstat -ntlp
```

- 创建目录

```
hdfs dfs -mkdir /user
hdfs dfs -mkdir /user/<username>
```

- 上传文件

```
hdfs dfs -put etc/hadoop input
```
