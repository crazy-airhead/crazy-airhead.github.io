---
title: 基于Docker部署Nginx并配置反向代理
toc: true
p: nginx/docker-deploy
date: 2019-10-21 10:21:48
categories:
- nginx
- docker
tags:
- nginx
- docker
---

## 背景

我们采用开发直接上线署的方式来快速开发，但因客户已经开始正式使用我司开发的小程序了，为了减少对客户的影响，现在需要额外部署一套开发环境。这个时候首先想到的就是通过Nginx来进行反向代理，开发环境使用二级域名，（如https://dev.zai500.com），方便开发小程序时候使用。因为中间有一些部署前没有碰过的问题，记录下来，以便后期项目时注意。

##  证书转换

公司项目是从SpringBoot转换到jfinal的，所以之前使用的是JKS格式的证书，需要进行转换，当然如果可以重新申请也能获得不同格式的证书。

### jks格式转pkcs12

```sh
keytool -importkeystore -srckeystore server.keystore -destkeystore server.p12 -srcalias serverkey -destalias serverkey -srcstoretype jks -deststoretype pkcs12 -srcstorepass 111111 -deststorepass 111111 -noprompt
```

#### 参数说明

- importkeystore 指示导入导出keystore文件，可用于同类型或不同类型的导入导出
- srckeystore 指示源keystore文件
- srcalias 指示源实体别名
- srcstoretype 指示源store类型(jks/pkcs12..)
- srcstorepass 指示源store密码
- noprompt 不弹出提示

### 查看jks信息

如果不清楚scralias可能通过如下命令来查看

```sh
keytool -list -keystore server.jks
```

##  创建Nginx容器

因为我们的应用是使用Docker部署的，我们很自然的，使用Docker来部署Nginx。

###  拷贝配置

```sh
docker run -p 80:80 -p 443:443 --name nginx -it nginx:stable
docker container cp nginx:/etc/nginx .
```

以上命令用将nginx的配置信息拷贝到宿主机的当前目录，之后可以将`nginx`改成`conf`

### 重新创建容器

现在映射配置目录，不采用文件映射的方式，因为我们需要配置证书。

```sh
docker stop nginx
docker rm nginx
docker run -p 80:80 -p 443:443 --name nginx -v /data/nginx/conf:/etc/nginx -it nginx:stable
```

注意这里不使用文件的直接映射，因为需要配置证书。

###  修改配置

#### 将证书文件放置在`conf`目录下

```sh
- zai500.com
--- server.crt
--- server.key
- dev.zai500.com
--- server.crt
--- server.key
```

#### 修改nginx.conf

```nginx
server {
    listen 443 ssl;
    server_name dev.zai500.com;
    ssl_certificate dev.zai500.com/server.crt;
    ssl_certificate_key dev.zai500.com/server.key;
    ssl_session_timeout 5m;

    location / {
            proxy_pass http://172.17.0.1:9080;
            proxy_set_header Host $host:$server_port;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_hide_header Vary;
            proxy_set_header Accept-Encoding '';
            proxy_set_header Referer $http_referer;
            proxy_set_header Cookie $http_cookie;

            proxy_connect_timeout 300s;
            proxy_send_timeout 900;
            proxy_read_timeout 900;
    }

    location /im.ws {
            proxy_pass http://172.17.0.1:9080/im.ws;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
    }
}
```
**注意事项**

- 为减少对外暴露的端口，proxy_pass使用宿主机IP，可能通过`ip addr show docker0` 来查看，其中`inet 172.17.0.1/16`部分可获取。
- 如查有静态资源的访问需要配置好X-Forwarded-Proto和undertow（我自己是修改来程序逻辑），否则会出现Mixed Content的错误。
- WebSocket的代理需要额外配置。

## 小结

本次Nginx的调整除了方便之后开发外，也加强了自己对Ng配置的理解。中间因为Mixed Content的处理多花费了不少时间。

## 参考资料

![](/images/geek-time-ads/深入理解Nginx.jpeg)

https://blog.csdn.net/liuchuan_com/article/details/54376258

https://yq.aliyun.com/articles/617244

https://www.cnblogs.com/mafly/p/websocket.html