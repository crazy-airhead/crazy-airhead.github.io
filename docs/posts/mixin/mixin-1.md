---
date: '2024-09-02T00:17:27'
title: 「定投搜索」工具的一些分享
categories:
  - 教程100
  - 写作
  - mixin
tags:
  - 教程100
  - 写作
  - mixin
---

# 说明

「定投搜索」工具是 Mixin 的机器人（Mixin 号「7000103414」），以 Mixin 聊天的方式提供「定投人生」课堂的全文搜索，并返回匹配的课程列表或者课程卡片。

最近学习AI，发现可以用AI技术对「定投搜索」进行些优化改造，然后在查看文档时发现之前写了这篇技术总结，现在稍作调整分享这个「定投搜索」Mixin的机器人制作过程，顺便预告下新版功能。

<!-- more -->

# 主要模块

定投搜索工具主要分为数据采集，数据存储和数据查询三个部分。

## **数据采集**

- 课程信息

## **数据存储**

- 使用ElasticSearch索引课程内容

## **数据查询**

- 对接Mixin，提供界面交互。

- 检索课程。

# 主要技术

- Java 17

- [Mixin SDK，https://developers.mixin.one/docs/resources/sdk](https://github.com/fox-one/mixin-sdk-go)

- [ElasticSearch](http://blevesearch.com/) 7.10.2

- Docker

# 开发步骤

开发过程中实际是按两部分工作来做的，一是数据处理，怎么把课程内容存储到ES中，另一个是Mixin对接，主要是Mixin消息的收发。

## 数据处理

### 数据采集

整理成电子表格，包含群组id，课程名，课程id，消息文本。其中群组id和课程id可以从分享的链接中获取。

消息文本，可以语音软件识别，转录，或者听写等等，这部分需要靠大家各显神通了。

### 语音转文本

如果直接采集了文本内容，这个一步可以忽略。如果是采集了语音文件，可以参考课程「2022.12.23.未来能力上的基尼指数会放大」，将语音转成文本，每个音频转换的文件需要合并成一个文本，方便检索。

文本转语音可以使用[Whisper.cpp，Port of OpenAI's Whisper model in C/C++](https://github.com/ggerganov/whisper.cpp)，参考README说明编译whipser.cpp和下载模型文件。

如果采集的语音文件是 mp3 格式的，需要转码，其他格式可能也需要转码。此时需要下载 ffmpeg 做音频的格式转换，如果使用的是 Mac 可以通过`homebrew`进行安装。

FfmpegUtil

```java
/**
 * @author airhead
 */
public class FfmpegUtil {
  public static void covertMp3ToWav(String sourceFile, String targetFile) {
    String cmd =
        String.format(
            "/opt/homebrew/bin/ffmpeg -i %s -ar 16000 -ac 1 -acodec pcm_s16le %s",
            sourceFile, targetFile);
    Process process = RuntimeUtil.exec(cmd);
    try {
      process.waitFor();
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }
}
```

WhisperUtil

```java
public class WhisperUtil {
  public static String WHISPER_HOME = "/Users/airhead/opt/whisper.cpp";

  public static void transcribe(String sourceFile, String lang) {
    transcribe(WHISPER_HOME, sourceFile, lang);
  }

  public static void transcribe(String whisperHome, String sourceFile, String lang) {
    if (StrUtil.isBlank(lang)) {
      lang = "zh";
    }

    String whisperPath = whisperHome + "/main";
    String modelPath = whisperHome + "/models/ggml-large.bin";
    String cmd =
        String.format("%s -m %s -f %s -l %s -otxt", whisperPath, modelPath, sourceFile, lang);
    Process process = RuntimeUtil.exec(cmd);
    try {
      process.waitFor();
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }

  public static String transcribeMp3(String sourceFile) {
    String wavFile = StrUtil.replace(sourceFile, ".mp3", ".wav");
    String txtFile = StrUtil.replace(sourceFile, ".mp3", ".wav.txt");
    if (FileUtil.exist(txtFile)) {
      return FileUtil.readString(txtFile, CharsetUtil.CHARSET_UTF_8);
    }

    FileUtil.del(wavFile);
    FfmpegUtil.covertMp3ToWav(sourceFile, wavFile);

    transcribe(WHISPER_HOME, wavFile, "zh");

    // 删除临时文件
    FileUtil.del(wavFile);

    return FileUtil.readString(txtFile, CharsetUtil.CHARSET_UTF_8);
  }
}
```

使用 whisper.cpp 时可能会碰到识别出来的文字是繁体和没有标点符号的问题，其中没有标点的使用了几个python的类库，效果不理想，当时未处理。繁体字的问题，可以使用hanlp进行转换。

引入hanlp相关依赖

```groovy
implementation("com.hankcs:hanlp:1.8.4")
```

使用

```Java
String text = "中國";text = HanLP.convertToSimplifiedChinese(text);
```

### 课程存储

使用了[noear/esearchx](https://gitee.com/noear/esearchx)类库，可参考README熟悉该类库。

创建索引

使用es的 7.10.2版本并安装hanlp插件用于全文检索的分词。

```json
{
  "settings": {
    "index": {
      "number_of_shards": "3",
      "number_of_replicas": "1",
      "refresh_interval": "1s"
    }
  },
  "mappings": {
    "properties": {
      "groupId": {
        "type": "keyword"
      },
      "courseId": {
        "type": "keyword"
      },
      "courseTitle": {
        "type": "text",
        "analyzer": "hanlp"
      },
      "courseUrl": {
        "type": "keyword"
      },
      "courseContent": {
        "type": "text",
        "analyzer": "hanlp"
      },
      "indexedTime": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss"
      }
    }
  }
}
```

插件的github地址

[KennFalcon/elasticsearch-analysis-hanlp: HanLP Analyzer for Elasticsearch (github.com)](https://github.com/KennFalcon/elasticsearch-analysis-hanlp)

CourseEntity

```java
@Data
public class CourseEntity {

  private String _id;

  private String groupId;

  private String courseId;

  private String courseTitle;

  private String courseContent;

  private String courseUrl;

  private String indexedTime;
}
```

存储 Indexer

```java
private static void index(
    EsContext esContext, String indexName, CourseMessage courseMessage, String content) {
  if (content != null) {
    try {
      CourseEntity entity =
          esContext
              .indice(indexName)
              .where(r -> r.term("courseId", courseMessage.getCourseId()))
              .limit(1)
              .selectOne(CourseEntity.class);
      if (entity != null) {
        return;
      }

    } catch (IOException ignore) {
    }

    CourseEntity courseEntity = new CourseEntity();
    courseEntity.setGroupId(courseMessage.getGroupId());
    courseEntity.setCourseId(courseMessage.getCourseId());
    courseEntity.setCourseTitle(courseMessage.getCourseTitle());
    courseEntity.setCourseContent(content);
    courseEntity.setCourseUrl(
        String.format(
            "https://xuexi-courses.firesbox.com/#/%s/courses/%s",
            courseMessage.getGroupId(), courseMessage.getCourseId()));
    courseEntity.setIndexedTime(LocalDateTimeUtil.formatNormal(LocalDateTimeUtil.now()));

    try {
      esContext.indice(indexName).insert(courseEntity);
    } catch (IOException e) {
      System.out.println(e.getMessage());
      throw new RuntimeException(e);
    }
  }
}
```

### 课程查询

CourseDTO

```java
@Data
public class CourseDTO {
  private String courseTitle;
  private String courseUrl;
}
```

查询 Searcher

```java
public List<CourseDTO> search(String keywords) {
  if (StrUtil.isBlank(keywords)) {
    return new ArrayList<>();
  }

  try {
    EsData<CourseDTO> result =
        esContext
            .indice("ri_course")
            .where(
                c ->
                    c.useScore()
                        .should()
                        .match("courseTitle", keywords)
                        .match("courseContent", keywords))
            .minScore(1)
            .limit(10)
            .selectList(CourseDTO.class);

    return result.getList();

  } catch (IOException e) {
    log.error(e.getMessage());
  }

  return new ArrayList<>();
}
```

## Mixin对接

### 申请机器人

在[Mixin Developers](https://developers.mixin.one/dashboard)申请应用，按界面提示即可。

### 必读文档

- https://developers.mixin.one/docs/dapp/getting-started/create-dapp

- https://developers.mixinbots.com/courses/1e276ee9-18fb-42e3-915a-54b049679084/89329795-c5a2-4aa5-ab32-c52cf6649907

### 机器人消息

Java版本的官方SDK，未实现消息服务，可以获取https://github.com/crazy-airhead/bot-api-kotlin-client，编译后可用。

可参考samples里的java代码，启动后，即可接收mixin客户端发来的消息，并打印出来。

```java
@SuppressWarnings("SameParameterValue")
public class Blaze {
  public static void main(String[] args) throws IOException {
    EdDSAPrivateKey key = getEdDSAPrivateKeyFromString(privateKey);
    BlazeClient blazeClient =
        new BlazeClient.Builder()
            .configEdDSA(userId, sessionId, key)
            .enableDebug()
            .enableParseData()
            .enableAutoAck()
            .blazeHandler(new MyBlazeHandler())
            .build();
    blazeClient.start();

    // 卡一下；因为没有任何别的服务启动
    System.in.read();
  }

  public static class MyBlazeHandler implements BlazeHandler {

    @Override
    public boolean onMessage(@NotNull WebSocket webSocket, @NotNull BlazeMsg blazeMsg) {
      System.out.println(blazeMsg);
      MsgData data = blazeMsg.getData();
      if (data != null) {
        sendTextMsg(webSocket, data.getConversionId(), data.getUserId(), "read");
      }

      return true;
    }
  }
}
```

需对CREATE_MESSAGE的Action消息进行处理。

### 发送文本消息

```java
BlazeClientKt.sendTextMsg(
    webSocket, blazeMsg.getData().getConversionId(), blazeMsg.getData().getUserId(), "需要发送的消息");
```

### 发送卡片消息

Ri，定投人生课堂的一些基础信息。

```java
public interface Ri {
  String APP_ID = "408cace6-84a2-44ae-8fff-37b2333e26ad";
  String GROUP_ID = "7000102069";
  String ICON_URL =
      "https://mixin-images.zeromesh.net/y0rAmPBGgNV5NskMtJ8deTmM0omHjQ6TshUi7TXRe6TpSfYin-sw3jQjc3CZxt1aVZQyQ9rbvU6b09I_UNJhV9k=s256";
  String DESCRIPTION = "定投人生课堂";
}
```

Blaze

```java
Cards cards =
    new Cards(
        Ri.APP_ID,
        Ri.ICON_URL,
        i.getCourseTitle(),
        Ri.DESCRIPTION,
        i.getCourseUrl(),
        true);
BlazeClientKt.sendCardMsg(
    webSocket,
    blazeMsg.getData().getConversionId(),
    blazeMsg.getData().getUserId(),
    cards);
```

# 意外收获

期间做了提交了两个PR，也算是开始参与开源，算是一点收获。

1. Mixin Java SDK的增加 BlazeClient 处理即时消息。

2. esearchx的一个查询返回_id，方便查询后更新数据。

# 新版预告

使用本地 AI 修复文本转换的繁体中文，错别字和没有标点符号问题，这样搜索时能得到更准确的结果。这部分已经完成技术验证，会陆续修复文本上线。

使用本地 AI 提供问答功能，也就是把课程内容当作知识库来回答用户提供的问题。这部分是否还有待验证。部署ai提问功能需要性能较好的服务器，当前的nas可能是不够用的，上线时间未定。
