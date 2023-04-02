import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(), // hash模式：createWebHashHistory，history模式：createWebHistory
    routes: [
        //首页
        {
            path: '/',
            redirect: '/demo',
        },
        {
            path: "/demo",
            component: () => import("./page/demo/index"),
            //嵌套路由
            children: [
                {
                    path: 'ssq',
                    component: () => import("./page/demo/ssq"),
                },
            ],
        },
        {
            path: '/404',
            component: () => import('./page/404')
        },
        //一定放最后
        {
            path: '/:pathMatch(.*)*',
            redirect: '/404'
        }
    ],
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
    console.log('全局前置守卫', 'to', to, 'from', from, 'next', next);
    next();
});

// 全局后置钩子
router.afterEach((to, from) => {
    console.log('全局后置钩子', 'to', to, 'from', from);
});

export default router;