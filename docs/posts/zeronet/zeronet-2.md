---
date: '2017-10-26T08:23:47'
title: ZeroNet安装
categories:
  - zeronet
tags:
  - ZeroNet
---
## 安装ZeroNet
- 下载ZeroNet安装包：[Microsoft Windows](https://github.com/HelloZeroNet/ZeroNet-win/archive/dist/ZeroNet-win.zip),[Apple macOS](https://github.com/HelloZeroNet/ZeroNet-mac/archive/dist/ZeroNet-mac.zip), [Linux 64bit](https://github.com/HelloZeroNet/ZeroBundle/raw/master/dist/ZeroBundle-linux64.tar.gz),[Linux 32bit](https://github.com/HelloZeroNet/ZeroBundle/raw/master/dist/ZeroBundle-linux32.tar.gz)
- 解压
- 运行 `ZeroNet.exe` (win), `ZeroNet(.app) `(macOS), `ZeroNet.sh`(linux)
## Debian Linux手动安装
- `sudo apt-get update`
- `sudo apt-get install msgpack-python python-gevent`
- `wget https://github.com/HelloZeroNet/ZeroNet/archive/master.tar.gz`
- `tar xvpfz master.tar.gz`
- `cd ZeroNet-Master`
- 运行`python zeronet.py`
- 浏览器中打开`http://127.0.0.1:43110`

## Vagrant
- `vagrant up`
- 访问VM`vagrant sh`
- `cd /vagrant`
- 运行`python zeronet.py --ui_ip 0.0.0.0`
- 浏览器中打开`http://127.0.0.1:43110`

## Docker
- `docker run -d -v &lt;local_data_folder&gt;:/root/data -p 15441:15441 -p 43110:43110 nofish/zeronet`
- 这个Docker镜像包含了Tor代理，默认是关闭的。注意有些节点不允许在你运行Tor。如果你需要开启，将环境变量`ENABLE_TOR`设置为`true`(默认是`false`)。比如：
`docker run -d -e "ENABLE_TOR=true" -v &lt;local_data_folder&gt;:/root/data -p 15441:15441 -p 127.0.0.1:43110:43110 nofish/zeronet`
- 浏览器中打开`http://127.0.0.1:43110`

## Virtualenv
- `virtualenv env`
- `source env/bin/activate`
- `pip install msgpack-python gevent`
- `python zeronet.py`
- 浏览器中打开`http://127.0.0.1:43110`
