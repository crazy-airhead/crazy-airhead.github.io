---
date: '2019-05-30T14:08:31'
title: CentOS安装oVirt4.3
categories:
  - CentOS
  - oVirt
tags:
  - CentOS
  - oVirt
---
> 本文描述最新版本CentOS(CentOS-7-x86_64-DVD-1810)单机安装oVirt及创建虚拟机的过程。
> 本文主要为自己做记录，以便下次重装时有参考。
> 本文主要参考oVirt官网的[安装指南](https://www.ovirt.org/documentation/install-guide/chap-Installing_oVirt.html)

<!-- more -->

## 准备

### 系统

采用最小安装方式安装好CentOS7。
### 基础工具包
此步骤非必需，只是为方便后面的一些操作。
```sh
# yum install epel-release net-tools vim unzip zip wget ftp -y
```
### 设置静态IP

CentOS7的网络IP地址配置文件在`/etc/sysconfig/network-scripts`文件夹下。

可能过ifconfig查看网卡情况，之后通过网卡信息打开对应的配置文件，如`vim /etc/sysconfig/network-scripts/ifcfg-ens0`

```properties
TYPE="Ethernet"
PROXY_METHOD="none"
BROWSER_ONLY="no"
DEFROUTE="yes"
IPV4_FAILURE_FATAL="no"
IPV6INIT="yes"
IPV6_AUTOCONF="yes"
IPV6_DEFROUTE="yes"
IPV6_FAILURE_FATAL="no"
IPV6_ADDR_GEN_MODE="stable-privacy"
NAME="ens0"
UUID="95b614cd-79b0-4755-b08d-99f1cca8888b"
DEVICE="ens0"
ONBOOT="yes"

BOOTPROTO="static"         # 使用静态IP地址，默认为dhcp
IPADDR="192.168.131.199"   # 设置的静态IP地址
NETMASK="255.255.255.0"    # 子网掩码
GATEWAY="192.168.131.254"    # 网关地址
DNS1="8.8.8.8"       # DNS服务器
```

之后通过`service network restart`使配置生效。

### 修改HostName

`vim /etc/hostname`，增加`ovirt.goldsyear.com`，保存退出，或使用如下命令：

```sh
# hostnamectl set-hostname ovirt.goldsyear.com
```

`vim /etc/hosts`，增加

```sh
# 192.168.131.199 ovirt.goldsyear.com server-node1
```

### 关闭防火墙

```sh
# systemctl disable firewalld
# systemctl disable NetworkManager
```

### 关闭SELinux

```sh
# sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
# setenforce 0
```

### 清理iptables

```sh
# iptables -L -n
# iptables -F
```

## 安装oVirt包

1. 添加oVirt官方源

```sh
# yum install http://resources.ovirt.org/pub/yum-repo/ovirt-release43.rpm
```

2. 更新源

```sh
# yum update
```

3. 安装`ovirt-engine`包及依赖

```sh
# yum install ovirt-engine
```

## 配置oVirt Engine

运行`engine-setup`，根据提醒进行安装相关配置，除防火墙选配选`no`,因为上一步已关闭，其它都可直接回车接受默认选项，此处内容可直接参看官册指南。其间需要输入密码，后面登录管理端需要用到该密码。

```sh
# engine-setup
```

## 安装oVirt Node
```sh
yum -y install vdsm
```

配置完成后可通过`https://ovirt.goldsyear.com/ovirt-engine`进行访问，该地址会在配置完成后信息中提示出来。

## 管理oVirt

我自己没有截图用了[CentOS7 安装并使用Ovirt 4.2](<https://www.jianshu.com/p/9d699c05c17b>)的图。

![img](https://upload-images.jianshu.io/upload_images/4042820-47375fef5b48d070?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)

登录ovirt UI，用户名 admin，密码是安装过程中设置的密码。已经提供了默认的数据中心，集群和网络，因为是单机使用，可以在默认配置的基础上进行相关的管理。

### 添加主机

装宿主机的信息填上，等待安装（可在「事件」查看安装情况）。

![img](https://upload-images.jianshu.io/upload_images/4042820-29be69fe16987392?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)

完成后需要确认添加。

![img](https://upload-images.jianshu.io/upload_images/4042820-b60ea815280e954b?imageMogr2/auto-orient/)

### 添加存储

#### 宿主机配置nfs

正常情况，安装好ovirt-engine时`nfs-utils`已经存在，若不存在使用如下方式安装：

```sh
# yum install -y nfs-utils
```

##### 创建目录及设置权限

其中ssd用于存储虚拟机，iso用于存储安装（iso）文件。

```sh
# mkdir /data/ssd 
# chown 36:36 /data/ssd
# chmod 755 /data/ssd

# mkdir /data/iso
# chown 36:36 /data/iso
# chmod 755 /data/iso
```

##### 导出

```sh

# vim /etc/exports   
	/data/ssd 0.0.0.0/0.0.0.0(rw,sync)
	/data/iso 0.0.0.0/0.0.0.0(rw,sync,no_root_squash)
```

##### 启动服务

```sh
# exportfs -a				
# systemctl start rpcbind      
# systemctl start nfs-server   
# systemctl enable rpcbind nfs-server   
```

#### 添加NFS SSD存储域

![img](https://upload-images.jianshu.io/upload_images/4042820-6f1b030a333fa690?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)

#### 添加NFS ISO存储域

![img](https://upload-images.jianshu.io/upload_images/4042820-8cbf0d888fd7b900?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)

添加成功后可以查看宿主机目录，如`/data/iso/5d56c384-5e1c-46ee-a2aa-d4bedda4b6a2/images/11111111-1111-1111-1111-111111111111`，实际目录可能略有不同，上传iso文件。

### 创建虚拟机

创建虚拟机，添加实例镜像和nic（用默认的ovirtmgmt网络）。

![img](https://upload-images.jianshu.io/upload_images/4042820-2f5bf6fa419aa9e3?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)

点击“运行”下拉选“只运行一次”，附加CD，以暂停模式启动，调整引导序列为CD-ROM。

点击“控制台”下拉选“控制台选项”，可在确定按钮边的控制台资源下载客户端。

本来想用noVNC,但提示错误无法进入，暂时也不知道是什么原因。

![img](https://img-blog.csdn.net/20180420192509414?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2xwd21t/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

日志中有如下错误：

```sh
2019-05-30 09:21:43,252+08 ERROR [org.ovirt.engine.ui.frontend.server.gwt.OvirtRemoteLoggingService] (default task-20) [] Uncaught exception: com.google.gwt.core.client.JavaScriptException: (TypeError) : 对象不支持“addEventListener”属性或方法
```

## 清理

1. engine-cleanup
2. yum remove ovirt-engine


## 查看状态
systemctl status ovirt-engine

## 问题
- 添加主机是如果防火墙被开启，请再次关闭防火墙


## 小结

以上就是oVirt的单机安装和配置使用过程，更多的内容需要不断的使用才会发现。之前对于CentOS和oVirt都不是太了解参考网上资料能基本完成，另感谢同事的帮助，加深我对CentOS分区和oVirt的域等概念的理解。

## 参考链接

<https://www.ovirt.org/documentation/install-guide/chap-Installing_oVirt.html>

<https://blog.csdn.net/lpwmm/article/category/7607937>

<https://www.jianshu.com/p/9d699c05c17b>

<https://www.jianshu.com/p/83e0f25d2700>

<https://linuxhint.com/install_ovirt_centos7/>

<https://blog.51cto.com/964678615/2483173>



