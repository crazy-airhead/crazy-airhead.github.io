---
title: Howebrew 安装软件时提示不支持的 MacOs 版本
toc: true
date: 2024-11-17 16:26:16
categories:
- MacOS
- Homebrew
tags:
- MacOS
- Homebrew
---

# 问题

系统升级 macOS Sequoia 的 15.1 后，今天要安装安装 gpg 结果提示异常：`_error:
gnupg: unknown or unsupported macos version: :dunno`。

# 分析

macOS 系统版本的升级可能导致 Homebrew 识别新系统版本时出现兼容性问题，具体表现为“unknown or unsupported macOS version: :dunno”错误。通过查看 Github 的讨论（[来源](https://github.com/orgs/Homebrew/discussions/941)），发现该问题可以通过重置 Homebrew 解决。

# 处理

执行`brew docker`，检查brew是否有问题。我自己执行此命令提示如下问题：

```bash
Please note that these warnings are just used to help the Homebrew maintainers
with debugging if you file an issue. If everything you use Homebrew for is
working fine: please don't worry or file an issue; just ignore this. Thanks!

Warning: Suspicious https://github.com/Homebrew/brew git origin remote found.
The current git origin is:
  https://mirrors.aliyun.com/homebrew/brew.git

With a non-standard origin, Homebrew won't update properly.
You can solve this by setting the origin remote:
  git -C "/opt/homebrew" remote set-url origin https://github.com/Homebrew/brew
```

此时继续执行提示的命令，因为墙的原因，之前设置了国内的镜像。

```bash
git -C "/opt/homebrew" remote set-url origin https://github.com/Homebrew/brew
```

再次执行`brew docker`，提示正常。

执行`brew update-reset`，将 Homebrew 重置到官方的稳定版本：

```bash
brew update-reset
```

接着就可以执行`brew update`，更新 Homebrew 及所有组件到最新版本。

```bash
brew update
```

# 参考

[macOS系统升级Homebrew报错“unknown or unsupported macOS version: :dunno (MacOSVersionError) ”解决方法](https://blog.axiaoxin.com/post/fix-brew-macos-version-dunno-error/)


