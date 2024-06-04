import {ref, onUnmounted} from 'vue';

// requestAnimationFrame 请求动画帧 （白屏优化）
export function defer(maxFrameCount = 999) {
    const frameCount = ref(0);
    let rafId: number;
    const addFrameCount = () => {
        frameCount.value++;
        //只要没到最大帧数就一直调用
        if (frameCount.value < maxFrameCount) {
            rafId = requestAnimationFrame(addFrameCount);
        }
    };
    addFrameCount();
    onUnmounted(() => {
        cancelAnimationFrame(rafId);
    });
    return function (n: number) {
        //console.log(frameCount.value >= n, frameCount.value, n);
        return frameCount.value >= n;//判断当前渲染帧数是否大于自定义n
    };
}