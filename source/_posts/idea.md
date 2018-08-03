---
title: IntelliJ IDEA授权
date: 2018-08-03 20:57:00
tags: [idea,java]
---
> 建议购买Jetbrains正版授权。

## 起因
IntelliJ IDEA出了新版本(2018.2)，之前使用网上找的LicenseServer地址，更新后无法正常使用了。查看[文档](http://blog.lanyus.com/archives/326.html/comment-page-10#comments)时发现如下方法可激活。

因为评论内容，评论多了可能不好找，摘录下来，另外自己在配置时一些地方没有搞懂，还是记录下来的好。

之前听说javaagent很强大，现在看来确实是的。

## 方法
> Rover updated his crack for Jetbrains 2018.2 releases. Download it here: [http://bit.ly/jetbrainscrack210](http://bit.ly/jetbrainscrack210)
> 
> Usage:
> 1. Remove any license you had before.
> 2. Click "Configure" -> "Edit Custom VM Options ..."
> 3. Append "-javaagent:{JetbrainsCrackPath}" to end line.
> ie: -javaagent:~/JetbrainsCrack-2.10-release-enc.jar
> 4. Restart IDE
> 5. Click Register
> 6. Select "Activation Code"
> 7. Enter any character.
> 
> Registered to Rover12421/Rover12421
> 
>If you prefer not to see Rover12421 you can paste the below code to the Activation Code, and it will be licensed to "Lanyus/ Not Me", change the "Lanyus" and "Not Me" to your own liking.
```json
{"licenseId":"ThisCrackLicenseId",
"licenseeName":"Lanyus",
"assigneeName":"Not Me",
"assigneeEmail":"rover12421@163.com",
"licenseRestriction":"By Rover12421 Crack, Only Test! Please support genuine!!!",
"checkConcurrentUse":false,
"products":[
{"code":"II","paidUpTo":"2099-12-31"},
{"code":"DM","paidUpTo":"2099-12-31"},
{"code":"AC","paidUpTo":"2099-12-31"},
{"code":"RS0","paidUpTo":"2099-12-31"},
{"code":"WS","paidUpTo":"2099-12-31"},
{"code":"DPN","paidUpTo":"2099-12-31"},
{"code":"RC","paidUpTo":"2099-12-31"},
{"code":"PS","paidUpTo":"2099-12-31"},
{"code":"DC","paidUpTo":"2099-12-31"},
{"code":"RM","paidUpTo":"2099-12-31"},
{"code":"CL","paidUpTo":"2099-12-31"},
{"code":"PC","paidUpTo":"2099-12-31"},
{"code":"DB","paidUpTo":"2099-12-31"},
{"code":"GO","paidUpTo":"2099-12-31"},
{"code":"RD","paidUpTo":"2099-12-31"}
],
"hash":"2911276/0",
"gracePeriodDays":7,
"autoProlongated":false}
```
## 补充
如果是新装或者完全清理了之前版本，步骤1是可以不用执行的。

步骤2是需要特别注意的地方，菜单位置为"Help"->"Edit Custom VM Options ..."，因系统未授权，不能进入，需要手动修改相关文件。

参考官网文档：
- [VM配置](https://intellij-support.jetbrains.com/hc/en-us/articles/206544869-Configuring-JVM-options-and-platform-properties)
- [设置配置](https://intellij-support.jetbrains.com/hc/en-us/articles/206544519)

修改内容：

1. 在安装目录找到对应版本的vm配置文件(IDE_HOME\bin\<product>[bits][.exe].vmoptions) 
2. 将文件拷贝到配置目录(<SYSTEM DRIVE>\Users\<USER ACCOUNT NAME>\.<PRODUCT><VERSION>)的config目录下。如果未生成该目录，运行Idea进行初始配置就可生成。
3. 增加-javaagent。
