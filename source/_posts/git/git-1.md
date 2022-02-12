---
title: 管理多个Github帐号
date: 2018-09-19 08:15:40
categories:
- git
tags: [Github Pages, hexo, Git, ssh]
---

## 起因

之前通过GithubPages和Hexo搭建了个人博客，在[这里](https://l4qiang.me/2016/10/05/hexo/)可看到搭建的方法。现在呢，希望用另一个帐号，管理一个不同内容的[博客](http://goldyear.info)。有了之前的经验，整个搭建的过程还是比较顺利，主要碰到的问题就是代码发布。之前github帐号，是通过Windows的[凭证管理](https://www.howto-connect.com/how-to-use-credential-manager-windows-10/)来实现的，按理说Github配置了多个帐号也是可以管理的。如图：

![crdential.png](crdential.png)

但是两套博客在发布代码的时候都出现了问题。

## 初步方案

将用户名和密码配置在Hexo的`_config.yml`的配置项中，形如

```
https://enderjo:xyz@github.com/enderjo/enderjo.github.io
```

虽然这样配置是解决了发布问题，但密码安全问题就暴露出来了，想想之前有了解到Github有ssh功能，但也没用过，初步试了下一样发现两个帐号配置的问题，github不支持同一个公钥用于不同的帐号，会提示公钥已经被使用了，请教了下前同事事了解到ssh有个config的配置。

## 最终方案

基于同事的提示刚开始创建的config如下:

```
Host github:enderjo
 Hostname github.com
 User git
 PreferredAuthentications publickey
 IdentityFile ~/.ssh/github-enderjo/id_rsa
```

Window中在用户目录`%USERPROFILE%`下。之后使用ssh测试也是通的。
如下：

```shell
$ ssh -T github.com:enderjo
Hi enderjo! You've successfully authenticated, but GitHub does not provide shell access.
```

但测试Git Clone的时候提示无法

```shell
$ git clone git@github.com:enderjo/enderjo.github.io.git
Cloning into 'enderjo.github.io'...
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

参考[Error: Permission denied (publickey)](https://help.github.com/articles/error-permission-denied-publickey/)通过ssh-add证书的方式，能正常git clone。此时已可初步判断，git clone没有正常取到config的配置。
接着同事发来这篇文章
[https://gitlab.com/gitlab-org/gitlab-ce/issues/45593](https://gitlab.com/gitlab-org/gitlab-ce/issues/45593)
其中提到，可通过如下命令查看git clone的实际执行过程：

```
GIT_TRACE=1 GIT_SSH_COMMAND="ssh -vvv" git clone git@gitlab.example.com:my-group/my-project.git
```

测试后的部分代码如下：

```
$ GIT_TRACE=1 GIT_SSH_COMMAND="ssh -vvv" git clone git@github.com:enderjo/enderjo.github.io.git
14:03:51.164492 exec-cmd.c:236          trace: resolved executable dir: C:/Program Files/Git/mingw64/bin
14:03:51.165492 git.c:415               trace: built-in: git clone git@github.com:enderjo/enderjo.github.io.git
Cloning into 'enderjo.github.io'...
14:03:51.225463 run-command.c:637       trace: run_command: unset GIT_DIR; 'ssh -vvv' git@github.com 'git-upload-pack '\''enderjo/enderjo.github.io.git'\'''
```

此时我们可以看到，实际执行的地址和测试的地址是不一样的。

```
$ ssh -T git@github.com:enderjo
$ ssh -vvv git@github.com
```

ssh命令是根据config文件中Host记录与ssh命令时所输入的主机名来进行匹配的，而git clone因为使用`:`分隔用户名。

之后查到[这篇](https://blog.csdn.net/huasonl88/article/details/52166876)文章。config文件中的Host就是一个别名。

调整config

```
Host gh-enderjo
 Hostname github.com
 User git
 PreferredAuthentications publickey
 IdentityFile ~/.ssh/github-enderjo/id_rsa
```

修改git clone命令

```
$ git clone gh-enderjo:enderjo/enderjo.github.io.git
Cloning into 'enderjo.github.io'...
remote: Counting objects: 4822, done.
remote: Compressing objects: 100% (386/386), done.
remote: Total 4822 (delta 873), reused 2292 (delta 846), pack-reused 2496
Receiving objects: 100% (4822/4822), 5.20 MiB | 215.00 KiB/s, done.
Resolving deltas: 100% (1686/1686), done.
```

测试正常，修改Hexo的_config.yml也能正常发布代码了。

## 增加Mac的配置

因为之前配置过了Windows，这里我需要把Windows中的ssh配置先拷贝到Mac上（~/.ssh）。
测试，此时会提示。

```
Permissions 0755 for '/Users/airhead/.ssh/github-enderjo/id_rsa' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "/Users/airhead/.ssh/github-enderjo/id_rsa": bad permissions
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
```

需要修改权限为400（600也可以），注意修改路径

```
chmod 400 /Users/airhead/.ssh/github-enderjo/id_rsa
```

## 小结

利用ssh的config功能可以很好的管理Git的多帐号问题，但需要注意修改Git仓库的获取地址。

虽然一直有使用Git，但对于Git和ssh还是有很多不了解的地方。

## 参考链接

[Error: Permission denied (publickey)](https://help.github.com/articles/error-permission-denied-publickey/)
[https://gitlab.com/gitlab-org/gitlab-ce/issues/45593](https://gitlab.com/gitlab-org/gitlab-ce/issues/45593)
[ssh-config配置](https://blog.csdn.net/huasonl88/article/details/52166876)
[SSH Config 那些你所知道和不知道的事](https://deepzz.com/post/how-to-setup-ssh-config.html)