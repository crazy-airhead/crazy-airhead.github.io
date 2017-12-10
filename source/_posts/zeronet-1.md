---
title: ZeroNet常见问题
date: 2017-10-26 08:22:20
tags: [ZeroNet]
---
## 我需要开放端口么？
这个是可选的，如果你只是浏览和使用ZeroNet，你可以不需要开放端口。如果你要创建一个站点，强烈推荐你要开放一个端口。
ZeroNet在启动时会尝试用UPnP来打开一个端口，如果失败了，你需要手动开启：
- 通过`http://192.168.1.1 `或者 `http://192.168.0.1`来访问你的路由器页面。
- 查找`开启UPnP支持`的类似选项，然后重启ZeroNet。
如果还是不起作用，查看`端口转发`章节。不同的路由器各有不同。转发端口是15441。

## ZeroNet是匿名的么？
ZeroNet没有比BitTorrent提供更多的匿名性，但随着节点的增加，隐私（找到评论或站点所有者）会变得严峻。
ZeroNet在匿名网络中也做了一些工作：你可以使用Tor网络轻松的隐藏你的IP。
## 在Tor浏览器中如何使用ZeroNet？
推荐使用Tor浏览器来使用ZeroNet：
- 启动Tor Browser
- 打开`abaut:perferences#advanced`
- 点击`设置`
- 在不需要代理的输入框中填入`127.0.0.1`
- 在浏览器中打开`http://127.0.0.1:43110`
如果你看到的是空白页面，点击工具栏上的无脚本按钮，选择临时允许所有页面，重新加载页面。

## 在ZeroNet中如何使用Tor?
如果你希望隐藏你的IP，安装ZeroNet的最新版本然后点南Tor>每个连接都启动Tor。

在Windows上Tor和ZeroNet是打包在一起的，ZeroNet在第一次运行的时启尝试下载和解压Tor。如果因为某些情况安装失败了，可以根据`core\tools\tor\manual_install.txt`的说明来安装。

