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
const {every, stop} = useTimers();

const mapStyle = computed(() => {
    const rows = maze.basicMap.length;
    const cols = maze.basicMap[0] ? maze.basicMap[0].length : 0;
    return {height: CELL * rows + 'px', width: cols ? CELL * cols + 'px' : 'auto'};
});

/*
 * 每个格子记住"我是从哪一格走过来的"。
 * 它只参与回溯取路径、不参与渲染，所以放普通数组即可，
 * 没必要进 reactive —— 少一层代理就少一份开销。
 */
const prePath = [];

/**
 * 非递归的深度优先：自己维护栈，不用函数调用栈。
 * 同样是生成器，next() 一次只推进一格，方便把探索过程画出来。
 * 走的时候把格子涂成"已探索"，撞到出口后再顺着 prePath 一路退回起点，
 * 沿途涂成"解"——所以这条路径天生就是对的，不需要回溯撤销。
 */
function* getMazePath(x, y) {
    const stack = [{x, y}];

    while (stack.length > 0) {
        const curPos = stack.pop();
        maze.pathVisited[curPos.x][curPos.y] = true;
        maze.basicMap[curPos.x][curPos.y] = 3;
        yield;

        if (curPos.x === maze.exitX && curPos.y === maze.exitY) {
            maze.basicMap[curPos.x][curPos.y] = 2;
            let prePos = prePath[curPos.x][curPos.y];
            while (prePos != null) {
                maze.basicMap[prePos.x][prePos.y] = 2;
                yield;
                prePos = prePath[prePos.x][prePos.y];
            }
            break;
        }

        for (let i = 0; i < 4; i++) {
            const newX = curPos.x + RANGE[i][0];
            const newY = curPos.y + RANGE[i][1];
            if (isRange(newX, newY) && maze.basicMap[newX][newY] === 1 && !maze.pathVisited[newX][newY]) {
                prePath[newX][newY] = {x: curPos.x, y: curPos.y};
                stack.push({x: newX, y: newY});
            }
        }
    }
}

onMounted(() => {
    initMap();

    maze.basicMap.forEach((row, i) => {
        prePath.push(new Array(row.length).fill(null));
    });

    const createStep = createMaze();
    let createTimer = 0;
    createTimer = every(() => {
        if (createStep.next().done) {
            stop(createTimer);
            const answerStep = getMazePath(1, 1);
            let solveTimer = 0;
            solveTimer = every(() => {
                if (answerStep.next().done) {
                    stop(solveTimer);
                }
            }, 30);
        }
    }, 10);
});
</script>
