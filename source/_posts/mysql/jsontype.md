---
title: Mysql的JSON类型01
toc: true
p: mysql/jsontype
date: 2019-07-24 19:44:32
categories:
- mysql
tags:
- mysql
---

## 概述

Mysql从5.7.8版本开始支持JSON字段，可以高效的处理JSON文档。相比字符串字段，JSON字段有下面的几处优势：

- 自动的校验JSON格式，无效的文档会产生错误
- 优化的存储格式（结构化的二进制格式），访问数据时不需要额外的解析，可能通过键或者数组索引来直接该问数据，而不是读取整个字段。

JSON字段的存储空间要求与LONGBLOB和LONGTEXT是一样的（*L* + 4 bytes, where *L* < 2^32）。同时JSON字段的默认值只能是NULL。

为了操作JSON字段，提供了一系列的JSON和GeoJSON函数。

和其他的二进制类型一样，JSON字段不支持索引，但可以通过提取值的方式生成（虚拟）索引。

## 创建JSON值

新增JSON类型字段与其他类型没什么不同，插入时可以直接按字符串的方式进行插入，但必须是合法的JSON格式，如果不是语法直接报错。另外需要注意的是JSON字段使用utf8mb4字符集和uft8mb4_bin排序，因此1.其他字符集的字符串会被转换，2.JSON文档旭大小写敏感的，null，true，false只能用小写。

下面是官网的一些例子和自己的补充。

```mysql
mysql> CREATE TABLE t1 (jdoc JSON);
Query OK, 0 rows affected (0.20 sec)

mysql> INSERT INTO t1 VALUES('{"key1": "value1", "key2": "value2"}');
Query OK, 1 row affected (0.01 sec)

mysql> INSERT INTO t1 VALUES('[1, 2,');
ERROR 3140 (22032) at line 2: Invalid JSON text:
"Invalid value." at position 6 in value (or column) '[1, 2,'.

--下面语法也是能成功插入
mysql> insert into t1 values('true');
mysql> insert into t1 VALUES('1');
```

对于不太确定是否是MySql中支持的json内容，可以通过JSON_TYPE()进行测试。

```mysql
mysql> SELECT JSON_TYPE('["a", "b", 1]');
+----------------------------+
| JSON_TYPE('["a", "b", 1]') |
+----------------------------+
| ARRAY                      |
+----------------------------+

mysql> SELECT JSON_TYPE('"hello"');
+----------------------+
| JSON_TYPE('"hello"') |
+----------------------+
| STRING               |
+----------------------+

mysql> SELECT JSON_TYPE('hello');
ERROR 3146 (22032): Invalid data type for JSON data in argument 1
to function json_type; a JSON string or JSON type is required.


mysql> select JSON_TYPE('true');
+----------------------+
| JSON_TYPE('true')    |
+----------------------+
| BOOLEAN              |
+----------------------+
mysql> select JSON_TYPE('1');
+----------------------+
| JSON_TYPE('1')       |
+----------------------+
| INTEGER              |
+----------------------+
mysql> select JSON_TYPE('2019-01-01');
ERROR 3141 (22032): Invalid JSON text in argument 1 to function json_type: "The document root must not be followed by other values." at position 4.
```

通过JSON_ARRAY()可以生成JSON数组。

```mysql
mysql> SELECT JSON_ARRAY('a', 1, NOW());
+----------------------------------------+
| JSON_ARRAY('a', 1, NOW())              |
+----------------------------------------+
| ["a", 1, "2015-07-27 09:43:47.000000"] |
+----------------------------------------+
```

通过JSON_OBJECT()可以生成JSON对象。

```mysql
mysql> SELECT JSON_OBJECT('key1', 1, 'key2', 'abc');
+---------------------------------------+
| JSON_OBJECT('key1', 1, 'key2', 'abc') |
+---------------------------------------+
| {"key1": 1, "key2": "abc"}            |
+---------------------------------------+
```

