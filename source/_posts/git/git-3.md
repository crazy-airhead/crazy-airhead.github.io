---
title: 备份Git代码仓库并定时更新
toc: true
date: 2023-01-25 16:04:33
categories:
tags:

---

## 说明

公司所在机房时不时断电，且因为机房没配置UPS，于是考虑用自己家里的NAS做一个GitLab仓库的异地备份。

之前其实已经在物理机（CentOS7系统）上通过部署Gogs，通过新增镜像仓库的方式实现了代码的异地备份。但Linux的VPN客户端不稳定的，即便配置了自动重连，但无法断线重连，导致无法正常同步。于是使用[oVirt](https://l4qiang.me/2019/05/30/virtualizaition/ovirt/) 安装了Windows虚拟机，并使用SoftEther Vpn Client配置好公司的VPN网络，需要开机自动启动和断线自动连接。

考虑到之前部署Gogs时只能一个个新增镜像仓库，也是花了不少时间。这次重新部署，直接使用Git命令（不依赖Gogs）、自动化脚步和Windows定时任务的方式进行同步备份。

## 配置

### SSH Keys

因为涉及到多个项目的同步，配置上SSH Keys，可以减少配置和增加安全性。

1. 生成ssh公私钥，使用下面的脚本，都使用默认，敲回车即可。
   
   ```
   ssh-keygen -o -t rsa -b 4096 -C "l4qiang@gmail.com"
   ```

2. 复制`/c/Users/v/.ssh/id_rsa/id_rsa.pub`内容

3. 添加用户的SSH Keys，点击用户头像，`settings->SSH Keys`，将复制的公钥贴入Key的文本框中，点击Add Key按钮。

4. 测试
   
   ```
   ssh -T git@xxx.com
   ```

### Git镜像仓库与同步

主要使用两个git命令：

```bash
# 创建镜像
git clone --mirror git@xxx.com/l4qiang/aaa.git


# 同步
git --git-dir=aaa.git remote update
```

### 脚本

编写脚本并命名为`sync.sh`。

```bash
gitpath_prefix=git@xxx.com:
gitpath_name=(l4qiang/aaa.git l4qiang/bbb.git)
rep_path=/c/Repository
for name in "${gitpath_name[@]}"; 
do
    cd $rep_path
    user_name=${name%/*}
    echo $user_name
    project_name=${name##*/}
    echo $project_name
    if [ -d "$name" ]; then
        echo "正在备份，同步……"$name

        cd $user_name
        git --git-dir=$project_name remote update
    else
        echo "正在备份，创建……"$name 

        mkdir -p $name
        cd $user_name
        git clone --mirror $gitpath_prefix$name
    fi
done
```

### 定时任务

打开`Task Scheduler`，选择`Action->Create Basic Task`，按格式填写对应的任务信息。

主要时Actions部分，填写如下：

```
"C:\Program Files\Git\bin\bash.exe" /c/Repository/sync.sh
```
