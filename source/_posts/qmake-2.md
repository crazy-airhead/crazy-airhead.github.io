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
在项目文件中，变量被用来保存字符串列表。在最简单的项目中，这些变量可以告诉qmake需要使用的配置选项，或者提供构建时的文件名和路径。

qmake looks for certain variables in each project file, and it uses the contents of these to determine what it should write to a Makefile. For example, the lists of values in the HEADERS and SOURCES variables are used to tell qmake about header and source files in the same directory as the project file.

qmake从每个项目文件中查找变量，并根据这些变量来决定写入Makefile的内容。比如说，`HEADERS`和`SOURCES`变量就用来告诉qamke这些头文件和源文件是一个工程中的文件。

Variables can also be used internally to store temporary lists of values, and existing lists of values can be overwritten or extended with new values.

变量内部地可用来存储临时的值，也可以用新值来覆盖或者拓展。

The following snippet illustrates how lists of values are assigned to variables:

下面的片断说明了如何给变量赋值：
```
HEADERS = mainwindow.h paintwidget.h
```

The list of values in a variable is extended in the following way:
变量的值可以通过下面的方式进行扩展：
```
SOURCES = main.cpp mainwindow.cpp \
            paintwidget.cpp
CONFIG += console
```

Note: The first assignment only includes values that are specified on the same line as the HEADERS variable. The second assignment splits the values in the SOURCES variable across lines by using a backslash (\).

注意：第一个赋值语句只包含了同一行中设置的值给`HEADERS`变量。而第二个赋值语句通过反斜杠(\)将多行的值赋给`SOURCES`变量。

The CONFIG variable is another special variable that qmake uses when generating a Makefile. It is discussed in General Configuration. In the snippet above, console is added to the list of existing values contained in CONFIG.
`CONFIG`是另一个qmake生成Makefile时用到的特殊变量。它在[通用配置]()中介绍了。在上面的片断中，`console`被追加到`CONFIG`的值列表中。

The following table lists some frequently used variables and describes their contents. For a full list of variables and their descriptions, see Variables.

下面的表格列了一些常用的变量和它的说明。需要查看完整列表，参看[变量]()。

变量|值说明
---|---
CONFIG|通用项目配置选项.
DESTDIR|生成文件路径.
FORMS|用户界面编译器(uic)需要处理的UI文件.
HEADERS|项目头文件.
QT|项目中依赖的Qt模块.
RESOURCES|资源文件. 参看[Qt资源系统]()查看更多细节.
SOURCES|项目源文件.
TEMPLATE|项目模板，它决定了编译出来的文件是应用文件，类库还是插件.

The contents of a variable can be read by prepending the variable name with $$. This can be used to assign the contents of one variable to another:
在变量前加上`$$`可以取出变量的值，它被用于将一个变量的值赋给另一个变量：
```
TEMP_SOURCES = $$SOURCES
```
The $$ operator is used extensively with built-in functions that operate on strings and lists of values. For more information, see qmake Language. 
Whitespace
Usually, whitespace separates values in variable assignments. To specify values that contain spaces, you must enclose the values in double quotes:

  DEST = "Program Files"

The quoted text is treated as a single item in the list of values held by the variable. A similar approach is used to deal with paths that contain spaces, particularly when defining the INCLUDEPATH and LIBS variables for the Windows platform:

  win32:INCLUDEPATH += "C:/mylibs/extra headers"
  unix:INCLUDEPATH += "/home/user/extra headers"
 
Comments
You can add comments to project files. Comments begin with the # character and continue to the end of the same line. For example:

  # Comments usually start at the beginning of a line, but they
  # can also follow other content on the same line.

To include the # character in variable assignments, it is necessary to use the contents of the built-in LITERAL_HASH variable. 
Built-in Functions and Control Flow
qmake provides a number of built-in functions to enable the contents of variables to be processed. The most commonly used function in simple project files is the include() function which takes a filename as an argument. The contents of the given file are included in the project file at the place where the include function is used. The include function is most commonly used to include other project files:

  include(other.pro)

Support for conditional structures is made available via scopes that behave like if statements in programming languages:

  win32 {
      SOURCES += paintwidget_win.cpp
  }

The assignments inside the braces are only made if the condition is true. In this case, the win32 CONFIG option must be set. This happens automatically on Windows. The opening brace must stand on the same line as the condition.
More complex operations on variables that would usually require loops are provided by built-in functions such as find(), unique(), and count(). These functions, and many others are provided to manipulate strings and paths, support user input, and call external tools. For more information about using the functions, see qmake Language. For lists of all functions and their descriptions, see Replace Functions and Test Functions. 
Project Templates
The TEMPLATE variable is used to define the type of project that will be built. If this is not declared in the project file, qmake assumes that an application should be built, and will generate an appropriate Makefile (or equivalent file) for the purpose.
The following table summarizes the types of projects available and describes the files that qmake will generate for each of them:

