# instanceof 是如何实现的

## 前言
在js中，类型检测一直是个很重要的话题。 js提供了多种方式来判断变量的类型，而`instanceof`操作符就是其中最常用的方法之一。

`instanceof` 不仅仅是一个简单的类型检测工具，它背后蕴含着 JavaScript 原型链的核心机制。理解 `instanceof` 的工作原理，能够帮助我们更深入地掌握 JavaScript 的面向对象编程思想，以及原型继承的精髓。

本文将从原型的基础概念出发，逐步深入到原型链的工作机制，最后通过手写 `instanceof` 的实现来彻底理解这个操作符的内部逻辑。

## 原型

每个对象都有一个内部属性叫做[[Prototype]] (也可以通过__proto__访问)，他指向另一个对象，这个对象就叫做原型。原型对象的所有属性和方法，都被所有实例对象共享。

### 获取原型的方法
1. **Object.getPrototypeOf(obj)**

这是 ES5 引入的标准方法，也是最推荐的方式：
```js
function Person(name) {
    this.name = name;
}
const person = new Person('张三');
console.log(Object.getPrototypeOf(person) === Person.prototype); // true

```
2. **obj.__proto__**

这是一个非标准但广泛支持的属性：
```js
const obj = {};
console.log(obj.__proto__ === Object.prototype); // true
```
3. **constructor.prototype**

通过构造函数的 prototype 属性间接获取：

```js
function Person(name) {
    this.name = name;
}
const person = new Person('李四');
console.log(person.constructor.prototype === Person.prototype); // true
```

### 创建原型

1. **构造函数 + protptype**

```js
function Person(name) {
  this.name = name;
}

// 在构造函数的prototype上添加方法
Person.prototype.sayHello = function () {
  return `你好, 我是 ${this.name}`;
};

const person1 = new Person("lisi");
const person2 = new Person("xiaohong");

// 两个实例共享同一个原型上的方法
console.log(person1.sayHello());
console.log(person2.sayHello());
```

2. **Object.create()**

```js
// 创建原型对象
const person = {
  name: "lisi",
  sayHello: function () {
    return `你好, 我是 ${this.name}`;
  },
};

// 基于原型创建对象
const person1 = Object.create(person);
person1.name = "xiaohong";

console.log(person1.sayHello());
```

3. **es6 Class 语法**

```js
class Person {
  constructor(name) {
    this.name = name;
  }

  sayHello() {
    return `你好, 我是 ${this.name}`;
  }
}

const person1 = new Person("lisi");
console.log(person1.sayHello());
```

## 原型链

原型链是由对象的原型连接起来的一条链式结构。 当访问对象的属性和方法时，会沿着原型链向上查找，直到找到目标属性或者到达原型链的顶端（null）。

```js
const obj = {
  name: "lisi",
};

// 1.首先在obj自身查找toString方法发现没有
// 2. 然后在obj.__proto__(Object.prototype)查找toString方法发现有
// 3. 返回Object.prototype.toString

console.log(obj.toString());
```

## instanceof

instanceof 用来检测对象的类型，它是否是某个构造函数的实例。 instanceof 的左边是对象，右边是构造函数。 instanceof 会遍历对象的原型链，如果找到了就返回 true，否则返回 false

## 类型检测

```javascript
// 检测基本数据类型的包装对象
const str = new String("hello");
console.log(str instanceof String); // true
console.log(str instanceof Object); // true

const num = new Number(42);
console.log(num instanceof Number); // true

// 注意：基本类型不是对象实例
console.log("hello" instanceof String); // false
console.log(42 instanceof Number); // false

// 检测引用类型
const arr = [1, 2, 3];
console.log(arr instanceof Array); // true
console.log(arr instanceof Object); // true
```

## 具体实现

1. 如果值是 null 或者基本类型是基本类型，就直接返回 false
2. 如果构造函数不是函数，就报错
3. 否则值是对象，获取他的原型对象，看他的原型对象是否等于构造函数的原型对象，如果是返回 true，否则继续向上查找原型对象的原型对象，直到原型对象为 null，返回 false

```js
function myInstanceof(value, Constructor) {
  if (value == null || typeof value !== "object") {
    return false;
  }

  if (typeof Constructor !== "function") {
    throw new TypeError("Right-hand side of instanceof is not a constructor");
  }

  let proto = Object.getPrototypeOf(value);

  while (proto !== null) {
    if (proto === Constructor.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}
```

## 总结

通过本文的深入探讨，我们全面了解了 `instanceof` 操作符的工作原理和实现机制。`instanceof` 的本质是**原型链的遍历过程**。它通过不断向上查找对象的原型链，判断是否能找到与构造函数 `prototype` 属性相同的原型对象，从而确定对象是否为某个构造函数的实例。理解 `instanceof` 的实现原理，不仅能帮助我们更好地使用这个操作符，更重要的是加深了对 JavaScript 原型继承机制的理解。这为我们编写更加健壮和优雅的 JavaScript 代码奠定了坚实的基础。