如果使用JSON_OBJECT()插入数据需要处理引号(")。

```mysql
mysql> CREATE TABLE facts (sentence JSON);

--官网中说这个会无效，实际测试中是有效的。
mysql> INSERT INTO facts VALUES
     >   (JSON_OBJECT("mascot", "Our mascot is a dolphin named \"Sakila\"."));

--官网中说需要使用这个，实际测试时却报错。
mysql> INSERT INTO facts VALUES
     >   ('{"mascot": "Our mascot is a dolphin named \\"Sakila\\"."}');
Unknown command '\\'.
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '\\"."))' at line 1  

mysql> SELECT sentence FROM facts;
+---------------------------------------------------------+
| sentence                                                |
+---------------------------------------------------------+
| {"mascot": "Our mascot is a dolphin named \"Sakila\"."} |
+---------------------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT col->"$.mascot" FROM qtest;
ERROR 1146 (42S02): Table 'test.qtest' doesn't exist
mysql> SELECT sentence->"$.mascot" FROM facts;
+---------------------------------------------+
| sentence->"$.mascot"                        |
+---------------------------------------------+
| "Our mascot is a dolphin named \"Sakila\"." |
+---------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT sentence->>"$.mascot" FROM facts;
+-----------------------------------------+
| sentence->>"$.mascot"                   |
+-----------------------------------------+
| Our mascot is a dolphin named "Sakila". |
+-----------------------------------------+
1 row in set (0.00 sec)
```

其实如果要简单点就是用单引号(')。

```mysql
mysql> INSERT INTO facts VALUES(JSON_OBJECT('mascot', 'Our mascot is a dolphin named "Sakila".'));
Query OK, 1 row affected (0.00 sec)
```

而通过JSON_MERGE()可以合并两个JSON文档。

```mysql
mysql> SELECT JSON_MERGE('["a", 1]', '{"key": "value"}');
+--------------------------------------------+
| JSON_MERGE('["a", 1]', '{"key": "value"}') |
+--------------------------------------------+
| ["a", 1, {"key": "value"}]                 |
+--------------------------------------------+

mysql> SELECT JSON_MERGE('{"key1":"value1"}', '{"key2":"value2"}');
+------------------------------------------------------+
| JSON_MERGE('{"key1":"value1"}', '{"key2":"value2"}') |
+------------------------------------------------------+
| {"key1": "value1", "key2": "value2"}                 |
+------------------------------------------------------+
1 row in set, 1 warning (0.00 sec)

mysql> SELECT JSON_MERGE('1', '{"key2":"value2"}');
+--------------------------------------+
| JSON_MERGE('1', '{"key2":"value2"}') |
+--------------------------------------+
| [1, {"key2": "value2"}]              |
+--------------------------------------+
1 row in set, 1 warning (0.00 sec)
```

以上例子可以看出JSON_MEGER是根据两个JSON文档的类型来结构返回类型的，类型相同时不转换，类型不同时转为JSON数组。还有些细节可能参看官网[Normalization, Merging, and Autowrapping of JSON Values](https://dev.mysql.com/doc/refman/5.7/en/json.html#json-normalization)。

##  查询和修改JSON值

通过JSON_EXTRACT()可以提取JSON文档值，具体语法说明参看[JSON Path Syntax](https://dev.mysql.com/doc/refman/5.7/en/json.html#json-path-syntax)

```mysql
mysql> SELECT JSON_EXTRACT('{"id": 14, "name": "Aztalan"}', '$.name');
+---------------------------------------------------------+
| JSON_EXTRACT('{"id": 14, "name": "Aztalan"}', '$.name') |
+---------------------------------------------------------+
| "Aztalan"                                               |
+---------------------------------------------------------+
```

通过JSON_SET()来修改值。

```mysql
mysql> SET @j = '["a", {"b": [true, false]}, [10, 20]]';

mysql> SELECT JSON_SET(@j, '$[1].b[0]', 1, '$[2][2]', 2);
+--------------------------------------------+
| JSON_SET(@j, '$[1].b[0]', 1, '$[2][2]', 2) |
+--------------------------------------------+
| ["a", {"b": [1, false]}, [10, 20, 2]]      |
+--------------------------------------------+
```

通过JSON_INSERT()来插入新值，但不替换旧值。

```mysql
mysql> SELECT JSON_INSERT(@j, '$[1].b[0]', 1, '$[2][2]', 2);
+-----------------------------------------------+
| JSON_INSERT(@j, '$[1].b[0]', 1, '$[2][2]', 2) |
+-----------------------------------------------+
| ["a", {"b": [true, false]}, [10, 20, 2]]      |
+-----------------------------------------------+
```

通过JSON_REPLACE()来替换旧值而忽略新值。

```mysql
mysql> SELECT JSON_REPLACE(@j, '$[1].b[0]', 1, '$[2][2]', 2);
+------------------------------------------------+
| JSON_REPLACE(@j, '$[1].b[0]', 1, '$[2][2]', 2) |
+------------------------------------------------+
| ["a", {"b": [1, false]}, [10, 20]]             |
+------------------------------------------------+
```

通过JSON_REMOVE()来移除文档中的值。

```mysql
mysql> SELECT JSON_REMOVE(@j, '$[2]', '$[1].b[1]', '$[1].b[1]');
+---------------------------------------------------+
| JSON_REMOVE(@j, '$[2]', '$[1].b[1]', '$[1].b[1]') |
+---------------------------------------------------+
| ["a", {"b": [true]}]                              |
+---------------------------------------------------+
```

## 聚合查询

对于JSON文档的聚合查询（MIN，MAX，GROUP_CONCAT）没有什么实际意义，是不支持的。