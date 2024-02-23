---
layout: post
title: 初识SpringBoot-第六篇：使用jdbcTemplate访问数据库
lead: 
comments: true
categories: SpringBoot
tags:
  - java
  - Spring
  - jdbcTemplate
  - mysql
---
> `Spring Framework`对数据库的操作在`JDBC`上面做了深层次的封装，通过`依赖注入`功能，可以将 `DataSource` 注册到`JdbcTemplate`之中，使我们可以轻易的完成对象关系映射，并有助于规避常见的错误，在`SpringBoot`中我们可以很轻松的使用它。

<!-- more -->

特点：

- 速度快，对比其它的ORM框架而言，JDBC的方式无异于是最快的
- 配置简单，`Spring`自家出品，几乎没有额外配置
- 学习成本低，毕竟`JDBC`是基础知识，`JdbcTemplate`更像是一个`DBUtils`



## 前期准备

### 工程创建

创建一个工程 选择需要用到的项目，也可以在pom文件中选择添加。

![placeholder](/assets/images/初识SpringBoot-第六篇_使用jdbcTemplate访问数据库/1564144529646.png )

### 配置文件

POM文件：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```

application.yml

```yaml
spring:
  datasource:
  	#驱动包 
  	#springboot2.0  默认数据源使用com.zaxxer.hikari.HikariDataSource 作为数据源，
    #com.mysql.jdbc.Driver 已被弃用
    driver-class-name: com.mysql.cj.jdbc.Driver
    
    #数据库地址 如果出现时区错误 The server time zone value 'xxx' is unrecognize, 可在后面添加 ?serverTimezone=UTC
    #jdbc:mysql://localhost:3306/chapter5_jdbc?serverTimezone=UTC
    url: jdbc:mysql://localhost:3306/chapter5_jdbc
    
    #访问用户名
    username: root
    
    #访问密码
    password: 1234
```



效果：

​	默认是用class 作为数据源；

​	数据源的相关配置都在DataSourceProperties类中；



### 配置原理

org.springframework.boot.autoconfigure.jdbc：

1、参考DataSourceConfiguration，根据配置创建数据源，默认使用Tomcat连接池；可以使用spring.datasource.type指定自定义的数据源类型；

2、SpringBoot默认支持的数据源；

DataSourceConfiguration定义了所有支持的数据源（具体的查看 DataSourceConfiguration配置类）

```java
 abstract class DataSourceConfiguration {
     
	@Configuration
    @ConditionalOnClass({BasicDataSource.class})
    @ConditionalOnMissingBean({DataSource.class})
    @ConditionalOnProperty(
        name = {"spring.datasource.type"},
        //该注解指定该类为数据源类
        havingValue = "org.apache.commons.dbcp2.BasicDataSource",
        matchIfMissing = true
    )
    static class Dbcp2 {
        
    }
     
     。。。
 }
```

3、自定义数据源类型

```java
abstract class DataSourceConfiguration {
	/**
     * Generic DataSource configuration. 自定义数据源方法
     */
    @ConditionalOnMissingBean(DataSource.class)
    @ConditionalOnProperty(name = "spring.datasource.type")
    static class Generic {

       @Bean
       public DataSource dataSource(DataSourceProperties properties) {
           //使用DataSourceBuilder创建数据源，利用反射创建响应type的数据源，并且绑定相关属性
          return properties.initializeDataSourceBuilder().build();
       }

    }
}

properties.initializeDataSourceBuilder().build();
点击进入build查看实现方法
    public T build() {
        Class<? extends DataSource> type = this.getType();
      	//利用反射获取容器中的数据源
        DataSource result = (DataSource)BeanUtils.instantiateClass(type);
        this.maybeGetDriverClassName();
        this.bind(result);
        return result;
    }
   
```



## 项目初识化 数据库操作

springboot提供了在启动项目时执行建表sql & 数据sql的操作



### 具体操作

application.yml

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/chapter5_jdbc?serverTimezone=UTC
    username: root
    password: 1234
    
    # 执行sql操作配置
    # 账号密码
    schema-username: root
    schema-password: 1234
    # 操作开关 aways为开启  never、embedded关闭
    initialization-mode: alwas
    # 指定文件地址 不指定则 默认为如下文件
    # 建表文件 （schema.sql、schema-all.sql）数据语句sql文件（data.sql、data-all.sql）
    schema:
      - classpath*:employee.sql
      - classpath*:schema.sql
```

