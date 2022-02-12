---
title: Homebrew安装与更换源
toc: true
date: 2021-07-24 07:07:50
categories:
- MacOS
- Homebrew
tags:
- MacOS
- Homebrew
---

## Homebrew是什么

[Homebrew](https://brew.sh/)是一款Mac OS平台下的软件包管理工具，通过一条指令，就可以实现包管理，包括安装、卸载、更新、查看、搜索等功能，而不用关心各种依赖，简单方便。

<!-- more -->

## 安装

### 要求

- A 64-bit Intel CPU or Apple Silicon CPU [1](https://docs.brew.sh/Installation#1)
- macOS Mojave (10.14) (或以上版本) [2](https://docs.brew.sh/Installation#2)
- Xcode命令行工具: `xcode-select --install`, [developer.apple.com/downloads](https://developer.apple.com/downloads) or [Xcode](https://itunes.apple.com/us/app/xcode/id497799835) [3](https://docs.brew.sh/Installation#3)
- 支持shell (比如`bash`或者 `zsh`) [4](https://docs.brew.sh/Installation#4)

### 安装

```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

对于国内情况，可以加速Homebrew的安装

```shell
export HOMEBREW_BREW_GIT_REMOTE="https://mirrors.aliyun.com/homebrew/brew.git"  # put your Git mirror of Homebrew/brew here
export HOMEBREW_CORE_GIT_REMOTE="https://mirrors.aliyun.com/homebrew/homebrew-core.git"  # put your Git mirror of Homebrew/homebrew-core here
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

### 卸载

```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/uninstall.sh)"
```

### 更换源

更换源之前可以先查看源，Homebrew主要的有四部分组成：

- brew Homebrew源代码仓库
- homebrew-core Homebrew核心软件仓库
- homebrew-bottles Homebrew预编译软件
- homebrew-cask Macos客户端应用

#### 查看命令

```shell
cd "$(brew --repo)" && git remote -v
cd "$(brew --repo homebrew/core)" && git remote -v



```

#### 更换命令

```shell
cd "$(brew --repo)" && git remote set-url origin https://mirrors.aliyun.com/homebrew/brew.git

cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core" && git remote set-url origin https://mirrors.aliyun.com/homebrew/homebrew-core.git

cd "$(brew --repo)/Library/Taps/homebrew/homebrew-cask" && git remote set-url origin http://mirrors.aliyun.com/homebrew/homebrew-cask.git

echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.aliyun.com/homebrew/homebrew-bottles' >> ~/.zshrc
source ~/.zshrc


```

如果是10.15之前的版本，主要将`~/.zshrc`替换成`~/.bash_profile`。

## 基础命令

- 安装包

  ```shell
  brew install <packageName>
  ```

- 卸载包

  ```shell
  brew uninstall <packageName>
  ```

- 查询可用包

  ```shell
  brew search <packageName>
  ```

- 更新包

  ```shell
  brew upgrade <packageName>
  ```

- 查看已安装包列表

  ```shell
  brew list
  ```

- 查看包信息

  ```shell
  brew info <packageName>
  ```

- 更新Homebrew

  ```shell
  brew update
  ```

- 查看Homebrew版本

  ```shell
  brew -v
  ```

- Homebrew帮助信息

  ```shell
  brew -h
  ```
