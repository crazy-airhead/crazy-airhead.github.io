---
date: '2020-05-19T14:03:51'
title: 使用VSCode+Docker搭建PHP远程开发环境
categories:
  - VSCode
  - Docker
  - PHP
tags:
  - VSCode
  - Docker
  - PHP
---

## 为什么

搭建VSCode+Docker搭建PHP远程开发环境搭建，主要解决以下几个问题：

- 微信开发调试问题。

- 随时随地办公问题(具体参看[code-server](https://github.com/cdr/code-server))。

- 减少本地环境污染，PHP与Node版本可能冲突(dyld: Library not loaded: /usr/local/opt/icu4c/lib/libicui18n.64.dylib)。

- 减少硬盘使用。
  
  <!-- more -->
  
  ## 基础环境

### 本地

- MacOS

- VSCode

- Docker Desktop

### 远程

- CentOS

- Docker CE

本机不使用MacOS，而用Windows，准备好SSH工具应该也没问题。远程服务器，推荐购买[阿里云](https://www.aliyun.com/acts/hotsale?userCode=l7irb6oi)，使用*NIX系统都没有问题。

## 步骤

- 配置ssh登录远程服务器

- 安装Docker

- 安装PHP

- 安装Nginx

- 配置VSCode

- 测试

以上为使用VSCode+Docker搭建PHP远程开发环境搭建的主要过程。

## 配置SSH远程登录

在本机上生成密钥对，然后把公钥放到服务器相应用户的`~/.ssh`目录，开启服务器SSH配置。

### 生成密钥

进入`~/.ssh`如果有管理多个ssh，最好`~/.ssh`

```bash
mkdir ~/.ssh/aliyun
cd ~/.ssh/aliyun
ssh-keygen
```

系统会询问你文件名和秘钥密码，可以一路回车过去，会生成两个文件：

- id_rsa 私钥
- id_rsa.pub 公钥

### 服务器ssh配置

把上一步生成的公钥发送到服务器(scp,FillZilla等)上，然后在服务器上执行下面命令。（**authenrized_keys的权限必须是600或更小**，否则会连接失败）。

```bash
cat id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

修改服务器上的ssh配置文件，位置：/etc/ssh/sshd_config

```bash
RSAAuthentication yes
PubkeyAuthentication yes

PermitRootLogin no //禁止root登录
PasswordAuthentication yes //允许密码登录，根据你的情况设置
```

然后重启ssh服务

```bash
systemctl restart sshd
```

配置别名

```bash
Host server_alias(你的服务器别名)
 HostName test.com/192.168.1.1(域名或IP)
 Port 22
 User user
 Identifier id_rsa
```

保存后，登录时只需执行

```bash
ssh server_alias
```

## 安装Docker

Docker安装无特殊说明，参考官方文档进行安装即可，本机Docker可以不用启动。

### 本机

[https://docs.docker.com/docker-for-mac/install/](https://docs.docker.com/docker-for-mac/install/)

### 远程

[https://docs.docker.com/engine/install/centos/](https://docs.docker.com/engine/install/centos/)

## 安装PHP

因为需要安装PHP扩展，所以通过编写Dockerfile来生成镜像。通过https://hub.docker.com/_/php 可以查看相关配置。注意修改国内源，同时不要使用最新版本镜像，否则下载依赖包时可能出现问题。如下是我的 Dockerfile，大家可以参考。

```dockerfile
FROM php:7.3-fpm
LABEL maintainer="L4qiang@gmail.com"
LABEL Description="PHP7.3开发环境"

# dependency
RUN sed -i 's#http://deb.debian.org#https://mirrors.163.com#g' /etc/apt/sources.list \
    && apt-get update \
    && apt-get install -y net-tools dnsutils inetutils-ping wget git unzip

# composer
RUN curl -sS https://getcomposer.org/installer | php
RUN mv composer.phar /usr/local/bin/composer
RUN chmod +x /usr/local/bin/composer
RUN composer config -g repo.packagist composer https://packagist.phpcomposer.com

# php-ext
RUN docker-php-ext-install -j$(nproc) bcmath calendar exif gettext sockets dba mysqli pcntl pdo_mysql shmop sysvmsg sysvsem sysvshm iconv
RUN pecl install xdebug && docker-php-ext-enable xdebug

RUN apt-get install -y --no-install-recommends libfreetype6-dev libjpeg62-turbo-dev libpng-dev \
    && docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ \
    && docker-php-ext-install -j$(nproc) gd

RUN apt-get install -y --no-install-recommends libzip-dev && \
    rm -r /var/lib/apt/lists/* && \
    docker-php-ext-install -j$(nproc) zip
```

### 构建容器

```bash
docker build -t php-dev .
docker run --name -d -p 9000:9000 -v /data/Workspace/www:/var/www/html -v /data/Workspace/log/php:/var/log/php php-dev
```

## 安装Nginx

在远程服务器用Docker安装Nginx，通过https://hub.docker.com/_/nginx 可以查看一些配置。一般会将nginx的整个配置目录 copy 到本地一份，然后在运行的时候将目录绑定到 nginx 容器的配置目录

### 获取配置

```bash
docker run --name tmp-nginx -d nginx
docker cp tmp-nginx:/etc/nginx /data/nginx/conf
docker rm -f tmp-nginx
```

### 修改配置

```nginx
    server {
       charset utf-8;
       client_max_body_size 128M;

       listen 80; ## listen for ipv4
       server_name php.goldsyear.com;

       root /var/www/html/;
       index       index.php;

       location / {
            try_files $uri $uri/ /index.php$is_args$args;
        }

        location ~ ^/assets/.*\.php$ {
            deny all;
        }

       location ~ \.php$ {
           include fastcgi_params;
           fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
           fastcgi_pass 172.17.0.1:9000;
       }

       location ~* /\. {
           deny all;
       }
    }
```

**注意**`/var/www/html/`为php-dev中的地址。`172.17.0.1`为docker宿主网卡地址，可通过`ip addr show docker0` 来查看，一般为`172.17.0.1`。

### 构建容器

```bash
docker run -p 80:80 --name nginx -v /data/nginx/conf:/etc/nginx -d nginx:stable
```

## VSCode配置

### 安装Remote Development插件

打开VSCode，切换到插件面板，搜索Remote Development并安装，会同时安装Remote-WSL，Remote-Containers，Remote-SSH这三个插件。

### 配置SSH

创建工作目录，如`/Users/airhead/WorkSpace/followme/docker`

使用VSCode打开目录，增加.vscode\settings.json

```json
{
    "docker.host": "ssh://root@ip",
    "terminal.integrated.shellArgs.osx": ["-s", "ssh-add ~/.ssh/goldsyear-aliyun/id_rsa"]
}
```

注意，docker.host不是一个地址不能使用别名。

## 测试

此时切换的VSCode的Docker面板，会看到`php-dev`(根据自己的情况查看)，右键`Attach Visual Studio Code`，会打开一个新的VSCode。

打开目录/var/www/html，创建inde.php

```php
<?php
    echo phpinfo();
?>
```

使用浏览器查看或用wget查看

```bash
wget http://php.goldsyear.com/index.php -O index.html
2020-05-19 16:20:51 (1.25 MB/s) - ‘index.html’ saved [99370]
```

## 总结

通过以上的配置就可以在VSCode中远程开发了，此次配置PHP远程开发环境，最容易出现问题的地方是PHP镜像的构建，可能会因为各种原因出错，要保持耐心多试几次。

## 参考链接

- [ssh-keygen](https://yq.aliyun.com/articles/654813)

- [管理多个Github帐号](https://l4qiang.me/2018/09/19/git/git-1/)

- [Developing inside a Container](https://code.visualstudio.com/docs/remote/containers)

- [避坑！用 Docker 搞定 PHP 开发环境搭建](https://www.php.cn/php-weizijiaocheng-427163.html)
