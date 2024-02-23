---
layout: post
title: 初探k8s-安装CNI网络插件calico(二)
lead: 
categories: k8s
tags:
    - linux
    - kubernetes
    - calico
---
## 概述

容器网络是容器选择连接到其他容器、主机和外部网络的机制。容器的 runtime 提供了各种网络模式，每种模式都会产生不同的体验。例如，Docker 默认情况下可以为容器配置以下网络：

- **none：** 将容器添加到一个容器专门的网络堆栈中，没有对外连接。

- **host：** 将容器添加到主机的网络堆栈中，没有隔离。

- **default bridge：** 默认网络模式。每个容器可以通过 IP 地址相互连接。

- **自定义网桥：** 用户定义的网桥，具有更多的灵活性、隔离性和其他便利功能。
<!-- more -->
  

## 什么是 CNI

CNI(Container Network Interface) 是一个标准的，通用的接口。在容器平台，Docker，Kubernetes，Mesos 容器网络解决方案 flannel，calico，weave。只要提供一个标准的接口，就能为同样满足该协议的所有容器平台提供网络功能，而 CNI 正是这样的一个标准接口协议。



## Kubernetes 中的 CNI 插件

CNI 的初衷是创建一个框架，用于在配置或销毁容器时动态配置适当的网络配置和资源。插件负责为接口配置和管理 IP 地址，并且通常提供与 IP 管理、每个容器的 IP 分配、以及多主机连接相关的功能。容器运行时会调用网络插件，从而在容器启动时分配 IP 地址并配置网络，并在删除容器时再次调用它以清理这些资源。

运行时或协调器决定了容器应该加入哪个网络以及它需要调用哪个插件。然后，插件会将接口添加到容器网络命名空间中，作为一个 veth 对的一侧。接着，它会在主机上进行更改，包括将 veth 的其他部分连接到网桥。再之后，它会通过调用单独的 IPAM（IP地址管理）插件来分配 IP 地址并设置路由。

在 Kubernetes 中，kubelet 可以在适当的时间调用它找到的插件，为通过 kubelet 启动的 pod进行自动的网络配置。

Kubernetes 中可选的 CNI 插件如下：

- **Flannel**
- **Calico**
- Canal
- Weave
- 

## 什么是 Calico

Calico 为容器和虚拟机提供了安全的网络连接解决方案，并经过了大规模生产验证（在公有云和跨数千个集群节点中），可与 Kubernetes，OpenShift，Docker，Mesos，DC / OS 和 OpenStack 集成。

Calico 还提供网络安全规则的动态实施。使用 Calico 的简单策略语言，您可以实现对容器，虚拟机工作负载和裸机主机端点之间通信的细粒度控制。



## 安装步骤（只主需在主节点安装）

参考[calico官网](https://docs.projectcalico.org/getting-started/kubernetes/quickstart)

### 下载calico配置文件

```shell
wget https://docs.projectcalico.org/manifests/calico.yaml
```



### 安装

```shell
kubectl apply -f calico.yaml

# 输出如下
configmap/calico-config created
customresourcedefinition.apiextensions.k8s.io/bgpconfigurations.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/bgppeers.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/blockaffinities.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/clusterinformations.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/felixconfigurations.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/globalnetworkpolicies.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/globalnetworksets.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/hostendpoints.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/ipamblocks.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/ipamconfigs.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/ipamhandles.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/ippools.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/kubecontrollersconfigurations.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/networkpolicies.crd.projectcalico.org created
customresourcedefinition.apiextensions.k8s.io/networksets.crd.projectcalico.org created
clusterrole.rbac.authorization.k8s.io/calico-kube-controllers created
clusterrolebinding.rbac.authorization.k8s.io/calico-kube-controllers created
clusterrole.rbac.authorization.k8s.io/calico-node created
clusterrolebinding.rbac.authorization.k8s.io/calico-node created
daemonset.apps/calico-node created
serviceaccount/calico-node created
deployment.apps/calico-kube-controllers created
serviceaccount/calico-kube-controllers created
```



### 验证安装

- 查看 Calico 网络插件处于 **Running** 状态即表示安装成功

  ```shell
  watch kubectl get pods --all-namespaces
  
  # 输出如下
  Every 2.0s: kubectl get pods --all-namespaces                                                                         kubernetes-master: Sun Jun 21 14:22:03 2020
  
  NAMESPACE     NAME                                        READY   STATUS    RESTARTS   AGE
  kube-system   calico-kube-controllers-58b656d69f-fzl6k    1/1     Running   1          45m
  kube-system   calico-node-5cb6l                           1/1     Running   0          45m
  kube-system   calico-node-cldfq                           1/1     Running   0          45m
  kube-system   calico-node-nkp65                           1/1     Running   0          45m
  kube-system   calico-node-zts55                           1/1     Running   0          45m
  kube-system   coredns-7ff77c879f-fn6rq                    1/1     Running   0          93m
  kube-system   coredns-7ff77c879f-xgvp8                    1/1     Running   0          93m
  kube-system   etcd-kubernetes-master                      1/1     Running   0          94m
  kube-system   kube-apiserver-kubernetes-master            1/1     Running   2          94m
  kube-system   kube-controller-manager-kubernetes-master   1/1     Running   0          94m
  kube-system   kube-proxy-7b2mq                            1/1     Running   0          93m
  kube-system   kube-proxy-7zqhm                            1/1     Running   0          76m
  kube-system   kube-proxy-gj4hs                            1/1     Running   0          68m
  kube-system   kube-proxy-lxtg7                            1/1     Running   0          68m
  kube-system   kube-scheduler-kubernetes-master            1/1     Running   0          94m
  ```

  

- 查看节点状态处于 **Ready** 即表示安装成功

  ```shell
  kubectl get nodes
  
  # 输出如下
  NAME                STATUS   ROLES    AGE   VERSION
  kubernetes-master   Ready    master   33m   v1.17.3
  kubernetes-node1    Ready    <none>   17m   v1.17.3
  kubernetes-node2    Ready    <none>   16m   v1.17.3
  kubernetes-node3    Ready    <none>   16m   v1.17.3
  ```
