---
date: '2023-02-22T23:12:53'
title: 单机部署DSS
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



# **零、注意事项**

- 确保安装的系统为CentOS7

- 服务器存在多网卡问题。首先通过命令`ifconfig`禁用多余的网卡，以确保激活的网卡数只有1个。

```Bash
# 查看网卡ifconfig# 禁用指定网卡ifconfig [NIC_NAME] down
```

- 网卡多IP问题。在确保服务器只存在一个网卡是激活状态的情况下，通过命令查看网卡对应的IP数，若大于1，那么就需要去掉网卡中指定的IP，采用动态获取IP的方式，具体命令如下：

```Bash
 echo $(hostname -I) ip addr flush dev [NIC_NAME] ifdown [NIC_NAME] ifup [NIC_NAME]
```

- hostname配置。在安装前用户需要配置hostname到ip的映射

# **一、基础软件安装**

- 需要的命令工具：

```Bash
yum install -y telnet tar sed dos2unix unzip zip expect curl
```

- 检查cp等命令是否有别名alias，避免安装时提示。

```Bash
aliasvi ~/.bashrc# 删除cp rm 的别名，
```

- 需要安装的软件
  
  - MySQL(5.5+)，安装Hive时已安装
  
  - JDK (1.8.0_141以上)，安装Hadoop时已安装
  
  - Python(2.x和3.x都支持)，默认包含python2，无需安装，但需要安装pip和matplotlib

```Bash
curl https://bootstrap.pypa.io/pip/2.7/get-pip.py -o get-pip.pypip config set global.index-url https://mirrors.aliyun.com/pypi/simple/python -m pip install matplotlib
```

- 安装Nginx

```Bash
sudo yum install -y epel-releasesudo yum -y updatesudo yum install -y nginxsystemctl start nginxsystemctl enable nginx
```

- 安装Hadoop2.7.2

- 安装Hive2.3.3（未找到2.3.3版本，使用的是2.3.9版本）

