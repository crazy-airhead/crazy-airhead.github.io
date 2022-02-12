---
title: 免密登录GitHub
toc: true
date: 2022-02-12 12:43:06
categories:
- git
- GitHub
- ssh
tags:
- git
- GitHub
- ssh
---

# 说明

本文基于macOS Monterey（v12.0.1）环境，不同版本可能会有所差异。

# 步骤

## 检查是否配置过sshkey

```bash
$ ls -al ~/.ssh
# ls: /Users/airhead/.ssh: No such file or directory
```

## 创建sshkey

```bash
$ ssh-keygen -t rsa -C "L4qiang@gmail.com"
# Generating public/private rsa key pair.
# Enter file in which to save the key (/Users/airhead/.ssh/id_rsa): /Users/airhead/.ssh/airhead-github/id_rsa
# 后续交互可以默认回车即可。
```

此处修改了默认的生成路径，方便后面管理不同的密钥。如无提示无效路径时，使用`mkdir -p /Users/airhead/.ssh/airhead-github` 创建对于目录。

## 创建成功

```bash
Your identification has been saved in /Users/airhead/.ssh/airhead-github/id_rsa
Your public key has been saved in /Users/airhead/.ssh/airhead-github/id_rsa.pub
The key fingerprint is:
SHA256:hh935Euebatrb1ckBz8/17t2YRwCTtiPbjwaMSKWWRM L4qiang@gmail.com
The key's randomart image is:
+---[RSA 3072]----+
|       E. o      |
|       o . +  .  |
|      + . o =  o |
|     = o o = o.o+|
|    . o S * + o+=|
|       o + O + ==|
|        . + = + *|
|         .  ...+o|
|           .o=+oo|
+----[SHA256]-----+
```

## 将公钥配置到GitHub

通过下面的语法复制公钥内容，并贴到Github上，[SSH and GPG keys (github.com)](https://github.com/settings/keys)

```
$ pbcopy < ~/.ssh/airhead-github/id_rsa.pub
```

## 添加~/.ssh/config

```textile
Host airhead-github
 Hostname github.com
 User git
 PreferredAuthentications publickey
 IdentityFile ~/.ssh/airhead-github/id_rsa
```

## 测试

```bash
ssh -T airhead-github

# This key is not known by any other names
# Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
# Warning: Permanently added 'github.com' (ED25519) to the list of known hosts.
# Hi crazy-airhead! You've successfully authenticated, but GitHub does not provide shell access.
```

## 验证提交

此处使用Hexo的博客仓库进行测试。

- 修改Hexo的配置`_config.yml`

```yml
# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  type: git
  repo: airhead-github:crazy-airhead/crazy-airhead.github.io.git
  branch: master
```

- 发布

```bash
hexo d -g
```
