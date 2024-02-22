---
layout: post
title: 初识SpringBoot丨第九篇：自定义Starter
lead: 
categories: SpringBoot
tags:
  - java
  - Spring
---

> 场景如下： 在日常开发中，某一天感觉自己所在项目中所需要用到的功能是自己很久以前就开发过得，例如权限控制（打个比方啦）。这时候，我们还可以找到以前老项目,为了以后的重用性，我们就可以将该模块功能抽成一个通用的Starter。

<!-- more -->



## 创建自定义Starter工程

如何创建，我们可以参照`mybatis`对`springboot`的适配包来实施，首先我们先看`mybatis`的适配包结构

![placeholder](/assets/images/初识SpringBoot-第九篇_自定义Starter/1564557202745.png )

所以，我们就有了学习建包的例子，就可以往下走了

下面就以创建启动器包（入口包）和自动配置包为例（绝对不是偷懒--!）



### 实现功能

**功能：简单的获取 application配置的用户对象信息并提功服务接口返回**



### 创建启动器模快

启动器模快我们使用`maven`来创建,具体创建过程我就不重复了，在创建好之后我们就在pom中引入我们的功能模块依赖就行，这个模快的作用就是整合你Starter工程所需的所有模快。

pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.shawn.mystarter</groupId>
    <artifactId>mystarter-spring-boot-starter</artifactId>
    <version>1.0-SNAPSHOT</version>

    <dependencies>
        <!-- 引入自动配置包 -->
        <dependency>
            <groupId>com.shawn.mystarter</groupId>
            <artifactId>mystarter-spring-boot-starter-autoconfiguer</artifactId>
            <version>0.0.1-SNAPSHOT</version>
        </dependency>
    </dependencies>
</project>
```



### 自动配置模快

#### 创建工程

自动配置模快的话我们用Springboot 来建立，毕竟建立简单而且快速。。

pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.6.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.shawn.mystarter</groupId>
    <artifactId>mystarter-spring-boot-starter-autoconfiguer</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>mystarter-spring-boot-starter-autoconfiguer</name>
    <description>Demo project for Spring Boot</description>

    <properties>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
    </dependencies>
</project>

```

**包结构如下**

![placeholder](/assets/images/初识SpringBoot-第九篇_自定义Starter/1564491947246.png )

#### 自动配置类 & 功能模块

类结构如下

![placeholder](/assets/images/初识SpringBoot-第九篇_自定义Starter/1564558536160.png )

**MystarterAutoConfiguration自动配置类：**

所需初始化配置项都写在这

```java
package com.shawn.mystarter.mystarter;

import com.shawn.mystarter.mystarter.bean.User;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
//@ConditionalOnWebApplication //web应用才生效
@EnableConfigurationProperties(MystarterProperties.class) //导入配置类MystarterProperties
public class MystarterAutoConfiguration implements InitializingBean {

    private MystarterProperties mystarterProperties;

    private BeanInitializer beanInitializer;

    private User user;


    public MystarterAutoConfiguration(MystarterProperties mystarterProperties) {
        this.mystarterProperties = mystarterProperties;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        // 初始化 用户 并加载到容器 （测试需要）
        initUser();
    }


    public void initUser() throws Exception{
        //省略 配置文件空值判断 ，初始化User bean值
       this.user = new User(this.mystarterProperties.getUserName(),this.mystarterProperties.getEmail());
    }

    /**
    * 工程初识化将用户 加载到容器中  测试用
    */
    @Bean
    @ConditionalOnMissingBean   //当容器中不存在 userBean是才写入容器
    public User uesr(){
        return this.user;
    }
}

```

**MystarterProperties 工程配置类：**

```java
package com.shawn.mystarter.mystarter;

import org.springframework.boot.context.properties.ConfigurationProperties;


//绑定applicatioin文件以mystarter为前缀的值
@ConfigurationProperties(prefix = MystarterProperties.MYSTARTER_PREFIX)
public class MystarterProperties {
    public static final String MYSTARTER_PREFIX = "mystarter";

    private String userName;
    private String email;

    //省略 getter setter
}

```

**BeanInitializer获取bean工具类** :

实现功能所需

```java
package com.shawn.mystarter.mystarter;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

@Component
public class BeanInitializer implements ApplicationContextAware {

    private static ApplicationContext applicationContext;
    @Override
    public void setApplicationContext(ApplicationContext applicationContextParam) throws BeansException {
        applicationContext=applicationContextParam;
    }
    public static Object getObject(String id) {
        Object object = null;
        object = applicationContext.getBean(id);
        return object;
    }
    public static <T> T getObject(Class<T> tClass) {
        return applicationContext.getBean(tClass);
    }

    public static Object getBean(String tClass) {
        return applicationContext.getBean(tClass);
    }

    public static <T> T getBean(Class<T> tClass) {
        return applicationContext.getBean(tClass);
    }
}

```

**User  :**

```java
package com.shawn.mystarter.mystarter.bean;

public class User {

    private String userName;
    private String email;

    public User(String userName, String email) {
        this.userName = userName;
        this.email = email;
    }

    //省略 getter setter  toString
}

```

**UserService:**

功能服务层接口

```java
package com.shawn.mystarter.mystarter.service;

import com.shawn.mystarter.mystarter.BeanInitializer;
import com.shawn.mystarter.mystarter.bean.User;

public class UserSevice {

    /**
     * 模拟service层获取UserBean的方法
     * @return
     */
    public static User getUser(){
        return BeanInitializer.getBean(User.class);
    }

}

```

#### spring.factories配置

在resources下创建META-INF目录，并创建spring.factories，并配置所需要初始化的配置类

spring.factories.xml

```properties
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  com.shawn.mystarter.mystarter.MystarterAutoConfiguration,\
  com.shawn.mystarter.mystarter.BeanInitializer


```



### Maven install

将已经创建好的自定义starter 打包到maven本地仓库

![placeholder](/assets/images/初识SpringBoot-第九篇_自定义Starter/1564559495957.png )

> 注意 

**打包顺序是先子包再父包**



## 引用自定义Starter

在其他工程pom文件中引用我们刚创建好的 工具包，然后开始测试功能

![placeholder](/assets/images/初识SpringBoot-第九篇_自定义Starter/1564494584299.png )

### 测试

application.properties

```properties
mystarter.userName = "username23232"
mystarter.email = "2510xxxxx@qq.com"

```



测试代码

```java
package com.shawn.chapter8;

@RunWith(SpringRunner.class)
@SpringBootTest
public class Chapter8StarterApplicationTests {

    @Test
    public void contextLoads() {
        //服务层接口获取 容器中的User
        User user = UserSevice.getUser();
        System.out.println(user.toString());
    }

}

```

结果

![placeholder](/assets/images/初识SpringBoot-第九篇_自定义Starter/1564559850942.png )



## 总结

嗯！ 测试结束，功能实现起来有点乱，主要是想顺便整合一下之前所学SpringBoot的相关配置，，so...

结果从流程看起来还是有点乱的，，多担待哈！！



[个人项目地址](https://github.com/ShawnJim/spring-boot-learning)

