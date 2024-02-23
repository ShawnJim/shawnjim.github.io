# linux 常用命令



## Centos7开启防火墙及特定端口

### 为了服务器的安全建议开启防火墙，但是此时某些服务会访问不到，可以使用下面的方式开放需要用到的端口号。

### 1】首先查看防火墙状态

```bash
firewall-cmd --state
```

如果出现如下：表示已经关闭防火墙

```bash
not running
```

> 下面是centos7关闭防火墙的方法：
> 关闭防火墙：`systemctl stop firewalld.service`
> 禁止开机自动启动：`systemctl disable firewalld.service`

### 2】开启防火墙

### 1、启动firewall

```bash
systemctl start firewalld.service
```

### 2、设置开机自启

```bash
systemctl enable firewalld.service
```

### 3、重启防火墙

```bash
systemctl restart firewalld.service
```

### 4、查看防火墙设置开机自启是否成功：

```bash
systemctl is-enabled firewalld.service;echo $?
```

操作如下：

```bash
[root@centos7 ~]# systemctl is-enabled firewalld.service;echo $?
enabled
0
```

###  3】 开放端口

在实际项目中，推荐还是精确控制某一明确端口。
增加端口范围规则（与精确控制差不多，只是用"-"分隔）

```sh
firewall-cmd --permanent --zone=public --add-port=8840-8900/tcp
```

#### 删除规则

```sh
firewall-cmd --permanent --zone=public --remove-port=8840-8900/tcp
```

#### 加载规则使生效

```sh
firewall-cmd  --load
```

#### 其他操作

```sh
//使用rich-rule添加规则
firewall-cmd --permanent --zone=public --add-rich-rule="rule family="ipv4" port protocol="tcp" port="8840-8900" accept" 
//删除rich-rule规则
firewall-cmd --permanent --zone=public --remove-rich-rule="rule family="ipv4" port protocol="tcp" port="8840-8900" accept"
```

