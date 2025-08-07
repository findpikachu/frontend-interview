# 基于 Promise 封装 Ajax

## 前言

在现代前端开发中，与服务器进行数据交互是不可避免的需求。虽然现在我们有了更现代的 `fetch` API，但理解如何基于传统的 XMLHttpRequest (XHR) 来封装一个支持 Promise 的 Ajax 库，对于深入理解异步编程和网络请求机制仍然具有重要意义。

XMLHttpRequest 作为浏览器提供的原生 API，功能强大但使用起来相对繁琐。它基于事件驱动的回调模式，在处理复杂的异步逻辑时容易陷入"回调地狱"，代码可读性和维护性都不够理想。而 Promise 的出现为异步编程提供了更优雅的解决方案，让我们能够以链式调用的方式处理异步操作。

本文将从 XMLHttpRequest 的基本使用开始，逐步分析其存在的问题，然后通过手写一个基于 Promise 的 Ajax 封装库来解决这些问题。

## XMLHttpRequest 使用

MLHttpRequest 是浏览器中用于发送 HTTP 请求和接收响应的 API。

XMLHttpRequest（简称 XHR）是 Web 浏览器内置的一个对象，用于在不刷新页面的情况下与服务器进行数据交换。它是实现 AJAX（异步 JavaScript 和 XML）技术的核心，可以让网页实现异步加载数据、提交表单、获取 JSON、XML、文本等内容。

但是 XMLHttpRequest 使用繁琐，并且不支持 promise，所以用回调函数来写会形成回调地狱，所以只能基于 promise 手动封装。所以现代都使用 fetch api 来替代 xhr。

```js
var xhr = new XMLHttpRequest();
xhr.open("GET", "https://example.com/api?name=张三", true); // true 表示异步

xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    // 请求完成
    if (xhr.status >= 200 && xhr.status < 300) {
      console.log("成功:", xhr.responseText);
    } else {
      console.error("失败:", xhr.status, xhr.statusText);
    }
  }
};

xhr.send();
```

## ajax 封装为 promise 实现

使用 promise 来封装 ajax，这样可以避免回调地狱，并且错误处理更容易。

- 当返回状态码在 200-300 之间，表示请求成功，promise 状态为 fulfilled。
- 当返回状态码不在 200-300 之间，表示请求失败，promise 状态为 rejected。
- 当请求超时，promise 状态为 rejected。
- 当请求出错，promise 状态为 rejected。
- 当 JSON.parse 失败，promise 状态为 rejected。

然后我们封装了一个 request 对象，用于发送不同类型的请求，包括 GET、POST、PUT、PATCH 等。 这样使用起来很简单

```js
function ajax(options) {
  return new Promise((resolve, reject) => {
    let {
      url,
      method = "GET",
      headers = {
        "Content-Type": "application/json",
      },
      timeout = 5000,
      data = null,
    } = options;

    const xhr = new XMLHttpRequest();

    method = method.toUpperCase();

    xhr.open(method, url, true);

    for (const [k, v] of Object.entries(headers)) {
      xhr.setRequestHeader(k, v);
    }
    xhr.timeout = timeout;
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          let res = null;
          try {
            res = JSON.parse(xhr.responseText);
          } catch (e) {
            res = xhr.responseText;
          }
          resolve({
            data: res,
            status: xhr.status,
            statusText: xhr.statusText,
          });
        } else {
          reject({
            message: `http error`,
            status: xhr.status,
            statusText: xhr.statusText,
          });
        }
      }
    };
    xhr.onerror = function () {
      reject({
        message: `network error`,
        status: xhr.status,
        statusText: xhr.statusText,
      });
    };

    xhr.ontimeout = function () {
      reject({
        message: `timeout error`,
        status: xhr.status,
        statusText: xhr.statusText,
      });
    };

    try {
      if (method === "GET") {
        xhr.send();
      } else {
        const reqData = typeof data === "object" ? JSON.stringify(data) : data;
        xhr.send(reqData);
      }
    } catch (e) {
      reject({
        message: e.message,
        status: xhr.status,
        statusText: xhr.statusText,
      });
    }
  });
}

const request = {
  get(url, options = {}) {
    return ajax({
      url,
      method: "GET",
      ...options,
    });
  },

  post(url, data, options = {}) {
    return ajax({
      url,
      data,
      method: "POST",
      ...options,
    });
  },

  put(url, data, options = {}) {
    return {
      url,
      method: "PUT",
      data,
      ...options,
    };
  },

  patch(url, data, options = {}) {
    return {
      url,
      method: "PATCH",
      data,
      ...options,
    };
  },

  delete(url, options = {}) {
    return {
      url,
      method: "DELETE",
      ...options,
    };
  },
};
```

## 总结

通过本文的学习，我们成功地将传统的 XMLHttpRequest API 封装成了一个现代化的、基于 Promise 的 Ajax 库。这个过程不仅解决了原生 XHR 的使用痛点，还让我们深入理解了异步编程的核心概念。

虽然现在我们通常使用 `fetch` API 或 `axios` 等成熟的库，但理解这种封装思路仍然很有价值。它让我们明白了现代 HTTP 客户端库的设计理念，也为我们在特殊场景下进行定制化开发提供了思路。