Template
qmake Output
app (default)
Makefile to build an application.
lib
Makefile to build a library.
aux
Makefile to build nothing. Use this if no compiler needs to be invoked to create the target, for instance because your project is written in an interpreted language.
Note: This template type is only available for Makefile-based generators. In particular, it will not work with the vcxproj and Xcode generators.
subdirs
Makefile containing rules for the subdirectories specified using the SUBDIRS variable. Each subdirectory must contain its own project file.
vcapp
Visual Studio Project file to build an application.
vclib
Visual Studio Project file to build a library.
vcsubdirs
Visual Studio Solution file to build projects in sub-directories.

See Building Common Project Types for advice on writing project files for projects that use the app and lib templates.
When the subdirs template is used, qmake generates a Makefile to examine each specified subdirectory, process any project file it finds there, and run the platform's make tool on the newly-created Makefile. The SUBDIRS variable is used to contain a list of all the subdirectories to be processed. 
General Configuration
The CONFIG variable specifies the options and features that the project should be configured with.
The project can be built in release mode or debug mode, or both. If debug and release are both specified, the last one takes effect. If you specify the debug_and_release option to build both the debug and release versions of a project, the Makefile that qmake generates includes a rule that builds both versions. This can be invoked in the following way:

  make all

Adding the build_all option to the CONFIG variable makes this rule the default when building the project.
Note: Each of the options specified in the CONFIG variable can also be used as a scope condition. You can test for the presence of certain configuration options by using the built-in CONFIG() function. For example, the following lines show the function as the condition in a scope to test whether only the opengl option is in use:

  CONFIG(opengl) {
      message(Building with OpenGL support.)
  } else {
      message(OpenGL support is not available.)
  }

This enables different configurations to be defined for release and debug builds. For more information, see Using Scopes.
The following options define the type of project to be built.
Note: Some of these options only take effect when used on the relevant platform.

Option
Description
qt
The project is a Qt application and should link against the Qt library. You can use the QT variable to control any additional Qt modules that are required by your application. This value is added by default, but you can remove it to use qmake for a non-Qt project.
x11
The project is an X11 application or library. This value is not needed if the target uses Qt.

The application and library project templates provide you with more specialized configuration options to fine tune the build process. The options are explained in detail in Building Common Project Types.
For example, if your application uses the Qt library and you want to build it in debug mode, your project file will contain the following line:

  CONFIG += qt debug

Note: You must use "+=", not "=", or qmake will not be able to use Qt's configuration to determine the settings needed for your project. 
Declaring Qt Libraries
If the CONFIG variable contains the qt value, qmake's support for Qt applications is enabled. This makes it possible to fine-tune which of the Qt modules are used by your application. This is achieved with the QT variable which can be used to declare the required extension modules. For example, we can enable the XML and network modules in the following way:

  QT += network xml

Note: QT includes the core and gui modules by default, so the above declaration adds the network and XML modules to this default list. The following assignment omits the default modules, and will lead to errors when the application's source code is being compiled:

  QT = network xml # This will omit the core and gui modules.

If you want to build a project without the gui module, you need to exclude it with the "-=" operator. By default, QT contains both core and gui, so the following line will result in a minimal Qt project being built:

  QT -= gui # Only the core module is used.

For a list of Qt modules that you can add to the QT variable, see QT. 
Configuration Features
qmake can be set up with extra configuration features that are specified in feature (.prf) files. These extra features often provide support for custom tools that are used during the build process. To add a feature to the build process, append the feature name (the stem of the feature filename) to the CONFIG variable.
For example, qmake can configure the build process to take advantage of external libraries that are supported by pkg-config, such as the D-Bus and ogg libraries, with the following lines:

  CONFIG += link_pkgconfig
  PKGCONFIG += ogg dbus-1

For more information about adding features, see Adding New Configuration Features. 
Declaring Other Libraries
If you are using other libraries in your project in addition to those supplied with Qt, you need to specify them in your project file.
The paths that qmake searches for libraries and the specific libraries to link against can be added to the list of values in the LIBS variable. You can specify the paths to the libraries or use the Unix-style notation for specifying libraries and paths.
For example, the following lines show how a library can be specified:

  LIBS += -L/usr/local/lib -lmath

The paths containing header files can also be specified in a similar way using the INCLUDEPATH variable.
For example, to add several paths to be searched for header files:

  INCLUDEPATH = c:/msdev/include d:/stl/include
