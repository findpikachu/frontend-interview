# Generator 实现 async 和 await

## 前言

在现代 JavaScript 开发中，async/await 已经成为处理异步操作的标准方式，它让我们能够用同步的语法来编写异步代码，极大地提升了代码的可读性和维护性。但你是否想过，async/await 的底层实现原理是什么？

实际上，async/await 本质上是 Generator 函数和 Promise 的语法糖。在 ES2017 引入 async/await 之前，就已经在使用 Generator 函数来解决异步编程中的"回调地狱"问题， 例如著名的 redux-saga 库。

本文将从 Generator 的基本概念开始，逐步分析 async/await 的工作机制，最后通过手写一个 `generatorToAsync` 函数来完整实现这一转换过程。

## generator

generator 是一个函数，他会返回一个迭代器，用来控制函数的执行流程，每次调用 next 方法， 一直到 yield 停止，next 方法返回的是一个对象，有两个属性，一个是 value，他是 yield 后面的值，另一个是 done，表示是否到达函数末尾。

next 方法的参数，会被当作上一个 yield 的返回值。

```js
function* gen() {
  yield 1;
  yield 2;
  yield 3;
  return 4;
}

const g = gen();
console.log(g.next()); // {value: 1, done: false}
console.log(g.next()); // {value: 2, done: false}
console.log(g.next()); // {value: 3, done: false}
console.log(g.next()); // {value: 4, done: true}
```

## async/await

async/await 是 generator 的语法糖，他是基于 promise+generator 实现的，他是用同步的方法来写异步，简化了异步处理的逻辑。

```js
function fn(nums) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(nums * 2);
    }, 1000);
  });
}

async function asyncFn() {
  const num1 = await fn(1);
  console.log(num1); // 2
  const num2 = await fn(num1);
  console.log(num2); // 4
  const num3 = await fn(num2);
  console.log(num3); // 8
  return num3;
}
```

await 后面是一个 promise，他会等待 promise reslove 后，继续往后执行。

## 实现

generator 的 yield 可以等价于 await， 后面接 promise，generator 的 return 可以等价于 async 函数的 return

我们封装一个函数叫做 generatorToAsync，返回的函数可以等价于 async 函数，返回的都是 promise

使用 gen 返回一个迭代器， 调用迭代器的 next 方法， 返回一个对象， 有两个属性，一个是 value，他是 yield 后面的值，另一个是 done，表示是否到达函数末尾。

如果 done 为 true，就直接把 promise resolve， 否则就继续递归调用这个过程，如果出错了就直接调用迭代器的 throw 方法。

```js
function generatorToAsync(gen) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      const iter = gen(...args);

      const step = (key, arg) => {
        let result;
        try {
          result = iter[key](arg);
        } catch (e) {
          reject(e);
        }
        const { value, done } = result;
        if (done) {
          return resolve(value);
        }

        return Promise.resolve(value).then(
          (v) => step("next", v),
          (err) => step("throw", err)
        );
      };

      return step("next");
    });
  };
}

function fn(nums) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(nums * 2);
    }, 1000);
  });
}

function* asyncFn() {
  const num1 = yield fn(1);
  console.log(num1); // 2
  const num2 = yield fn(num1);
  console.log(num2); // 4
  const num3 = yield fn(num2);
  console.log(num3); // 8
  return num3;
}

const genToAsync = generatorToAsync(asyncFn);
const asyncRes = genToAsync();
asyncRes.then((res) => console.log(res));
```

## 总结

通过本文的学习，我们学习了generator的使用, 并深入理解了 async/await 的底层实现原理，并成功用 Generator 和 promise 手写了一个完整的实现。 

