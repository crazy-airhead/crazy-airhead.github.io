---
title: 使用nvm管理Nodejs
toc: true
date: 2021-07-24 09:19:40
categories:
- frontend
- nodejs
tags:
- frontend
- nodejs
- nvm
---

## NVM是什么？

nvm(node version manager)是一个nodejs版本的管理工具。通过nvm可以方便的安装和切换不同版本的nodejs。
<!-- more -->

## 安装前准备

本文基于MacOS系统。为了统一使用nvm进行node版本的管理，需要先清除之前安装的node。

```shell
brew uninstall node
```

如果还没清理干净，可尝试如下[方法](https://www.jianshu.com/p/920961b6a538)：

```shell
sudo npm uninstall npm -g
 
sudo rm -rf /usr/local/lib/node /usr/local/lib/node_modules /var/db/receipts/org.nodejs.*
 
sudo rm -rf /usr/local/include/node /Users/$USER/.npm
 
sudo rm /usr/local/bin/node
 
sudo rm /usr/local/share/man/man1/node.1
 
sudo rm /usr/local/lib/dtrace/node.d
```

## 安装nvm

```shell
brew install nvm
```

根据提示，把提示中的内容添加到`~/.zshrc`

```shell
export NVM_DIR="$HOME/.nvm"
  [ -s "/usr/local/opt/nvm/nvm.sh" ] && . "/usr/local/opt/nvm/nvm.sh"  # This loads nvm
  [ -s "/usr/local/opt/nvm/etc/bash_completion.d/nvm" ] && . "/usr/local/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion 
```

使配置生效

```shell
source ~/.zshrc
```

## 基础命令

- 查看版本

  ```shell
  nvm ls-remote
  ```

- 安装

  ```shell
  nvm install <version>
  ```

- 切换版本

  ```shell
  nvm use <version>
  ```

- 指定默认版本

  ```shell
  nvm alias default <version>
  ```

- 查看已安装版本

  ```
  nvm ls
  ```

- 查看当前使用版本

  ```shell
  mvn current
  ```

- 卸载

  ``` shell
  nvm uninstall <version>
  ```
