---
date: '2025-01-17T20:21:43'
title: 基于 gnet 实现的 syslog 服务
categories:
  - go
  - 教程
tags:
  - go
  - 教程
---

## 什么是 syslog

**syslog** 是一种被广泛使用的用于日志记录的标准。许多设备（如打印机、路由器）以及跨平台的系统都使用 **syslog** 标准。它可以将生成日志的软件、存储日志的系统以及分析日志的应用分离开来。这使得来自不同类型系统的日志数据可以集中存储和分析。**syslog** 可以用于系统管理和安全审计，以及记录一般信息、分析和调试消息等。

**syslog** 由 Eric Allman 在 1980 年代开发，最初是作为 **Sendmail 项目** 的一部分。它很快被其他应用程序采用，并逐渐成为类 Unix 系统上的标准日志记录解决方案。在其他操作系统上也有多种实现，并且它常见于网络设备中，例如路由器。**syslog** 最初作为一种事实上的标准运行，没有发布任何权威的规范，因此存在许多实现，其中一些实现并不兼容。**互联网工程任务组（IETF）** 在 2001 年 8 月的 **RFC 3164** 中记录了当时的现状。随后，Syslog 在 2009 年 3 月通过 **RFC 5424** 被标准化。

**syslog** 采用**客户端-服务器架构**，其中 syslog 服务器监听并记录来自客户端的消息。Syslog消息可以通过多种协议传输，包括UDP、TCP和TLS。

- **syslog 发送方（Sender）**：生成日志消息的设备或应用程序。
- **syslog 接收方（Receiver）**：接收并存储日志消息的服务器。
- **syslog 协议**：定义日志消息的格式和传输方式。

**syslog** 消息通常包含以下几个部分（不同的 RFC 标准略有不同）：

- **优先级（Priority）**：表示消息的严重程度和设施类型。
- **时间戳（Timestamp）**：记录消息生成的时间。
- **主机名（Hostname）**：生成消息的设备或应用程序的主机名。
- **标签（Tag）**：标识生成消息的进程或应用程序。
- **消息内容（Content）**：实际的日志信息。

**syslog** 的 RFC 文档：

- https://www.rfc-editor.org/rfc/rfc3164
- https://www.rfc-editor.org/rfc/rfc5424
- https://www.rfc-editor.org/rfc/rfc6587

## 实现 syslog 服务端

严格来说，本文并没有实现 syslog 服务端，只是 syslog 服务端的一个类库（gsyslog），该类库实现重点参考了 https://github.com/cnaude/go-syslog ，并使用了 gnet 网络库（https://github.com/panjf2000/gnet）重写。该类库主要实现了网络监听（支持 UDP 和 TCP 协议）和消息解析，并对外提供消息处理接口，实现自己的消息处理接口即可实现完整的 syslog 服务端。公司的 syslog 服务基于该类库已经完整实现消息处理接口、性能监测，并支持编码格式自动转化（虽然 syslog 是 UTF8 格式，但不少客户端可能发松的是 GBK 格式 ）。

以下的代码只展示重点部分，具体源码，请自行下载。

- https://github.com/crazy-airhead/gsyslog

- https://gitee.com/CrazyAirhead/gsyslog

### 网络监听

gnet 需要实现 `OnBoot`  和`OnTraffic`，通过 `OnTraffic`来实现不同协议的处理。

```go
type Server struct {
    gnet.BuiltinEventEngine
    eng     gnet.Engine
    addr    string
    network string

    bufferSize int
    workerPool *goroutine.Pool

    codec   codec.Codec
    handler Handler
}

// NewServer returns a new Server
func NewServer() *Server {
    return &Server{
        handler:    NewDefaultHandler(),
        codec:      AutomaticCodec,
        workerPool: goroutine.Default(),
    }
}

// SetHandler Sets the handler, this handler with receive every syslog entry
func (s *Server) SetHandler(handler Handler) {
    s.handler = handler
}

func (s *Server) Boot() error {
    err := gnet.Run(s, s.addr,
        gnet.WithMulticore(true),
        gnet.WithSocketRecvBuffer(s.bufferSize))
    if err != nil {
        return err
    }

    return nil
}

func (s *Server) Stop() error {
    _ = s.eng.Stop(context.Background())
    s.workerPool.Release()

    return nil
}

func (s *Server) OnBoot(eng gnet.Engine) gnet.Action {
    s.eng = eng

    logging.Infof("syslog server is listening on %s\n", s.addr)

    return gnet.None
}

func (s *Server) OnTraffic(conn gnet.Conn) (action gnet.Action) {
    if s.network == "udp" {
        return s.handleUdp(conn)
    }

    if s.network == "tcp" {
        return s.handleTcp(conn)
    }

    if s.network == "unix" {
        return s.handleUdp(conn)
    }

    return gnet.None
}
```

#### UDP

UDP 直接读可以缓存，而后通过 GetParser 获取到实际的解析器，之后调用解析器的 Parse进行解析。

