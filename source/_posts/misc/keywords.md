---
title: 编程语言能打印自己的保留关键字么？
toc: true
p: misc/keywords
date: 2020-02-15 15:33:56
categories:
tags:
- Programming Languages
---
## 引子
今天看到一段Python程序，打印Python的保留关键字。
```python
import keyword
print(keyword.kwlist)
```
程序写了这么多年，也接触了一些语言（C++、Go、Java、Javascript(TypeScript)、Kotlin、Pyton），印象中都是说语言规范，记下来就好。突然就好奇了，有多少语言能利用自己的内置类库完成这个事情呢？于是拿自己接触的这些语言来做个对比。

## 能否打印关键字
其实在StackOverflow上也有人有类似的问题，比如：
- [Is it possible to get a list of keywords in Python?](https://stackoverflow.com/questions/9642087/is-it-possible-to-get-a-list-of-keywords-in-python)
- [Get a list of all Java reserved Keywords](https://stackoverflow.com/questions/24265110/get-a-list-of-all-java-reserved-keywords)

做了个简单的搜索，整理出下面这张表格，表格内容不一定准确，欢迎纠正。

|Programming Languages|Can print keys by SelfLib|Keywords|
|---------------------|-------------------------|--------|
|C++                  |No                       |https://en.cppreference.com/w/cpp/keyword|
|Go                   |No                       |https://golang.org/ref/spec#Keywords|
|Java                 |No                       |https://docs.oracle.com/javase/tutorial/java/nutsandbolts/_keywords.html|
|JavaScript           |No                       |https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar|
|TypeScript           |No                       |https://github.com/Microsoft/TypeScript/issues/2536|
|Kotlin               |No                       |https://kotlinlang.org/docs/reference/keyword-reference.html|
|Python               |Yes                       |https://docs.python.org/3/library/keyword.html|

一些补充：
- 打印保留关键字本身并不难，维护一个列表就可以的。
- Java有个内置函数是可以判断是否为关键字的`SourceVersion.isKeyword(str)`。

## 语言关键字统计
在找不同语言关键字的时候找到这样一个统计库。[A list and count of keywords in programming languages](https://github.com/leighmcculloch/keywords)

> The number of keywords in a programming language _can_ be an indication to it's simplicity/complexity, and that can impact the simplicity/complexity of the solutions that developers produce using it. Complex solutions can be more expensive to maintain and difficult to hire for. However, this is dependent on many factors and keyword count is only one; language idioms also play a massive part.

## 细节之处见真章
提供丰富的类库，在意细节，是否会是Python能这么流行的原因呢？

