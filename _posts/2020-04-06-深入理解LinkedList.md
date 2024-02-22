---
layout: post
title: 深入理解LinkedList
lead: 
categories:
  - 数据结构
tags:
  - 源码
  - java
  - LinkedList
---

## 底层实现

> 一个双向链表实现的List，它除了作为List使用，还可以作为队列或者堆栈使用
>
> 在链表首尾添加元素很高效，在中间添加元素比较低效，首先要找到插入位置的节点，在修改前后节点的指针。<!-- more -->

核心成员变量

```java
	transient int size = 0; // 指向当前集合大小

    /**
     * Pointer to first node.
     * Invariant: (first == null && last == null) ||
     *            (first.prev == null && first.item != null)
     */
    transient Node<E> first; // 指向当前集合第一个节点

    /**
     * Pointer to last node.
     * Invariant: (first == null && last == null) ||
     *            (last.next == null && last.item != null)
     */
    transient Node<E> last; // 指向当前集合最末节点
```

`transient`关键字(引用百度百科)： 

> Java语言的关键字，变量修饰符，如果用**transient**声明一个实例变量，当对象存储时，它的值不需要维持。换句话来说就是，用**transient**关键字标记的成员变量不参与序列化过程。

内部Node节点

```java
 	private static class Node<E> {
        E item; // 当前节点
        Node<E> next; // 指向下一节点
        Node<E> prev; // 指向上一节点

        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }
```



## 添加元素

LinkedList主要提供`addFirst`、`addLast`、`add`、`addAll`等方法来实现元素的添加。

### add()

```java
 	public void add(int index, E element) {
        checkPositionIndex(index); // 1

        if (index == size) // 2
            linkLast(element);
        else // 3
            linkBefore(element, node(index));
    }
```

执行流程：

1. 判断是否越界
2. 当前index等于节点个数，就将元素添加到链表尾部
3. 添加当前元素到指定节点前

```java
    void linkLast(E e) {
        //将内部保存的尾节点赋值给l
        final Node<E> l = last;
        //创建新节点，新节点的prev节点是当前的尾节点
        final Node<E> newNode = new Node<>(l, e, null);
        //把新节点作为新的尾节点
        last = newNode;
        //判断是否是第一个添加的元素
        //如果是将新节点赋值给first
        //如果不是把原首节点的next设置为新节点
        if (l == null)
            first = newNode;
        else
            l.next = newNode;
        //更新链表节点个数
        size++;
        //将集合修改次数加1
        modCount++;
    }

```

```java
	//将元素插入到指定节点前
    void linkBefore(E e, Node<E> succ) {
        // assert succ != null;
        //拿到succ的上一节点
        final Node<E> pred = succ.prev;
        //创建新节点
        final Node<E> newNode = new Node<>(pred, e, succ);
        //将新节点作为succ的上一节点
        succ.prev = newNode;
        //判断succ是否是首节点
        //如果是将新节点作为新的首节点
        //如果不是将新节点作为pred的下一节点
        if (pred == null)
            first = newNode;
        else
            pred.next = newNode;
        //更新链表节点个数
        size++;
        //将集合修改次数加1
        modCount++;
    }
```

### addFirst()

添加元素至链表头节点

```java
    public void addFirst(E e) {
        linkFirst(e);
    }

    /**
     * Links e as first element.
     */
    private void linkFirst(E e) {
        final Node<E> f = first; // 获取当前头部节点
        final Node<E> newNode = new Node<>(null, e, f); // 当前元素创建新节点
        first = newNode; // 头部节点指向新节点
        
        //判断是否是第一个添加的元素
        //如果是将新节点赋值给last
        //如果不是把原首节点的prev设置为新节点
        if (f == null) 
            last = newNode;
        else
            f.prev = newNode;
        
        size++; // 更新链表节点个数
        modCount++; // 集合修改次数+1
    }
```

### addLast()

添加元素至链表尾节点

```java
    public void addLast(E e) {
        linkLast(e);
    }

    /**
     * Links e as last element.
     */
    void linkLast(E e) {
        final Node<E> l = last; // 获取当前尾结点元素
        final Node<E> newNode = new Node<>(l, e, null); // 为当前元素创建新节点
        last = newNode; // 尾部节点指向新节点
        
        // 判断是否为第一个添加的元素
        // 如果是则将first指向新节点
		// 如果不是则把原尾结点的next指向为新节点
        if (l == null)
            first = newNode;
        else
            l.next = newNode;
        
        size++; // 更新链表节点个数
        modCount++; // 集合修改次数+1
    }
```

### addAll()