![placeholder](/assets/images/初识SpringBoot-第六篇_使用jdbcTemplate访问数据库/1564210509669.png )

department.sql

```sql
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for department
-- ----------------------------
DROP TABLE IF EXISTS `department`;
CREATE TABLE `department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `departmentName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
```

启动项目查看数据库则相应表已经创建完成

![placeholder](/assets/images/初识SpringBoot-第六篇_使用jdbcTemplate访问数据库/1564210575329.png )

### 原理

从源码入手，首先查看springboot这方面的自动配置类

**DataSourceAutoConfiguration**

```java
@Import({DataSourcePoolMetadataProvidersConfiguration.class, DataSourceInitializationConfiguration.class})
//导入了DataSourceInitializationConfiguration 类初识化配置类
public class DataSourceAutoConfiguration {
    public DataSourceAutoConfiguration() {
        
 }
```

发现其导入了DataSourceInitializationConfiguration这个初始化配置类，再看该类

**DataSourceInitializationConfiguration**

```java
@Configuration
@Import({DataSourceInitializerInvoker.class, DataSourceInitializationConfiguration.Registrar.class})
//导入了DataSourceInitializerInvoker执行类
class DataSourceInitializationConfiguration {
    DataSourceInitializationConfiguration() {
}
```

其导入了DataSourceInitializerInvoker这个初始化程序执行类，再继续

**DataSourceInitializerInvoker**

```java
class DataSourceInitializerInvoker implements ApplicationListener<DataSourceSchemaCreatedEvent>, InitializingBean {
    private static final Log logger = LogFactory.getLog(DataSourceInitializerInvoker.class);
    
    //维护了这个数据源初始化类
    private DataSourceInitializer dataSourceInitializer;
    
    private DataSourceInitializer getDataSourceInitializer() {
        if (this.dataSourceInitializer == null) {
            DataSource ds = (DataSource)this.dataSource.getIfUnique();
            if (ds != null) {
                this.dataSourceInitializer = new DataSourceInitializer(ds, this.properties, this.applicationContext);
            }
    }
}
```

DataSourceInitializerInvoker实现了ApplicationListener应用程序监听接口并且内部维护了一个数据源初识化构造类 DataSourceInitializer ，到这步应该就能够发现其中实现的方法了

**DataSourceInitializer** 部分代码

```java
package org.springframework.boot.autoconfigure.jdbc;

class DataSourceInitializer {
    private static final Log logger = LogFactory.getLog(DataSourceInitializer.class);
    private final DataSource dataSource;

    /**
    *	执行库sql文件方法
    */
    public boolean createSchema() {
        //获取配置信息
        List<Resource> scripts = this.getScripts("spring.datasource.schema", this.properties.getSchema(), "schema");
        if (!scripts.isEmpty()) {
            //判断配置文件中开关是否为always允许
            if (!this.isEnabled()) {
                logger.debug("Initialization disabled (not running DDL scripts)");
                return false;
            }

            String username = this.properties.getSchemaUsername();
            String password = this.properties.getSchemaPassword();
            //运行
            this.runScripts(scripts, username, password);
        }

        return !scripts.isEmpty();
    }

    /**
    *	执行数据文件方法 如createSchema类似
    */
    public void initSchema() {
        List<Resource> scripts = this.getScripts("spring.datasource.data", this.properties.getData(), "data");
        if (!scripts.isEmpty()) {
            if (!this.isEnabled()) {
                logger.debug("Initialization disabled (not running data scripts)");
                return;
            }

            String username = this.properties.getDataUsername();
            String password = this.properties.getDataPassword();
            this.runScripts(scripts, username, password);
        }

    }

    //开关方法
    private boolean isEnabled() {
        //getInitializationMode 为配置项中的 initialization-mode
        DataSourceInitializationMode mode = this.properties.getInitializationMode();
        if (mode == DataSourceInitializationMode.NEVER) {
            return false;
        } else {
            return mode != DataSourceInitializationMode.EMBEDDED || this.isEmbedded();
        }
    }

    //拼接配置文件参数
    private List<Resource> getScripts(String propertyName, List<String> resources, String fallback) {
        if (resources != null) {
        	//如果配置文件中shema配置项不为空则按指定文件执行
            return this.getResources(propertyName, resources, true);
        } else {
            //如果配置文件中shema配置项为空则按默认配置执行 如shema.sql  ,传入fallback参数为文件名称
            String platform = this.properties.getPlatform();
            List<String> fallbackResources = new ArrayList();
            fallbackResources.add("classpath*:" + fallback + "-" + platform + ".sql");
            fallbackResources.add("classpath*:" + fallback + ".sql");
            return this.getResources(propertyName, fallbackResources, false);
        }
    }


    //执行方法
    private void runScripts(List<Resource> resources, String username, String password) {
        if (!resources.isEmpty()) {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.setContinueOnError(this.properties.isContinueOnError());
            populator.setSeparator(this.properties.getSeparator());
            if (this.properties.getSqlScriptEncoding() != null) {
                populator.setSqlScriptEncoding(this.properties.getSqlScriptEncoding().name());
            }

            Iterator var5 = resources.iterator();

            while(var5.hasNext()) {
                Resource resource = (Resource)var5.next();
                populator.addScript(resource);
            }

            DataSource dataSource = this.dataSource;
            if (StringUtils.hasText(username) && StringUtils.hasText(password)) {
                dataSource = DataSourceBuilder.create(this.properties.getClassLoader()).driverClassName(this.properties.determineDriverClassName()).url(this.properties.determineUrl()).username(username).password(password).build();
            }

            DatabasePopulatorUtils.execute(populator, dataSource);
        }
    }
}

```

