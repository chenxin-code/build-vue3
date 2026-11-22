import {onBeforeUnmount} from 'vue';

/*
 * 登记在组件生命周期上的定时器。
 *
 * build-vue2 的两个迷宫页都用 setInterval 驱动动画，但离开路由时谁都没清，
 * 组件销毁了定时器还在空转。mixin 里要清就得每个页面各写一份 beforeDestroy；
 * 组合式函数可以在自己的内部注册 onBeforeUnmount，页面只管用，泄漏问题一次性解决。
 *
 * 注意：必须在 setup 阶段调用本函数，否则钩子挂不上。
 */
export function useTimers() {
    const timeouts = new Set();
    const intervals = new Set();

    /** 延时执行，执行完自动从登记表里摘掉 */
    const later = (fn, ms) => {
        const id = setTimeout(() => {
            timeouts.delete(id);
            fn();
        }, ms);
        timeouts.add(id);
        return id;
    };

    /** 周期执行，需显式 stop；组件卸载时会自动清 */
    const every = (fn, ms) => {
        const id = setInterval(fn, ms);
        intervals.add(id);
        return id;
    };

    const stop = (id) => {
        if (intervals.delete(id)) {
            clearInterval(id);
        } else if (timeouts.delete(id)) {
            clearTimeout(id);
        }
    };

    onBeforeUnmount(() => {
        timeouts.forEach(clearTimeout);
        intervals.forEach(clearInterval);
        timeouts.clear();
        intervals.clear();
    });

    return {later, every, stop};
}
