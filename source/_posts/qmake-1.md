---
title: 入门
date: 2017-05-22 22:30:09
tags: [Qt,qmake]
---
# 入门
本教程向介绍qmake的基本知识。本手册的其他主题包含了更多的qmake使用细节。

## 从简单开始
假设你已经完成了项目的基本实现，并且你创建了如下的文件：
- hello.cpp
- hello.h
- main.cpp
你可以在Qt发布包的`examples/qmake/tutorial`目录下找到这些文件。剩下的唯一一件事就是使用Qt来写应用配置。首先，用你最喜欢的文本编辑器，在`examples/qmake/tutorial`目录下创建一个`hello.pro`的文件。第一件要做的事情就是该文件中增加构成你开发项目的头文件和源文件的说明。

我们先添加源文件。通过`SOURCES`变量可以完成这个事情。只要创建一行`SOURCES +=`,后面紧跟hello.pp就可以了。你的文件应该像这样：
```
SOURCES += hello.cpp
```
其他文件也这样做：
```  
SOURCES += hello.cpp
SOURCES += main.cpp
```
如果你喜欢Make风格的语法，我们也可以在一行中写所有的文件列表：
```
SOURCES = hello.cpp \
        main.cpp
```

接下来我们来添加头文件。除了使用了`HEADERS`变量，其它和源文件的添加方式是一样的。

如果头文件也添加完成，你的项目文件应该是这样的：
```
HEADERS += hello.h
SOURCES += hello.cpp
SOURCES += main.cpp
```

目标名是自动设置的。它和项目文件名相同，只不过包含了适应平台的后缀。例如，如果项目文件是`hello.pro`，那是在Window上是`hello.exe`，在Unix上是`hello`。如果你想要不同的名称，可以使用下面的方式：
```
TARGET = helloworld
```

最终的项目文件是这样的：
```
HEADERS += hello.h
SOURCES += hello.cpp
SOURCES += main.cpp
```

你可以用qmake来生成项目的Makefile。在你的项目目录下，使用如下的命令：
```
qmake -o Makefile hello.pro
```
然后根据你使用的编辑器来输入`make`或者`nmake`。
对于Visual Studio的用户来说，qmake一样可以生成Visual Studio的项目文件。例如：
```
qmake -tp vc hello.pro
```
## 增加调试
应用程序的发布版本不包含任何调试符号和调试信息。但是在开发过程中生成调试信息是非常有用的。在`CONFIG`变量中增加`debug`就可以。

例如：
```
CONFIG += debug
HEADERS += hello.h
SOURCES += hello.cpp
SOURCES += main.cpp
```

使用qmake重新生成Makefile。这样你在调试环境下运行应用程序就可获得有用的信息。

## 添加指定平台源文件

经过几个小时的编码，你产生了一些平台相关应用程序，并且你希望保持平台的独立性。所以你在你的项目中有两个新一文件：`hellowin.cpp`和`hellounix.cpp`。我们不能简单的用`SOURCES`将这两个文件添加到项目文件当中。所以我们增加了一个作用域来处理不同的编译平台。

Windows平台的域是这样的：
```
win32 {
    SOURCES += hellowin.cpp
}
```
当编译Windows版本时，qmake添加`hellowin.cpp`到文件列表中。当编译其他平台时，qmake会忽略掉。那剩下的就是如何创建Unix的域了。

如果你都做完了，你的项目文件应该是这样的：
```
CONFIG += debug
HEADERS += hello.h
SOURCES += hello.cpp
SOURCES += main.cpp
win32 {
    SOURCES += hellowin.cpp
  }
unix {
    SOURCES += hellounix.cpp
  }
```

和之前一样用qmake来生成Makefile。

## 如果文件不存在就停止qmake
如果确定某个文件不存在时你可能不想生成Makefile。你可以通过`exists()`函数来确定某个文件是否存在。我们可以通过`error()`函数来结束qmake的进程。在域下也同样适用。简单的替换域条件就可以了。检查main.cpp文件的判断如下：
```
!exists( main.cpp ) {
    error( "No main.cpp file found" )
  }
```
`!`是判断表达式取反。也就是说如果exists(main.cpp)为真时文件存在，那么!exists(main.cpp)为真时，就是文件不存在。

```
CONFIG += debug
HEADERS += hello.h
SOURCES += hello.cpp
SOURCES += main.cpp
win32 {
    SOURCES += hellowin.cpp
  }
unix {
    SOURCES += hellounix.cpp
  }
!exists( main.cpp ) {
    error( "No main.cpp file found" )
}
```
和之前一样用qmake来生成Makefile。如果你临时重命名了main.cpp，你就会看到qmake停止执行的信息。

## 多条件检测

假设你使用Windows并且希望在命令行中运行程序的时候用qDebug()来看表达示的输出。为了看输出，必须使用合适的控制台设置来编译程序。我们只要简单地将`console`设置到`CONFIG`中可以。现在我们来说说，我们运行在Windows上添加了`CONFIG`并且设置为`debug`的情况，此时需要用到两个域嵌套。首先创建一个域，然后在里面创建另一个。在第二个域中做如下的设置：
```
win32 {
    debug {
        CONFIG += console
    }
}
```

嵌套域可以冒号来连接，所以最终的项目文件是这样的：
```
CONFIG += debug
HEADERS += hello.h
SOURCES += hello.cpp
SOURCES += main.cpp

win32 {
    SOURCES += hellowin.cpp
}

unix {
    SOURCES += hellounix.cpp
}

!exists(main.cpp) {
    error("No main.cpp file found")
}

win32:debug {
    CONFIG += console
}
```

就这些了！你已经完成了qmake的教程，现在开始写你自己项目的项目文件吧。


