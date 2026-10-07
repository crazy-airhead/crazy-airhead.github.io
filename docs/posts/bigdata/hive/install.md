---
date: '2023-02-22T22:06:58'
title: 单机部署Hive
categories:
  - 大数据
  - hadoop
  - hive
  - course
  - dds
tags:
  - 大数据
  - hadoop
  - hive
  - course
  - dds
---

# 说明

需要部署大数据治理平台，查看了一些开源版本之后发现微众银行的[DataSphereStudio](https://github.com/WeBankFinTech/DataSphereStudio)(DSS)比较符合我们的预期，于是着手部署该数据平台。

因为DSS默认支持的是Hive2.3.3，但官网没找到对应版本，使用的是[2.3.9](https://dlcdn.apache.org/hive/hive-2.3.9/apache-hive-2.3.9-bin.tar.gz)。

参考安装文档[GettingStarted - Apache Hive - Apache Software Foundation](https://cwiki.apache.org/confluence/display/Hive/GettingStarted)。

# 基础软件

- CentOS7

- Hadoop2.7.2

- MySQL5.6+

# 基础配置

- 安装MySQL，下载的是5.7.40版本

```bash
yum installm -y ./*.rpm

systemctl start mysqld && systemctl enable mysqld


grep 'temporary password' /var/log/mysqld.log


mysql -uroot -ppassword

alter user root@localhost identified by 'Hadoop.2023';
flush privileges;
exit
```

- # 配置

- 解压

```bash
tar -zxvf apache-hive-2.3.9-bin.tar.gz
mv apache-hive-2.3.9-bin /home/hive
```

- 增加PATH

```properties
vi ~/.bashrc

epxort HIVE_HOME=/home/hive
export PATH=$PATH:/home/hadoop/bin:$HIVE_HOME/bin

source ~/.bashrc
```

- 创建hdfs的hive目录

```bash
hdfs dfs -mkdir -p /user/hive
hdfs dfs -chmod -R 777 /user/hive
hdfs dfs -mkdir -p /tmp/hive
hdfs dfs -chmod -R 777 /tmp/hive
```

- 配置hive本地临时目录

```bash
mkdir /home/tmp/hive
chmod -R 777 /home/tmp/hive
```

- 配置hive-site.xml

```bash
cd /home/hive/conf

cp hive-default.xml.template hive-site.xml
```

-  使用vim模式替换

```vim
# 替换临时目录
:%s#${system:java.io.tmpdir}#/home/temp/hive#g

# 替换目录用户
:%s#${system:user.name}#root#g
```

- 修改hive数据库配置

```xml
  <property>
    <name>javax.jdo.option.ConnectionDriverName</nae>
    <value>com.mysql.jdbc.Driver</value>
    <description>Driver class name for a JDBC metastore</description>
  </property>
  <property>
    <name>javax.jdo.option.ConnectionUserName</name>
    <value>root</value>
    <description>Username to use against metastore database</description>
  </property>
  <property>
    <name>javax.jdo.option.ConnectionURL</name>
    <value>jdbc:mysql://172.18.23.219:3306/hive?createDatabaseIfNoExist=true</value>
    <description>
      JDBC connect string for a JDBC metastore.
      To use SSL to encrypt/authenticate the connection, provide database-specific SSL flag in the connection URL.
      For example, jdbc:postgresql://myhost/db?ssl=true for postgres database.
    </description>
  </property>
  <property>
    <name>javax.jdo.option.ConnectionPassword</name>
    <value>Hadoop.2023</value>
    <description>password to use against metastore database</description>
  </property>
```

- 下载jdbc驱动，上传到`/home/hive/lib`目录下。

```
yum install -y wget 
wget https://repo1.maven.org/maven2/mysql/mysql-connector-java/5.1.48/mysql-connector-java-5.1.48.jar
```

# 运行

- 初始化

```
cd /home/hive/bin
schematool -initSchema -dbType mysql


# 如果没有自动创建hive数据库，需要自己手动创建，后重新执行上述语句。
```

- 启动Hive

```
./hive
```
