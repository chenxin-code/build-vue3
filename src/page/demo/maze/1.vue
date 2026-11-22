<template>
  <div id="map" :style="mapStyle">
    <div class="line" v-for="(row, i) in maze.basicMap" :key="i">
      <div :class="[CLASS_NAME[cell]]" v-for="(cell, j) in row" :key="j"></div>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted} from 'vue';
import {CELL, CLASS_NAME, RANGE, useMaze} from '../../../hooks/useMaze';
import {useTimers} from '../../../hooks/useTimers';

const {maze, initMap, isRange, createMaze} = useMaze();
const {later, every, stop} = useTimers();

const mapStyle = computed(() => {
    const rows = maze.basicMap.length;
    const cols = maze.basicMap[0] ? maze.basicMap[0].length : 0;
    return {height: CELL * rows + 'px', width: cols ? CELL * cols + 'px' : 'auto'};
});

// 递归解法是同步跑完的，格子状态当场就定了；
// 动画靠给每一格递增延时来"回放"探索顺序，answerStep 就是第几帧。
let answerStep = 0;

/** 把某个格子标成 t（1 路 / 2 解），延后 answerStep 帧再画出来 */
const timeOutRender = (x, y, t) => {
    later(() => {
        maze.basicMap[x][y] = t;
    }, answerStep++ * 30);
};

/**
 * 深度优先 + 回溯求出口。
 * 先把自己标记为已探索并涂成"解"的颜色，再按 上右下左 依次试；
 * 四条道都走不通说明这是个死胡同，退回来涂回路，返回 false 让上一层继续试。
 */
const getMazePath = (x, y) => {
    if (!isRange(x, y)) {
        return false;
    }

    maze.pathVisited[x][y] = true;
    timeOutRender(x, y, 2);

    if (x === maze.exitX && y === maze.exitY) {
        return true;
    }

    for (let i = 0; i < 4; i++) {
        const newX = x + RANGE[i][0];
        const newY = y + RANGE[i][1];
        // 是路、没走过，才值得钻进去
        if (isRange(newX, newY) && maze.basicMap[newX][newY] === 1 && !maze.pathVisited[newX][newY]) {
            if (getMazePath(newX, newY)) {
                return true;
            }
        }
    }

    // 回溯：这个点不在真正的路径上，还原成路
    timeOutRender(x, y, 1);
    return false;
};

onMounted(() => {
    initMap();

    const createStep = createMaze();
    let createTimer = 0;
    createTimer = every(() => {
        // 每次 next() 只挖开一格，让生成过程可见
        if (createStep.next().done) {
            stop(createTimer);
            getMazePath(1, 1);
        }
    }, 10);
});
</script>