如此 我们也就对该配置及实现了解了个大概！！



## 数据源连接池

springboot默认配置配置源选择有很多，在这里我就用druid阿里数据源连接池来做示例

### 具体操作

#### 配置文件

pom.xml

```xml
<!-- 阿里数据源 -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.1.8</version>
</dependency>

<!-- 引入日志，否则数据源启动报错 -->
<dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>1.2.17</version>
</dependency>
```

application.yml

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/chapter5_jdbc?serverTimezone=UTC
    username: root
    password: 1234
    # 自动建表
    schema-username: root
    schema-password: 1234
    initialization-mode: embedded
    schema:
      - classpath*:employee.sql
      - classpath*:schema.sql
      
    # 指定数据源为阿里连接池数据源
    type: com.alibaba.druid.pool.DruidDataSource
    #   数据源其他配置
    initialSize: 5
    minIdle: 5
    maxActive: 20
    maxWait: 60000
    timeBetweenEvictionRunsMillis: 60000
    minEvictableIdleTimeMillis: 300000
    validationQuery: SELECT 1 FROM DUAL
    testWhileIdle: true
    testOnBorrow: false
    testOnReturn: false
    poolPreparedStatements: true
    #配置监控统计拦截的filters，去掉后监控界面sql无法统计，'wall'用于防火墙
    filters: stat,wall,log4j
    maxPoolPreparedStatementPerConnectionSize: 20
    useGlobalDataSourceStat: true
    connectionProperties: druid.stat.mergeSql=true;druid.stat.slowSqlMillis=500



```

#### 自定义数据源配置类&监控管理后台

```java
package com.shawn.chapter5.config;

@Configuration
public class DruidConfig {

    /**
    *
    *	绑定配置文件各项参数，并写入容器中
    */
    @ConfigurationProperties(prefix = "spring.datasource")
    @Bean
    public DruidDataSource druidDataSource(){
        return new DruidDataSource();
    }

    /**
     * 配置Druid的监控
     * 配置一个管理后台的Servlet
     * @return
     */
    @Bean
    public ServletRegistrationBean statViewServlet(){
        ServletRegistrationBean bean = new ServletRegistrationBean(new StatViewServlet(),
                "/druid/*");
        Map<String,String> initParams = new HashMap<>();
        {
            //登陆名密码
            initParams.put("loginUsername","admin");
            initParams.put("loginPassword","1234");
            //白名单
            initParams.put("allow","localhost");
            //黑名单
            initParams.put("deny","");
        }
        bean.setInitParameters(initParams);
        return bean;
    }

