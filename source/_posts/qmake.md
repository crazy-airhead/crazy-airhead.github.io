---
title: qmake
date: 2017-04-30 20:52:21
tags:
---

# qmake手册
qmake简化了跨平台的项目的构建过程。它自动化生成MakeFile，因此只要几行信息来创建Makefile。无论是不是QT项目，你都可以用qmake来编译。

qmake基于一个项目文件的信息来自动生成Makefile。项目文件是由开发人员来编写的，通常也很简单，但更复杂的项目的项目文件也会更复杂一些。

qmake包含额外的功能用于支持QT的开发，自动包含了moc和uic的构建规则。

在不需要修改项目文件的情况下，qmake也可以生成Microsoft Visual studio的项目。

# 目录

- 概述
- 入门
- Creating Project Files
- Building Common 
- Project Types
- Running qmake
- Platform Notes
- qmake Language
- Advanced Usage
- Using Precompiled Headers
- Configuring qmake
- Reference
    - Variables
    - Replace Functions
        - Built-in Replace Functions
    - Test Functions
        - Built-in Test Functions
        - Test Function Library

# 概述
qmake工具为你提供了一个面向项目的系统，用于管理应用、类库和其他组件的构建过程。这种方法使得你可以用非常简洁的方式（通常在单个文件中）来控制源文件的使用和，描述构建的每个步骤。qmake会展开项目文件的信息，生成一个Makefile来执行编译和链接的所需命令。

## 项目描述
项目通过项目文件（.pro）的内容来描述。qmake用这个文件中的信息来生成Makefile，包含了构建项目所需的所在命令。项目文件通常包括一个头文件和源文件的列表，通用配置信息和其他一些应用相关的细节，比如额外的链接库列表或者目录列表。

项目文件包含了一些不同的元素，包括注释，变量申明，内置函数和简单构控结构体。在最简单的项目中，只需要一些配置来申明需要编译的头文件和源文件就可能构建项目。关于如何构建一个简单的项目文件的更多信息，可以参看[快速入门]()。

你也可以为复杂项目创建更复杂的项目文件。参看[创建项目文件]()来有一个初步了解。关于变量和函数的详情信息，参看[引用]()。

你也可以通过修改应用程序和类库的项目模板的配置来微调构建过程。更多详情，参看[构建通用项目类型]()。

你可以通过Qt Creator的项目向导来创建项目文件。你选择项目模板，Qt Creator就可以创建一个使用默认值的项目文件来构建和运行你的项目。你可以按你的目的来修改这个项目文件。

你也可以用qmake来生成项目文件。查看[运行qmake]()可以看到qmake的运行参数的完整描述。

基本的配置功能已经可以处理绝大多数的跨平台项目。但是用一些平台相关的变量是有用的，甚到是必须的。更多信息，参看[平台说明]()。

## 项目构建
对于简单项目来说，你只要在根目录下运行qmake来生成一个Makefile。接下来你就可以根据Makefile来运行`make`编译项目。
更多的关于qmake在构建过程中使用到环境变量的信息，参看[配置qmake]()。

## 使用第三方类库
[第三方类库指南]()描述了如何在Qt项目中使用第三方类库。
## 预编译头文件
在大型项目中，利用预编预头文件可以加速编译过程。更多的信息，参看[使用预编译头文件]()。

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

# 创建项目文件
项目文件包含了所有qmake用于构建应用程序，类库和插件的信息。通常，您使用一系列声明来指定项目中的资源，但是对简单编程结构的支持使您可以为不同的平台和环境描述不同的构建过程。



