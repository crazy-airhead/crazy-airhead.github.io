---
date: '2017-12-11T20:56:22'
title: 创建ZeroNet站点
categories:
  - zeronet
tags:
  - ZeroNet
---

## 最简单的方式：使用页面
- 在ZeroHello站点时，点击左边栏的“⋮ ”>"创建新的空站点"菜单
- 你会跳转到一个只有你可以修改的全新站点
You can find and modify your site's content in data/[yoursiteaddress] directory
- 你可以在`data/[你的地址]`目录找到和修改你的站点内容
After the modifications open your site, drag the topright "0" button to left, then press sign and publish buttons on the bottom
- 当你修改好你的站点后，拖动右上的"0"按钮到左边，然后点击底部的签名和发布按钮。
## 手动方式：使用命令行
1. 创建站点结构
- 如果ZeroNet在运行需要关闭
- 进入ZeroNet的安装目录，然后运行：
```
$ zeronet.py siteCreate
...
- Site private key: 23DKQpzxhbVBrAtvLEc2uvk7DZweh4qL3fn3jpM3LgHDczMK2TtYUq
- Site address: 13DNDkMUExRf9Xa9ogwPKqp7zyHFEqbhC2
...
- Site created!
$ zeronet.py
...
```
- 这样会创建你的站点的初始文件
`data/13DNDkMUExRf9Xa9ogwPKqp7zyHFEqbhC2`
>注意：使用bundle版本的Windows的用户需要进入ZeroBudle/ZeroNet目录，然后执行`"../Python/python.exe" zeronet.py siteCreate`
1. 创建/修改站点
- 更新`data/[your site address key]`目录下的网站文件（比如：13DNDkMUExRf9Xa9ogwPKqp7zyHFEqbhC2）
- 当你的站点准备好时运行：
```
$ zeronet.py siteSign 13DNDkMUExRf9Xa9ogwPKqp7zyHFEqbhC2
- Signing site: 13DNDkMUExRf9Xa9ogwPKqp7zyHFEqbhC2...
Private key (input hidden):
```
- 输入你创建网站时的私钥。这一步会对所有的文件进行签名，所以节点可以验证网站所有者的身份
1. 发布网站更新
- 为了通知节点你修改了站点内容，你需要运行如下命令：
```
$ zeronet.py sitePublish 13DNDkMUExRf9Xa9ogwPKqp7zyHFEqbhC2
...
Site:13DNDk..bhC2 Publishing to 3/10 peers...
Site:13DNDk..bhC2 Successfuly published to 3 peers
- Serving files....
```
- 这样就好了，你已经成功的将你的修改签名和发布出去了。
- 你的站点可以通过这个网址访问：
`http://localhost:43110/13DNDkMUExRf9Xa9ogwPKqp7zyHFEqbhC2`。

