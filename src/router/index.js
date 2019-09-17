import Vue from 'vue'
import Router from 'vue-router'

//使用懒加载的方式来引入,只有路由被访问的时候才加载
import home from '@/components/home'

Vue.use(Router)
// 自定义
let router =  new Router({
  routes: [
        {
            path:'/',
            name :'home',
            component:home
        }
  ]
})
export default router
