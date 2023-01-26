---
title: 引入tdengine流计算
toc: true
date: 2023-01-26 10:09:15
categories:
- tdengine
tags:
- tdengine
---

## 安装

参考前文[系统升级TDengine3.0](https://l4qiang.me/2022/10/30/tdengine/tdengine-1/)安装TDegine。

## 创建原始数据表

虽然程序中支持使用动态创建原始数据表，但在创建流计算时需要原始数据表的信息，因此先创建，此处省略其他字段。

<!-- more -->

```sql
create table if not exists st_aaa
(
ts timestamp,
sts nchar(32),
id nchar(24),
create_time timestamp
) tags
(
source_ip nchar(64),
group_id bigint,
)
```

## 创建流计算

```sql
create stream if not exists stream_aaa TRIGGER AT_ONCE fill_history 1 into cnt_aaa AS
SELECT _wstart ts, COUNT(*) AS group_sum, FIRST(ts) AS first_ts, FIRST(id) AS first_id, source_ip
FROM st_aaa 
PARTITION BY source_ip
INTERVAL(1s) SLIDING(1s);
```

## 查询

```
taos> select * from cnt_aaa;
              ts               |      group_count      |           first_ts            |            first_id            |           source_ip            |           tar
get_ip            |       group_id        |
========================================================================================================================================================================
===========================================
 2023-01-26 10:42:29.000000000 |                     1 | 2023-01-26 10:42:29.000001000 | 20230126104229000001           | 172.18.23.1                    | 172.18.23.246
                  |   7564974818487156978 |
 2023-01-26 10:42:31.000000000 |                     1 | 2023-01-26 10:42:31.000022000 | 20230126104231000022           | 172.18.21.11                   | 172.18.20.19 
                  |   1887179168227876716 |
 2023-01-26 10:42:31.000000000 |                     1 | 2023-01-26 10:42:31.000017000 | 20230126104231000017           | 172.18.21.11                   | 172.18.20.14 
                  |   4478081376045249307 |
 2023-01-26 10:42:31.000000000 |                     1 | 2023-01-26 10:42:31.000015000 | 20230126104231000015           | 172.18.21.11                   | 172.18.20.12 
                  |   8150718786340743195 |
 2023-01-26 10:42:31.000000000 |                     1 | 2023-01-26 10:42:31.000019000 | 20230126104231000019           | 172.18.21.11                   | 172.18.20.16 

```

## 注意事项

```
CREATE STREAM [IF NOT EXISTS] stream_name [stream_options] INTO stb_name SUBTABLE(expression) AS subquery
stream_options: {
 TRIGGER    [AT_ONCE | WINDOW_CLOSE | MAX_DELAY time]
 WATERMARK   time
}
```

官网提供的文档`stream_options`没有分段写，第一次容易把stream_options也当成语法，其实的应该写在stream_name后面。

## 参考连接

[流式计算 ](https://docs.taosdata.com/taos-sql/stream/)