    /**
     * 配置web监控的拦截器
     * @return
     */
    @Bean
    public FilterRegistrationBean webStatFilter(){
        FilterRegistrationBean registrationBean = new FilterRegistrationBean();
        {
            registrationBean.setFilter(new WebStatFilter());
            //配置属型
            Map<String,String> initParam = new HashMap<>();
            {
                //拦截白名单
                initParam.put("exclusions","*.js,*.css");
            }
            registrationBean.setInitParameters(initParam);
            //拦截配置 /* 拦截所有
            registrationBean.setUrlPatterns(Arrays.asList("/*"));
        }
        return registrationBean;
    }

}
```

至此，数据源与监控管理后台配置完成 打开浏览器测试

![placeholder](/assets/images/初识SpringBoot-第六篇_使用jdbcTemplate访问数据库/1564212299638.png )

大功告成！！



## CRUD操作

### 数据表

首先数据库建表

```sql
CREATE TABLE `t_user` (
  `id` int(8) NOT NULL AUTO_INCREMENT COMMENT '主键自增',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(50) NOT NULL COMMENT '密码',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户表';
```

### entity类

**User**

```java
package com.shawn.chapter5.entity;

public class User {
    private int id;
    private String username;
    private String password;

    public User() {
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }
    
    省略getter setter
}
```

### restful 风格接口

偷个小懒，就省略了**service**,**dao**层代码，直接在`controller`层使用`jdbcTemplate`进行数据库操作，**这种写法非常不规范，各位童鞋千万不要学哦**

**UserController**

```java
package com.shawn.chapter5.controller;


@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public List<User> queryUsers() {
        // 查询所有用户
        String sql = "select * from t_user";
        return jdbcTemplate.query(sql, new Object[]{}, new BeanPropertyRowMapper<>(User.class));
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        // 根据主键ID查询
        String sql = "select * from t_user where id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{id}, new BeanPropertyRowMapper<>(User.class));
    }

    @DeleteMapping("/{id}")
    public int delUser(@PathVariable Long id) {
        // 根据主键ID删除用户信息
        String sql = "DELETE FROM t_user WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    @PostMapping
    public int addUser(@RequestBody User user) {
        // 添加用户
        String sql = "insert into t_user(username, password) values(?, ?)";
        return jdbcTemplate.update(sql, user.getUsername(), user.getPassword());
    }


    @PutMapping("/{id}")
    public int editUser(@PathVariable Long id, @RequestBody User user) {
        // 根据主键ID修改用户信息
        String sql = "UPDATE t_user SET username = ? ,password = ? WHERE id = ?";
        return jdbcTemplate.update(sql, user.getUsername(), user.getPassword(), id);
    }
}
```





## 测试

由于上面的接口是 restful 风格的接口，添加和修改无法通过浏览器完成，所以需要我们自己编写`junit`或者使用`postman`之类的工具。

创建单元测试`Chapter4ApplicationTests`，通过`TestRestTemplate`模拟**GET、POST、PUT、DELETE等请求操作**

```java
package com.shawn.chapter5;


@RunWith(SpringRunner.class)
@SpringBootTest
public class Chapter5JdbcApplicationTests {

    private static final Logger log = LoggerFactory.getLogger(Chapter5JdbcApplicationTests.class);

    @Autowired
    private TestRestTemplate testRestTemplate;

    @Test
    public void testInsert() throws Exception {
        testRestTemplate.postForEntity("http://localhost:" + 8080 + "/users", new User("user1", "pass1"), Integer.class);
        log.info("[添加用户成功]\n");
        // TODO 如果是返回的集合,要用 exchange 而不是 getForEntity ，后者需要自己强转类型
        final List<User> body = testRestTemplate.exchange("http://localhost:" + 8080 + "/users", HttpMethod.GET
                , null, new ParameterizedTypeReference<List<User>>(){}).getBody();
        log.info("[查询所有] - [{}]\n", body);
        int userId = body.get(0).getId();
        ResponseEntity<User> response3 = testRestTemplate.getForEntity("http://localhost:" + 8080 + "/users/{id}", User.class, userId);
        log.info("[主键查询] - [{}]\n", response3.getBody());
        testRestTemplate.put("http://localhost:" + 8080 + "/users/{id}", new User("user11", "pass11"), userId);
        log.info("[修改用户成功]\n");
        testRestTemplate.delete("http://localhost:" + 8080 + "/users/{id}", userId);
        log.info("[删除用户成功]");
    }

}

```



## 相关资料

[crud部分参考博文](https://blog.battcn.com/2018/05/07/springboot/v2-orm-jdbc/)



[TestRestTemplate官方文档](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-testing.html#boot-features-rest-templates-test-utility)



[jdbcTemplate官方文档](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-sql.html#boot-features-using-jdbc-template)



[博客项目地址](https://github.com/ShawnJim/spring-boot-learning/tree/master/chapter5-jdbc)