其他操作系统根据[安装说明](https://www.torproject.org/docs/installguide.html)进行安装，修改你的torrc的配置文件，把`# ControlPort 9051`的`#`去掉，然后重启你的Tor服务和ZeroNet。
> 提示：你可以通过ZeroNet的[状态页](http://127.0.0.1:43110/Stats)来验证你的IP。
> 提示：如果你连接时发生错误，请检查你是否安装了最新版本的Tor（需要0.2.7.5以上版本）

# Linux系统中ZeroNet如何使用Tor？
更新最新版本的Tor（我们需要0.2.7.5+版本），执行这些[操作](https://www.torproject.org/docs/debian.html.en)。以Debian为例：
```
echo 'deb http://deb.torproject.org/torproject.org jessie main'>> /etc/apt/sources.list.d/tor.list
```
```
gpg --keyserver keys.gnupg.net --recv 886DDD89
```
```
gpg --export A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 | apt-key add -
```
```
apt-get update
```
```
apt-get install tor
```
修改配置文件开启控制协议：
```
mcedit /etc/tor/torrc
```
删除`ControlPort 9051`和`CookieAuthentication 1`(大概在57行)的`#`字符。
```
/etc/init.d/tor restart
```
通过`usermod -a -G debian-tor [yourlinuxuser]`来授权访问cookie。（如果不是使用Debian通过`ls -al /var/run/tor/control.authcookie`的查看文件的用户组）。
注销/登录来使修改生效。
>提示：可以通过`echo 'PROTOCALINFO' | nc 127.0.0.1 9051`来验证Tor是否正常运行。
>提示：你可以不修改Tor的配置，仅通过`zeronet.py --tor disabe --proxy 127.0.0.1:9050 --disable_udp`来使用Tor，但这样你会失去与其他.onion地址通话的能力。

## 能否使用一个配置文件？
你可以把选项配置在`zeronet.conf`文件中。比如：
```
[global]
data_dir = my-data-dir
log_dir = my-log-dir
ui_restrict =
 1.2.3.4
 2.3.4.5
```
使用`zeronet.py --help`命令查看所有的选项。

## 如果ISP和政府屏蔽了Tor如何使它工作？
ZeroNet暂时未包含[Tor pluggable transports](https://www.torproject.org/docs/pluggable-transports.html.en)。访问Tor网络的最简单的方法就是使用Tor浏览器。修改它的配置开启可拨插传输，然后修改ZeroNet的配置，使用Tor浏览器代理和控制端口。
通过`--tor_controller 127.0.0.1:9151 --tor-proxy 127.0.0.1:9150`来启动ZeroNet或者在`zeronet.conf`中添加如下参数：
```
[global]
tor_controller = 127.0.0.1:9151
tor_proxy = 127.0.0.1:9150
```

## 不同机器可以使用相同用户名么？
可以，只要你把`data/user.json`文件拷贝到时你的新机器就可以了。

## 如何创建一个“特殊”的网站地址？
通过[vanitygen](https://bitcointalk.org/index.php?topic=25804.0)来生成。一旦你生成了你的key,创建`data/你的key`目录。在这个目录下放一些文件。
然后访问`http://127.0.0.1:43110/你的key/`.将`0`按钮拖到左边，然后用侧边栏来注册你的网站。

## 如何注册一个.bit的域名。
你可以通过[Namacoin](https://namecoin.info/)来注册一个.bit域名。通过GUI客户端或者[命令行接口](http://www.christopherpoole.net/registering-a-bit-domain-with-namecoin.html)来管理你的域名。
一旦你注册完成，你需需增加一个`zeronet`节点来记录它。比如：
```
{
...
    "zeronet": {
        "": "1EU1tbG9oC1A8jz2ouVwGZyQ5asrNsE4Vr",
        "blog": "1BLogC9LN4oPDcruNz3qo1ysa133E9AGg8",
        "talk": "1TaLk3zM7ZRskJvrh3ZNCDVGXvkJusPKQ"
    },
...
}

```
""是顶级域名，其他的是子域名。
>提示:你可以通过[shapeshift.io](https://shapeshift.io/)来购买比特币或者其他加密货币的Namecoin。
>提示:一些可以注册.bit域名的站点：[domaincoin.net](https://domaincoin.net/), [peername.com](https://peername.com/), [dotbit.me](https://dotbit.me/)
>提示：你可以在[namecha.in](http://namecha.in/)中验证你的域名。比如:`zeorid.bit`
>提示：在域名中只能使用小写字母，数字和-。
>提示：要让ZeroHello显示你的域名而不是比特币网址，你需要在`content.json`中增加`domain`键.比如：
```
{
"address": "1BLogC9LN4oPDcruNz3qo1ysa133E9AGg8",
 "background-color": "white",
 "cloneable": true,
 "description": "Blogging platform Demo",
 "domain": "Blog.ZeroNetwork.bit",
}
```
## 我是否可以通过生成的网站地址/私钥来接收比特币支付？
是的，这个地址是一个标准的比特币地址。私钥也是WIF格式的，因此你可以把它导到大部分的客户端里。
>提示：建议不要在你的网站地址中放太多钱，因为每次更新你的网站的时候就需要使用你的私钥。

## 当有人托管恶意内容时会发生什么？
Zeronet的网站是沙箱化的，他们的拥有权限和你在互联网上访问的其他站点一样。你可以完全控制托管理的内容。如果你发现可疑内容，你随时都可以停止托管。

## 能否通过远程的方式来安装ZeroNet？

## 有什么方式可以跟踪ZeroNet使用的带宽？
ZeroNet的侧边栏会展示发送和接收的字节（将`0`按钮拖到左边打开侧边栏）。
>提示：所有连接的统计`http://127.0.0.1:43110/Stats`

## 当两个人用相同的key来更新网站时会发生什么？
每个content.json是有时间戳的，所有的客户端只接收最新的那个。

## ZeroNet是否使用了比特币的区块链？
没有，Zeronet只是使用了比特币的加密算法用于网站地址和内容签名和验证。用户的标识是基于比特币的[BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)格式

Namecoin的区块链用于域名注册。

## ZeroNet是否只支持HTML和CSS的网站？
ZeroNet is built for dynamic, real-time updated websites, but you can serve any kind of files using it. (VCS repositories, your own thin-client, database, etc.)

ZeroNet用于构建动态和实时更新的站，或者任何的文件类型（VCS仓库，瘦客户端，数据库等等）

## 如何创建一个ZeroNet网站？
按[操作说明](http://zeronet.readthedocs.io/en/latest/using_zeronet/create_new_site/)

## 运行的原理是什么？
- 当你打开一个新的站点，需要访问者在BitTorrent网络的IP地址。
- 首先下载content.json文件，这个文件包含了所有的文件名，散列和网站所有者的加密签名。
- 通过网站地址和文件中的网站所有者的签名来验证下载的content.json文件。
- 下载其他文件（html，css，js……）并通过content.json中的SHA512散列值进行验证。
- 你会托管所有你访问过的网站。
- 如果网站的所有者（拥有网站私钥的人）修改了网站，然后他签名一个新的content.json并发布到各个节点。当节点验证了content.json的真实性（通过签名），下载修改的文件并发布给其他节点。
更多信息：[ZeroNet简单网站介绍](http://zeronet.readthedocs.io/en/latest/using_zeronet/sample_sites/)，[ZeroNet工作原理幻灯片](https://docs.google.com/presentation/d/1_2qK1IuOKJ51pgBvllZ9Yu7Au2l551t3XBgyTSvilew/pub)