- 安装Spark2.0以上版本
  
      [部署Hadoop+Hive+Spark](https://ytq6nfyc5n.feishu.cn/docx/XbzzdTJsFoWrcAxcmd0cqQQvn9e)
  
      确保可以执行如下命令
  
  ```Bash
  hdfs dfs -ls /hive -e "show databases"spark-sql -e "show databases"
  ```

# **二、创建用户**

1. 假设**部署用户是hadoop账号**（可以不是hadoop用户，但是推荐使用Hadoop的超级用户进行部署，这里只是一个示例）

2. 在所有需要部署的机器上创建部署用户，用于安装 ，如下命令创建部署用户hadoop

```XML
sudo useradd hadoop
```

3. 因为Linkis的服务是以 `sudo -u ${linux-user}` 方式来切换引擎，从而执行作业，所以部署用户需要有 sudo 权限，而且是免密的，按下面步骤修改部署用户权限

编辑/etc/sudoers文件：

```XML
vi /etc/sudoers
```

在/etc/sudoers文件中添加下面内容：

```Plaintext
hadoop  ALL=(ALL)  NOPASSWD: NOPASSWD: ALL
```

4. 修复文件权限

```Bash
...chown root:root /etc/sudo.conf -Rchown root:root /etc/sudoers.d -R
```

# **三、准备安装包**

- 用户可以自行编译或者去 release 页面下载安装包：[DSS Release-1.1.1](https://github.com/WeBankFinTech/DataSphereStudio/releases/tag/1.1.1)

- DSS & Linkis 一键安装部署包的层级目录结构如下：

```Plaintext
├── dss_linkis # 一键部署主目录  ├── bin # 用于一键安装，以及一键启动 DSS + Linkis  ├── conf # 一键部署的参数配置目录  ├── wedatasphere-dss-x.x.x-dist.tar.gz # DSS后端安装包  ├── wedatasphere-dss-web-x.x.x-dist.zip # DSS前端和Linkis前端安装包  ├── wedatasphere-linkis-x.x.x-dist.tar.gz # Linkis后端安装包
```

# **四、修改配置**

- 用户需要对 `xx/dss_linkis/conf` 目录下的 `config.sh` 和 `db.sh` 进行修改。

- 打开 `config.sh`，按需修改相关配置参数，参数说明如下：

```Bash
#################### 一键安装部署的基本配置 ####################### deploy user（部署用户，默认为当前登录用户）deployUser=hadoop### Linkis_VERSIONLINKIS_VERSION=1.1.1### DSS Web（本机安装一般无需修改，但需确认此端口是否占用，若被占用，修改一个可用端口即可）DSS_NGINX_IP=127.0.0.1DSS_WEB_PORT=8085### DSS VERSIONDSS_VERSION=1.1.1############## linkis的其他默认配置信息 start ############## ### Specifies the user workspace, which is used to store the user's script files and log files.### Generally local directory##file:// required. 指定用户使用的目录路径，一般用于存储用户的脚本文件和日志文件等，是用户的工作空间WORKSPACE_USER_ROOT_PATH=file:///tmp/linkis/ ### User's root hdfs path##hdfs:// required. 结果集日志等文件路径，用于存储Job的结果集文件HDFS_USER_ROOT_PATH=hdfs:///tmp/linkis ### Path to store job ResultSet:file or hdfs path##hdfs:// required. 结果集日志等文件路径，用于存储Job的结果集文件，如果未配置 使用HDFS_USER_ROOT_PATH的配置RESULT_SET_ROOT_PATH=hdfs:///tmp/linkis ### Path to store started engines and engine logs, must be local. 存放执行引擎的工作路径，需要部署用户有写权限的本地目录ENGINECONN_ROOT_PATH=/appcom/tmp### 基础组件环境信息###HADOOP CONF DIR #/appcom/config/hadoop-config（用户根据实际情况修改）
HADOOP_CONF_DIR=/appcom/config/hadoop-config###HIVE CONF DIR  #/appcom/config/hive-config（用户根据实际情况修改）
HIVE_CONF_DIR=/appcom/config/hive-config###SPARK CONF DIR #/appcom/config/spark-config（用户根据实际情况修改）
SPARK_CONF_DIR=/appcom/config/spark-config###for install （用户根据实际情况修改）LINKIS_PUBLIC_MODULE=lib/linkis-commons/public-module##YARN REST URL spark engine required（根据实际情况修改IP和端口）
YARN_RESTFUL_URL=http://127.0.0.1:8088## Engine version#SPARK_VERSION（根据实际版本情况修改版本号）
SPARK_VERSION=2.4.3##HIVE_VERSION（根据实际版本情况修改版本号）
HIVE_VERSION=2.3.9##PYTHON_VERSION（根据实际版本情况修改版本号）
PYTHON_VERSION=python2## LDAP is for enterprise authorization, if you just want to have a try, ignore it.#LDAP_URL=ldap://localhost:1389/#LDAP_BASEDN=dc=webank,dc=com#LDAP_USER_NAME_FORMAT=cn=%s@xxx.com,OU=xxx,DC=xxx,DC=com############## linkis的其他默认配置信息 end ################################# The install Configuration of all Linkis's Micro-Services ######################################## 用户可以根据实际情况修改IP和端口 #####################    NOTICE:#       1. If you just wanna try, the following micro-service configuration can be set without any settings.#            These services will be installed by default on this machine.#       2. In order to get the most complete enterprise-level features, we strongly recommend that you install#          the following microservice parameters####  EUREKA install information###  You can access it in your browser at the address below:http://${EUREKA_INSTALL_IP}:${EUREKA_PORT}###  Microservices Service Registration Discovery CenterLINKIS_EUREKA_INSTALL_IP=127.0.0.1LINKIS_EUREKA_PORT=9600#LINKIS_EUREKA_PREFER_IP=true###  Gateway install information#LINKIS_GATEWAY_INSTALL_IP=127.0.0.1LINKIS_GATEWAY_PORT=9001### ApplicationManager#LINKIS_MANAGER_INSTALL_IP=127.0.0.1LINKIS_MANAGER_PORT=9101### EngineManager#LINKIS_ENGINECONNMANAGER_INSTALL_IP=127.0.0.1LINKIS_ENGINECONNMANAGER_PORT=9102### EnginePluginServer#LINKIS_ENGINECONN_PLUGIN_SERVER_INSTALL_IP=127.0.0.1LINKIS_ENGINECONN_PLUGIN_SERVER_PORT=9103### LinkisEntrance#LINKIS_ENTRANCE_INSTALL_IP=127.0.0.1LINKIS_ENTRANCE_PORT=9104###  publicservice#LINKIS_PUBLICSERVICE_INSTALL_IP=127.0.0.1LINKIS_PUBLICSERVICE_PORT=9105### cs#LINKIS_CS_INSTALL_IP=127.0.0.1LINKIS_CS_PORT=9108########## Linkis微服务配置完毕 ############################# The install Configuration of all DataSphereStudio's Micro-Services ######################################### 非注释的参数必须配置，注释掉的参数可按需修改 #################### #    NOTICE:#       1. If you just wanna try, the following micro-service configuration can be set without any settings.#            These services will be installed by default on this machine.#       2. In order to get the most complete enterprise-level features, we strongly recommend that you install#          the following microservice parameters## 用于存储发布到 Schedulis 的临时ZIP包文件WDS_SCHEDULER_PATH=file:///appcom/tmp/wds/scheduler### DSS_SERVER### This service is used to provide dss-server capability.### project-server#DSS_FRAMEWORK_PROJECT_SERVER_INSTALL_IP=127.0.0.1#DSS_FRAMEWORK_PROJECT_SERVER_PORT=9002### orchestrator-server#DSS_FRAMEWORK_ORCHESTRATOR_SERVER_INSTALL_IP=127.0.0.1#DSS_FRAMEWORK_ORCHESTRATOR_SERVER_PORT=9003### apiservice-server#DSS_APISERVICE_SERVER_INSTALL_IP=127.0.0.1#DSS_APISERVICE_SERVER_PORT=9004### dss-workflow-server#DSS_WORKFLOW_SERVER_INSTALL_IP=127.0.0.1#DSS_WORKFLOW_SERVER_PORT=9005### dss-flow-execution-server#DSS_FLOW_EXECUTION_SERVER_INSTALL_IP=127.0.0.1#DSS_FLOW_EXECUTION_SERVER_PORT=9006###dss-scriptis-server#DSS_SCRIPTIS_SERVER_INSTALL_IP=127.0.0.1#DSS_SCRIPTIS_SERVER_PORT=9008########## DSS微服务配置完毕################### other default configuration 其他默认配置信息  ############## ## java application default jvm memory（Java应用的堆栈大小。如果部署机器的内存少于8G，推荐128M；## 达到16G时，推荐至少256M；如果想拥有非常良好的用户使用体验，推荐部署机器的内存至少达到32G）export SERVER_HEAP_SIZE="128M"##sendemail配置，只影响DSS工作流中发邮件功能EMAIL_HOST=smtp.163.comEMAIL_PORT=25EMAIL_USERNAME=xxx@163.comEMAIL_PASSWORD=xxxxxEMAIL_PROTOCOL=smtp### Save the file path exported by the orchestrator serviceORCHESTRATOR_FILE_PATH=/appcom/tmp/dss### Save DSS flow execution service log pathEXECUTION_LOG_PATH=/appcom/tmp/dss############## other default configuration 其他默认配置信息 ############## 
```

- 请注意：DSS 推荐使用 LDAP 进行用户登录鉴权，如您想接入公司的 LDAP，还需在上面的 `config.sh` 中填写 LDAP 的配置参数。 [如何安装 LDAP？](https://web.mit.edu/rhel-doc/5/RHEL-5-manual/Deployment_Guide-en-US/s1-ldap-quickstart.html)

- 修改数据库配置。请确保配置的数据库，安装机器可以正常访问，否则将会出现 DDL 和 DML 导入失败的错误，打开 `db.sh`，按需修改相关配置参数，参数说明如下：

```Bash
配置DSS数据库MYSQL_HOST=127.0.0.1MYSQL_PORT=3306MYSQL_DB=dssMYSQL_USER=xxxMYSQL_PASSWORD=xxx## Hive metastore的数据库配置，用于Linkis访问Hive的元数据信息HIVE_HOST=127.0.0.1HIVE_PORT=3306HIVE_DB=xxxHIVE_USER=xxxHIVE_PASSWORD=xxx
```

# **五、安装和使用**

1. **停止机器上所有****DSS****及Linkis服务**
- 若从未安装过DSS及Linkis服务，忽略此步骤
2. **将当前目录切换到bin目录**

```Bash
cd xx/dss_linkis/bin
```

3. **执行安装脚本**
   
   ```Bash
   sh install.sh
   ```
   
   2. 该安装脚本会检查各项集成环境命令，如果没有请按照提示进行安装，以下命令为必须项：
   
   3. *yum; java; mysql; unzip; expect; telnet; tar; sed; dos2unix; nginx*
   
   4. 安装时，脚本会询问您是否需要初始化数据库并导入元数据，Linkis 和 DSS 均会询问，**第一次安装必须选是(2)**
   
   5. 通过查看控制台打印的日志信息查看是否安装成功，如果有错误信息，可以查看具体报错原因
   
   6. *除非用户想重新安装整个应用，否则该命令执行一次即可*

4. **启动服务**
- 若用户的Linkis安装包是通过自己编译获取且用户想启用数据源管理功能，那么就需要去修改配置以启动该项功能，使用下载的安装包无需操作

```Bash
## 切换到Linkis配置文件目录cd xx/dss_linkis/linkis/conf## 打开配置文件linkis-env.shvi linkis-env.sh## 将如下配置改为trueexport ENABLE_METADATA_MANAGER=true
```

- 若用户的Linkis安装包是通过自己编译获取，在启动服务前尽量将后续用到的密码改成和部署用户名一致，使用下载的安装包无需操作

```Bash
## 切换到Linkis配置文件目录cd xx/dss_linkis/linkis/conf/## 打开配置文件linkis-mg-gateway.propertiesvi linkis-mg-gateway.properties## 修改密码wds.linkis.admin.password=hadoop
```

- 在xx/dss_linkis/bin目录下执行启动服务脚本

```Bash
sh start-all.sh
```

- 如果启动产生了错误信息，可以查看具体报错原因。启动后，各项微服务都会进行**通信检测**，如果有异常则可以帮助用户定位异常日志和原因
5. **安装默认Appconn**

```Bash
# 切换目录到dss，正常情况下dss目录就在xx/dss_linkis目录下，cd xx/dss_linkis/dss/bin# 执行启动默认Appconn脚本sh install-default-appconn.sh
```

- *该命令执行一次即可，除非用户想重新安装整个应用*
6. **查看验证是否成功**
- 用户可以在Eureka界面查看 Linkis & DSS 后台各微服务的启动情况，默认情况下DSS有6个微服务，Linkis有6个微服务 **（Eureka地址默认端口号9600，服务完整启动时可以看到地址）**

![](https://ytq6nfyc5n.feishu.cn/space/api/box/stream/download/asynccode/?code=YzJlZGJmZjIxOGU0YTM4YWU1NDBhNzNkYTU5YTZjZjVfRHR0RlU4UDZCOFZqc2xyUnZndXplTkp0amlQVDRLTkJfVG9rZW46Ym94Y250blY5V0VuTkNXV1dFQWhRVG1tUVBlXzE2NzcwNzk1ODE6MTY3NzA4MzE4MV9WNA)

![](https://ytq6nfyc5n.feishu.cn/space/api/box/stream/download/asynccode/?code=MWVhNjY2NDNhMjMwMTA3NzM0ZmRlODQ0YWI0NGUyNzFfZ3RRZHVJcno4OVBtVEVnQ1pQOXpHS2czS0NzUWVRYzRfVG9rZW46Ym94Y25GQVZLbHVwRUxQMHkyV1lmVHZ3WmJiXzE2NzcwNzk1ODE6MTY3NzA4MzE4MV9WNA)

- 用户可以使用**谷歌浏览器**访问以下前端地址：`http://DSS_NGINX_IP:DSS_WEB_PORT` **启动日志会打印此访问地址（在xx/dss_linkis/conf/config.sh中也配置了此地址）**。登陆时默认管理员的用户名和密码均为部署用户为hadoop（用户若想修改密码，可以通过修改 xx/dss_linkis/linkis/conf/linkis-mg-gateway.properties 文件中的 wds.linkis.admin.password 参数)
7. **停止服务**

```Bash
sh stop-all.sh
```

- 若用户需要停止所有服务可执行该命令`sh stop-all.sh`，重新启动所有服务就执行`sh start-all.sh`，这两条命令均在xx/dss_linkis/bin目录下执行

# **六、补充说明**

- 考虑到安装包过于大的问题，Linkis默认仅提供Hive, Python, Shell, Spark引擎插件，用户若想使用其他引擎，可参考文档: [Linkis引擎的安装](https://linkis.apache.org/zh-CN/docs/1.1.1/deployment/engine-conn-plugin-installation)

- DSS默认未安装调度系统，用户可以选择安装 Schedulis 或者 DolphinScheduler，具体安装方式见下面表格

- DSS默认仅安装DateChecker, EventSender, EventReceiver AppConn，用户可参考文档安装其他AppConn，如Visualis, Exchangis, Qualitis, Prophecis, Streamis。调度系统可使用Schedulis或DolphinScheduler


|                  |                       |                                                                                                                                                                                           |                                                                                                                                                                                                                    |
| ---------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 组件名              | 组件版本要求                | 组件部署链接                                                                                                                                                                                    | AppConn部署链接                                                                                                                                                                                                        |
| Schedulis        | Schedulis0.7.0        | [Schedulis部署](https://github.com/WeBankFinTech/Schedulis/blob/master/docs/schedulis_deploy_cn.md)                                                                                         | [Schedulis AppConn安装](https://github.com/WeBankFinTech/DataSphereStudio-Doc/blob/main/zh_CN/%E5%AE%89%E8%A3%85%E9%83%A8%E7%BD%B2/SchedulisAppConn%E6%8F%92%E4%BB%B6%E5%AE%89%E8%A3%85%E6%96%87%E6%A1%A3.md)        |
| Visualis         | Visualis1.0.0         | [Visualis部署](https://github.com/WeBankFinTech/Visualis/blob/master/visualis_docs/zh_CN/Visualis_deploy_doc_cn.md)                                                                         | [Visualis AppConn安装](https://github.com/WeBankFinTech/Visualis/blob/master/visualis_docs/zh_CN/Visualis_appconn_install_cn.md)                                                                                     |
| Exchangis        | Exchangis1.0.0        | [Exchangis部署](https://github.com/WeBankFinTech/Exchangis/blob/master/docs/zh_CN/ch1/exchangis_deploy_cn.md)                                                                               | [Exchangis AppConn安装](https://github.com/WeBankFinTech/Exchangis/blob/master/docs/zh_CN/ch1/exchangis_appconn_deploy_cn.md)                                                                                        |
| Qualitis         | Qualitis0.9.2         | [Qualitis部署](https://github.com/WeBankFinTech/Qualitis/blob/master/docs/zh_CN/ch1/%E5%BF%AB%E9%80%9F%E6%90%AD%E5%BB%BA%E6%89%8B%E5%86%8C%E2%80%94%E2%80%94%E5%8D%95%E6%9C%BA%E7%89%88.md) | [Qualitis AppConn安装](https://github.com/WeBankFinTech/Qualitis/blob/master/docs/zh_CN/ch1/%E6%8E%A5%E5%85%A5%E5%B7%A5%E4%BD%9C%E6%B5%81%E6%8C%87%E5%8D%97.md)                                                      |
| Prophecis        | Prophecis0.3.2        | [Prophecis部署](https://github.com/WeBankFinTech/Prophecis/blob/master/docs/zh_CN/QuickStartGuide.md)                                                                                       | [Prophecis AppConn安装](https://github.com/WeBankFinTech/Prophecis/blob/master/docs/zh_CN/Deployment_Documents/Prophecis%20Appconn%E5%AE%89%E8%A3%85%E6%96%87%E6%A1%A3.md)                                           |
| Streamis         | Streamis0.2.0         | [Streamis部署](https://github.com/WeBankFinTech/Streamis/blob/main/docs/zh_CN/0.2.0/Streamis%E5%AE%89%E8%A3%85%E6%96%87%E6%A1%A3.md)                                                        | [Streamis AppConn安装](https://github.com/WeBankFinTech/Streamis/blob/main/docs/zh_CN/0.2.0/development/StreamisAppConn%E5%AE%89%E8%A3%85%E6%96%87%E6%A1%A3.md)                                                      |
| DolphinScheduler | DolphinScheduler1.3.x | [DolphinScheduler部署](https://dolphinscheduler.apache.org/zh-cn/docs/1.3.8/user_doc/standalone-deployment.html)                                                                            | [DolphinScheduler AppConn安装](https://github.com/WeBankFinTech/DataSphereStudio-Doc/blob/main/zh_CN/%E5%AE%89%E8%A3%85%E9%83%A8%E7%BD%B2/DolphinScheduler%E6%8F%92%E4%BB%B6%E5%AE%89%E8%A3%85%E6%96%87%E6%A1%A3.md) |

# 七、问题处理

- 部署时提示上传资源错误

![](https://ytq6nfyc5n.feishu.cn/space/api/box/stream/download/asynccode/?code=YTQ2ZmEzNjU2ZDk4ZjFhZDFiNjI3NTE2Y2RkNGQzMjJfZHUydlZFQUJ5dXlzYUdTQWdHa3VTaURtZWJJRnMya1JfVG9rZW46Ym94Y242RHdqcE81dmt6UHRzTThPRFJMSWtoXzE2NzcwNzk1ODE6MTY3NzA4MzE4MV9WNA)

> 可以查看`xx/dss-links/links/logs/links-ps-publishservice.log`看具体的错误信息，来确定具体的错误

# 八、参考链接

- [DSS单机部署](https://github.com/WeBankFinTech/DataSphereStudio-Doc/blob/main/zh_CN/%E5%AE%89%E8%A3%85%E9%83%A8%E7%BD%B2/DSS%26Linkis%E4%B8%80%E9%94%AE%E9%83%A8%E7%BD%B2%E6%96%87%E6%A1%A3%E5%8D%95%E6%9C%BA%E7%89%88.md)

- [DSS部署](https://github.com/apache/linkis/discussions/3628)

- [安装pip](https://zhuanlan.zhihu.com/p/433878383)
