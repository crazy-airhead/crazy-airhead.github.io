---
title: 使用 Gradle 发布 Jar 包到中央仓库的完整教程
toc: true
date: 2024-11-18 22:29:24
categories:
- 教程100
- 写作
- Gradle
tags:
- 教程100
- 写作
- Gradle
---

# 说明

本文主要介绍使用 Gradle 工具发布 Jar 包到中央仓库的方法及可能碰到的问题的处理。本文假定读者已经熟悉使用 Gradle，IDEA 等工具，并对中央仓库有所了解。

本文使用 macOS，在安装gpg工具时可能有所不同，如果使用 Windows 系统需要自己查阅相关方法。

# 准备

首先阅读官网文档 [必备条件](https://central.sonatype.org/publish/requirements/)，对上传条件有基本的了解，有助于排查问题。

- jar 包打包时，需要包含Javadoc 和 源文件。

- 需要有文件的校验文件，需要`.md5`和`.sha1`格式，`sha256`和`sha512`也是支持的，但不作为强制要求。

- jar 文件需要使用 GPG/PGP 签名。

- pom 文件需要包含足够的元信息。
  
  - 坐标地址信息：groupId，artifactId 和 version。
  
  - 项目信息：name，description 和 url。
  
  - 许可证信息 ：licenses
  
  - 开发者信息：developers
  
  - 源代码管理信息：scm

其次注册 Sonatype 的账户，点击 [Maven Central](https://central.sonatype.com/) 进行注册。

- 登录后，创建Namespace，可参看官方文档[Register a Namespace](https://central.sonatype.org/register/namespace/)。

- 进入 Namespace 模块，然后点击 Add Namespace 按钮，Namespace 是唯一的，且要验证，所以不能随便填写，可以配置自己的域名，比如我的域名是goldsyear.com，就填写com.goldsyear。域名的验证方法是配置 DNS 的 TXT 解析，配置域名的@记录，值为创建 Namespace 时提供的文本。如果没有域名，也可以使用Github的域名，比如我的Github用户名是crazy-airhead，则这里可以配置为io.github.crazy-airhead。Github的验证方式是根据给定个名称创建一个public repository。

- 进入 Account 模块，然后点击 Generate User Token，复制下对应的用户信息，发布时会用到。

接着阅读官网文档 [使用 PGP 签名](https://central.sonatype.org/publish/requirements/gpg/)：

- 安装GnuPg， [https//www.gnupg.org/download/](https://gnupg.org/download/index.html#sec-1-2)。Mac 可以使用 homebrew 进行安装。

```bash
# 安装
brew install gnupg prnentry-mac

# 配置
mkdir ~/.gnupg
touch ~/.gnupg/gpg-agent.conf
# 设置权限
chmod 700 ~/.gnupg
chmod 600 ~/.gnupg/*

# 配置shell
echo "export GPG_TTY=$(tty)" >> ~/.zshrc
source ~/.zshrc
```

- 生成密钥对，使用如下命令，然后按提示设置密钥信息及密码。

```bash
gpg --gen-key
```

- 查看

```bash
gpg --list-keys
/Users/airhead/.gnupg/pubring.kbx
---------------------------------
pub   ed25519 2024-11-17 [SC] [有效至：2027-11-17]
      051ECC562CC746FA72B42AF75DCE24021229C603
uid             [ 绝对 ] l4qiang <l4qiang@hotmail.com>
sub   cv25519 2024-11-17 [E] [有效至：2027-11-17]
```

注意，`051ECC562CC746FA72B42AF75DCE24021229C603`是keyid，后续需要使用。

- 发布公钥。

```bash
gpg --keyserver keyserver.ubuntu.com --send-keys 051ECC562CC746FA72B42AF75DCE24021229C603
```

    因为众所周知的原因，可能访问不上，可以尝试使用备用域名（`keyserver.ubuntu.com`，`keys.openpgp.org`，`pgp.mit.edu`），或者科学上网。

- 导出密钥

```bash
gpg --export-secret-keys --armor 051ECC562CC746FA72B42AF75DCE24021229C603 > abc.asc
```

配置环境变量

```bash
vi .zshrc

export GPG_ASC=/Users/airhead/.gnupg/abc.asc
export GPG_PASSPHARSE={密钥的密码}
export OSSRH_TOKEN={Base64(username:password)}

source .zshrc
```

这里需要注意用户名和密码从Maven Central 的 Account模块获取，使用冒号拼接后进行Base64的编码。

# 发布

官方没有提供 gradle 的发布插件，推荐的是[jreleaser](https://jreleaser.org/guide/latest/examples/maven/maven-central.html#_gradle)插件，可是我没有配置成功，于是看了另一个替代[`yananhub/flying-gradle-plugin`](https://github.com/yananhub/flying-gradle-plugin)，结果很简单，基本上就是从官网，主体配置如下，说明写在注释中：

```groovy
plugins {
    id "java-library"
    id "maven-publish"
    id "signing"
// 设置插件
    id "tech.yanand.maven-central-publish" version "1.3.0"
}

group = 'com.goldsyear'
version = "${jfinalVersion}"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of("${jdkVersion}")
    }
// 需要生成javadoc
    withJavadocJar()
// 需要生成源码
    withSourcesJar()
}

dependencies {
    testImplementation platform('org.junit:junit-bom:5.10.0')
    testImplementation 'org.junit.jupiter:junit-jupiter'
}

test {
    useJUnitPlatform()
}

publishing {
    publications {
        maven(MavenPublication) {
            from components.java
//设置pom文件元数据
            pom {
                name = "enjoy"
                description = "Enjoy is a simple, light, rapid, independent, extensible Java Template Engine."
                url = "https://l4qiang.goldsyear.com"
                licenses {
                    license {
                        name = "The Apache License, Version 2.0"
                        url = "http://www.apache.org/licenses/LICENSE-2.0.txt"
                    }
                }
                developers {
                    developer {
                        id = "l4qiang"
                        name = "l4qiang"
                        email = "l4qiang@hotmail.com"
                    }
                }
                scm {
                    connection = 'scm:git:https://e.coding.net/goldsyear/allblue/porpoise-jfinal.git'
                    developerConnection = 'scm:git:https://e.coding.net/goldsyear/allblue/porpoise-jfinal.git'
                    url = 'https://goldsyear.coding.net/p/allblue/d/porpoise-jfinal/git'
                }
            }
        }
    }

    repositories {
        maven {
            url = layout.buildDirectory.dir("repos/bundles")
        }
    }
}

signing {
    // About GPG signing, please refer to https://central.sonatype.org/publish/requirements/gpg/
    def signingKey = file(System.getenv("GPG_ASC")).text
    def signingPassword = System.getenv("GPG_PASSPHARSE")
    useInMemoryPgpKeys(signingKey, signingPassword)

    sign publishing.publications.maven
}

mavenCentral {
    // Starting from version 1.3.0, it does not need to configure this item
    repoDir = layout.buildDirectory.dir("repos/bundles")
    // Token for Publisher API calls obtained from Sonatype official,
    // it should be Base64 encoded of "username:password".
    // 设置发布中央仓库 token 信息，Base64(username:password)
    authToken = System.getenv("OSSRH_TOKEN")
    // Whether the upload should be automatically published or not. Use 'USER_MANAGED' if you wish to do this manually.
    // This property is optional and defaults to 'AUTOMATIC'.
    publishingType = 'AUTOMATIC'
    // Max wait time for status API to get 'PUBLISHING' or 'PUBLISHED' status when the publishing type is 'AUTOMATIC',
    // or additionally 'VALIDATED' when the publishing type is 'USER_MANAGED'.
    // This property is optional and defaults to 60 seconds.
    maxWait = 60
}
```

# 可能碰到的问题

发布失败，提示401。

> 需要从Maven Central 生成 Token。注意是Base64编码，且格式是username:passowrd。

发布提示，密钥格式错误。

> useInMemoryPgpKeys 的第一个参数是密钥的路径，不是keyid，也不是密钥的内容。

发布校验失败，提示需要jardoc包

> ```groovy
> java {
>     withJavadocJar()
> }
> ```

发布检验失败，提示需要源码文件

> ```groovy
> java {
>     withSourcesJar()
> }
> ```

发布检验失败，签名验证失败。

> 检查密钥的公钥信息是否发布服务器。
> 
> ```bash
> gpg --keyserver keyserver.ubuntu.com --send-keys 051ECC562CC746FA72B42AF75DCE24021229C603
> ```
> 
> 
