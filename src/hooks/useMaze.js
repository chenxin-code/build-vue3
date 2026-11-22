import {reactive} from 'vue';

/*
 * 迷宫通用逻辑，对应 build-vue2 的 src/mixins/maze-common.js。
 * 算法参考 https://blog.csdn.net/weixin_43840202/article/details/117398825
 *
 * mixin 换成组合式函数，有两处不是"改个写法"而是真的变了：
 * 1. 全程不再需要 $forceUpdate()。mixin 里每个改格子的地方都跟着一次强制刷新，
 *    那是 Vue 2 侦测不到数组下标赋值才打的补丁；Vue 3 的 reactive 是深层代理，
 *    basicMap[x][y] = 1 这种写法本身就被追踪着。
 * 2. 两个页面原本在各自 mounted 里重复一遍"建地基 + 定进出口"，现在收进 initMap，
 *    mixin 只能共享方法、共享不了这段一次性流程。
 */

// 格子边长，地图尺寸和滚动容器都按它算
export const CELL = 30;

// 上、右、下、左四个方向的偏移量
export const RANGE = [[-1, 0], [0, 1], [1, 0], [0, -1]];

// 格子状态到 class 名的映射：0 墙、1 路、2 解、3 已探索
export const CLASS_NAME = ['wall', 'road', 'path', 'visited'];

export function useMaze() {
    const maze = reactive({
        basicMap: [],
        visited: [],      // 生成迷宫时访问过
        pathVisited: [],  // 求解时访问过
        exitX: 0,
        exitY: 0,
    });

    /**
     * 生成地基：奇数行且奇数列的格子才留成路，其余全是墙，
     * 于是每条路四周天然被墙包着，后面挖通才有意义。
     */
    const createBasis = (x, y) => {
        for (let i = 0; i < x; i++) {
            const line = new Array(y).fill(0);
            maze.visited.push(new Array(y).fill(false));
            maze.pathVisited.push(new Array(y).fill(false));
            if (i % 2 === 1) {
                for (let j = 0; j < line.length; j++) {
                    if (j % 2 === 1) {
                        line[j] = 1;
                    }
                }
            }
            maze.basicMap.push(line);
        }
    };

    /** 建地基并把入口定在 (1,1)、出口定在右下角 */
    const initMap = (size = 29) => {
        createBasis(size, size);
        maze.basicMap[1][1] = 1;
        maze.exitX = maze.basicMap[0].length - 2;
        maze.exitY = maze.basicMap.length - 2;
        maze.basicMap[maze.exitX][maze.exitY] = 1;
    };

    /** 是否落在地图内部（不含最外圈，保证任何格子都留有墙） */
    const isRange = (x, y) =>
        x > 0 && x < maze.basicMap.length - 1 && y > 0 && y < maze.basicMap[0].length - 1;

    /**
     * 生成迷宫。用生成器写是为了让调用方每次 next() 只挖一格，
     * 从而把挖墙的过程做成动画；同步函数就只能一次性算完。
     * 出队方向随机在"取队首/取队尾"之间切换，等于在广度优先和深度优先之间摇摆，
     * 所以每次生成的迷宫形状都不一样。
     */
    function* createMaze() {
        const stack = [{x: 1, y: 1}];
        maze.visited[1][1] = true;

        while (stack.length > 0) {
            const curPos = Math.random() > 0.5 ? stack.shift() : stack.pop();

            for (let i = 0; i < 4; i++) {
                // 一次跨两格，中间那格是墙，挖开它两格才连通
                const newX = curPos.x + RANGE[i][0] * 2;
                const newY = curPos.y + RANGE[i][1] * 2;

                if (isRange(newX, newY) && !maze.visited[newX][newY]) {
                    yield;
                    maze.basicMap[(newX + curPos.x) / 2][(newY + curPos.y) / 2] = 1;
                    if (Math.random() > 0.5) {
                        stack.push({x: newX, y: newY});
                    } else {
                        stack.unshift({x: newX, y: newY});
                    }
                    maze.visited[newX][newY] = true;
                }
            }
        }
    }

    return {maze, initMap, isRange, createMaze};
}
