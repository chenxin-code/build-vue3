<template>
  <div class="samsara">
    <div class="hud">
      <el-button type="success" plain @click="buyKeys(10, 1)">花费 10 QB 购买 1 把钥匙</el-button>
      <el-button type="success" plain @click="buyKeys(100, 11)">花费 100 QB 购买 11 把钥匙</el-button>
      <div class="info-bar">
        <el-button size="small" type="info" plain @click="openInfo('cost')">每抽钥匙消耗</el-button>
        <el-button size="small" type="info" plain @click="openInfo('odds')">当前中奖概率</el-button>
      </div>
    </div>

    <div class="stage">
      <div class="grid">
        <div
            v-for="(cell, i) in cells"
            :key="cell.id"
            class="cell"
            :style="{ gridRow: cell.row + 1, gridColumn: cell.col + 1 }"
            :class="{
              'is-active': sweepIndex === i,
              'is-win': cell.drawn && lastWonId === cell.id,
              'is-drawn': cell.drawn && lastWonId !== cell.id
            }">
          <div class="cell-inner">
            <!-- 图挂了（404／断网）就整块不占位，只留名字和概率，比留一个裂图图标干净 -->
            <img
                v-if="cell.img && !badPics.has(cell.img)"
                class="pic"
                :src="cell.img"
                :alt="cell.name"
                loading="lazy"
                @error="badPics.add(cell.img)"/>
            <div class="name">{{ cell.name }}</div>
            <div class="meta">
              <!-- 出池后概率恒为 0，这一行直接换成角标，省得绝对定位压住别的内容 -->
              <span v-if="cell.drawn" class="stamp">已抽中</span>
              <span v-else class="odds">{{ oddsText(cell) }}</span>
              <!-- 顶级格开抽前必须从弹框里选一个，抽中后锁死；和概率同行排，避免盖住概率 -->
              <button
                  v-if="cell.selectable && !cell.drawn"
                  class="picker"
                  :disabled="busy"
                  @click="openPick(cell)">
                {{ cell.pickId ? '更换' : '选择' }}
              </button>
            </div>
          </div>
          <div v-if="cell.drawn && lastWonId === cell.id" class="burst"></div>
        </div>

        <div class="core">
          <!-- 抽完之后按钮本身已经写明状态，这行就不再占位重复一遍 -->
          <div v-if="!finished" class="cost">第 <span class="cost-num">{{ drawCount + 1 }}</span> 抽，消耗钥匙 <span class="cost-num">{{ costNow }}</span> 把</div>
          <button class="draw-btn" :disabled="!readyToDraw" @click="draw()">
            {{ busy ? '抽奖中…' : (finished ? '本轮已抽完' : (pickedAll ? '点击抽奖' : '请先自选武器')) }}
          </button>
          <div class="keys">
            <span class="keys-label">剩余钥匙</span>
            <span class="keys-num">{{ keys }}</span>
            <span class="keys-unit">把</span>
          </div>
          <div class="spent">
            <span class="spent-label">已花费</span>
            <span class="spent-num">{{ spentQB }}</span>
            <span class="spent-unit">QB</span>
          </div>
        </div>
      </div>
    </div>

    <!-- lockScroll 关掉：默认的滚动条锁会让 body 宽度在开关时跳一下 -->
    <el-dialog v-model="infoVisible" :title="infoMode === 'cost' ? '每抽钥匙消耗' : '当前中奖概率'" width="min(420px, 92vw)" append-to-body :lock-scroll="false">
      <template v-if="infoMode === 'cost'">
        <p class="info-note">钥匙消耗按斐波那契递增,后一抽等于前两抽之和。</p>
        <table class="info-table">
          <thead>
            <tr><th>抽数</th><th class="num">本抽消耗</th><th class="num">累计</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in costRows" :key="r.draw">
              <td>第 {{ r.draw }} 抽</td>
              <td class="num">{{ r.cost }} 把</td>
              <td class="num">{{ r.total }} 把</td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-else>
        <p class="info-note">概率按当前剩余奖池实时归一,抽中即出池。</p>
        <table class="info-table">
          <thead>
            <tr><th>奖品</th><th class="num">权重</th><th class="num">本抽概率</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in oddsRows" :key="r.id" :class="{'is-drawn': r.drawn}">
              <td>{{ r.name }}</td>
              <td class="num">{{ r.weight }}</td>
              <td class="num">{{ r.odds }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </el-dialog>

    <el-dialog v-model="pickVisible" :title="pickCell?.groupName" width="min(420px, 92vw)" append-to-body :lock-scroll="false">
      <p class="info-note">这一格的中奖概率固定为 {{ pickCell ? oddsText(pickCell) : '' }},选择哪个奖品都不改概率。</p>
      <div class="pick-list">
        <button
            v-for="opt in pickCell?.options"
            :key="opt.id"
            class="pick-item"
            :class="{'is-current': opt.id === pickCell?.pickId}"
            @click="choose(opt)">
          <img
              v-if="!badPics.has(opt.img)"
              class="pic"
              :src="opt.img"
              :alt="opt.name"
              @error="badPics.add(opt.img)"/>
          <span class="pick-name">{{ opt.name }}</span>
        </button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {computed, reactive, ref} from 'vue';
import {ElMessageBox} from 'element-plus';
import {useTimers} from '../../hooks/useTimers';

/*
 * CF轮回式抽奖：外圈 12 格奖池 + 中央 2×2 抽奖区。
 * 规则照抄那类活动的四条硬约束：抽中即从池子里摘掉（不重复）、总次数封顶、
 * 两个王者格各有一组候选且开抽前必须选完、每一抽的钥匙消耗按斐波那契递增（越往后越贵，逼出购买环节）。
 * 奖品名、概率全是我自己编的，配图只是 picsum 占位图，没用任何游戏素材。
 */

// 提示统一走 MessageBox 弹框；按 ESC 关掉会 reject，这里吞掉，顺带让链式提示照常往下走
// lockScroll 关掉，否则弹框给 body 加 overflow:hidden 抽掉滚动条，整页会左右抖一下
const tip = (msg, title) => ElMessageBox.alert(msg, title, {confirmButtonText: '确定', lockScroll: false}).catch(() => {});

const TOTAL = 12;
// 端游「王者的轮回」12 抽的真实消耗档位：后一抽等于前两抽之和，全清共 608 把
const COST_LADDER = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];
const START_KEYS = 0;

