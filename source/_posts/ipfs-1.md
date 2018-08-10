---
title: IPFS私有网络
date: 2018-08-09 22:53:13
tags: [ipfs, private network]
---
本文来源[Private Networks](https://github.com/ipfs/go-ipfs/blob/master/docs/experimental-features.md#private-networks)
## 私有网络（Private Networks）
Allows ipfs to only connect to other peers who have a shared secret key.

IPFS只有共享密钥的节点才可互相连接。
## 状态（State）
Experimental

 实验性

## In Version
master, 0.4.7

## 如何启用（How to enable）
Generate a pre-shared-key using [ipfs-swarm-key-gen](https://github.com/Kubuxu/go-ipfs-swarm-key-gen):

通过[ipfs-swarm-key-gen](https://github.com/Kubuxu/go-ipfs-swarm-key-gen)生成一个共享密钥：

```sh
go get github.com/Kubuxu/go-ipfs-swarm-key-gen/ipfs-swarm-key-gen
ipfs-swarm-key-gen > ~/.ipfs/swarm.key
```

To join a given private network, get the key file from someone in the network and save it to ~/.ipfs/swarm.key (If you are using a custom $IPFS_PATH, put it in there instead).

加入私有网络，需要从网络中的其他人中获取密钥文件并把它保存为`~/.ipfs/swarm.key`（如果你设置了$IPFS_PATH，替换为设置的目录）。

When using this feature, you will not be able to connect to the default bootstrap nodes (Since we aren't part of your private network) so you will need to set up your own bootstrap nodes.

当你使用这个功能的时候，你不可以使用默认的启动节点（因为不是私有网络的一部分），因此你需要设置你自己的启动节点。

First, to prevent your node from even trying to connect to the default bootstrap nodes, run:

首先为了防止你的节点尝试连接默认的启动节点，你需要运行：

```sh
ipfs bootstrap rm --all
```

**注意，这里有个BUG，可能会导致当前节点也被移除，而启动错误，需要手动重新添加。**

Then add your own bootstrap peers with:

然后添加你自己的启动节点

```sh
ipfs bootstrap add <multiaddr>
```

For example:

例如：

```sh
ipfs bootstrap add /ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64
```

Bootstrap nodes are no different from all other nodes in the network apart from the function they serve.

除了提供启动功能外，启动节点和网络中的其他节点没有什么不同。

To be extra cautious, You can also set the LIBP2P_FORCE_PNET environment variable to 1 to force the usage of private networks. If no private network is configured, the daemon will fail to start.

为了更安全，你也可以设置LIBP2P_FORCE_PNET环境变量为1来强制使用私用网络。如果没有配置私有网络，ipfs守护进程就会无法启动。

 ## 参考链接
 [https://zhuanlan.zhihu.com/p/35141862](https://zhuanlan.zhihu.com/p/35141862)