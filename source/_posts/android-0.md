---
title: Android开发环境配置
date: 2018-08-09 21:25:26
tags: [Android]
---
Android Studio是Google基于IntelliJ IDEA Community版本开发的定制版本，下载Android Studio需要翻墙，下载后基本按默认方式安装基本可以完成Android的开发环境配置。

IntelliJ IDEA包含了Android Studio中的所有功能，同时公司使用IntelliJ IDEA做为开发工具，所以使用IntelliJ IDEA作为开发工具就更好了。因为没有自动Android SDK，配置会繁琐一些。
## 准备
- 安装Java 8 JDK
- 安装IntelliJ IDEA 2018.2

需要确保IDEA已经正常运行，已开发Java项目。

## 配置IntelliJ IDEA
建议使用新版本（2018.2）支持页面中配置Android SDK。

关闭所有项目，此时会打开欢迎界面，在configure>settings或者在文件settings(Ctrl+Alt+S)打开系统配置，之后选择Appearenc&Behavior>system setting>Android SDK。

在Android SDK Location处点击Edit，选择相关SDK工具包，等待下载完成。
![安装Android SDK](http://of73u2ed9.bkt.clouddn.com/android%20sdk.png)

## 创建Android项目
• 在欢迎界面，创建新项目或者在File>New Project菜单中选择。
• 在项目类型选Android，可以一路默认，也可以更加自己的实际需要设置应用名，最小支持的SDK和模板等内容。
![创建Android项目](http://of73u2ed9.bkt.clouddn.com/android%20project.png)

## 注意事项
因为模拟器的原因需要关闭Windows的hyper-v，这个在安装安装SDK时会提示。