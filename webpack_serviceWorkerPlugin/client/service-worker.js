/*
    目前的问题：  invest修改了之后,缓存没有更新

*/


/*
    注意事项
        1. 只支持get请求

            jsonp 不被支持
            post接口不被支持

    测试环境
        可以在 localhost 上测试
    正式环境

        只能在HTTPS的网页上注册service workers
            因为通过service worker可以劫持连接，伪造和过滤响应
            防止加载service worker的时候不被坏人篡改，

*/

/*
service-worker
    运行于浏览器后台(单独的运行环境和执行线程)，不受页面刷新的影响，可以监听和截拦作用域范围内所有页面的 HTTP 请求。

    允许开发者控制页面的网络请求。

    作用： 实现  消息推送，web离线工作


    通过postMessage方法来与Web页面通信，让页面操作DOM。

    生命周期
        install
        activated or error(安装失败)
        idle
        teminated or (fetch Message)




     执行顺序

          首次加载页面
              页面                   注册service-worker.js
              service-worker.js      执行
              页面                   注册成功
              service-worker.js      install成功

          二次加载页面,才会处理请求
              service-worker.js      fetch




              未做到的事情
                message（页面消息）事件 或者 被终止（节省内存）。

                使用ServiceWorker cache polyfill让旧版本浏览器支持 ServiceWorker cache API，
                
                
                self.skipWaiting()
                self.clients.claim()
                self.navigator.onLine

                caches.keys()

                //清除缓存
                caches.delete(t)

                event.map(function (t) {
                    if (t !== a) return caches.delete(t)
                })

                t.request.headers.get("save-data")
                t.request.url.includes("fonts.jd.com")


*/


// 缓存的名称
var cacheStorageName = 'qianjiaCache{{version}}'

// 当浏览器注册 Service Worker后 调用
self.addEventListener('install', event => {

    debugger
    event.waitUntil(

        //创建一个 cacheStorage（只能看到当前域名的资源，其他域名的资源虽然被缓存，但是不能被看到）
        caches.open(cacheStorageName).then(cache => {
            //批量添加cacheItem
            cache.addAll([])

            //单个添加cacheItem
            //cache.put(requestToCache, responseToCache);

        }).then(function () {
            return console.log("Skip waiting!"),
                //跳过等待，执行新线程（结束老线程）
                self.skipWaiting()
        })
    );
});

//版本修改时 触发 ,将旧版本的缓存清理掉。

//var CACHE_NAME = 'main_v1.0.0';

self.addEventListener('activate',function (event) {
    debugger;
    //var mainCache = [CACHE_NAME];
    event.waitUntil(

        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheItemName) {
                        return caches.delete(cacheItemName);
                })
            );
        })
    );
    return self.clients.claim();


})



//当请求时，（第二次刷新页面才会执行）
self.addEventListener('fetch', function (event) {

    //动态资源（接口）
    if(event.request.url.indexOf('qj/front/v2') != -1){

    }
    //静态资源
    else{
        event.respondWith(

            //从cacheStorage中匹配
            caches.match(event.request)
                .then(function (response) {

                    //匹配到，直接返回结果
                    if (response) {
                        return response;
                    }


                    //未匹配到，重新请求
                    var requestToCache = event.request.clone();
                    return fetch(requestToCache).then(function (response) {
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        var responseToCache = response.clone();
                        caches.open(cacheStorageName).then(function (cache) {


                            //单个添加cacheItem
                            cache.put(requestToCache, responseToCache);

                            //批量添加cacheItem
                            //cache.addAll([])
                        });
                        return response;
                    })
                })
        )
    }


});