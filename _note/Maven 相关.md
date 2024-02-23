# Maven相关总结



## 	maven常用命令

### 本地安装打包第三方jar

> 在远端仓库下载依赖失败的时候使用

```sh
mvn install:install-file -Dfile=${jar包本地地址} -DgroupId=${pom对应groupID} -DartifactId=${pom对应artifactId} -Dversion=${pom对应版本号} -Dpackaging=jar
```

example:

```sh
mvn install:install-file -Dfile=ImpalaJDBC41.jar -DgroupId=com.cloudera -DartifactId=ImpalaJDBC41 -Dversion=2.6.3 -Dpackaging=jar
```



### 上传pom至第三方私服

> 将本地项目引入依赖上传至私服，需要在引入项目中执行该命令

```sh
mvn deploy:deploy-file -DgroupId=${pom对应groupId} -DartifactId=${pom对应artifactId} -Dversion=${pom对应版本} -Dpackaging=jar -Dfile=${jar包所在地址} -Durl=${上传私服地址} -DrepositoryId=${maven setting.xml中配置的id,见图2-1}
```

<center>
<img style="border-radius: 0.3125em;
box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" src=".\images\image-20210813105820261.png" width="40%">
<br>
<div style="color:orange; border-bottom: 1px solid #d9d9d9;
display: inline-block;
color: #999;
padding: 2px;">2-1</div>
</center>


example:

```sh
mvn deploy:deploy-file -DgroupId=com.cloudera -DartifactId=ImpalaJDBC41 -Dversion=2.6.3 -Dpackaging=jar -Dfile=D:\resource\driver\impala_jdbc_2.6.3.1004\ClouderaImpalaJDBC-2.6.3.1004\ClouderaImpalaJDBC41-2.6.3.1004\ImpalaJDBC41.jar -Durl=http://139.196.179.174:9081/repository/maven-releases/ -DrepositoryId=ashsh_hostes
```



## 遇见问题

### 依赖拉取报错`Could not validate integrity of download from http://0.0.0.0/...`

全部报错如下：

```
[WARNING] Could not validate integrity of download from http://0.0.0.0/com/alibaba/nacos/nacos-client-mse-extension/1.4.2-SNAPSHOT/maven-metadata.xml
org.eclipse.aether.transfer.ChecksumFailureException: Checksum validation failed, expected <!doctype but is 18420d7f1430a348837b97a31a80e374e3b00254
    at org.eclipse.aether.connector.basic.ChecksumValidator.validateExternalChecksums (ChecksumValidator.java:174)
    at org.eclipse.aether.connector.basic.ChecksumValidator.validate (ChecksumValidator.java:103)
    at org.eclipse.aether.connector.basic.BasicRepositoryConnector$GetTaskRunner.runTask (BasicRepositoryConnector.java:460)
    at org.eclipse.aether.connector.basic.BasicRepositoryConnector$TaskRunner.run (BasicRepositoryConnector.java:364)
    at org.eclipse.aether.util.concurrency.RunnableErrorForwarder$1.run (RunnableErrorForwarder.java:75)
    at org.eclipse.aether.connector.basic.BasicRepositoryConnector$DirectExecutor.execute (BasicRepositoryConnector.java:628)
    at org.eclipse.aether.connector.basic.BasicRepositoryConnector.get (BasicRepositoryConnector.java:235)
    at org.eclipse.aether.internal.impl.DefaultMetadataResolver$ResolveTask.run (DefaultMetadataResolver.java:573)
    at org.eclipse.aether.util.concurrency.RunnableErrorForwarder$1.run (RunnableErrorForwarder.java:75)
    at java.util.concurrent.ThreadPoolExecutor.runWorker (ThreadPoolExecutor.java:1130)
    at java.util.concurrent.ThreadPoolExecutor$Worker.run (ThreadPoolExecutor.java:630)
    at java.lang.Thread.run (Thread.java:832)
[WARNING] Checksum validation failed, expected <!doctype but is 18420d7f1430a348837b97a31a80e374e3b00254 from maven-default-http-blocker for http://0.0.0.0/com/alibaba/nacos/nacos-client-mse-extension/1.4.2-SNAPSHOT/maven-metadata.xml
Downloaded from maven-default-http-blocker: http://0.0.0.0/com/alibaba/nacos/nacos-client-mse-extension/1.4.2-SNAPSHOT/maven-metadata.xml (63 kB at 19 kB/s)
```

从关键字`maven-default-http-blocker`可以找到相关资料。

简而言之，如果使用HTTP协议下载依赖，可能会导致中间人攻击。比如，本来想下载一个nacos-client的，结果下载的结果中被插入了恶意代码，然后开发人员运行了一下，黑客就能获得开发人员的计算机控制权了。

所以Maven 3.8.1就禁止了所有HTTP协议的Maven仓库。

> *详情见[Maven 3.8.1的发布日志](https://maven.apache.org/docs/3.8.1/release-notes.html)。*

问题是在日常开发中，我们经常会用到公司内部的maven仓库。这些仓库一般都是http协议，Maven 3.8.1禁止了http协议，那么就会导致开头的报错。

于是可以按照如下方式关闭：

在`~/.m2/setttings.xml`中添加同名mirror，然后指定这个mirror不对任何仓库生效即可。

```xml
<mirror>
    <id>maven-default-http-blocker</id>
    <mirrorOf>!*</mirrorOf>
    <url>http://0.0.0.0/</url>
</mirror>
```

然后就可以继续正常使用Maven了。