```java
	//将集合内的元素依次插入index位置后
    public boolean addAll(int index, Collection<? extends E> c) {
        //判断是否越界
        checkPositionIndex(index);
		//将集合转换为数组
        Object[] a = c.toArray();
        int numNew = a.length;
        //判断数组长度是否为0，为0直接返回false
        if (numNew == 0)
            return false;
		//pred上一个节点，succ当前节点
        Node<E> pred, succ;
        //判断index位置是否等于链表元素个数
        //如果等于succ赋值为null，pred赋值为当前链表尾节点last
        //如果不等于succ赋值为index位置的节点，pred赋值为succ的上一个节点
        if (index == size) {
            succ = null;
            pred = last;
        } else {
            succ = node(index);
            pred = succ.prev;
        }
		//循环数组
        for (Object o : a) {
            @SuppressWarnings("unchecked") E e = (E) o;
            //创建新节点
            Node<E> newNode = new Node<>(pred, e, null);
            //如果上一个节点为null，把新节点作为新的首节点，否则pred的下一个节点为新节点
            if (pred == null)
                first = newNode;
            else
                pred.next = newNode;
            //把新节点赋值给上一个节点
            pred = newNode;
        }
		//如果index位置的节点为null，把pred作业尾节点
        //如果不为null，pred的下一节点为index位置的节点，succ的上一节点为pred
        if (succ == null) {
            last = pred;
        } else {
            pred.next = succ;
            succ.prev = pred;
        }
		//更新链表节点个数
        size += numNew;
        //将集合修改次数加1
        modCount++;
        //因为是无界的，所以添加元素总是会成功
        return true;
    }
```



## 获取元素

> LinkedList提供了`get`、`getFirst`、`getLast`等方法获取节点元素值。

### get()

获取指定位置的元素

```java
	//获取指定位置的元素值
    public E get(int index) {
        //判断是否越界
        checkElementIndex(index);
        //直接调用node方法获取指定位置的节点，并反回其元素值
        return node(index).item;
    }

	/**
     * Returns the (non-null) Node at the specified element index.
     */
    Node<E> node(int index) {
        // assert isElementIndex(index);

        // 判断当前索引是否处于链表前段
        // 如果是则从头部开始遍历获取元素
        // 如果不是则从尾部开始遍历获取元素
        if (index < (size >> 1)) {
            Node<E> x = first; // 获取当前头部节点
            for (int i = 0; i < index; i++) // 根据索引从头部开始遍历节点
                x = x.next;
            return x;
        } else {
            Node<E> x = last; // 获取当前尾部节点
            for (int i = size - 1; i > index; i--) //根据索引从尾部开始遍历
                x = x.prev;
            return x;
        }
    }

```

### getFirst()

返回当前链表头部元素

```java
    /**
     * Returns the first element in this list.
     *
     * @return the first element in this list
     * @throws NoSuchElementException if this list is empty
     */
    public E getFirst() {
        final Node<E> f = first;
        if (f == null)
            throw new NoSuchElementException();
        return f.item;
    }

```



### getLast()

返回当前链表尾部元素

```java
    /**
     * Returns the last element in this list.
     *
     * @return the last element in this list
     * @throws NoSuchElementException if this list is empty
     */
    public E getLast() {
        final Node<E> l = last;
        if (l == null)
            throw new NoSuchElementException();
        return l.item;
    }

```



## 关于队列的操作

LinkedList可以作为FIFO(First In First Out)的队列，也就是先进先出的队列使用，以下是关于队列的操作。

```java
    //获取队列的第一个元素，如果为null会返回null
    public E peek() {
        final Node<E> f = first;
        return (f == null) ? null : f.item;
    }
	//获取队列的第一个元素，如果为null会抛出异常
    public E element() {
        return getFirst();
    }
	//获取队列的第一个元素，如果为null会返回null
    public E poll() {
        final Node<E> f = first;
        return (f == null) ? null : unlinkFirst(f);
    }

	//获取队列的第一个元素，如果为null会抛出异常
    public E remove() {
        return removeFirst();
    }
	//将元素添加到队列尾部
    public boolean offer(E e) {
        return add(e);
    }

```

## 关于双端队列操作

双端列队可以作为栈使用，栈的特性是LIFO(Last In First Out)，也就是后进先出。所以作为栈使用也很简单，添加和删除元素都只操作队列的首节点即可。

```java
//将元素添加到首部
    public boolean offerFirst(E e) {
        addFirst(e);
        return true;
    }
	//将元素添加到尾部
    public boolean offerLast(E e) {
        addLast(e);
        return true;
    }
 	//获取首部的元素值
    public E peekFirst() {
        final Node<E> f = first;
        return (f == null) ? null : f.item;
     }
	//获取尾部的元素值
    public E peekLast() {
        final Node<E> l = last;
        return (l == null) ? null : l.item;
    }
	//删除首部，如果为null会返回null
    public E pollFirst() {
        final Node<E> f = first;
        return (f == null) ? null : unlinkFirst(f);
    }
	//删除尾部，如果为null会返回null
    public E pollLast() {
        final Node<E> l = last;
        return (l == null) ? null : unlinkLast(l);
    }
	//将元素添加到首部
    public void push(E e) {
        addFirst(e);
    }
	//删除首部，如果为null会抛出异常
    public E pop() {
        return removeFirst();
    }
	//删除链表中元素值等于o的第一个节点，其实和remove方法是一样的，因为内部还是调用的remove方法
    public boolean removeFirstOccurrence(Object o) {
        return remove(o);
    }

	//删除链表中元素值等于o的最后一个节点
	public boolean removeLastOccurrence(Object o) {
     	//因为LinkedList允许存在null，所以需要进行null判断
        if (o == null) {
            //和remove方法的区别它是从尾节点往前遍历
            for (Node<E> x = last; x != null; x = x.prev) {
                if (x.item == null) {
                    //调用unlink方法删除指定节点
                    unlink(x);
                    return true;
                }
            }
        } else {
            for (Node<E> x = last; x != null; x = x.prev) {
                if (o.equals(x.item)) {
                    unlink(x);
                    return true;
                }
            }
        }
        return false;
    }

```



