---
title: 个推透传消息打开指定页面
date: 2018-08-24 06:40:18
tags: [Android, 个推, 透传消息]
---
## 背景
公司IM项目采用个推进行消息推送，之前使用Hbuilder在线打包的方式集成。这次采用Hbuilder插件开发并离线打包的方式新增视频功能（视频使用WebRTC协议），其中的呼入消息需要使用到个推的推送（主要考量就是复用，减少开发量）。
通过个推官网的文档[Android Studio快速集成（推荐）](http://docs.getui.com/getui/mobile/android/androidstudio_maven/)，能很快的将个推SDK集成进来。
## 实现及问题
### 业务逻辑
1. 视频发起者，发起视频邀请。
2. 服务器接到请求后，推送个推透传消息给视频接收者。
3. 视频接收者，弹出的呼入页面，点击接收开始视频会话，或拒绝视频邀请。
### 实现
需要继承自com.igexin.sdk.GTIntentService的类，用于接收CID、透传消息。以下为对应的事件回调方法：
```java
public class DemoIntentService extends GTIntentService {
    @Override
    public void onReceiveMessageData(Context context, GTTransmitMessage msg) {
         //省略其他业务逻辑
        Intent intent = new Intent(getBaseContext(), XxxActivity.class);
        getApplication().startActivity(intent);
    }

    @Override
    public void onReceiveClientId(Context context, String clientid) {
        Log.e(TAG, "onReceiveClientId -> " + "clientid = " + clientid);
        //省略注册个推与用户信息
    }
}
```
### 问题
正常情况，此时应该能弹出指定的XxxActivity页面，然而并未弹出。经过一段资料查找和测试验证。需要增加`Intent.FLAG_ACTIVITY_NEW_TASK`的设置，代码如下：
```java
    @Override
    public void onReceiveMessageData(Context context, GTTransmitMessage msg) {
         //省略其他业务逻辑
        Intent intent = new Intent(getBaseContext(), XxxActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getApplication().startActivity(intent);
    }
```
### FLAG_ACTIVITY_NEW_TASK
> int FLAG_ACTIVITY_NEW_TASK 
> If set, this activity will become the start of a new task on this history stack.

如果设置了`FLAG_ACTIVITY_NEW_TASK`，页面会被置顶。从文档来看主要还是对Android开发的基础知识不够了解。

## 小结
算是Android开发中的一个小坑吧，记录下来，方便日后查找。希望本文对采用类似方案的朋友有所帮助。

## 参考
[个推-点击推送跳转至指定页面（透传）](https://blog.csdn.net/Monkey_King_Bar/article/details/78568582)
[Intent](https://developer.android.com/reference/android/content/Intent)