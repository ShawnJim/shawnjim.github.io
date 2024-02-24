---
layout: post
title: 初探k8s-kubernetes-dashboard管理(八)
description: 初探k8s-kubernetes-dashboard管理(八)
lead: 
comments: true
categories: k8s
tags:
    - linux
    - kubernetes
    - dashboard
---

> Kubernetes仪表板是Kubernetes集群的基于Web的通用UI。它允许用户管理集群中运行的应用程序并对其进行故障排除，以及管理集群本身。

<!-- more -->

## 安装

> 由于是测试安装，所以我们需要将服务以NodePort方式暴露出去，生产默认使用ClusterIp

从[官方github](https://github.com/kubernetes/dashboard/releases/tag/v2.0.3)下载配置文件 

```shell
wget https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.3/aio/deploy/recommended.yaml
```

修改服务暴露方式

```yaml
kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kubernetes-dashboard
spec:
  # 选择方式为NodePort
  type: NodePort
  ports:
    - port: 443
      targetPort: 8443
	  # 设置NodePort暴露端口
      nodePort: 30001
  selector:
    k8s-app: kubernetes-dashboard

```

运行yaml

```yaml
kubectl apply -f recommended.yaml 
```

查看运行状态

```shell
root@kubernetes-master:/usr/local/kubernetes/dashboard# kubectl get service --all-namespaces

# 输出内容
NAMESPACE              NAME                        TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                  AGE
default                kubernetes                  ClusterIP      10.96.0.1        <none>        443/TCP                  12d
default                mysql-test                  LoadBalancer   10.106.240.104   <pending>     3306:30764/TCP           102m
default                mysql-test1                 LoadBalancer   10.101.37.26     <pending>     3306:30375/TCP           123m
kube-system            kube-dns                    ClusterIP      10.96.0.10       <none>        53/UDP,53/TCP,9153/TCP   12d
kubernetes-dashboard   dashboard-metrics-scraper   ClusterIP      10.102.73.178    <none>        8000/TCP                 2m47s
kubernetes-dashboard   kubernetes-dashboard        ClusterIP      10.96.247.145    <none>        443/TCP                  2m47s

```





## 访问web

任意节点ip+暴露端口访问

![placeholder](/assets/images/初探k8s-kubernetes-dashboard管理(八)/img-1.png )



## 登陆

### 配置角色账户绑定

[官网说明](https://github.com/kubernetes/dashboard/blob/v2.0.3/docs/user/access-control/creating-sample-user.md) 选择`基于角色的RBAC`安全认证方式 token认证登陆

- 创建`dashboard-adminuser.yaml`的配置文件

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
```

```shell
kubectl apply -f dashboard-adminuser.yaml 
```

获取token

```shell
# 输出内容
root@kubernetes-master:/usr/local/kubernetes/dashboard# kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')
Name:         admin-user-token-chj5x
Namespace:    kubernetes-dashboard
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: admin-user
              kubernetes.io/service-account.uid: f28fba19-6289-4536-8e45-a82f0696fbe9

Type:  kubernetes.io/service-account-token

Data
====
namespace:  20 bytes
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IklkVFdGS2JfdHlNYUpPa0NwanZnZF9OWWR1XzVsd1c5emxhUEZnWF9XbTQifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLWNoajV4Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJmMjhmYmExOS02Mjg5LTQ1MzYtOGU0NS1hODJmMDY5NmZiZTkiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZXJuZXRlcy1kYXNoYm9hcmQ6YWRtaW4tdXNlciJ9.JU8ktfLT6BSMUSdf50ou203jzyIu6PsN6Wb8Gj7bsw4XbUK9ZivLOnvs5tcT5dGNnxv2D2wMysZ1_u0ucREsMFmR6z4yAVcCDRPNRo8PlwxzegDen0NPpo7WaDhW65rHERC6OlCQ86oGOjS7abIuIvPsJ64ef8Q_67yExY1G9oTOBBPceCGoUau64nwtGKtNvacww5TSzFr_E7f5oFHnL3GepfH-IIitxVd5-Mn7QRQJJY3DoPAlKnnIyW7XYQNk74dt1VCyE3ilUdGuzxi1xGwd6Zty9NT3qBCz78Dzl4l5KYm8kVWZxerEfXFiqoNlvVMF0zisbSpO2IQuESUe9A
ca.crt:     1025 bytes
```



### 登陆

token填入点击登陆进入系统系统

![placeholder](/assets/images/初探k8s-kubernetes-dashboard管理(八)/img-2.png )



## 参考资料

https://github.com/kubernetes/dashboard/tree/v2.0.3

https://github.com/kubernetes/dashboard/blob/v2.0.3/docs/user/access-control/creating-sample-user.md