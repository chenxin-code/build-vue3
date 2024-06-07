import {createRouter, createWebHistory, createWebHashHistory, createMemoryHistory} from 'vue-router';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        // 首页
        {
            path: '/',
            redirect: '/demo',
        },
        {
            path: '/defer',
            component: () => import('./page/defer.vue'),
        },
        {
            path: '/demo',
            component: () => import('./page/demo/index.vue'),
            // 嵌套路由
            children: [
                {
                    path: 'group-order',
                    component: () => import('./page/demo/group-order.vue'),
                },
                {
                    path: 'print-exportPDF',
                    component: () => import('./page/demo/print-exportPDF.vue'),
                },
                {
                    path: 'Avue-Crud',
                    component: () => import('./page/demo/Avue-Crud.vue'),
                },
            ],
        },
    ]
});

export default router;
