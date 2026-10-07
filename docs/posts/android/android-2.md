---
date: '2018-08-10T11:25:05'
title: Hbuilder Android平台第三方插件开发指导
categories:
  - Android
tags:
  - android
  - hbuilder
  - plugin
---
## 准备
官方文档为兼容各个版本，看起来比较杂乱，不容易读懂。自己根据实际的开发情况，整理了本文。本文参考官方文档[Android平台第三方插件开发指导](http://ask.dcloud.net.cn/article/66)， 对官方文档有理解不到位之处未能说明清楚，请参看官方文档。

下载最新版本5+SDK,[下载地址](http://ask.dcloud.net.cn/article/103)， 将SDK解压到任意目录，目录结构如下，以下统称为5+SDK目录。

![](http://of73u2ed9.bkt.clouddn.com/hbuilder12.png)

## 术语字典
### JS Plugin Bridge
H5+ Plugin Bridge层JS部分API，插件调用者通过调用API，触发Native层扩展插件相应方法的调用。
### Native Plugin Bridge
H5+ Plugin Bridge层Native部分API，插件开发者通过实现接口类方法，实现扩展插件业务逻辑。插件开发者调用API，实现Native扩展方法运行结果的返回。
### Native层扩展插件
开发者使用原生语言实现的5+扩展插件，可被JS层通知调用。
### 插件类别名（插件别名）
读时需要按插件类|别名的方式来断句。JS层字符串，用来声明JS层和Native层插件的对应关系。
## 技术架构
HTML5+ 基座扩展采用三层结构，JS层、PluginBridge层和Native层。 三层功能分别是： 
- JS层： 在Webview页面调用，触发Native层代码，获取执行结果。 
- PluginBridge层： 将JS层请求进行处理，触发Native层扩展插件代码。 
- Native层： 插件扩展的平台原生代码，负责执行业务逻辑并执行结果返回到请求页面。
- 
![](http://img-cdn-qiniu.dcloud.net.cn/uploads/article/20141017/6e2bd27ff777bed57750a5b3b6143a0f.png)

插件开发者在开发扩展插件时需要为扩展插件编写对应的JS API，JS API将在HTML页面中触发调用对应Native扩展方法的请求，并负责接收运行结果。

插件调用者（也可能为插件调用者）通过调用Javascript Plugin Bridge的API用来完成对Native层代码的调用和运行结果的返回。

在实际应用中，插件开发者可以根据扩展方法的实际需求不同，提供同步或者异步JS API，插件调用者根据JS API将设置为同步执行或异步执行。

## 扩展插件工作流程
### 同步执行
同步执行的扩展方法会阻塞当前JS代码的执行，直到Native层插件扩展方法执行完毕。
![](http://img-cdn-qiniu.dcloud.net.cn/uploads/article/20141017/095b9c2bdb95d1d9ef68ddeeb610b883.png)

### 异步执行
异步扩展方法不会阻塞当前JS代码的执行，插件调用者需要设置回调方法接收Native层返回的执行结果。插件开发者需要在插件中调用 Native plugin brigde的方法将执行结果返回到请求页面。
![](http://img-cdn-qiniu.dcloud.net.cn/uploads/article/20141017/e7b481bc1dc1caf69cda678f92587cd9.png)

工程示例请参考SDK内包含的HBuilder-Integrate-AS工程，工程里已经整合了插件开发和集成方式的示例。

## 插件实现方式
### 创建插件类
创建一个继承自StandardFeature的类，实现第三方插件扩展。

创建插件类需要引入的包 
```java
importio.dcloud.common.DHInterface.IWebview;
importio.dcloud.common.DHInterface.StandardFeature;
importio.dcloud.common.util.JSUtil;
```

### 实现扩展方法
#### 插件初始化
重写onStart方法，需要设置dcloud_properties.xml的Service节点，该方法才会被调用。
```java
public void onStart(Contextcontext,Bundlebundle,String[]strings)
```
#### 扩展插件方法声明
Native层扩展插件的方法声明如下：
```java
public void methodName(IWebview webView, JSONArray array)
```
#### 参数说明
参数名|类型|说明
---|---|---
webView|IWebview|发起请求的webview
array|JSONArray|JS请求传入的参数

只有符合以上函数声明的方法，才可被JS层调用。

### 决定执行方法
插件开发者对返回值的不同调用方式决定了JS API的执行方法。不同的执行方法对入参array(JSONArray)的要求也会有所有不同。

#### 同步执行方法
插件开发者通过JSUtil.wrapJsVar返回时为同步执行。同步执行方法在返回结果时可以直接将结果以return的形式返回给js层。
##### 方法声明
```java
String wrapJsVar(String value);
```
##### 参数说明
参数名|类型|说明
---|---|---
value|String|要返回到JS层的值

查看io.dclod.util.JSUtil了解更多的返回值类型的处理(boolean,Number, String, JSONArray, JSONObject)。

##### 示例代码
```java
JSUtil.wrapJsVar("Html5 Plus Plugin Hello1!");
```
#### 异步执行方法
插件开发者调用JSUtil.execCallback返回时为异步执行。通过CallbackId实现回调函数的关联处理，对于CallbackId的传入由插件开发者具体约定入参array(JSONArray)中的位置，通常使用第一个。

##### 方法声明
```java
String execCallback(IWebview pWebView, String pCallbackId, String pMessage, int pStatus, boolean isJson, boolean pKeepCallback);
```
##### 参数说明
参数名|类型|说明
---|---|---
pWebView	|IWebview 	|扩展插件方法运行的窗口
pCallbackId	|String 	|回调函数的唯一标识
pMessage	|String 	|回调函数的参数，即返回结果
pStatus	|int 	|操作是否成功，成功则使用JSUtil.OK，否则使用错误代码
isJson	|boolean 	|回调函数参数是否为JSON数据
pKeepCallback	|boolean 	|是否可多次触发回调函数
##### 示例代码
```java
JSUtil.execCallback(pWebview, cbId, (which==AlertDialog.BUTTON_POSITIVE)?"ok":"cancel", JSUtil.OK, false, false);
```
#### 完整代码示例
该示例只展示同步或异步方法，完整内容参考官网或者SDK中示例工程。
```java
package com.example.H5PlusPlugin;
import io.dcloud.common.DHInterface.IWebview;
import io.dcloud.common.DHInterface.StandardFeature;
import io.dcloud.common.util.JSUtil;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
public class PGPlugintest extends StandardFeature
{   
    public void PluginTestFunction(IWebview pWebview, JSONArray array)
    {
        String CallBackID = array.optString(0);
        JSONArray newArray = new JSONArray();
        newArray.put(array.optString(1));
        newArray.put(array.optString(2));
        newArray.put(array.optString(3));
        newArray.put(array.optString(4));
        JSUtil.execCallback(pWebview, CallBackID, newArray, JSUtil.OK, false);
}
public String PluginTestFunctionSync(IWebview pWebview, JSONArray array)
    {
        String inValue1 = array.optString(0);
        String inValue2 = array.optString(1);
        String inValue3 = array.optString(2);
        String inValue4 = array.optString(3);
        String ReturnValue = inValue1 + "-" + inValue2 + "-" + inValue3 + "-" + inValue4;
        return JSUtil.wrapJsVar(ReturnValue);
    }
}
```
## 插件调用方法
### 设置插件类别名
插件调用者在实现JS API时首先要定义一个插件类别名，在Android工程的assets\data\dcloud_properties.xml文件中声明插件类别名和Native层扩展插件类的对应关系。feature节点下声明的插件将会在调用时创建相应的对象。
```xml
<properties>
    <features>
        <feature name="plugintest" value="com.example.H5PlusPlugin.PGPlugintest"></feature>
    </features>
</properties>
```
如果开发的插件有应用启动时初始化的需求，需要同时配置service节点。
```xml
<properties>
    <services>
        <service name="plugintest" value="com.example.H5PlusPlugin.PGPlugintest"></service>
    </services>
</properties>
```
### 调用方式实现
#### 同步调用
插件调用者需要调用JS Plugin Bridge的window.plus.bridge.execSync()方法，该方法可同步获取Native插件返回的运行结果。
##### 函数声明
```js
void plus.bridge.execSync( String service, String action, Array<String> args );
```
##### 参数说明
参数名|类型|说明
---|---|---
service	|String	|插件类别名
action	|String	 |调用Native层插件方法名称
args	|Array&lt;String&gt;	|参数列表
#### 异步调用
插件调用者需要调用JS Plugin Bridge的plus.bridge.exec()方法，该方法会通知Native层插件执行指定方法，运行结果会通过回调的方式通知JS层。
##### 函数声明
```js
void plus.bridge.exec( String service, String action, Array<String> args );
```
##### 参数说明
参数名|类型|说明
---|---|---
service	|String	|插件类别名
action	|String	 |调用Native层插件方法名称
args	|Array&lt;String&gt;	|参数列表
为了接收和处理结果，插件调用者需要调用window.plus.bridge.callbackId（）生成callbackId，并通过args（ Array&lt;String&gt; ）传入。对JS不是很了解，个人认为应该类似一个Map（回调函数表），提供回调函数注册。

## 实际使用及示例代码
根据业务的需要和使用的方便，可以在JS层进行插件调用的封装使用。
### 封装示例
该示例只展示同步或异步方法，完整内容参考官网或者SDK中示例工程。
```js
document.addEventListener( "plusready",  function()
{
// 声明的JS“扩展插件别名”
    var _BARCODE = 'plugintest',
        B = window.plus.bridge;
    var plugintest = 
{
// 声明异步返回方法
        PluginTestFunction : function (Argus1, Argus2, Argus3, Argus4, successCallback, errorCallback ) 
        {
            var success = typeof successCallback !== 'function' ? null : function(args) 
            {
                successCallback(args);
            },
            fail = typeof errorCallback !== 'function' ? null : function(code) 
            {
                errorCallback(code);
            };
            callbackID = B.callbackId(success, fail);
// 通知Native层plugintest扩展插件运行”PluginTestFunction”方法
            return B.exec(_BARCODE, "PluginTestFunction", [callbackID, Argus1, Argus2, Argus3, Argus4]);
        },
        // 声明同步返回方法
        PluginTestFunctionSync : function (Argus1, Argus2, Argus3, Argus4) 
        {            
            // 通知Native层plugintest扩展插件运行“PluginTestFunctionSync”方法并同步返回结果                       
            return B.execSync(_BARCODE, "PluginTestFunctionSync", [Argus1, Argus2, Argus3, Argus4]);
        }
    };
    window.plus.plugintest = plugintest;
}, true );
```
### HTML使用示例
该示例只展示同步或异步方法，完整内容参考官网或者SDK中示例工程。
```html
<!DOCTYPE HTML>
<html>
    <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
        <meta name="HandheldFriendly" content="true"/>
        <meta name="MobileOptimized" content="320"/>
        <title>H5Plugin</title>
        <script type="text/javascript" src="./js/common.js"></script>
        <script type="text/javascript" src="./js/test.js"></script>
        <script type="text/javascript">
function pluginShow() {
            plus.plugintest.PluginTestFunction("Html5","Plus","AsyncFunction","MultiArgument!", function( result ) {alert( result[0]  + "_" + result[1]  + "_" + result[2]  + "_" + result[3] );},function(result){alert(result)});
        }
function pluginGetString()
        {
            alert(plus.plugintest.PluginTestFunctionSync("Html5","Plus","SyncFunction","MultiArgument!"));
        }
</script>
        <link rel="stylesheet" href="./css/common.css" type="text/css" charset="utf-8"/>
    </head>
    <body>
        <header>
            <div class="nvbt" onclick="back();"><div class="iback"></div></div>
            <div class="nvtt">PluginTest</div>
        </header>
        <div id="dcontent" class="dcontent">
            <br/>
             <div class="button" onclick="pluginShow()">PluginTestFunction()</div>
            <div class="button" onclick="pluginGetString()">PluginTestFunctionSync()</div>   
            <br/>
        </div>
    </body>
</html>
```

## 参考链接
[Android平台第三方插件开发指导](http://ask.dcloud.net.cn/article/66)
[Android平台以WebView方式集成HTML5+SDK方法](http://ask.dcloud.net.cn/article/80)
