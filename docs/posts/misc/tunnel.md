---
date: '2018-11-02T08:27:18'
title: 打造自己的HTTPS安全遂道
categories:
  - misc
tags:
  - http tunnel
  - natapp
---
# 背景
最近刚好在做小程序的开发，需要用到本地调试，刚开始时使用`Natapp`的免费遂道，勉强能开发（域免），后面买了付费遂道，域名不变开发顺畅起来。但要真机调试时还是不行，微信不认三级域名，需要购买他的二级域名服务。转念一想还不如自己搭建一个呢，成本可控，也只要折腾一次就好，反正也能学东西。于是也就有了本文。

# 准备
- 一台云主机，可在购买[阿里云](https://promotion.aliyun.com/ntms/act/qwbk.html#share_box?spm=5176.11533457.1089570.36.15da77e3g6I8CL&aliyunapp_auto_login=true&userCode=l7irb6oi)，开放对应端口。
- 一个已经备案的域名（备案过程真是个痛苦的过程，各种资料，各种步骤，还可能审不过），并且做了二级域名泛解析。（本文假设你已经会域名解析配置）
- `Go http tunnel`，可在这里下载(https://github.com/mmatczuk/go-http-tunnel/releases)
- Let's Encrypt工具。

# 配置
## https证书
可参看[这里](http://www.infoq.com/cn/news/2018/03/lets-encrypt-wildcard-https)或[这里](https://www.jianshu.com/p/c5c9d071e395)
此处唯一要注意的就是有个域名解析的交互过程，这个在上述资料中也有说明。

记录下证书的生成位置如上文是`/etc/letsencrypt/archive/newyingyong.cn`，自动的生成路径可能不现。
## http tunnel服务器
- 服务器需要开放80,443,5223端口。
- 根据自己的服务器系统下载对应版本。
- 解压就可以了，进入目录。
- 执行如下命令，以https证书参考资料证书地址为例。
```
tunneld -tlsCrt /etc/letsencrypt/archive/goldsyear.com/fullchain.pem -tlsKey /etc/letsencrypt/archive/goldsyear.com/privkey.pem
```

## http tunnel客户端
- 根据自己的服务器系统下载对应版本
- 解压就可以了，进入目录。
- 生成客户端证书`openssl req -x509 -nodes -newkey rsa:2048 -sha256 -keyout client.key -out client.crt`,并将证书放到解压目录
- 创建`tunnel.yml`，默认读当前路径配置。
- 参考样例：
```yml
server_addr: SERVER_IP:5223
tunnels:
    webui:
        proto: http
        addr: localhost:8080
        auth: user:password
        host: goldsyear.com
```
其中,`server_addr`为服务器地址，`tunnels`为开启的遂道列表，`webui`为实际的遂道名，正常可去掉`auth`配置，`host`中的域名与遂道名无直接关系。更多配置信息参看[官网](https://github.com/mmatczuk/go-http-tunnel)。
- 启动`tunnel start-all`。

## 验证
在客户端启动最简单http服务，使用客户端配置的域名进行访问，如果正常访问，恭喜你。如果还有问题，请核查服务器或客户端配置。

# 推广
如果你觉得以上配置过于复杂。有以下两种方式供你选择，当然你可能有更好的选择。
1. 可以使用[Natapp](https://natapp.cn/)，他提供免费的HTTPS的遂道，但提供的免费域名会一直变化。最好购买遂道和域名服务，付费时可以使用我的推广优惠码`ADBE2C5C`。
2. 如果你恰好刚起步，希望用于本地调试，可以加我微信号，也可提供相关服务支持。申请时请备注`https tunnel技术支持`。![微信](https://l4qiang.me/images/wechat.png)

