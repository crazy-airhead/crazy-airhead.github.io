---
date: '2023-01-26T09:41:38'
title: 安装Ovirt后导致无法连接Docker容器问题
categories:
  - oVirt
  - Docker
tags:
  - oVirt
  - Docker
---

## 说明

因为[备份GitLab代码仓库](https://l4qiang.me/2023/01/25/git/git-3/)，安装了[oVirt4.3](https://l4qiang.me/2019/05/30/virtualizaition/ovirt/)，之后发现原来的Docker服务无法访问了。简单测试Docker服务本身是可用的。在张同学的协助下，初步断定是oVirt安装了路由发生了变化引起的。

<!-- more -->

## 诊断

Docker内部是通过iptables进行转发的，查看iptable情况。

```
[root@goldsyear ~]# iptables -t nat -nvL --line-number
Chain PREROUTING (policy ACCEPT 357 packets, 75406 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1       58  3506 DOCKER     all  --  *      *       0.0.0.0/0            0.0.0.0/0            ADDRTYPE match dst-type LOCAL

Chain INPUT (policy ACCEPT 37 packets, 3113 bytes)
num   pkts bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 339 packets, 21026 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1       35  2100 DOCKER     all  --  *      *       0.0.0.0/0           !127.0.0.0/8          ADDRTYPE match dst-type LOCAL

Chain POSTROUTING (policy ACCEPT 339 packets, 21026 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1       16   973 MASQUERADE  all  --  *      !docker0  172.17.0.0/16        0.0.0.0/0           
2        0     0 MASQUERADE  all  --  *      !br-e78d6dd2902d  192.168.49.0/24      0.0.0.0/0           
3        0     0 MASQUERADE  tcp  --  *      *       172.17.0.4           172.17.0.4           tcp dpt:3306
4        0     0 MASQUERADE  tcp  --  *      *       172.17.0.2           172.17.0.2           tcp dpt:3306
5        0     0 MASQUERADE  tcp  --  *      *       172.17.0.3           172.17.0.3           tcp dpt:6379
6        0     0 MASQUERADE  tcp  --  *      *       172.17.0.4           172.17.0.4           tcp dpt:3000
7        0     0 MASQUERADE  tcp  --  *      *       172.17.0.4           172.17.0.4           tcp dpt:22
8        0     0 MASQUERADE  tcp  --  *      *       172.17.0.5           172.17.0.5           tcp dpt:8096

Chain DOCKER (2 references)
num   pkts bytes target     prot opt in     out     source               destination         
1       31  1860 RETURN     all  --  docker0 *       0.0.0.0/0            0.0.0.0/0           
2        0     0 RETURN     all  --  br-e78d6dd2902d *       0.0.0.0/0            0.0.0.0/0           
3       26  1568 DNAT       tcp  --  !docker0 *       0.0.0.0/0            0.0.0.0/0            tcp dpt:3307 to:172.17.0.2:3306
4        0     0 DNAT       tcp  --  !docker0 *       0.0.0.0/0            0.0.0.0/0            tcp dpt:3308 to:172.17.0.3:6379
5        0     0 DNAT       tcp  --  !docker0 *       0.0.0.0/0            0.0.0.0/0            tcp dpt:13000 to:172.17.0.4:3000
6        0     0 DNAT       tcp  --  !docker0 *       0.0.0.0/0            0.0.0.0/0            tcp dpt:10022 to:172.17.0.4:22
7        0     0 DNAT       tcp  --  !docker0 *       0.0.0.0/0            0.0.0.0/0            tcp dpt:32400 to:172.17.0.5:8096
```

初步判断是的了一条`192.168.49.0的路由

```
0     0 MASQUERADE  all  --  *      !br-e78d6dd2902d  192.168.49.0/24      0.0.0.0/0 
```

然后尝试删除对应的路由，但发现只有删除`PREROUTING`的路由，Docker才能正常访问

```
iptables -t nat -D PREROUTING 1
```

## 统一处理
- 检查ip转发
```
sysctl net.ipv4.ip_forward
```
如果为1，不需要修改
- 清理路由
```
iptables -t nat -F
```
- 增加对应网关路由
```
iptables -t nat -A POSTROUTING -s 172.17.0.0/16 ! -o docker0 -j MASQUERADE
```
如果还有其他网卡，也可一起增加
```
iptables -t nat -A POSTROUTING -s 172.18.0.0/16 ! -o br-80d019e60f1b -j MASQUERADE
```

## 遗留问题

- 如果重启Docker服务还是会增加该路由，需要重新手动删除。自己对网络不是太熟悉，Docker官网提供了份[Docker and iptables ](https://docs.docker.com/network/iptables/)的说明文档，后续继续研究。

- 可能关联的问题，虽然重新配置了镜像加速，但拉取ElasticSearch的镜像很慢。
