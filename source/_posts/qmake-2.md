---
title: 创建项目文件
date: 2017-05-22 22:33:20
tags: [Qt,qmake]
---

# 创建项目文件
项目文件包含了所有qmake用于构建应用程序，类库和插件的信息。通常，您使用一系列声明来指定项目中的资源，但是对简单编程结构的支持使您可以为不同的平台和环境描述不同的构建过程。

## 项目文件要素
qmake使用的项目文件的格式可以支持简单的和相对复杂的系统构建。简单的项目文件通过直接申请的方式，通过标准的变量的定义来指示项目中的头文件和源文件。复杂的项目通过控制流来调整构建过程。接下来的章节介绍项目文件中不同类型的要素。

### 变量
In a project file, variables are used to hold lists of strings. In the simplest projects, these variables inform qmake about the configuration options to use, or supply filenames and paths to use in the build process.

在项目文件中，变量被用来保存字符串列表。在最简单的项目中，这些变量可以告诉qmake需要使用的配置选项，或者提供构建时的文件名和路径。

qmake looks for certain variables in each project file, and it uses the contents of these to determine what it should write to a Makefile. For example, the lists of values in the HEADERS and SOURCES variables are used to tell qmake about header and source files in the same directory as the project file.
Variables can also be used internally to store temporary lists of values, and existing lists of values can be overwritten or extended with new values.
The following snippet illustrates how lists of values are assigned to variables:

  HEADERS = mainwindow.h paintwidget.h

The list of values in a variable is extended in the following way:

  SOURCES = main.cpp mainwindow.cpp \
            paintwidget.cpp
  CONFIG += console

Note: The first assignment only includes values that are specified on the same line as the HEADERS variable. The second assignment splits the values in the SOURCES variable across lines by using a backslash (\).
The CONFIG variable is another special variable that qmake uses when generating a Makefile. It is discussed in General Configuration. In the snippet above, console is added to the list of existing values contained in CONFIG.
The following table lists some frequently used variables and describes their contents. For a full list of variables and their descriptions, see Variables.

Variable
Contents
CONFIG
General project configuration options.
DESTDIR
The directory in which the executable or binary file will be placed.
FORMS
A list of UI files to be processed by the user interface compiler (uic).
HEADERS
A list of filenames of header (.h) files used when building the project.
QT
A list of Qt modules used in the project.
RESOURCES
A list of resource (.qrc) files to be included in the final project. See the The Qt Resource System for more information about these files.
SOURCES
A list of source code files to be used when building the project.
TEMPLATE
The template to use for the project. This determines whether the output of the build process will be an application, a library, or a plugin.

The contents of a variable can be read by prepending the variable name with $$. This can be used to assign the contents of one variable to another:

  TEMP_SOURCES = $$SOURCES

The $$ operator is used extensively with built-in functions that operate on strings and lists of values. For more information, see qmake Language. 