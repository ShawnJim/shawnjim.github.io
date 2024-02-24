---
layout: post
title: 深入理解ArrayList
description: 深入理解ArrayList
lead: 
comments: true
categories:
  - 数据结构
tags:
  - 源码
  - java
  - ArrayList
---

- toc
{: toc }


## 底层实现

> ArrayList底层是由默认容量大小为10的Object数组实现
<!-- more -->

```java
    /**
     * Default initial capacity.
     */
    private static final int DEFAULT_CAPACITY = 10;

    /**
     * Shared empty array instance used for empty instances.
     */
    private static final Object[] EMPTY_ELEMENTDATA = {};

    /*
     * Shared empty array instance used for default sized empty instances.
	 */
    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

    /*
     * The array buffer into which the elements of the ArrayList are stored.
     * The capacity of the ArrayList is the length of this array buffer. Any
     * empty ArrayList with elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA
     * will be expanded to DEFAULT_CAPACITY when the first element is added.
     */
    transient Object[] elementData; // non-private to simplify nested class access

    /**
     * The size of the ArrayList (the number of elements it contains).
	 */
    private int size;
```

DEFAULT_CAPACITY： 默认初始化容量

EMPTY_ELEMENTDATA：空数组对象，创建ArrayList构造函数初识容量为0时,默认对象内容为该对象

```java
    public ArrayList(int initialCapacity) {
        if (initialCapacity > 0) {
            this.elementData = new Object[initialCapacity];
        } else if (initialCapacity == 0) {
            this.elementData = EMPTY_ELEMENTDATA;
        } else {
            throw new IllegalArgumentException("Illegal Capacity: "+
                                               initialCapacity);
        }
    }
```

DEFAULTCAPACITY_EMPTY_ELEMENTDATA：空数组对象，如果使用默认构造函数创建，则默认对象内容则为该对象

```java
    /**
     * Constructs an empty list with an initial capacity of ten.
     */
    public ArrayList() {
        this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
    }
```

elementData：数据存储对象

size：当前数组长度



## 添加元素

ArrayList主要提供`add`、`addAll`、`set`等方法来实现元素的添加。

### add(E element)

```java
    /**
     * Appends the specified element to the end of this list.
     *
     * @param e element to be appended to this list
     * @return <tt>true</tt> (as specified by {@link Collection#add})
     */
    public boolean add(E e) {
        // 数组初始化 or 扩容处理
        ensureCapacityInternal(size + 1);  // Increments modCount!!
        elementData[size++] = e;
        return true;
    }
```

添加元素到数组最末处；

#### ensureCapacityInternal(minCapacity)

```java
private void ensureCapacityInternal(int minCapacity) {
        // 如果elementData 指向的是 DEFAULTCAPACITY_EMPTY_ELEMENTDATA 的地址
        if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
            //置默认大小 为DEFAULT_CAPACITY
            minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity);
        }
        //确定实际容量
        ensureExplicitCapacity(minCapacity);
    }


private void ensureExplicitCapacity(int minCapacity) {
        modCount++;

        // 如果超出了容量，进行扩展
        if (minCapacity - elementData.length > 0)
            grow(minCapacity);
    }
```

对当前数组对象的一些动态处理

#### 扩容 grow(int minCapacity)

```java
	private void grow(int minCapacity) {
        // overflow-conscious code
        int oldCapacity = elementData.length;
        //右移运算符等价于除以2，如果第一次是10，扩容之后的大小是15
        int newCapacity = oldCapacity + (oldCapacity >> 1);
        if (newCapacity - minCapacity < 0)
            newCapacity = minCapacity;
        if (newCapacity - MAX_ARRAY_SIZE > 0)
            newCapacity = hugeCapacity(minCapacity);
        // minCapacity is usually close to size, so this is a win:
        elementData = Arrays.copyOf(elementData, newCapacity);
    }
```

使用Arrays.copyOf方法将当前数据的元素复制到一个为当前数组容量1.5倍大小的新数组中

### add(int index, E element)

插入元素到当前数组指定下标处