// 两个自选格各自一组候选，互不重叠；下标和 RING 末尾两格一一对应。
// 权重挂在组上而不是候选上：这一格的中奖概率是定死的，选择哪个只换名字和图。
const TOP_GROUPS = [
  {
    name: '王者武器',
    weight: 2,
    options: [
      {id: 'C0748', name: '王者之心', img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C0748.png'},
      {id: 'C1446', name: '王者之翼', img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C1446.png'},
      {id: 'C0886', name: '王者之魄', img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C0886.png'},
      {id: 'C5291', name: '王者之势', img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C5291.png'},
      {id: 'C1050', name: '王者之怒', img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C1050.png'},
      {id: 'C9976', name: '王者之决', img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C9976.png'},
    ],
  },
  {
    name: '传说武器',
    weight: 1,
    options: [
      {id: 'C6481', name: '传说灵眸', img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C6481.png'},
      {id: 'W9024', name: '传说圣耀', img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/W9024.png'},
      {id: 'C8506', name: '传说圣灵', img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C8506.png'},
      {id: 'C6480', name: '传说幽瞳', img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C6480.png'},
      {id: 'W9026', name: '传说炽阳', img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/W9026.png'},
      {id: 'C9289', name: '传说暗裔', img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C9289.png'},
    ],
  },
];

// weight 是该档位的相对权重，抽时按剩余奖品重新归一。
// 条数必须等于 RING.length - 2（顶级格另算），少一条 buildCells 就会读到 undefined
const PRIZE_SEED = [
  {id: 'polc19', name: '属性变更券×5', weight: 300, img: 'https://game.gtimg.cn/images/actdaoju/cp/a20261113sylyqmcf/polc19.png'},
  {id: 'polc16', name: '交易专用钥匙×5', weight: 300, img: 'https://game.gtimg.cn/images/actdaoju/cp/a20261113sylyqmcf/polc16.png'},
  {id: 'C0939', name: '毛瑟-天秤座', weight: 30, img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C0939.png'},
  {id: 'C0881', name: 'M240B-苍雷', weight: 30, img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C0881.png'},
  {id: 'C1188', name: '沙鹰-天神', weight: 10, img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C1188.png'},
  {id: 'C0548', name: '屠龙', weight: 8, img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C0548.png'},
  {id: 'C1283', name: 'AN94-超新星', weight: 6, img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C1283.png'},
  {id: 'C2093', name: 'AWM-裁决', weight: 4, img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C2093.png'},
  {id: 'C9482', name: 'Scar Light-白虎', weight: 2, img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C9482.png'},
  {id: 'C3351', name: 'M200-幻神', weight: 1.5, img: 'https://mcdn.gtimg.com/bbcdn/cf/serial/C3351.png'},
];

// 12 个格子按顺时针编号，中央 2×2 留给抽奖区，所以环序不能按行优先排
const RING = [
    [0, 0], [0, 1], [0, 2], [0, 3],
    [1, 3], [2, 3], [3, 3],
    [3, 2], [3, 1], [3, 0],
    [2, 0], [1, 0],
];

const buildCells = () => {
    const list = [];
    for (let i = 0; i < RING.length; i++) {
        const [r, c] = RING[i];
        // 最后两格是自选格：概率一开始就定死，只是还没决定放哪个奖品
        if (i >= RING.length - 2) {
            const group = TOP_GROUPS[i - (RING.length - 2)];
            list.push(reactive({
                id: 'top-slot-' + i, row: r, col: c,
                name: group.name, groupName: group.name,
                weight: group.weight, img: null,
                selectable: true, pickId: null, options: group.options,
                drawn: false,
            }));
        } else {
            const seed = PRIZE_SEED[i];
            list.push(reactive({
                id: seed.id, row: r, col: c,
                name: seed.name, weight: seed.weight, img: seed.img,
                selectable: false, pickId: null, drawn: false,
            }));
        }
    }
    return list;
};

const cells = reactive(buildCells());
const keys = ref(START_KEYS);
// 只统计购买花掉的 QB，抽奖本身扣的是钥匙不再计一次
const spentQB = ref(0);
const busy = ref(false);
const sweepIndex = ref(-1);
const lastWonId = ref('');
// 按 URL 记挂掉的图：格子和选奖品弹框共用同一批地址，一处失败两处都不占位
const badPics = reactive(new Set());

const {later} = useTimers();

const remainCount = computed(() => cells.filter(c => !c.drawn).length);
const finished = computed(() => remainCount.value === 0);
// 已抽出的个数就是本抽的下标，消耗直接由 cells 派生，刷新重开时会自动回到第一档
const drawCount = computed(() => TOTAL - remainCount.value);
const costNow = computed(() => COST_LADDER[drawCount.value]);
const pickedAll = computed(() => cells.every(c => !c.selectable || !!c.pickId));
// 钥匙不足不算「不能点」，只算「点了要提示」，所以不进这里的禁用条件
const readyToDraw = computed(() => pickedAll.value && !busy.value && !finished.value);

/**
 * 顶级格选奖品：把选中项的字段直接写回格子本身，概率不动（权重是格的，不是奖品的）。
 * 这样概率、停格动画、中奖提示都只读 cells 一份数据，不用再做一层视图拷贝。
 */
const applyPick = (cell, optId) => {
    const opt = cell.options.find(o => o.id === optId);
    if (!opt) return;
    cell.pickId = opt.id;
    cell.name = opt.name;
    cell.img = opt.img;
};

const pickVisible = ref(false);
const pickCell = ref(null);
const openPick = cell => {
    pickCell.value = cell;
    pickVisible.value = true;
};

const choose = opt => {
    applyPick(pickCell.value, opt.id);
    pickVisible.value = false;
};

const oddsText = cell => {
    const pool = cells.filter(c => !c.drawn);
    const total = pool.reduce((sum, c) => sum + c.weight, 0);
    if (!total || cell.drawn) return '0%';
    const self = pool.find(c => c.id === cell.id);
    return self ? ((self.weight / total) * 100).toFixed(1) + '%' : '0%';
};

const pickWinner = () => {
    const pool = cells.filter(c => !c.drawn);
    const total = pool.reduce((sum, c) => sum + c.weight, 0);
    let roll = Math.random() * total;
    for (const cell of pool) {
        roll -= cell.weight;
        if (roll <= 0) return cell;
    }
    return pool[pool.length - 1];
};

/**
 * 跑马灯：从上一次停下的格子接着转，随机连转 1～4 圈落到目标格，
 * 前面匀速，最后随机 5～8 步逐级拉开间隔做「减速停格」。
 * 最后一次 tick 落在 step === steps 上，所以 steps 直接取「圈数 × 整圈 + 起点的环距」，
 * 多算一格灯就会停在中奖格的下一格。
 */
const sweepTo = (targetIndex, done) => {
    const laps = 1 + Math.floor(Math.random() * 4);
    const from = sweepIndex.value < 0 ? 0 : sweepIndex.value;
    const dist = (targetIndex - from + RING.length) % RING.length;
    const steps = RING.length * laps + dist;
    // 刹车距离也随机，但兜一道：圈少时别把整趟都变成减速
    const brake = Math.min(5 + Math.floor(Math.random() * 4), steps - 3);
    let step = 0;
    const tick = () => {
        sweepIndex.value = (from + step) % RING.length;
        step++;
        if (step > steps) {
            done();
            return;
        }
        const left = steps - step;
        later(tick, left > brake ? 50 : 50 + (brake - left) * 45);
    };
    tick();
};

const draw = () => {
    if (!readyToDraw.value) return;
    if (keys.value < costNow.value) {
        tip(`钥匙不足，本抽需要 ${costNow.value} 把，还差 ${costNow.value - keys.value} 把`, '钥匙不足');
        return;
    }
    busy.value = true;
    // 上一轮的中奖高亮一开抽就收掉：留着的话转圈期间它会一直是金色，看不出已经出池
    lastWonId.value = '';
    keys.value -= costNow.value;
    const winner = pickWinner();
    sweepTo(cells.indexOf(winner), () => {
        winner.drawn = true;
        lastWonId.value = winner.id;
        // 停格后半秒再弹框，busy 这段时间不落下来，免得连点把中奖框盖掉
        later(() => {
            busy.value = false;
            // MessageBox 是单例，连着两次调用后者会盖掉前者，收尾提示等中奖框关掉再弹
            tip(`抽中「${winner.name}」`, '恭喜中奖').then(() => {
                if (finished.value) tip(`本轮 ${TOTAL} 个奖品已全部抽完，刷新页面重开一轮`, '本轮已抽完');
            });
        }, 500);
    });
};

/** QB 买钥匙：10 QB 一把，100 QB 十一把（多送一把） */
const buyKeys = (qb, count) => {
    keys.value += count;
    spentQB.value += qb;
    tip(`花费 ${qb} QB 购买 ${count} 把钥匙`, '购买成功');
};

/* 两个说明弹窗共用一个 el-dialog，靠 infoMode 切换内容 */
const infoVisible = ref(false);
const infoMode = ref('cost');
const openInfo = mode => { infoMode.value = mode; infoVisible.value = true; };

// 消耗表：第 n 抽、本抽消耗、累计消耗
const costRows = computed(() => {
    let acc = 0;
    return COST_LADDER.map((c, i) => { acc += c; return {draw: i + 1, cost: c, total: acc}; });
});

// 概率表：每个格一行，已抽中的打灰显示 0%
const oddsRows = computed(() => cells.map(c => ({
    id: c.id, name: c.name,
    weight: c.weight, drawn: c.drawn, odds: oddsText(c),
})));
</script>

<style lang="less" scoped>
@cell: 132px;

.samsara {
  max-width: 900px;
  margin: 0 auto;
  color: #e8e2d5;
}

.stage {
  display: flex;
  /* 右侧战绩栏去掉后只剩奖池一块，靠左会留一大片空白 */
  justify-content: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, @cell);
  grid-template-rows: repeat(4, @cell);
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  background: radial-gradient(circle at 50% 40%, #2a2118 0%, #171310 70%);
  border: 1px solid #4a3c28;
}

.cell {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(180deg, #262019, #1a1613);
  border: 1px solid #443724;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease;
}

.cell-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  box-sizing: border-box;
  text-align: center;
}

/* 官方道具图是 675×300 的横图，框按比例放宽并用 contain，整张图才不会被裁掉 */
.pic {
  width: 76px;
  height: 34px;
  object-fit: contain;
  border-radius: 4px;
  background: #241f18;
}

.name {
  font-size: 13px;
  line-height: 1.2;
  color: #efe6d2;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
}

.odds {
  color: #6f6450;
}

.stamp {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.55);
  color: #7d7361;
  border: 1px solid #4a4133;
}

/* 和概率同行排在右侧，不用绝对定位：绝对定位会压住下面那行概率 */
.picker {
  /* 按钮默认按行盒排文字，11px 字号下行盒比字形矮，字会往上偏；行盒给到 12px 再用 flex 居中才上下对称 */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 12px;
  background: #201b15;
  color: #d9cfae;
  border: 1px solid #55472f;
  border-radius: 4px;
  padding: 2px 5px;
  cursor: pointer;

  /* 手机上的命中区：往外圈 8/5px 到约 43.6×33.6，不改盒子尺寸也不影响布局 */
  &::before {
    content: '';
    position: absolute;
    inset: -8px -5px;
  }

  /* 转圈期间锁定：中奖格已经定死，这时候还能换奖品就说不通了 */
  &:disabled {
    cursor: default;
    opacity: 0.45;
  }

  &:not(:disabled):hover {
    border-color: #f2c14e;
    color: #ffd97a;
  }
}

.cell.is-drawn {
  opacity: 0.42;
  filter: grayscale(0.7);
}

.cell.is-active {
  transform: translateY(-2px);
  border-color: #f2c14e;
  box-shadow: 0 0 0 1px #f2c14e, 0 0 18px rgba(242, 193, 78, 0.45);
}

.cell.is-win {
  border-color: #ffd97a;
  box-shadow: 0 0 0 2px #ffd97a, 0 0 26px rgba(255, 217, 122, 0.6);
}

/* 停格闪光：一次性的 conic 光晕，动画结束就靠 display 收掉 */
.burst {
  position: absolute;
  inset: -40%;
  background: conic-gradient(from 0deg, rgba(255, 226, 143, 0) 0deg, rgba(255, 226, 143, 0.55) 30deg, rgba(255, 226, 143, 0) 60deg);
  animation: burst 0.9s ease-out 1 forwards;
  pointer-events: none;
}

@keyframes burst {
  from { opacity: 0.9; transform: rotate(0deg) scale(0.6); }
  to { opacity: 0; transform: rotate(220deg) scale(1.15); }
}

.core {
  grid-area: 2 / 2 / 4 / 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(80, 60, 30, 0.35), rgba(30, 24, 18, 0.6));
  border: 1px dashed #5a4a2e;
}

.hud {
  /* 430 = 两个购买按钮各 210 + 10 间隙；放不下时 auto-fit 自动堆成一列 */
  max-width: 430px;
  margin: 0 auto 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 10px;

  /* 网格已经管了间距，Element 默认的相邻 margin 会让按钮错位 */
  .el-button + .el-button {
    margin-left: 0;
  }
}

/* 说明按钮整行居中，保持彼此 10px 的间距，不跟着上面两列被拉开 */
.info-bar {
  /* 1 / -1 而不是 span 2：堆成单列时 span 2 会多撑出一条隐式列 */
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.keys,
.spent {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

/* 两行都只高亮数字，字号对齐 */
.keys-num,
.spent-num {
  font-weight: 700;
  color: #ffd97a;
  line-height: 1;
}

.keys-label,
.spent-label,
.keys-unit,
.spent-unit {
  font-size: 12px;
  color: #9c8f74;
}

.cost {
  font-size: 12px;
  color: #8b8069;

  .cost-num {
    font-weight: 700;
    color: #ffd97a;
  }
}

.draw-btn {
  /* 撑满中央区但封顶 210：写死 min-width 会把 .core 所在的两条轨道顶宽，窄屏整张轮盘就溢出。
     减 24 是留左右各 12 的边距，不然手机上按钮会顶满整个中央区；
     别写成 min(100% - 24px, 210px)：Less 会把 min() 当自己的函数先算成 76% */
  width: calc(100% - 24px);
  max-width: 210px;
  height: 44px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #fff4e0;
  cursor: pointer;
  background: linear-gradient(180deg, #e0463d, #a3231d);
  box-shadow: 0 3px 0 #7d1a15, 0 0 16px rgba(224, 70, 61, 0.35);
  transition: transform 0.08s ease, box-shadow 0.08s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 0 #7d1a15, 0 0 22px rgba(224, 70, 61, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(2px);
    box-shadow: 0 1px 0 #7d1a15;
  }

  &:disabled {
    cursor: not-allowed;
    filter: grayscale(0.6) brightness(0.7);
  }
}

.info-note {
  font-size: 12px;
  color: #8b8069;
  margin: 0 0 10px;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th, td {
    padding: 6px 8px;
    border-bottom: 1px solid #eee;
  }
  th {
    color: #8b8069;
    font-weight: 500;
  }
  td.num, th.num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  tr.is-drawn td {
    color: #9c8f74;
    text-decoration: line-through;
  }
}

.pick-list {
  display: grid;
  /* 110 = 96 图 + 12 内边距 + 2 边框；420 宽放三列，手机 92vw 放不下就自动变两列 */
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
}

.pick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  border-radius: 8px;
  border: 1px solid #e5e0d2;
  background: #fff;
  cursor: pointer;

  .pic {
    width: 96px;
    height: 43px;
  }

  &:hover {
    border-color: #f2c14e;
  }

  &.is-current {
    border-color: #e0463d;
    background: #fff8f0;
  }
}

.pick-name {
  font-size: 13px;
  color: #3a3226;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    /* 360 视口下 Scar Light-白虎 这类长名字会换成两行：行高按最高的一行走，既不切字也不会参差不齐 */
    grid-template-rows: repeat(4, minmax(92px, 1fr));
  }

  /* 92px 的行高放不下 34 图 + 名称 + 概率/选择按钮同行，高度缩到 28 才不挤掉最后一行，宽度跟着原图比例走 */
  .cell .pic {
    width: 63px;
    height: 28px;
  }
}
</style>
