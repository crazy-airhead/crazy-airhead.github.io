---
title: 解决Navicat打开连接并闲置一段时间后卡顿问题
toc: true
p: misc/navicat
date: 2019-05-30 09:54:53
categories:
- navicat
tags:
- navicat
---
使用Navicat打开Mysql连接并闲置一段时间后卡顿（旧版本可能直接无响应或异常退出）。

出现这种情况，可通过如下两种方式来调整：
- 修改Mysql的Wait_timeout属性（默认设置下，当一个连接的空闲时间超过8小时后，MySQL 就会断开该连接）。
- 设置Navicat连接属性中的高级选项，勾选保持连接间隔，并设置为30（小于wait_timeout即可）。