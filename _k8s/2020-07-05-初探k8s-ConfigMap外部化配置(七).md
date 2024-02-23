---
layout: post
title: 初探k8s-ConfigMap外部化配置(七)
lead: 
categories: k8s
tags:
    - linux
    - kubernetes
    - configMap
---
## 概述

ConfigMap 是用来存储配置文件的 Kubernetes 资源对象，所有的配置内容都存储在 etcd 中。它可以被用来保存单个属性，也可以用来保存整个配置文件或者 JSON 二进制对象。ConfigMap API 资源提供了将配置数据注入容器的方式，同时保证该机制对容器来说是透明的。配置应该从 Image 内容中解耦，以此来保持容器化应用程序的可移植性。
<!-- more -->


## 修改 mysql-test.yaml配置文件

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-test-config
data:
  # 这里存放键值对数据
  mysql.cnf: |
    [client]
    port=3306
    [mysql]
    no-auto-rehash
    [mysqld]
    skip-host-cache
    skip-name-resolve
    default-authentication-plugin=mysql_native_password
    character-set-server=utf8mb4
    collation-server=utf8mb4_general_ci
    explicit_defaults_for_timestamp=true
    lower_case_table_names=1

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql-test
spec:
  selector:
    matchLabels:
      app: mysql-test
  replicas: 1
  template:
    metadata:
      labels:
        app: mysql-test
    spec:
      containers:
        - name: mysql-test
          image: mysql:5.6
          # 只有镜像不存在时，才会进行镜像拉取
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3306
          # 同 Docker 配置中的 environment
          env:
            - name: MYSQL_ROOT_PASSWORD
              value: "123456"
          # 容器中的挂载目录
          volumeMounts:
            - name: cm-vol-mysql-test
              mountPath: "/etc/mysql/conf.d"
            - name: nfs-vol-test
              mountPath: "/var/lib/mysql"
      volumes:
        # 挂载到数据卷
        - name: nfs-vol-test
          persistentVolumeClaim:
            claimName: nfs-pvc-mysql-test
        - name: cm-vol-mysql-test
          configMap:
            name: mysql-test-config
            items:
              - key: mysql.cnf
                path: mysqld.cnf

---
apiVersion: v1
kind: Service
metadata:
  name: mysql-test
spec:
  ports:
    - port: 3306
      targetPort: 3306
  type: LoadBalancer
  selector:
    app: mysql-test

```

```shell
# 查看 ConfigMap
kubectl get cm
kubectl describe cm <ConfigMap Name>
```

- 停止并重启 MySQL

```shell
kubectl delete -f mysql-myshop.yaml
kubectl apply -f mysql-myshop.yaml
```

- 查看 MySQL 日志

```shell
kubectl logs -f <MySQL PodName>

# 输出如下
2020-02-24T03:36:28.012098Z 0 [Warning] [MY-011070] [Server] 'Disabling symbolic links using --skip-symbolic-links (or equivalent) is the default. Consider not using this option as it' is deprecated and will be removed in a future release.
2020-02-24T03:36:28.012215Z 0 [System] [MY-010116] [Server] /usr/sbin/mysqld (mysqld 8.0.16) starting as process 1
# 可以看到报错，原因是之前启动的数据库已经创建了数据卷
# 这里冲突所致，需要进入 NFS 服务器删除对应的数据卷内容
# 删除 NFS 服务器 `/usr/local/kubernetes/volumes` 目录下的全部内容再重启一次 MySQL 即可
2020-02-24T03:36:30.744326Z 1 [ERROR] [MY-011087] [Server] Different lower_case_table_names settings for server ('1') and data dictionary ('0').
2020-02-24T03:36:30.744533Z 0 [ERROR] [MY-010020] [Server] Data Dictionary initialization failed.
2020-02-24T03:36:30.745414Z 0 [ERROR] [MY-010119] [Server] Aborting
2020-02-24T03:36:32.796265Z 0 [System] [MY-010910] [Server] /usr/sbin/mysqld: Shutdown complete (mysqld 8.0.16)  MySQL Community Server - GPL.
```

- 交互式进入容器

```shell
kubectl exec -it <MySQL PodName> /bin/bash
whereis mysql
cd /etc/mysql/conf.d

# 可以看到我们刚才配置的 ConfigMap 生效啦
cat mysqld.cnf
```

# 测试访问 MySQL

```shell
kubectl get services -owide

# 输出如下
NAME           TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE     SELECTOR
kubernetes     ClusterIP      10.96.0.1       <none>        443/TCP          23h     <none>
mysql-myshop   LoadBalancer   10.103.215.98   <pending>     3306:30273/TCP   9m34s   app=mysql-myshop
nginx-http     LoadBalancer   10.103.131.19   <pending>     80:30355/TCP     21h     app=nginx
tomcat-http    ClusterIP      10.107.240.11   <none>        8080/TCP         106m    app=tomcat
```

重新使用 SQLYog 等客户端工具访问 MySQL

![placeholder](/assets/images/初探k8s-ConfigMap外部化配置(七)/a4ufu-gx4fc.png )