---
title: CORS 跨域资源共享
date: 2018-05-12 11:09:50
categories:
- frontend
- security
tags: 
- CORS
---

# 原因
因为使用Angular来调用ipfs的API时出现403禁止访问错误，首先判断的是跨域问题，尝试如下内容：直接在浏览器中输入URL访问可以，通过代理或浏览器的允许跨域设置依然是403错误。
通过查看ipfs的文档（https://github.com/ipfs/js-ipfs-api），IPFS服务器默认不支持跨域请求，需要修改配置文件。
```shell
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"http://example.com\"]"
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"
```
修改配置，重启IPFS之后正常访问IPFS的API。

# 分析
对于CORS没有理解，通过查看Wiki整理下对CORS，加深理解。为什么浏览器中可以访问而前端调用不行？
直接在浏览器中可以直接访问是因为他是第一下资源地址，是一个GET请求，不是跨域请求。
Angular中请求时，是一个XHR请求，且与第一个资源地址不同，是跨域请求。

# 跨域资源共享
跨域资源共享是一种机制，它允许受限的访问第一个访问资源域以外的资源（如字体）的机制。一张网页通常包含了很多跨域的图片，样式，脚本，iframes，或者视频。一些跨域请求，尤其是Ajax请求，会因为默认的[同源安全策略](https://en.wikipedia.org/wiki/Same-origin_policy)而被禁止访问。

CORS定义了浏览器和服务器如何来决定一个跨域请求是安全的。它比完全同源请求有更多的自由和功能，但不要只是简单地允许所有跨源请求。CORS规范最初是作为W3C推荐标准发布的，但该文档已经过时。 [Fetch Living Standard](https://fetch.spec.whatwg.org/)是当前维护活跃的规范。

## 同源判断规则
绝对路径，需要是协议，域名，端口号三者与第一个访问的资源（浏览器中输入的URL）相同，才被认为是同源。
## CORS工作机制
CORS标准新增了一组HTTP消息头，它为浏览器和服务器之间提供了一种有权限时才请求远程URL的方法。虽然服务器可以执行一些验证和授权，但浏览器通常有责任支持这些消息头并执行相关限制。

对于可以修改数据的Ajax和HTTP请求方法(通常是GET以外的HTTP方法，或者用于某些MIME类型的POST使用)，规范要求浏览器“预先执行”请求，使用HTTP的OPTIONS方法从服务器请求受支持的方法，然后在服务器“批准”后，使用实际的HTTP请求方法发送实际请求。服务器还可以通知客户端是否应该通过请求发送“凭据”(包括Cookies和HTTP身份验证数据)。
[cors](https://en.wikipedia.org/wiki/File:Flowchart_showing_Simple_and_Preflight_XHR.svg)

## CORS相关消息头
### 请求头
- Origin
- Access-Control-Request-Method
- Access-Control-Request-Headers
### 响应头
- Access-Control-Allow-Origin
- Access-Control-Allow-Credentials
- Access-Control-Expose-Headers
- Access-Control-Max-Age
- Access-Control-Allow-Methods
- Access-Control-Allow-Headers

Access-Control-Allow-Origin: *

“*”的值是特殊的，因为它不允许请求提供凭据，这意味着不允许发送HTTP身份验证、客户端SSL证书和Cookie等原因。