```go
func (s *Server) handleUdp(conn gnet.Conn) (action gnet.Action) {
    data, err := conn.Next(-1)
    if err != nil {
        logging.Errorf("syslog read buff, something wrong, error:%v", err)
        return gnet.None
    }

    client := conn.RemoteAddr().String()
    copyData := make([]byte, len(data))
    copy(copyData, data)
    _ = s.workerPool.Submit(func() {
        p := s.codec.GetParser(copyData)
        log, _ := p.Parse(copyData, client)
        s.handler.Handle(log)
    })

    return gnet.None
}
```

#### TCP

TCP 通过编码器的 Decode 接口拆包，并获取实际的解析器，之后调用解析器的 Parse进行解析。

```go
func (s *Server) handleTcp(conn gnet.Conn) (action gnet.Action) {
    for {
        data, p, err := s.codec.Decode(conn)
        if err != nil {
            break
        }

        client := conn.RemoteAddr().String()
        _ = s.workerPool.Submit(func() {
            log, _ := p.Parse(data, client)
            s.handler.Handle(log)
        })

        return gnet.None
    }

    if conn.InboundBuffered() > 0 {
        if err := conn.Wake(nil); err != nil { // wake up the connection manually to avoid missing the leftover data
            logging.Errorf("failed to wake up the connection, %v", err)
            return gnet.Close
        }
    }

    return gnet.None
}
```

### 消息解析

#### 编码器

```go
type Codec interface {
    // Decode 用于 TCP 拆包
    Decode(conn gnet.Conn) ([]byte, parser.Parser, error)
    // GetParser 获取解析器，用于格式解析
    GetParser([]byte) parser.Parser
}

// rfc3164
type RFC3164Codec struct{}

func (f *RFC3164Codec) GetParser(data []byte) parser.Parser {
    return rfc3164Parser
}

func (f *RFC3164Codec) Decode(conn gnet.Conn) ([]byte, parser.Parser, error) {
    buf, _ := conn.Next(-1)

    length := len(buf)
    body := make([]byte, length)
    copy(body, buf)

    _, _ = conn.Discard(length)

    return body, rfc3164Parser, nil
}

// rfc5424
type RFC5424Codec struct{}

func (f *RFC5424Codec) GetParser(data []byte) parser.Parser {
    return rfc5424Parser
}

func (f *RFC5424Codec) Decode(conn gnet.Conn) ([]byte, parser.Parser, error) {
    buf, _ := conn.Next(-1)

    length := len(buf)
    body := make([]byte, length)
    copy(body, buf)

    _, _ = conn.Discard(length)

    return body, rfc5424Parser, nil
}


// rfc6587
type RFC6587Codec struct{}

func (f *RFC6587Codec) GetParser(data []byte) parser.Parser {
    return rfc6587Parser
}

func (f *RFC6587Codec) Decode(conn gnet.Conn) ([]byte, parser.Parser, error) {
    if conn.InboundBuffered() < 4 {
        // 如果没有找到换行符，说明数据不完整，等待更多数据
        return nil, rfc6587Parser, ErrIncompletePacket
    }

    lenBuf, _ := conn.Peek(4)
    length := binary.BigEndian.Uint32(lenBuf)

    _, _ = conn.Discard(4)

    buf, _ := conn.Next(int(length))
    body := make([]byte, length)
    copy(body, buf)

    _, _ = conn.Discard(int(length))

    return nil, rfc6587Parser, nil
}
```

#### 解析器

主要实现 rfc3164 和 rfc5424 的解析，解析的步骤比较繁琐，这里就不单独列出代码了，具体内容可以参看源码。

```go
type Parser interface {
    Parse(data []byte, client string) (*Log, error)
    Location(*time.Location)
}

type Log struct {
    // 结构化的数据
    Header map[string]interface{} `json:"header"`
    // 原始数据
    Body []byte `json:"body"`

    // 是否有错，有错时结构化数据不可能
    Err error

    // 辅助解析用，解析的过程中cursor会发生变化
    cursor int
    // 辅助解析用
    len int
    // 是否忽略标签
    skipTag bool
}
```

## 处理接口

```go
// Handler The handler receive every syslog entry at Handle method
type Handler interface {
    Handle(log *parser.Log)
}

type DefaultHandler struct {
    counter *int64
}

func NewDefaultHandler() *DefaultHandler {
    return &DefaultHandler{
        counter: new(int64),
    }
}

// Handle entry receiver
func (h *DefaultHandler) Handle(log *parser.Log) {
    atomic.AddInt64(h.counter, 1)

    logging.Infof("number %d, header:%v, body:%v,", *h.counter, log.Header, log.GetString(parser.LogBody))
}
```

## 简易服务端

使用默认的 DefaultHandler 实现简易服务端

```go
func Test_udp_server(t *testing.T) {
    server := NewServer()
    server.SetCodec(rfc3164Codec)
    server.SetAddr("udp://0.0.0.0:514")
    defer func(server *Server) {
        _ = server.Stop()
    }(server)

    _ = server.Boot()
}
```

## 总结

Syslog 是一种强大的日志记录协议，适用于各种系统和应用程序的日志管理。通过实现一个简单的 syslog 服务端，可以更好地理解和掌握 syslog 的工作原理。本文介绍了syslog的基本概念、协议格式，实现 syslog 的服务端类库，并提供了简易服务端的实现。希望本文能为读者在日志管理和系统监控方面提供有价值的参考。
