---
layout: post
title: Shenandoah垃圾回收器
lead:
comments: true
categories: 
  - jvm
---

- toc
{: toc }

该项目实现目标是能实现一种能在任意堆大小下都能把垃圾回收的停顿时间控制在10毫秒以内。该目标意味着它不仅是要并发的进行垃圾标记，还要并发的进行对象清理后的整理工作。

## 与G1的不同

## 收集器工作过程

### 初始标记（Initial Marking）

### 并发标记（Concurrent Marking）

### 最终标记（Final Marking）

### 并发清理（Concurrent Cleanup）

### 并发回收（Concurrent Evacuation）

### 初始引用更新（Initial Update Reference）

### 并发引用更新（Concurrent Update Reference）

### 最终引用更新（Final Update Reference）

### 并发清理（Concurrent Cleanup）

黄色区域代表被选入回收集的Region, 绿色部分代表还存活对象, 蓝色就是用户线程可以分配对象的内存Region.

![Shenandoah 垃圾回收工作过程](/assets/images/jvm/Shenandoah收集器/pic_1.png)

## 转发指针

## 实际应用测试对比数据