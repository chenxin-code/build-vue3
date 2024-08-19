export default {
    beforeMount(el, binding) {
        console.log('binding', binding);
        const selectDom = document.querySelector(`.${binding.arg} .el-select-dropdown__wrap`);
        const loadMores = () => {
            const isBase = selectDom.scrollHeight - selectDom.scrollTop <= selectDom.clientHeight;
            if (isBase) {
                binding.value && binding.value();
            }
        };
        // 将获取到的dom和函数挂载到el-select上，实例销毁时好处理
        el.selectDomInfo = selectDom;
        el.selectLoadMore = loadMores;
        // 监听滚动事件
        selectDom?.addEventListener('scroll', loadMores.bind(selectDom));
    },
    // 实例销毁
    beforeUnmount(el) {
        if (el.selectLoadMore) {
            el.selectDomInfo.removeEventListener('scroll', el.selectLoadMore);
            delete el.selectDomInfo;
            delete el.selectLoadMore;
        }
    },
};