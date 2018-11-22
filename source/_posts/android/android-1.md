---
title: Hbuilder 5+SDKAndroid原生工程
date: 2018-08-09 21:32:12
categories:
- Android
tags: [android, hbuilder]
---
## 准备
本文主要参考[使用新版本5+SDK创建最简Android原生工程（Android studio）](http://ask.dcloud.net.cn/article/13232)和 [Android离线打包](http://ask.dcloud.net.cn/article/38)。如有未说明清楚之处，参看官方文档。

下载最新版本5+SDK,[下载地址](http://ask.dcloud.net.cn/article/103)， 将SDK解压到任意目录，目录结构如下，以下统称为5+SDK目录。

![](http://of73u2ed9.bkt.clouddn.com/hbuilder12.png)
## 新建Android工程
从欢迎界面或者文件>新建工程，选择Android类型的项目，使用默认配置或者根据需要做相关调整。创建Anroid应用本身不是本文重点。如果有问题可以删了重来，建个一两次基本没问题了。
![新建Android工程](http://of73u2ed9.bkt.clouddn.com/android%20project.png)

## 配置Hbuilder
**注意将项目树使用Project方式显示，以便说明内容不引起误解**。

### 删除原生文件
删除原生工程中java目录下系统默认创建的源代码

![](http://of73u2ed9.bkt.clouddn.com/hbuilder1.png)
### 复制aar文件
复制5+SDK目录下的SDK->libs->lib.5plus.base-release.aar文件到原生工程工程的app->libs目录下

![](http://of73u2ed9.bkt.clouddn.com/hbuilder2.png)
### 配置build.gradle
打开app下的build.gradle文件
#### 添加aar文件引用到dependencies
添加aar文件引用到dependencies，如下代码。如过编译器有警告信息，根据提示信息修改成imlementation。
```json
compile(name: 'lib.5plus.base-release', ext: 'aar')
```
#### 添加aar文件搜索路径
添加aar文件搜索路径与dependencies同级, 代码如下
```json
repositories {
    flatDir {
        dirs 'libs'
    }
}
```
#### 修改targetSdkVersion
targetSdkVersion修改为21
#### 设置multiDexEnabled
multiDexEnabled设置成false

![](http://of73u2ed9.bkt.clouddn.com/hbuilder4.png)

### 配置Androidmanifest.xml
打开工程的Androidmanifest.xml文件,用以下内容替换原有application节点的内容
```xml
<application
    android:name="io.dcloud.application.DCloudApplication"
    android:allowClearUserData="true"
    android:icon="@drawable/icon"
    android:label="@string/app_name"
    android:largeHeap="true"
    >
    <activity
        android:name="io.dcloud.PandoraEntry"
        android:configChanges="orientation|keyboardHidden|keyboard|navigation"
        android:label="@string/app_name"
        android:launchMode="singleTask"
        android:hardwareAccelerated="true"
        android:theme="@style/TranslucentTheme"
        android:screenOrientation="user"
        android:windowSoftInputMode="adjustResize" >
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
<category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```
### 增加icon.png
在app->src->res->drawble目录下放应用的图标文件文件命名为icon.png，如果没有可从5+SDK目录下的HBuilder-Hello目录下找。
![](http://of73u2ed9.bkt.clouddn.com/hbuilder5.png)

### 配置资源目录
创建assets目录（app->src->main->assets），将5+SDK目录下的SDK->assets->data目录复制到新创建的assets目录下
![](http://of73u2ed9.bkt.clouddn.com/hbuilder6.png)

### 配置应用目录
创建apps目录（app->src->main->assets->apps），将5+SDK目录下的HBuilder-Hello下的Apps(HBuilder-Hello->app->src->main->assets->apps)目录下内容复制到新创建的apps目录下。 注意： 应用资源的路径为[appid]->www, appid为应用资源manifest.json文件中id节点的值。
![](http://of73u2ed9.bkt.clouddn.com/hbuilder7.png)

### 配置dcloud_control.xml
修改应用的assets->data->dcloud_control.xml文件的apps->app节点的appid属性的值改为manifest.json文件id节点的值，资源目录（app->[appid]）、manifest.json的id（id）和dcloud_control的appid，三者必须一致，否则应用无法正常启动。
![](http://of73u2ed9.bkt.clouddn.com/hbuilder8.png)

### 编译运行。

## 打包
### 配置应用的权限

参考5+SDK目录下“Feature列表.xls”文档，确定应用中使用到的扩展API，在AndroidManifest.json文件中调整API的权限。
![](http://of73u2ed9.bkt.clouddn.com/hbuilder11.png)
### 配置应用的包名及版本号

打开AndroidManifest.xml文件，在代码视图中修改根节点的package属性值，如下：
![](http://of73u2ed9.bkt.clouddn.com/hbuilder9.png)
其中package为应用的包名，采用反向域名格式，为应用的标识；versionCode为应用的版本号（整数值），用于各应用市场的升级判断，建议与manifest.json中version -> code值一致；versionName为应用的版本名称（字符串），在系统应用管理程序中显示的版本号，建议与manifest.json中version -> name值一致。

### 配置应用名称

打开res -> values -> strings.xml文件，修改“app_name”字段值，该值为安装到手机上桌面显示的应用名称。
### 配置应用图标和启动界面

将应用的图标（文件名为icon.png）和启动图片按照对应的尺寸拷贝到工程的res -> drawable-XXX目录下。
#### 应用图标
指定各种分辨率设备上使用的应用图标（png格式）

节点名|	图标尺寸|说明
---|---|---|
mdpi	|48*48	|普通屏程序图标
ldpi	|48*48	|大屏程序图标
hdpi	|72*72	|高分屏程序图标
xhdpi	|96*96	|20P高分屏程序图标
xxhdpi	|144*144|1080P高分屏程序图标

#### 启动图片
指定各种分辨率设备上使用的启动图片（png格式）

节点名|	图标尺寸|说明
---|---|---|
mdpi	|240*282	|普通屏启动图片
ldpi	|320*442	|大屏启动图片
hdpi	|480*762	|高分屏启动图片
xhdpi	|720*1242	|720高分屏幕启动图片
xxhdpi	|1080*1882	|1080p高分屏启动图片

### 更新应用资源
打开assets -> apps 目录，将下面“HelloH5”目录名称修改为应用manifest.json中的id名称（这步非常重要，否则会导致应用无法正常启动），并将所有应用资源拷贝到其下的www目录。
### 配置应用信息
打开assets -> data下的dcloud_control.xml文件：
![](http://of73u2ed9.bkt.clouddn.com/hbuilder11.png)
其中appid值为apps目录下的[appid]目录，appid决定运行哪个应用；appver为应用的版本号，用于应用资源的升级，必须保持与manifest.json中的version -> name值完全一致；version值为应用基座版本号（plus.runtime.innerVersion返回的值），不要随意修改。
### 生成安装包
如果只是测试使用Build->build apks即可，如果用于正式环境，build->Generate Signed APK。按要求填写相关信息。
![](http://of73u2ed9.bkt.clouddn.com/hbuilder10.png)
