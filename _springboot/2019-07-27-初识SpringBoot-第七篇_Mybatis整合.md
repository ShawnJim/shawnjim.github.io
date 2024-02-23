---
layout: post
title: 初识SpringBoot-第七篇：Mybatis整合
lead: 
comments: true
categories: SpringBoot
tags:
  - java
  - Spring
  - mybatis
  - mysql
---
> MyBatis 是一款优秀的持久层框架，它支持定制化 SQL、存储过程以及高级映射。MyBatis 避免了几乎所有的 JDBC 代码和手动设置参数以及获取结果集。MyBatis 可以使用简单的 XML 或注解来配置和映射原生类型、接口和 Java 的 POJO（Plain Old Java Objects，普通老式 Java 对象）为数据库中的记录。

<!-- more -->

特点：

- mybatis是一种持久层框架，也属于ORM映射。前身是ibatis。
- 相比于hibernatehibernate为全自动化，配置文件书写之后不需要书写sql语句，但是欠缺灵活，很多时候需要优化；
- mybatis为半自动化，需要自己书写sql语句，需要自己定义映射。增加了程序员的一些操作，但是带来了设计上的灵活，并且也是支持hibernate的一些特性，如延迟加载，缓存和映射等；对数据库的兼容性比hibernate差。移植性不好，但是可编写灵活和高性能的sql语句。



mybatis官方呢也对SpringBoot做了一系列适配，下面我们就开始springboot对mybatis的整合吧

## 前期准备

### 创建项目

老样子，可以用springboot提供的初识化器在建工程的时候就选择，也可以后面自己手动在pom文件中添加

![placeholder](/assets/images/初识SpringBoot-第七篇_Mybatis整合/1564219382113.png )

### 配置文件

pom.xml

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<!-- mybatis官方适配包 -->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.1.0</version>
</dependency>
<!-- mysql驱动 -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```

**关系图**

![placeholder](/assets/images/初识SpringBoot-第七篇_Mybatis整合/1564219688583.png )

application.yml

```yaml
#忽略数据源配置 
。。。

mybatis:
  #配置版配置 指定mapper.xml文件地址
  mapper-locations: classpath*:com/shawn/chapter6/mapper/*.xml
  #mapper-locations: classpath*:mapper/*.xml  # 这种配置需要自己在resources目录下建立mapper文件夹进行存放
  # 驼峰命名规范 如：数据库字段是  order_id 那么 实体字段就要写成 orderId
  configuration:
    map-underscore-to-camel-case: true
```

> 注意事项

由于 **mybatis.mapper-locations=classpath:com/battcn/mapper/\*.xml**配置的在`java package`中，而`Spring Boot`默认只打入`java package -> *.java`，所以我们需要给`pom.xml`文件添加如下内容

```xml
<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
        </resource>
        <resource>
            <directory>src/main/java</directory>
            <includes>
                <include>**/*.xml</include>
            </includes>
            <filtering>true</filtering>
        </resource>
    </resources>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```





## 代码实现

接下来我们就简单的用mybatis进行一个对单表的CRUD操作



### 建立数据表

```sql
CREATE TABLE `t_user` (
  `id` int(8) NOT NULL AUTO_INCREMENT COMMENT '主键自增',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(50) NOT NULL COMMENT '密码',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户表';
```



### 创建ORM Bean文件

```java
package com.shawn.chapter5.entity;

public class User implements Serializable {
    private static final long serialVersionUID = -4330472735502710660L;

    private int id;
    private String username;
    private String password;

    ... 省略getter setter
}

```



> springboot对于mybatis整合有两种方式，一种是使用注解如`@select`的方式(基于mybatis3.x)，第二种则是传统配置文件的方式...

### 注解版

```java
package com.shawn.chapter6.dao;

import com.shawn.chapter6.entity.User;
import org.apache.ibatis.annotations.*;

@Mapper
//或者在application类中使用@MapperScan 注解进行统一管理
public interface UserMapper {

    @Select("select * from t_user where id=#{id}")
    public User getById(Integer id);

    @Delete("delete from t_user where id=#{id}")
    public int deleteById(Integer id);

    @Options(useGeneratedKeys = true,keyProperty = "id")//主键返回
    @Insert("insert into t_user(username,password) values(#{username},#{password})")
    public int insert(User user);

    @Update("update t_user set username=#{username} where id=#{id}")
    public int update(User user);

}
```

使用@MapperScan对 mapper统一管理

```java
使用MapperScan批量扫描所有的Mapper接口；
@MapperScan(value = "com.shawn.chapter6.mapper")
@SpringBootApplication
public class Chapter6MybatisApplication {

	public static void main(String[] args) {
		SpringApplication.run(Chapter6MybatisApplication.class, args);
	}
}
```



### 配置版

```java
package com.shawn.chapter6.dao;

import com.shawn.chapter6.entity.User;
import org.apache.ibatis.annotations.*;

@Mapper
//或者在application类中使用@MapperScan 注解进行统一管理
public interface UserMapper {
    
    public int insertOne(User user);
}

```

UserMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="com.shawn.chapter6.dao.UserMapper"> 
<!-- namespace 指定此xml文件对应的mapper接口 -->

    <!-- parameterType 指定参数传入的类型 -->    
    <insert id="insertOne" parameterType="com.shawn.chapter6.entity.User">
      INSERT INTO `t_user`(`username`,`password`) VALUES (#{username},#{password})
    </insert>

</mapper>
```



## 接口测试

dao层（数据访问层）接口完成后，我们可以对写好的接口进行一系列测试

```java
package com.shawn.chapter6;

@RunWith(SpringRunner.class)
@SpringBootTest
public class Chapter6MybatisApplicationTests {

    private static final Logger log = LoggerFactory.getLogger(Chapter6MybatisApplicationTests.class);

    
    @Autowired
    private UserMapper userMapper;

    @Test
    public void contextLoads() {
        //注解版
        User user = new User("user11", "user11");
        final int insertResult = userMapper.insert(user);
        log.info(String.format("成功插入记录 -- 插入条数：{\%s},用户id：{\%s}",insertResult,user.getId()));
        int deleteResult = userMapper.deleteById(user.getId());
        log.info(String.format("成功删除记录 -- 删除条数：{\%s},删除用户：{\%s}",deleteResult,user.getId()));

        //配置版
        int insertOneResult = userMapper.insertOne(new User("user22", "user22"));
        log.info(String.format("成功插入记录 -- 插入条数：{\%s}",insertOneResult));
    }

}

```

**结果**

![placeholder](/assets/images/初识SpringBoot-第七篇_Mybatis整合/1564234989493.png )


## Mybatis-Generator

此项目可以自动生成

MyBatis Generator将生成：

- 与表结构匹配的Java POJO
- MyBatis / iBATIS兼容的SQL Map XML文件。MBG为配置中的每个表上的简单CRUD函数生成SQL。生成的SQL语句包括：
  - 插入
  - 按主键更新
  - 通过示例更新（使用动态where子句）
  - 按主键删除
  - 按示例删除（使用动态where子句）
  - 按主键选择
  - 按示例选择（使用动态where子句）

基本上的单表crud都不再需要自己来动手写了

以下是相关项目地址和文档

[本人项目地址](https://github.com/ShawnJim/MyBatis-Generator)

[mybatis-generator快速上手文档](http://www.mybatis.org/generator/quickstart.html)



## 相关资料

[mybaits 官方文档](http://www.mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/)

[本文相关项目](https://github.com/ShawnJim/spring-boot-learning/tree/master/chapter6-mybatis)

