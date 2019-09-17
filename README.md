# plat-gateway

> plat gateway vue demo

## Build Setup (default)

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```


## 背景说明
``` 
    为了方便后端维护路由信息，因此，构建一个工程开发了一个配置页面。
```
## 如何使用
``` 
1、下载代码后，执行 npm install 安装依赖
2、执行 npm run dev 启动项目
3、在config/index.js下，配置正确的后端服务地址
4、目前只有一个路由配置页面 home.vue，后续根据需要扩展
5、功能如何使用，略
```
## 如何打包
``` 
1、确保代码可以运行，执行 npm run build 生成文件在dist目录下
2、目前为了方便，将打包的文件放在后端 plat-gateway\src\main\resources\static 的目录下
3、正常部署后端项目，访问 http://localhost:8000/index.html#/ 即可
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
