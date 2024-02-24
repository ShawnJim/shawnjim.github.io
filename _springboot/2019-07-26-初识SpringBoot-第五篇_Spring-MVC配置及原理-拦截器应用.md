---
layout: post
title: 初识SpringBoot-第五篇：Spring MVC配置及原理 & 拦截器应用
description: 初识SpringBoot-第五篇：Spring MVC配置及原理 & 拦截器应用
lead: 
comments: true
categories: SpringBoot
tags:
  - java
  - Spring
  - SpringMVC
---
> Spring Boot有许多包含Spring MVC的启动器。请注意，一些启动器包含对Spring MVC的依赖，而不是直接包含它。本节回答有关Spring MVC和Spring Boot的常见问题。

Spring Boot为Spring MVC提供自动配置，适用于大多数应用程序。

<!-- more -->

自动配置在Spring的默认值之上添加了以下功能：

- 包含`ContentNegotiatingViewResolver`和`BeanNameViewResolver`豆类。

- 支持提供静态资源，包括对WebJars的支持（ [官方文档介绍](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-developing-web-applications.html#boot-features-spring-mvc-static-content)））。

- 自动注册`Converter`，`GenericConverter`和`Formatter`bean类。

  - Converter：转换器；  public String hello(User user)：类型转换使用Converter

  - `Formatter`  格式化器；  2017.12.17===Date；

    ```java
    	@Bean
    		@ConditionalOnProperty(prefix = "spring.mvc", name = "date-format")//在文件中配置日期格式化的规则
    		public Formatter<Date> dateFormatter() {
    			return new DateFormatter(this.mvcProperties.getDateFormat());//日期格式化组件
    		}
    ```

    ==自己添加的格式化器转换器，我们只需要放在容器中即可==

    

- 支持`HttpMessageConverters`（ [官方文档介绍](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-developing-web-applications.html#boot-features-spring-mvc-message-converters)）。

  - HttpMessageConverter：SpringMVC用来转换Http请求和响应的；User---Json；

  - `HttpMessageConverters` 是从容器中确定；获取所有的HttpMessageConverter；

    ==自己给容器中添加HttpMessageConverter，只需要将自己的组件注册容器中（@Bean,@Component）==

  

- 自动注册`MessageCodesResolver`（ [官方文档介绍](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-developing-web-applications.html#boot-features-spring-message-codes)）。

- 静态`index.html`支持。

- 自定义`Favicon`支持（[官方文档介绍](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-developing-web-applications.html#boot-features-spring-mvc-favicon)）。

- 自动使用`ConfigurableWebBindingInitializer`bean（ [官方文档介绍](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-developing-web-applications.html#boot-features-spring-mvc-web-binding-initializer)）。

  ==我们可以配置一个ConfigurableWebBindingInitializer来替换默认的；（添加到容器）==

  ```
  初始化WebDataBinder；
  请求数据=====JavaBean；
  ```

如果您想保留Spring Boot MVC功能并且想要添加其他 [MVC配置](https://docs.spring.io/spring/docs/5.1.8.RELEASE/spring-framework-reference/web.html#mvc)（拦截器，格式化程序，视图控制器和其他功能），您可以添加自己的`@Configuration`类类型`WebMvcConfigurer`但**不需要** `@EnableWebMvc`。如果您希望提供，或的 自定义实例`RequestMappingHandlerMapping`，则可以声明 实例以提供此类组件。`RequestMappingHandlerAdapter` `ExceptionHandlerExceptionResolver` `WebMvcRegistrationsAdapter`

如果您想完全控制Spring MVC，可以添加自己的`@Configuration` 注释`@EnableWebMvc`。



## 扩展SpringMvc

在springboot默认mvc配置下，再自己扩展其配置工功能；最终效果：SpringMVC的自动配置和我们的扩展配置都会起作用；

### 1、编写一个springmvc.xml文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/mvc https://www.springframework.org/schema/mvc/spring-mvc.xsd">


    <mvc:view-controller path="/hello" view-name="success"/>
    <mvc:interceptors>
        <mvc:interceptor>
            <mvc:mapping path="/hello"/>
            <bean></bean>
        </mvc:interceptor>
    </mvc:interceptors>
</beans>
```



### 编写一个配置类（@Configuration）

改配置类是WebMvcConfigurationSupport类型；不能标注@EnableWebMvc（使用该注解代表将springboot默认配置失效）;

springboot 2.0前：

```java
@Configuration
public class MyMvcConfig extends WebMvcAutoConfigurationAdapter {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        //浏览器发送 /shawn请求来到success页面
        registry.addViewController("/shawn").setViewName("success");
    }
}
```

spring boot2.0  继承WebMvcAutoConfigurationAdapter类已经过时:

```java
//实现WebMvcConfigurer可以来扩展SpringMVC的功能（建议）
@Configuration
public class MyMvcConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        //浏览器发送 /shawn请求来到success页面
        registry.addViewController("/shawn").setViewName("success");
    }
}

or

//继承WebMvcConfigurationSupport可以来扩展SpringMVC的功能,同时也相当于使用了@EnableWebMvc注解，springboot默认配置全部失效
@Configuration
public class MyMvcConfig extends WebMvcConfigurationSupport {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        //浏览器发送 /shawn请求来到success页面
        registry.addViewController("/shawn").setViewName("success");
    }
}

```



原理：

#### 1）、WebMvcAutoConfiguration是SpringMVC的自动配置类

#### 2）、在做其他自动配置时会导入；@Import({WebMvcAutoConfiguration . EnableWebMvcConfiguration .class})

![placeholder](/assets/images/初识SpringBoot-第五篇_Spring-MVC配置及原理-拦截器应用/1564040688664.png )

**例如参照添加视图方法addViewControllers功能来入手**

1. 从源码看EnableWebMvcConfiguration 继承了DelegatingWebMvcConfiguration类

```
@Configuration
public class DelegatingWebMvcConfiguration extends WebMvcConfigurationSupport {

    private final WebMvcConfigurerComposite configurers = new  WebMvcConfigurerComposite();
    public DelegatingWebMvcConfiguration() {
    }

    //从容器中获取所有ebMvcConfigurer
    @Autowired(
        required = false
    )
    public void setConfigurers(List<WebMvcConfigurer> configurers) {
        if (!CollectionUtils.isEmpty(configurers)) {
            this.configurers.addWebMvcConfigurers(configurers);
        }

    }

    //设置视图方法
    protected void addViewControllers(ViewControllerRegistry registry) {
        this.configurers.addViewControllers(registry);
    }

    ...
}
```

2. 点击该类addViewControllers 实现方法，进入WebMvcConfigurerComposite类中

   ```java
   class WebMvcConfigurerComposite implements WebMvcConfigurer {
       private final List<WebMvcConfigurer> delegates = new ArrayList();
       
       public void addViewControllers(ViewControllerRegistry registry) {
           Iterator var2 = this.delegates.iterator();
   		//一个参考实现；将所有的WebMvcConfigurer相关配置都来一起调用；
           while(var2.hasNext()) {
               WebMvcConfigurer delegate = (WebMvcConfigurer)var2.next();
               delegate.addViewControllers(registry);
           }
   
       }
   ```

   

#### 3）、容器中所有的WebMvcConfigurer都会一起起作用；

#### 4）、我们的配置类也会被调用；

至此，扩展配置内容结束



## 全面接管SpringMVC

这一操作将SpringBoot对SpringMVC的自动配置全部废弃，所有配置都由我们自己配置；(不建议，此部分内容只是说明springboot提供了该操作场景)

### 实际实现

实现起来也很简单，**我们需要在配置类中添加@EnableWebMvc即可；**

```java
//使用WebMvcConfigurerAdapter可以来扩展SpringMVC的功能
@EnableWebMvc
@Configuration
public class MyMvcConfig extends WebMvcConfigurerAdapter {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
       // super.addViewControllers(registry);
        //浏览器发送 /atguigu 请求来到 success
        registry.addViewController("/shawn").setViewName("success");
    }
}
```

原理：

为什么@EnableWebMvc自动配置就失效了；我们首先来看看其源码是如何配置的。

1）@EnableWebMvc的核心

```java
//导入了DelegatingWebMvcConfiguration类
@Import(DelegatingWebMvcConfiguration.class)
public @interface EnableWebMvc {
```

2）、DelegatingWebMvcConfiguration类

```java
//继承了WebMvcConfigurationSupport类
@Configuration
public class DelegatingWebMvcConfiguration extends WebMvcConfigurationSupport {
```

3）、WebMvcConfigurationSupport类

```java
@Configuration
@ConditionalOnWebApplication
@ConditionalOnClass({ Servlet.class, DispatcherServlet.class,
		WebMvcConfigurerAdapter.class })
//该注解标识如果容器中没有这个组件的时候，这个自动配置类才生效
@ConditionalOnMissingBean(WebMvcConfigurationSupport.class)
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE + 10)
@AutoConfigureAfter({ DispatcherServletAutoConfiguration .class ,
		ValidationAutoConfiguration .class })
public class WebMvcAutoConfiguration {
```

4）、@EnableWebMvc将WebMvcConfigurationSupport组件导入进来；

5）、导入的WebMvcConfigurationSupport只是SpringMVC最基本的功能；




## 自定义@ResponseBody渲染

Spring用于`HttpMessageConverters`渲染`@ResponseBody`（或响应 `@RestController`）。您可以通过在Spring Boot上下文中添加适当类型的bean来提供其他转换器。如果您添加的bean是默认包含的类型（例如`MappingJackson2HttpMessageConverter`JSON转换），则它将替换默认值。`HttpMessageConverters`提供了类型的便利bean， 如果您使用默认的MVC配置，它始终可用。它有一些有用的方法来访问默认和用户增强的消息转换器（例如，如果要手动将它们注入自定义，它可能很有用`RestTemplate`）。

与正常的MVC使用情况一样，`WebMvcConfigurer`您提供的任何bean也可以通过覆盖该`configureMessageConverters`方法来提供转换器。但是，与普通的MVC不同，您只能提供所需的其他转换器（因为Spring Boot使用相同的机制来提供其默认值）。最后，如果您通过提供自己的`@EnableWebMvc`配置选择退出Spring Boot默认MVC 配置，则可以完全控制并使用`getMessageConverters`from 手动完成所有操作 `WebMvcConfigurationSupport`。

有关[`WebMvcAutoConfiguration`](https://github.com/spring-projects/spring-boot/tree/v2.1.6.RELEASE/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/web/servlet/WebMvcAutoConfiguration.java) 更多详细信息，请参阅 源代码。



## 处理多部分文件上载

Spring Boot包含Servlet 3 `javax.servlet.http.Part`API以支持上传文件。默认情况下，Spring Boot配置Spring MVC，每个文件的最大大小为1MB，单个请求中的文件数据最大为10MB。您可以覆盖这些值，中间数据的存储位置（例如，到`/tmp` 目录），以及使用`MultipartProperties`类中公开的属性将数据刷新到磁盘的阈值。例如，如果要指定文件不受限制，请将`spring.servlet.multipart.max-file-size`属性设置为`-1`。

当您希望在Spring MVC控制器处理程序方法中接收多部分编码文件数据作为`@RequestParam`类型的注释参数时，多部分支持很有用`MultipartFile`。

有关[`MultipartAutoConfiguration`](https://github.com/spring-projects/spring-boot/tree/v2.1.6.RELEASE/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/web/servlet/MultipartAutoConfiguration.java) 详细信息，请参阅 源代码。

| ![[注意]](note.png)                                          |
| ------------------------------------------------------------ |
| 建议使用容器的内置支持进行分段上传，而不是引入其他依赖项，例如Apache Commons File Upload。 |



## 关闭Spring MVC DispatcherServlet

默认情况下，所有内容都是从应用程序的根目录（`/`）提供的。如果您希望映射到其他路径，可以按如下方式配置：

```
spring.mvc.servlet.path = / acme
```

如果你有额外的servlet，你可以声明一个`@Bean`类型`Servlet`或 `ServletRegistrationBean`每个servlet ，Spring Boot会将它们透明地注册到容器中。因为servlet是以这种方式注册的，所以可以将它们映射到`DispatcherServlet`不调用它的子上下文。

配置`DispatcherServlet`你自己是不寻常的，但如果你真的需要这样做，还必须提供一种 `@Bean`类型`DispatcherServletPath`来提供自定义的路径`DispatcherServlet`。

  
## 拦截器配置

**模拟场景：**

​	登陆时，对没有用户session的操作进行拦截调到首页



### 实现

编写拦截器类LoginHandlerInterceptor，实现HandlerInterceptor接口

```java
/**
 * 登陆检查，
 */
public class LoginHandlerInterceptor implements HandlerInterceptor {
    //目标方法执行之前
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Object user = request.getSession().getAttribute("loginUser");
        if(user == null){
            //未登陆，返回登陆页面
            request.setAttribute("msg","没有权限请先登陆");
            request.getRequestDispatcher("/index.html").forward(request,response);
            return false;
        }else{
            //已登陆，放行请求
            return true;
        }

    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {

    }
}
```

将该拦截器添加入容器

mvc自动配置类MyMvcConfig中重写拦截器方法写入规则

```java
package com.shawn.chapter4.config;


@Configuration
//@EnableWebMvc
public class MyMvcConfig implements WebMvcConfigurer {


    //重写方法写入拦截规则
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginInterceptor()).addPathPatterns("/**")
                .excludePathPatterns("/","/index","/login");
    }

}
```


## 相关资料

[springboot官方文档](https://docs.spring.io/spring-boot/docs/1.5.10.RELEASE/reference/htmlsingle/#boot-features-developing-web-applications)


[git相关项目](https://github.com/ShawnJim/spring-boot-learning/tree/master/chapter4-web)