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
### 消息公告示例
- 通过授权码动态生成用户
- 实时消息更新

### 工作原理
- 你发送消息给站点所有者的机器人
- 机器人修改message.json文件，然后签名并发布给其他节点
- 如果网站的更新到达你的客户端，他就会显示在你的浏览器上。
![](http://zeronet.readthedocs.io/en/latest/img/zeroboard.png)
地址：[1Gfey7wVXXg1rxk751TBTxLJwhddDNfcdp](http://127.0.0.1:43110/1Gfey7wVXXg1rxk751TBTxLJwhddDNfcdp)
[源码](https://github.com/HelloZeroNet/ZeroBoard)

## ZeroBlog
### 个人博客示例
- 内置内容编辑器
- Markdown语法
- 代码高亮
- 只要网页就可以签名和发布网站
### 工作原理？
- 你可以通过页面修改`data.json`
- 点击`Sign & Publsh new conent`按钮时会要求私钥（创建新站点时[生成](http://zeronet.readthedocs.io/en/latest/using_zeronet/create_new_site/)）
- 你的ZeroNet客户端签名新的，修改的文件并把文件发布到其他节点。
- 只要还有一个节点是活动的，你的站点就可以访问。
![](http://zeronet.readthedocs.io/en/latest/img/zeroblog.png)
地址：[1BLogC9LN4oPDcruNz3qo1ysa133E9AGg8](http://127.0.0.1:43110/1BLogC9LN4oPDcruNz3qo1ysa133E9AGg8)
或者[blog.zeronetwork.bit](http://127.0.0.1:43110/blog.zeronetwork.bit)
[源码](https://github.com/HelloZeroNet/ZeroBlog)

## ZeroTalk
### 去中心化的，P2P论坛示例
- 创建，修改，删除主题和消息
- 主题和消息投票
- 仅有一次和站点所有者的联系，就是在请求修改网站授权的时候。
- 留言和内容修改直接会推送给其他节点
- 只有你可以签名和修改你的文件。
- 实时的消息显示
### 工作原理
- 要参与网站的互动，你需要从ZeroID提供者那里注册一个证书（一个加密签名）
- 有了证书之后，你就可以发布内容（消息，主题，投票）给其他节点了。
[](http://zeronet.readthedocs.io/en/latest/img/zerotalk.png)
地址：[1TaLkFrMwvbNsooF4ioKAY9EuxTBTjipT](http://127.0.0.1:43110/1TaLkFrMwvbNsooF4ioKAY9EuxTBTjipT) 或者[talk.zeronetwork.bit](http://127.0.0.1:43110/talk.zeronetwork.bit)

[源码](https://github.com/HelloZeroNet/ZeroTalk)

## ZeroMail
端到端加密，分布式，点对点消息站点。为了提高隐私安全使用了与比特消息类似的解决方案，这样就不会暴露收件人信息。
- 使用ECISE用于私密传输，采用AES256进行消息编码。
- 当你第一次访问网站的时候，你的公钥会添加到你的数据文件中，这样其他人就可以给你发消息了。
- 每个人都尝试解密消息，这使得要找出消息接收人成为不可能，从而提高了隐私性。
- 为了减少消息负载和加快消息解密速度，我们重用了AES密钥，但是每次都会生成一个新的IV。
![](http://zeronet.readthedocs.io/en/latest/img/zeromail.png)
地址:[1MaiL5gfBM1cyb4a8e3iiL8L5gXmoAJu27](http://127.0.0.1:43110/1MaiL5gfBM1cyb4a8e3iiL8L5gXmoAJu27)或者[mail.zeronetwork.bit](http://127.0.0.1:43110/mail.zeronetwork.bit)
[源码](https://github.com/HelloZeroNet/ZeroMail)

## ZeroChat
一个完整的网站用于演示如何使用ZeroNet在不到用不到时100行的代码创建一个server-less，SQL后台，实时更新的P2P聊天应用。
- 选择ZeroID证书
- 用SQL数据库存储消息
- 实时创建和分布消息
- 实时更新消息
![](http://zeronet.readthedocs.io/en/latest/img/zerochat.png)
地址：[1AvF5TpcaamRNtqvN1cnDEWzNmUtD47Npg](http://127.0.0.1:43110/1AvF5TpcaamRNtqvN1cnDEWzNmUtD47Npg)
ZeroBlog上的教程：[第1部分](http://127.0.0.1:43110/Blog.ZeroNetwork.bit/?Post:43:ZeroNet+site+development+tutorial+1),[第2部分](http://127.0.0.1:43110/Blog.ZeroNetwork.bit/?Post:46:ZeroNet+site+development+tutorial+2)

## ZeroMe
去中心化的，类Twitter的P2P社交网络。
- 在ZeroMe的用户注册表中存储用户信息
- 将发布和留言存储在叫Hub的MergeSite中
- 通过选择文件来上传图片。
- 实时显示活动订阅
![](http://zeronet.readthedocs.io/en/latest/img/zerome.png)
地址：[1MeFqFfFFGQfa1J3gJyYYUvb5Lksczq7nH](http://127.0.0.1:43110/1MeFqFfFFGQfa1J3gJyYYUvb5Lksczq7nH)
[源码](https://github.com/HelloZeroNet/ZeroMe)

## ReactionGIFs
选择文件示例，视频文件只有浏览器请求时才会下载。
![](http://zeronet.readthedocs.io/en/latest/img/reactiongifs.jpg)
地址[1Gif7PqWTzVWDQ42Mo7np3zXmGAo3DXc7h](http://127.0.0.1:43110/1Gif7PqWTzVWDQ42Mo7np3zXmGAo3DXc7h)
[源码](https://github.com/HelloZeroNet/ReactionGIFs)