```java
    /**
     * Inserts the specified element at the specified position in this
     * list. Shifts the element currently at that position (if any) and
     * any subsequent elements to the right (adds one to their indices).
     *
     * @param index index at which the specified element is to be inserted
     * @param element element to be inserted
     * @throws IndexOutOfBoundsException {@inheritDoc}
     */
    public void add(int index, E element) {
        rangeCheckForAdd(index); // 1

        ensureCapacityInternal(size + 1); // 2 // Increments modCount!!
        System.arraycopy(elementData, index, elementData, index + 1,
                         size - index); // 3
        elementData[index] = element; // 4
        size++; // 5
    }
```

结合源码解读添加流程：

1. 判断当前索引是否数组越界，如果超出则抛出IndexOutOfBoundsException异常
2. 对数组动态处理; 初始化 or 扩容
3. 将旧数组拷贝到一个新数组中，参数：被复制的原数组, 被复制数组的第几个元素开始复制, 复制的目标数组, 从目标数组index + 1位置开始粘贴, 复制的元素个数
4. 将元素添加到指定下标处
5. 数组长度+1

### addAll(int index, Collection<? extends E> c)

```java
	public boolean addAll(Collection<? extends E> c) {
            /*转为对象数组*/
            Object[] a = c.toArray();
            int numNew = a.length;
            /*扩容机制：判断是否需要扩容*/
            ensureCapacityInternal(size + numNew);  // Increments modCount
            /*拷贝数组，参数:被复制的数组，被复制数组的第几个元素开始复制，复制到目标数组，目标数组粘贴的位置， 复制的个数*/
            System.arraycopy(a, 0, elementData, size, numNew);
            /*数组长度+numNew*/
            size += numNew;
            return numNew != 0;
        }
```

ArrayList的addAll()方法的实现和add()方法实现思路一致，只不过需要移动的元素更多，由于数组结构的特性，导致这样的操作对于数据大的ArrayList的插入操作，

会严重影响代码执行的效率，所以开发中我们应该尽量避免出现对数据元素多的ArrayList频繁add。

### set(int index, E element)

替换指定下标的元素

```java
    /**
     * Replaces the element at the specified position in this list with
     * the specified element.
     *
     * @param index index of the element to replace
     * @param element element to be stored at the specified position
     * @return the element previously at the specified position
     * @throws IndexOutOfBoundsException {@inheritDoc}
     */
    public E set(int index, E element) {
        rangeCheck(index); // 校验数组越界

        E oldValue = elementData(index);// 插入下标处原元素
        elementData[index] = element; // 将元素指向数组指定下标处
        return oldValue;
    }
```



## 获取元素

### get(int index)

```java
    /**
     * Returns the element at the specified position in this list.
     *
     * @param  index index of the element to return
     * @return the element at the specified position in this list
     * @throws IndexOutOfBoundsException {@inheritDoc}
     */
    public E get(int index) {
        rangeCheck(index); // 校验是否数组越界

        return elementData(index);
    }
```

获取指定下标的元素；



## 删除元素

ArrayList提供了`remove(int index)`、`remove(Object o)`、`clear()`、`removeAll（Collection c）`

### remove(int index)

```java
    /**
     * Removes the element at the specified position in this list.
     * Shifts any subsequent elements to the left (subtracts one from their
     * indices).
     *
     * @param index the index of the element to be removed
     * @return the element that was removed from the list
     * @throws IndexOutOfBoundsException {@inheritDoc}
     */
    public E remove(int index) {
        rangeCheck(index); // 1

        modCount++;
        E oldValue = elementData(index);

        int numMoved = size - index - 1; // 2
        if (numMoved > 0) // 3
            System.arraycopy(elementData, index+1, elementData, index,
                             numMoved); 
        elementData[--size] = null; // 4 // clear to let GC do its work

        return oldValue;
    }
```

解读流程： 

1. 校验数组越界
2. 计算需要删除数据位置
3. 判断删除是否元素最后一位，是则需要移动数组
4. 数组末尾下标元素指向空，垃圾回收

### remove(Object o)

删除ArrayList中的值对象，其实和通过下标删除很相似，只是多了一个步骤，遍历底层数组elementData，通过equals()方法或 == （特殊情况下）来找到要删除的元素，获取其下标，调用remove(int index)一样的代码即可。

