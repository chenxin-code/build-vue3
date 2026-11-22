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
                {
                    path: 'waterFall',
                    component: () => import('./page/demo/waterFall.vue'),
                },
                {
                    path: 'baiduMap-search-locate',
                    component: () => import('./page/demo/baiduMap-search-locate.vue'),
                },
                {
                    path: 'massChartsRenderOptimize',
                    component: () => import('./page/demo/massChartsRenderOptimize/index.vue'),
                },
                {
                    path: 'selectLoadMore',
                    component: () => import('./page/demo/selectLoadMore.vue'),
                },
                {
                    path: 'solarSystem',
                    component: () => import('./page/demo/solarSystem.vue'),
                },
                {
                    path: 'sync-async-component',
                    component: () => import('./page/demo/sync-async-component.vue'),
                },
                {
                    path: '3d-walk',
                    component: () => import('./page/demo/3d-walk.vue'),
                },
                {
                    path: 'pi-needle',
                    component: () => import('./page/demo/pi-needle.vue'),
                },
                {
                    path: 'maze',
                    component: () => import('./page/demo/maze/index.vue'),
                    // build-vue2 那边没配默认子路由，点「迷宫」会先进空白页，这里补上
                    redirect: '/demo/maze/1',
                    // 嵌套路由
                    children: [
                        {
                            path: '1',
                            component: () => import('./page/demo/maze/1.vue'),
                        },
                        {
                            path: '2',
                            component: () => import('./page/demo/maze/2.vue'),
                        },
                    ],
                },
            ],
        },
        {
            path: '/404',
            component: () => import('./page/404.vue'),
        },
        // 一定放最后
        {
            path: '/:pathMatch(.*)*',
            redirect: '/404',
        },
    ]
});

export default router;
