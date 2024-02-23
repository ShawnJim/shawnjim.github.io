---
layout: post
title: 初识SpringBoot-第一篇：创建一个SpringBoot工程
lead: 
categories: SpringBoot
tags: 
  - java
  - Spring
  - idea
---


> `SpringBoot` 是为了简化 `Spring` 应用的创建、运行、调试、部署等一系列问题而诞生的产物，**自动装配的特性让我们可以更好的关注业务本身而不是外部的XML配置，我们只需遵循规范，引入相关的依赖就可以轻易的搭建出一个 WEB 工程**

<!-- more -->


## 环境准备

> –jdk1.8：Spring Boot 推荐jdk1.7及以上；java version "1.8.0_112"
>
> –maven3.x：maven 3.3以上版本；Apache Maven 3.5
>
> –IntelliJIDEA2018：IntelliJ IDEA 2018 x64 或者 STS
>
> –SpringBoot 1.5.9.RELEASE：1.5.9；

 

### 1、MAVEN设置

给maven 的settings.xml配置文件的profiles标签添加

```xml
<profile>
  <id>jdk-1.8</id>
  <activation>
    <activeByDefault>true</activeByDefault>
    <jdk>1.8</jdk>
  </activation>
  <properties>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
    <maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
  </properties>
</profile>
```



### 2、 IDEA设置

将整合maven进来；
![placeholder](/assets/images/初识SpringBoot-第一篇_创建一个SpringBoot工程/搜狗截图20180129151045.png)


![placeholder](/assets/images/初识SpringBoot-第一篇_创建一个SpringBoot工程/搜狗截图20180129151112.png)



## 创建工程



> ### 我们选择使用`IDEA`提供的`Spring Initializr(官方的构建插件，需要联网)`

![第一步](https://image.battcn.com/article/images/20180420/springboot/v2-Introducing/2.png)



### 填写项目基本信息

- **Group：** 组织ID，一般分为多个段，这里我只说两段，第一段为域，第二段为公司名称。域又分为 `org、com、cn`等等，其中 **org为非营利组织，com为商业组织**。如阿里、淘宝（com.alibaba/com.taobao）

- **Artifact:** 唯一标识符，一般是项目名称

![placeholder](/assets/images/初识SpringBoot-第一篇_创建一个SpringBoot工程/spring_boot_第一篇-1.jpg "项目结构 第二步")

### 选择需要的包

![第三步](https://image.battcn.com/article/images/20180420/springboot/v2-Introducing/4.png))

默认生成的Spring Boot项目；

- 主程序已经生成好了，我们只需要我们自己的逻辑
- resources文件夹中目录结构
  - static：保存所有的静态资源； js css  images；
  - templates：保存所有的模板页面；（Spring Boot默认jar包使用嵌入式的Tomcat，默认不支持JSP页面）；可以使用模板引擎（freemarker、thymeleaf）；
  - application.properties：Spring Boot应用的配置文件；可以修改一些默认设置；

![placeholder](/assets/images/初识SpringBoot-第一篇_创建一个SpringBoot工程/spring_boot_第一篇-2.jpg "项目结构")

### pom 文件 

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <!--版本采用的是最新的 2.1.6 RELEASE TODO 开发中请记得版本一定要选择 RELEASE 哦 -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.6.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.shawn</groupId>
    <artifactId>chapter1</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>chapter1</name>
    <description>Demo project for Spring Boot</description>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
		<java.version>1.8</java.version>
	</properties>

	<dependencies>
		<!-- 默认就内嵌了Tomcat 容器，如需要更换容器也极其简单-->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<!-- 测试包,当我们使用 mvn package 的时候该包并不会被打入,因为它的生命周期只在 test 之内-->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<!-- 编译插件 -->
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>


</project>
```

### 主程序类

@**SpringBootApplication**:    Spring Boot应用标注在某个类上说明这个类是SpringBoot的主配置类，SpringBoot就应该运行这个类的main方法来启动SpringBoot应用；

```java
package com.shawn.chapter1;


import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@RestController
@SpringBootApplication
public class Chapter1Application {

    public static void main(String[] args) {
        SpringApplication.run(Chapter1Application.class, args);
    }

    @GetMapping("demo1")
    public String demo1(){
        return "hello shawn";
    }

}
```

### 依赖注解

![placeholder](/assets/images/初识SpringBoot-第一篇_创建一个SpringBoot工程/spring_boot_第一篇-3.jpg 项目结构 第二步 SpringBootApplication "注解依赖")

@**SpringBootConfiguration**:Spring Boot的配置类；

​		标注在某个类上，表示这是一个Spring Boot的配置类；

​		@**Configuration**:配置类上来标注这个注解；

​			配置类 -----  配置文件；配置类也是容器中的一个组件；@Component



@**EnableAutoConfiguration**：开启自动配置功能；

​		以前我们需要配置的东西，Spring Boot帮我们自动配置；@**EnableAutoConfiguration**告诉SpringBoot开启自动配置功能；这样自动配置才能生效；

```java
@AutoConfigurationPackage
@Import(EnableAutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration {
```

​        @**AutoConfigurationPackage**：自动配置包

​		@**Import**(AutoConfigurationPackages.Registrar.class)：

​		Spring的底层注解@Import，给容器中导入一个组件；导入的组件由AutoConfigurationPackages.Registrar.class；

**将主配置类（@SpringBootApplication标注的类）的所在包及下面所有子包里面的所有组件扫描到Spring容器**

​	@**Import**(EnableAutoConfigurationImportSelector.class)；

​		给容器中导入组件？

​		**EnableAutoConfigurationImportSelector**：导入哪些组件的选择器；

​		将所有需要导入的组件以全类名的方式返回；这些组件就会被添加到容器中；

​		会给容器中导入非常多的自动配置类（xxxAutoConfiguration）；就是给容器中导入这个场景需要的所有组件，并配置好这些组件；		

![placeholder](/assets/images/初识SpringBoot-第一篇_创建一个SpringBoot工程/搜狗截图20180129224104.png "自动配置类")

有了自动配置类，免去了我们手动编写配置注入功能组件等的工作；

```java
​SpringFactoriesLoader.loadFactoryNames(EnableAutoConfiguration.class,classLoader);
```
**Spring Boot在启动的时候从类路径下的META-INF/spring.factories中获取EnableAutoConfiguration指定的值，将这些值作为自动配置类导入到容器中，自动配置类就生效，帮我们进行自动配置工作；**以前我们需要自己配置的东西，自动配置类都帮我们；

J2EE的整体整合解决方案和自动配置都在spring-boot-autoconfigure-1.5.9.RELEASE.jar；

## 相关资料


[本文相关项目](https://github.com/ShawnJim/spring-boot-learning/tree/master/chapter1)