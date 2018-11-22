---
title: ZeroNet介绍
date: 2017-10-22 15:33:19
categories:
- zeronet
tags: [ZeroNet]
---

## ZeroNet是什么?

ZeroNet是使用比特币加密技术和BitTorrent网络协议构建的一个去中心化的无审查网络。

用户可以在ZeroNet上发布静态或者动态的站点。访问者可以决定是否成为服务节点。只要还有一个服务节点站点就会在线。

当站点的所有者更新站点的时候，所有服务的节点（以前的访问者）就会增量更新站点内容。

ZeroNet comes with a built-in SQL database. This makes content-heavy site development easy. The DB is also synced with hosting nodes with incremental updates.

ZeroNet自带内置数据库，这使得重内容的站点的开发更容易。数据库也会在节点增量更新。

## 为什么？

- 我们相信开放的，自由的，无审查的网络。
- 去中心化：只要一发布就无法删除。
- 无单点故障：只要还有一个服务节点，内容就会一直在线。
- 不法关闭：无处不在。内容会被访问者进行托管。
- 高速：ZeroNet使用BitTorrent技术比中心化服务器快。
- 离线访问：在没有互联网连接的情况下也可以浏览保存过的站点。
- 安全：使用与比特币钱包相同的加密方法来保护内容所有权。

## 特性

- 简单，零配置。
- 基于BIP32的无密码授权，使用与比特币钱包相同的加密方法来保护你的账户。
- 实时更新
- 支持Namecoin的.bit域名
- 数据库支持：更简单的站点开发和更快的页面加载速度。
- 匿名：全面支持Tor网络，支持通过.onion隐藏服务相互连接，而不是通过IPv4地址。
- TLS加密连接
- 自动打开uPnP端口。
- 插件和多用户 (开放式代理) 支持
- 跨平台，支持任何浏览器和系统

## 原理

- 在你运行ZeroNet后,你可以通过`http://127.0.0.1:43110/{zeronet_site_address}` (比如:`http://127.0.0.1:43110/1HeLLo4uzjaLetFx6NH3PMwFP3qbRbTf3D`)来访问网站。
- ZeroNet会通过BitTorrent网络来查找可用的节点，并下载需要的文件 (html, css, js...)。
- 你会托管理每一个你访问过的网站。
- 每个网站都有一个列表文件，存储了网站所有文件的SHA512哈希值和网站所有者的私钥生成的签名。
- 如果站点的所有者 (拥有私钥的那个人) 修改了站点, 并且他/她签名了新的列表文件，然后推送给其他节点， 那么所有节点将会在验证列表的真实性(使用签名)后, 下载修改后的文件并推送给其他节点。

## 限制

- 不支持大文件拆分
- 文件传输未压缩
- 不支持私有站点

## 赞助
Bitcoin: 1QDhxQ6PraUZa21ET5fYUCPgdrwBomnFgX

谢谢！