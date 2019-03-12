---
title: Windows 10右键打开CMD窗口
toc: true
p: misc/cmd
date: 2019-01-11 08:26:11
categories:
- windows
tags:
- windows
- regedit
- cmd
---

Windows安装了Git之后，右键菜单中多了个`Git Bash Here`，挺好用的（省去了cd命令），于是对于cmd也在这样的需求。在Win7时可用Shift+右键，看到`Open Cmd Here`，而Win10打开的是Power Shell，最新的版本好像连Power Shell也没有了。

大家可能也知道，Windows家的很多东西都是可以通过修改注册表来实现的。下面是一段验证可行的注册表。
```bash
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\cmd_here]
 
@="Cmd Here"
"Icon"="cmd.exe"
 
[HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\cmd_here\command]
@="\"C:\\Windows\\System32\\cmd.exe\""
 
[HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Folder\shell\cmdPrompt]
@="Cmd Here"
  
[HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Folder\shell\cmdPrompt\command]
@="\"C:\\Windows\\System32\\cmd.exe\" \"cd %1\""

[HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\cmd_here]
@="Cmd Here"
"Icon"="cmd.exe"

[HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\cmd_here\command]
@="\"C:\\Windows\\System32\\cmd.exe\""
```

将上述文档保存为.reg文件，双击运行。右键选择`Cmd Here`，打开CMD窗口并进入当前目录。

## 参考链接
[win10下右键菜单添加“打开cmd”](https://blog.csdn.net/Mr_BEelzebub/article/details/78776104)