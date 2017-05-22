---
title: qmake手册
date: 2017-04-30 20:52:21
tags: [Qt,qmake]
---

# qmake手册
qmake简化了跨平台的项目的构建过程。它自动化生成MakeFile，因此只要几行信息来创建Makefile。无论是不是QT项目，你都可以用qmake来编译。

qmake基于一个项目文件的信息来自动生成Makefile。项目文件是由开发人员来编写的，通常也很简单，但更复杂的项目的项目文件也会更复杂一些。

qmake包含额外的功能用于支持QT的开发，自动包含了moc和uic的构建规则。

在不需要修改项目文件的情况下，qmake也可以生成Microsoft Visual studio的项目。

# 目录

- 概述
- 入门
- 创建项目文件
- Building Common 
- Project Types
- Running qmake
- Platform Notes
- qmake Language
- Advanced Usage
- Using Precompiled Headers
- Configuring qmake
- Reference
    - Variables
    - Replace Functions
        - Built-in Replace Functions
    - Test Functions
        - Built-in Test Functions
        - Test Function Library


