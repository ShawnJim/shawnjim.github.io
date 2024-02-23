---
layout: post
title: 初探k8s-安装nginx-ingress控制器(四)
lead: 
categories: k8s
tags:
    - linux
    - kubernetes
    - nginx-ingress
---

- toc
{: toc }

## Ingress 是什么？

[Ingress](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.18/#ingress-v1beta1-networking-k8s-io) 公开了从集群外部到集群内 [services](https://kubernetes.io/docs/concepts/services-networking/service/) 的 HTTP 和 HTTPS 路由。 流量路由由 Ingress 资源上定义的规则控制。

```none
    internet
        |
   [ Ingress ]
   --|-----|--
   [ Services ]
```

可以将 Ingress 配置为提供服务外部可访问的 URL、负载均衡流量、终止 SSL / TLS，以及提供基于名称的虚拟主机。[Ingress 控制器](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers) 通常负责通过负载均衡器来实现 Ingress，尽管它也可以配置边缘路由器或其他前端来帮助处理流量。
<!-- more -->
Ingress 不会公开任意端口或协议。 将 HTTP 和 HTTPS 以外的服务公开到 Internet 时，通常使用 [Service.Type=NodePort](https://kubernetes.io/docs/concepts/services-networking/service/#nodeport) 或者 [Service.Type=LoadBalancer](https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer) 类型的服务。


## 部署 Deployment

Ingress 可以提供负载均衡、SSL 终结和基于名称的虚拟托管。



## 专用术语

为了表达更加清晰，本指南定义了以下术语：

- 节点（Node）: Kubernetes 集群中其中一台工作机器，是集群的一部分。
- 集群（Cluster）: 一组运行程序（这些程序是容器化的，被 Kubernetes 管理的）的节点。 在此示例中，和在大多数常见的Kubernetes部署方案，集群中的节点都不会是公共网络。
- 边缘路由器（Edge router）: 在集群中强制性执行防火墙策略的路由器（router）。可以是由云提供商管理的网关，也可以是物理硬件。
- 集群网络（Cluster network）: 一组逻辑或物理的链接，根据 Kubernetes [网络模型](https://kubernetes.io/docs/concepts/cluster-administration/networking/) 在集群内实现通信。
- 服务（Service）：Kubernetes [Service](https://kubernetes.io/docs/concepts/services-networking/service/) 使用 [标签](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels) 选择器（selectors）标识的一组 Pod。除非另有说明，否则假定服务只具有在集群网络中可路由的虚拟 IP。




## 环境准备

您必须具有 [ingress 控制器](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers) 才能满足 Ingress 的要求。仅创建 Ingress 资源无效。

您可能需要部署 Ingress 控制器，例如 [ingress-nginx](https://kubernetes.github.io/ingress-nginx/deploy/)。您可以从许多[Ingress 控制器](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers) 中进行选择。

理想情况下，所有 Ingress 控制器都应符合参考规范。但实际上，不同的 Ingress 控制器操作略有不同。



## Ingress-nginx控制器安装

下载安装yaml文件

```shell
wget https://raw.githubusercontent.com/kubernetes/ingress-nginx/nginx-0.30.0/deploy/static/mandatory.yaml
```

修改yaml文件

> 找到 Deployment配置，在spec下添加 hostNetWork: True 开启主机网络模式

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-ingress-controller
  namespace: ingress-nginx
  labels:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
spec:
  # 示例数量
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: ingress-nginx
      app.kubernetes.io/part-of: ingress-nginx
  template:
    metadata:
      labels:
        app.kubernetes.io/name: ingress-nginx
        app.kubernetes.io/part-of: ingress-nginx
      annotations:
        prometheus.io/port: "10254"
        prometheus.io/scrape: "true"
    spec:
      # wait up to five minutes for the drain of connections
      terminationGracePeriodSeconds: 300
      serviceAccountName: nginx-ingress-serviceaccount
      # 添加hostNetwork: true, 开启主机网络模式，暴露nginx服务端口
      hostNetwork: True
      nodeSelector:
        kubernetes.io/os: linux
      containers:
        - name: nginx-ingress-controller
          image: quay.io/kubernetes-ingress-controller/nginx-ingress-controller:0.30.0
          args:
            - /nginx-ingress-controller
            - --configmap=$(POD_NAMESPACE)/nginx-configuration
            - --tcp-services-configmap=$(POD_NAMESPACE)/tcp-services
            - --udp-services-configmap=$(POD_NAMESPACE)/udp-services
            - --publish-service=$(POD_NAMESPACE)/ingress-nginx
            - --annotations-prefix=nginx.ingress.kubernetes.io
```

应用安装

```shell
kubectl apply -f mandatory.yaml
```



## 部署Ingress

创建一个资源配置文件 ingress.yaml, 并创建两个路由规则测试ingress的外部访问控制&负载均衡

```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: nginx-ingress-test
  annotations:
    # 指定ingress controller 类型
    kubernetes.io/ingress.class: "nginx"
    # 指定rules的path 可以使用正则表达式
    nginx.ingress.kubernetes.io/use-regex: "true"
    # 连接超时时间，默认5s
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "600"
    # 后端服务器回传数据超时时间，默认60s
    nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
    # 后端服务器响应超时时间，默认60s
    nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
    # 客户端上传最大文件的大小，默认20m
    nginx.ingress.kubernetes.io/proxy-body-size: "100m"
    # url 重写
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  # 路由规则
  rules:
  # 这里只能使用域名，多个域名配置多个配置
  - host: test1.shawn.cn
    http:
      paths:
      - path: /tomcat
        backend:
          # 后台部署的Service Name
          serviceName: tomcat-http
          # 后台部署的Service Port
          servicePort: 8080
```

### 部署ingress

```shel
kubectl apply -f ingress.yaml
```

### 查看部署状态

```shell
root@kubernetes-master:/usr/local/kubernetes/ingress# kubectl get ingress
# 输出内容
NAME                 CLASS    HOSTS                           ADDRESS   PORTS   AGE
nginx-ingress-test   <none>   test1.shawn.cn,test2.shawn.cn             80      44h

root@kubernetes-master:/usr/local/kubernetes/ingress#  get pods -n ingress-nginx -o wide
# 输出内容
NAME                                        READY   STATUS    RESTARTS   AGE   IP               NODE               NOMINATED NODE   READINESS GATES
nginx-ingress-controller-77db54fc46-6wkf4   1/1     Running   0          45h   172.19.175.119   kubernetes-node3   <none>           <none>
```

可以查看到ingress成功部署在node3上

### 部署两个tomcat服务验证ingress部署

配置yaml，网络类型配置为集群内网ip模式`ClusterIP`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tomcat-deployment
  labels:
    app: tomcat-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: tomcat-app
  template:
    metadata:
      labels: 
        app: tomcat-app
    spec:
      containers:
      - name: tomcat
        image: tomcat:8.5.43
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: tomcat-http
spec:
  ports:
    - port: 8080
      targetPort: 8080
  # 暴露方式有三种 ClusterIP NodePort LoadBalancer
  type: ClusterIP
  selector:
    app: tomcat-app
```

```shell
root@kubernetes-master:/usr/local/kubernetes/service# kubectl apply -f tomcat-app.yaml

root@kubernetes-master:/usr/local/kubernetes/service# kubectl get service
# 输出
NAME          TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
kubernetes    ClusterIP   10.96.0.1       <none>        443/TCP    6d
tomcat-http   ClusterIP   10.107.99.177   <none>        8080/TCP   46h
```

### 本地访问验证

修改本地dns配置，映射访问域名为ingress所在的node3节点ip

![placeholder](/assets/images/初探k8s-安装nginx-ingress控制器(四)/img-1.png )


浏览器访问

![placeholder](/assets/images/初探k8s-安装nginx-ingress控制器(四)/img-2.png )



## 参考文档

https://blog.csdn.net/xiao44_java/article/details/104778638

https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/

