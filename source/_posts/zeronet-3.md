---
title: 简易ZeroNet站点
date: 2017-12-11 20:36:57
tags: [ZeroNet]
---
## ZeroHello
ZeroNet的主页
- 列出所有添加的站点：名称，节点数，修改时间
- 站点操作：更新，暂停，继续，删除
- 克隆站点转换成你的博客或者论坛
- 一键更新
![](http://zeronet.readthedocs.io/en/latest/img/zerohello.png)
地址：[1HeLLo4uzjaLetFx6NH3PMwFP3qbRbTf3D](http://127.0.0.1:43110/1HeLLo4uzjaLetFx6NH3PMwFP3qbRbTf3D)
[源码](https://github.com/HelloZeroNet/ZeroHello)

## ZeroBorad
简单的消息公告例子用于动态内容分发。
- 通过授权码动态生成用户
- 实时消息更新

工作原理
- 你发送消息给站点所有者的机器人
- 机器人修改message.json文件，然后签名并发布给其他节点
- 如果网站的更新到达你的客户端，他就会显示在你的浏览器上。
![](http://zeronet.readthedocs.io/en/latest/img/zeroboard.png)
地址：[1Gfey7wVXXg1rxk751TBTxLJwhddDNfcdp](http://127.0.0.1:43110/1Gfey7wVXXg1rxk751TBTxLJwhddDNfcdp)
[源码](https://github.com/HelloZeroNet/ZeroBoard)