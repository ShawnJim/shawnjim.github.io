---
layout: cv
title: CV
comments: true
---

[export cv.pdf](/assets/files/cv.pdf)

<h1 class="about">金振潇 {{ site.author.name }} </h1>
<ul>
    <li>{% include svg/pin-alt.svg %} <span>{{ site.address }}</span></li>
    <li>{% include svg/mail.svg %}<a href="mailto:{{ site.author.email }}">{{ site.author.email }}</a></li>
    <li>{% include svg/internet.svg %}<a href="{{ site.url }}">{{site.url }}</a></li>
    <li>{% include svg/github.svg %}<a href="https://github.com/{{ site.social.github }}"> https://github.com/{{ site.social.github }}</a></li>
    <li>{% include svg/phone.svg %}<a href="https://github.com/{{ site.phone }}">{{ site.phone }}</a></li>
</ul>

---

# 个人优势

1.	拥有5年后端编程经验，掌握Java、Python、Shell等编程语言。
2.	熟悉Spring Cloud技术体系，深入了解Nacos、Gateway、Ribbon等组件，熟练进行服务划分、旧服务改造和服务治理，理解 Paxos、Raft等分布式共识协议算法。
3.	熟悉Spring、MyBatis、Spring MVC和Spring Boot等核心框架，熟悉相关框架的核心源码。
4.	掌握Java核心知识，包括JVM、并发编程、集合、SPI等，具备良好的编码能力，能熟练应用设计模式。
5.	掌握Docker、Podman等容器技术，了解Cgroup、Containerd等底层技术，具备服务容器化实践经验。
6.	熟悉大数据相关组件，如Impala、Kudu、Hive、StreamSets等，具备线上异常问题排查和调优经验。
7.	熟悉MySQL、Redis、Memcached 等数据库 & 缓存组件，理解事务、锁、索引等原理，熟悉SQL调优和缓存相关的数据结构。
8.	熟悉AI工具辅助编程（如ChatGPT、Gemini、Copilot）. 拥有LLM工程化经验，基于LangChain实现了使用自然语言对Superset进行图表生成的项目。
9.	深度参与开源社区建设，成为Apache ShenYu Committer和DolphinScheduler Contributor。
10.	能够流畅阅读英文文档。

---

# 工作经历

## 上海生生物流有限公司	Java	2021.08-2023.08

1.	开发并维护生物物流数据中台系统：
  - 负责提供数据接入/输出端点，为企业内部OWTB等业务系统提供数据集成中转服务。
  - 生成各业务维度的分析报表，实现BI系统功能。
2.	维护业务流数据清洗管道：同步各业务数据库至Kudu/Hive，编写管道对数据流进行清洗和聚合，生成Ads层业务表以供分析。同时，编写时序批处理任务以监控业务指标并进行告警。
3.	维护中间件如Xxl-job和DolphinScheduler：
  - 针对Xxl-job的权限设计问题，扩展开发权限模块以支持只读权限。
  - 为企业微信告警场景定制化开发DolphinScheduler和Xxl-job，提供支持。
  - 维护容器基础镜像，更新配置环境。
4.	新人培训和知识库维护：负责为团队成员提供培训和指导，确保公司内部Java技术知识的传承和发展。


## 上海雷默广告有限公司	全栈工程师	2019.07-2021.07

1.	开发爬虫和自动化运营脚本,以提高地铁广告业务的效率和精度。
2.	设计和实现数据 ETL 流程,将数据成功入库,并提供可靠的报表分析支持。
3.	研发中标商业项目的后台系统,以满足业务需求并提高工作效率。

---

# 项目经历

---

## 生生物流 - 数据中台	后端工程师 | 组长	2019.08-至今

内容:
该项目旨在开发和维护一个生物物流数据中台系统，以支持企业内部的数据集成和分析需求。

主要功能：
-	提供数据接入和输出端点，实现与企业内部OWTB等业务系统的数据集成和中转服务。
-	生成各业务维度的分析报表，支持BI系统的功能，以便进行数据分析和决策支持。

项目目标：
通过构建高效的数据中台系统，提升企业内部数据处理和分析能力，支持业务的快速发展和决策制定。

技术：
1.	使用`Nginx`作为网关入口，通过`Gateway`集群分发流量至各服务提供者。
2.	集成`Alibaba Sentinel`实现服务限流、降级和熔断，保障高并发下的服务可用性。
3.	集成`Spring Cloud OAuth2`管理服务资源，统一鉴权和授权。
4.	使用`Nacos`作为服务注册和配置中心，实现服务发现和配置管理。
5.	采用`SkyWalking`收集链路追踪日志，结合`Logstash`和`Kafka`实现异常告警和性能分析。
6.	使用`Prometheus`和`Grafana`收集和监控服务指标，实现可视化告警。
7.	利用`Redis`缓存Token和业务数据，项目集成`Redisson`提供分布式锁。
8.	使用`Kafka`维护业务解耦，通过配置策略保证消息一致性。
9.	通过`DolphinScheduler`实现数据系统的工作流调度，支持亿次级别的在线生产调度。
10.	结合`Kudu`、`Hive + Impala`构建分布式存储和离线数据仓库，将数据同步至`MySQL`支持数据分析。
11.	结合`Jenkins`、`Docker  Swarm`和`Portainer`实现服务容器化和DevOps流水线，支持环境构建、滚动更新和故障恢复。
12.	后端服务基础框架：SpringBoot + SSM 。

业绩:
  -	通过采用集群化服务，相较于旧业务系统（基于PHP实现），2C4G双节点的数据系统实例使业务系统访问接口的吞吐量提升了近200%。同时，经过数据系统优化，大部分数据报表接口响应时间从分钟级别优化到了秒级别。
  -	实现接口吞吐能力近 600 TPS，每小时接收并处理来自温度计供应商鼎为的近10万条温度数据，并将其存储入数据仓库。对在途过程中的数据进行实时监控和分析，为冷链业务提供可视化监控和告警支持。

---

## 个人项目 - 自然语言生成Superset图表	开发	2024.01-2024.02

这是个人项目，旨在通过开发实践深入学习LangChain相关知识。

主要功能：
实现使用自然语言自动生成Superset图表的功能，提升数据可视化的效率和便捷性。

技术栈：
Python 3.11作为开发语言。
利用LangChain库处理自然语言理解和生成任务。
采用Prompt  Engineering技术优化模型的响应效果。

---

## 上海雷默 - 新闻自动化脚本平台	后端开发	2020.03-2020.04

使用技术：WxPython + XML

项目描述：
该项目是一个自动化脚本，旨在实现对微博、小红书、抖音等社交平台的引流和养号操作。

项目职责：
-	进行需求分析，确保脚本满足平台引流和养号的需求。
-	编写自动化脚本，实现对社交平台的自动化操作。
-	设计并实现用户界面，提供友好的交互体验。