```java
/**
     * Removes the first occurrence of the specified element from this list,
     * if it is present.  If the list does not contain the element, it is
     * unchanged.  More formally, removes the element with the lowest index
     * <tt>i</tt> such that
     * <tt>(o==null&nbsp;?&nbsp;get(i)==null&nbsp;:&nbsp;o.equals(get(i)))</tt>
     * (if such an element exists).  Returns <tt>true</tt> if this list
     * contained the specified element (or equivalently, if this list
     * changed as a result of the call).
     *
     * @param o element to be removed from this list, if present
     * @return <tt>true</tt> if this list contained the specified element
     */
    public boolean remove(Object o) {
        if (o == null) { 
            for (int index = 0; index < size; index++) //遍历集合
                // 判断数组对象与删除对象是否相等
                // 如相等则调用fastRemove方法删除该下标元素
                if (elementData[index] == null) { 
                    fastRemove(index);
                    return true;
                }
        } else {
            for (int index = 0; index < size; index++)
                if (o.equals(elementData[index])) {
                    fastRemove(index);
                    return true;
                }
        }
        return false;
    }

    /*
     * Private remove method that skips bounds checking and does not
     * return the value removed.
     */
	// 同remove(int index)
    private void fastRemove(int index) {
        modCount++;
        int numMoved = size - index - 1;
        if (numMoved > 0)
            System.arraycopy(elementData, index+1, elementData, index,
                             numMoved);
        elementData[--size] = null; // clear to let GC do its work
    }

```



### clear()

集合清空，通过遍历底层数组elementData，设置为null

```java
    /**
     * Removes all of the elements from this list.  The list will
     * be empty after this call returns.
     */
    public void clear() {
        modCount++;

        // clear to let GC do its work
        for (int i = 0; i < size; i++)
            elementData[i] = null;

        size = 0;
    }
```



### removeAll（Collection c）

删除不与传入集合对象相匹配的元素

```java
    /**
     * Removes from this list all of its elements that are contained in the
     * specified collection.
     *
     * @param c collection containing elements to be removed from this list
     * @return {@code true} if this list changed as a result of the call
     * @throws ClassCastException if the class of an element of this list
     *         is incompatible with the specified collection
     * (<a href="Collection.html#optional-restrictions">optional</a>)
     * @throws NullPointerException if this list contains a null element and the
     *         specified collection does not permit null elements
     * (<a href="Collection.html#optional-restrictions">optional</a>),
     *         or if the specified collection is null
     * @see Collection#contains(Object)
     */
    public boolean removeAll(Collection<?> c) {
        Objects.requireNonNull(c); //  空对象校验
        return batchRemove(c, false);
    }

    private boolean batchRemove(Collection<?> c, boolean complement) {
        final Object[] elementData = this.elementData; // 获取当前集合数组
        int r = 0, w = 0;
        boolean modified = false;
        try {
            for (; r < size; r++)
                // 判断元素是否存在传入集合中
                // 不存在则将该元素放入数组中，从下标0开始存放
                if (c.contains(elementData[r]) == complement) 
                    elementData[w++] = elementData[r];
        } finally {
            // Preserve behavioral compatibility with AbstractCollection,
            // even if c.contains() throws.
            // 判断当前数组是否有更改
            // 有更改则移动数组元素
            if (r != size) { 
                System.arraycopy(elementData, r,
                                 elementData, w,
                                 size - r);
                w += size - r;
            }
            // 判断数组是否有移动
            // 如果有移动则将多余元素下标指向null
            if (w != size) {
                // clear to let GC do its work
                for (int i = w; i < size; i++)
                    elementData[i] = null;
                modCount += size - w;
                size = w;
                modified = true;
            }
        }
        return modified;
    }
```



## 总结

- ArrayList底层由数组组成，数组是适合查询的，因为数组每个元素的内存空间是固定的，但是增删元素都需要复制一个新的数组，随着数组越来越大，效率会越发低下；

- arraylist不是线程安全的,只能用在单线程环境下

- arraylist支持序列化和克隆
- ArrayList适合频繁查询的业务场景，而频繁增删的场景更适合使用linkedList