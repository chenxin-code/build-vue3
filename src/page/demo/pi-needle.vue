<template>
  <div class="needle-page">
    <div class="stage-wrap">
      <canvas ref="stageRef" class="stage"></canvas>
      <div class="legend">
        <span class="dot dot-hit"></span>相交
        <span class="dot dot-miss"></span>不相交
      </div>
    </div>

    <div class="side">
      <div class="card">
        <p class="card-title">实验原理</p>
        <p class="formula">P = 2L / (π·t)</p>
        <p class="formula formula-strong">π = 2L / (P·t)</p>
        <p class="card-note">
          针与平行线相交的判定：针中心到最近一条线的距离 d ≤ (L/2)·sinθ。
          把 d 和 θ 都取均匀分布做积分，相交概率就只剩 L、t 和 π，反解即得 π。
        </p>
      </div>

      <div class="card">
        <p class="card-title">参数</p>
        <div class="field">
          <span class="label">针长 L</span>
          <el-slider v-model="needleLen" :min="20" :max="lineGap" :step="2" @change="reset"/>
          <span class="value">{{ needleLen }} px</span>
        </div>
        <div class="field">
          <span class="label">线距 t</span>
          <el-slider v-model="lineGap" :min="40" :max="120" :step="4" @change="reset"/>
          <span class="value">{{ lineGap }} px</span>
        </div>
        <p class="card-note">公式仅在 L ≤ t 时成立，所以针长上限跟着线距走；调参会重开一轮实验。</p>
      </div>

      <div class="card">
        <p class="card-title">结果</p>
        <div class="stat-row">
          <span class="label">投针总数 n</span>
          <span class="num">{{ throws.toLocaleString('en-US') }}</span>
        </div>
        <div class="stat-row">
          <span class="label">相交数 m</span>
          <span class="num">{{ hits.toLocaleString('en-US') }}</span>
        </div>
        <div class="stat-row">
          <span class="label">相交频率 P</span>
          <span class="num">{{ probText }}</span>
        </div>
        <div class="stat-row">
          <span class="label">π 估算值</span>
          <span class="num num-pi">{{ piText }}</span>
        </div>
        <div class="stat-row">
          <span class="label">相对误差</span>
          <span class="num">{{ errText }}</span>
        </div>
      </div>

      <div class="card">
        <p class="card-title">收敛过程</p>
        <canvas ref="chartRef" class="chart"></canvas>
        <p class="card-note">横轴为投针数的对数刻度，虚线是 π 真值。样本越多，估算值越贴近虚线。</p>
      </div>

      <div class="actions">
        <el-button type="primary" @click="toggle">{{ running ? '暂停' : '开始' }}</el-button>
        <el-button @click="batch(1000)">投 1000 根</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, onBeforeUnmount, ref, computed, watch} from 'vue';

const stageRef = ref(null);
const chartRef = ref(null);

const needleLen = ref(60);
const lineGap = ref(80);
const running = ref(false);

const throws = ref(0);
const hits = ref(0);

const PI_REAL = Math.PI;
const NEEDLES_PER_FRAME = 15;
// 画布只保留最近这么多根针。统计要跑够样本量才收敛，但全画上去
// 几十秒就糊成一片，所以画面是"正在下的针雨"，数字才是长期累计。
const MAX_DRAWN = 700;
// 统计面板与曲线每 100ms 刷新一次即可，逐帧写响应式变量纯属浪费
const SYNC_INTERVAL = 100;

let stageCtx = null;
let chartCtx = null;
let stageW = 0;
let stageH = 0;
// 只有整数个周期带才参与采样，否则末尾残缺的那一段会让 d 的分布偏掉
let bandTop = 0;
let bandH = 0;
let frameId = 0;
let lastSync = 0;
let dirty = true;

let total = 0;
let hit = 0;
// 待渲染的针，先进先出。dx/dy 在投的时候就算好，省掉每帧重复求三角函数
let recent = [];
// 每 1.5 倍投针数取一个样点，对数横轴上刚好铺成一条能看出趋势的折线
let samples = [];
let nextSampleAt = 20;

// 统计一律从响应式的 throws/hits 派生，直接读 total/hit 这两个普通变量
// 的话 computed 收集不到依赖，面板就永远停在初始值
const piValue = computed(() => (hits.value === 0 ? null : (2 * needleLen.value * throws.value) / (hits.value * lineGap.value)));
const probText = computed(() => (throws.value === 0 ? '—' : (hits.value / throws.value).toFixed(4)));
const piText = computed(() => (piValue.value === null ? '—' : piValue.value.toFixed(5)));
const errText = computed(() =>
    piValue.value === null ? '—' : (Math.abs(piValue.value - PI_REAL) / PI_REAL * 100).toFixed(2) + '%'
);

/** 铺底色并画出间距为 t 的平行线 */
const drawFloor = () => {
    if (!stageCtx) return;
    stageCtx.fillStyle = '#f4f8fd';
    stageCtx.fillRect(0, 0, stageW, stageH);

    stageCtx.strokeStyle = '#9db6d0';
    stageCtx.lineWidth = 1;
    const lines = Math.round(bandH / lineGap.value);
    for (let k = 0; k <= lines; k++) {
        const y = bandTop + k * lineGap.value;
        stageCtx.beginPath();
        stageCtx.moveTo(0, y);
        stageCtx.lineTo(stageW, y);
        stageCtx.stroke();
    }
};

/**
 * 投 count 根针。每根针只需两个随机数：
 * 中心落在带内的纵向位置（横向均匀不影响结果）、以及针的朝向 θ。
 * 朝向取 [0, π) 就够了 —— 转 180° 还是同一根针。
 */
const throwBatch = (count) => {
    const t = lineGap.value;
    const half = needleLen.value / 2;

    for (let i = 0; i < count; i++) {
        const cx = Math.random() * stageW;
        const localY = Math.random() * bandH;
        const theta = Math.random() * Math.PI;

        // 到最近一条线的距离：先取模落进一个周期，再取两端较近的那条
        const r = localY % t;
        const d = Math.min(r, t - r);
        const isHit = d <= half * Math.sin(theta);

        recent.push({
            cx,
            cy: bandTop + localY,
            dx: half * Math.cos(theta),
            dy: half * Math.sin(theta),
            isHit,
        });
        if (recent.length > MAX_DRAWN) recent.splice(0, recent.length - MAX_DRAWN);

        total++;
        if (isHit) hit++;
    }
    dirty = true;
};

/** 重画整幅画面：底图 + 最近这批针，越新的越实、越旧的越淡 */
const render = () => {
    if (!stageCtx) return;
    drawFloor();

    const n = recent.length;
    stageCtx.lineWidth = 1.6;
    stageCtx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
        const s = recent[i];
        stageCtx.globalAlpha = 0.12 + 0.88 * (i / n);
        stageCtx.strokeStyle = s.isHit ? '#d9503b' : '#7d9dbd';
        stageCtx.beginPath();
        stageCtx.moveTo(s.cx - s.dx, s.cy - s.dy);
        stageCtx.lineTo(s.cx + s.dx, s.cy + s.dy);
        stageCtx.stroke();
    }
    stageCtx.globalAlpha = 1;
};

/** 折线图：对数横轴上的 π 估算值 vs 真值 */
const drawChart = () => {
    if (!chartCtx) return;
    const w = chartRef.value.clientWidth;
    const h = chartRef.value.clientHeight;
    chartCtx.clearRect(0, 0, w, h);

    chartCtx.fillStyle = '#fbfdff';
    chartCtx.fillRect(0, 0, w, h);

    const yMin = 2.4;
    const yMax = 3.9;
    const xMinLog = 1;                    // 从 n = 10 起画
    const xMaxLog = Math.max(3, Math.log10(Math.max(total, 10)));
    const pad = {l: 34, r: 8, t: 8, b: 18};
    const plotW = w - pad.l - pad.r;
    const plotH = h - pad.t - pad.b;

    const toX = (n) => pad.l + (Math.log10(Math.max(n, 10)) - xMinLog) / (xMaxLog - xMinLog) * plotW;
    const toY = (pi) => pad.t + (yMax - Math.min(Math.max(pi, yMin), yMax)) / (yMax - yMin) * plotH;

    // π 真值参考线
    const yTrue = toY(PI_REAL);
    chartCtx.setLineDash([4, 3]);
    chartCtx.strokeStyle = '#5b8f63';
    chartCtx.lineWidth = 1;
    chartCtx.beginPath();
    chartCtx.moveTo(pad.l, yTrue);
    chartCtx.lineTo(w - pad.r, yTrue);
    chartCtx.stroke();
    chartCtx.setLineDash([]);

    chartCtx.fillStyle = '#7b8b9c';
    chartCtx.font = '11px system-ui, sans-serif';
    chartCtx.fillText('π', 6, yTrue + 4);
    chartCtx.fillText('3.9', 6, pad.t + 9);
    chartCtx.fillText('2.4', 6, h - pad.b - 1);
    chartCtx.fillText('10', pad.l - 4, h - 5);
    chartCtx.fillText(String(Math.round(Math.pow(10, xMaxLog))), w - pad.r - 26, h - 5);

    if (samples.length < 2) return;
    chartCtx.strokeStyle = '#3f7fd0';
    chartCtx.lineWidth = 1.6;
    chartCtx.beginPath();
    samples.forEach((s, i) => {
        const x = toX(s.n);
        const y = toY(s.pi);
        if (i === 0) chartCtx.moveTo(x, y);
        else chartCtx.lineTo(x, y);
    });
    chartCtx.stroke();

    chartCtx.fillStyle = '#3f7fd0';
    for (const s of samples) {
        chartCtx.beginPath();
        chartCtx.arc(toX(s.n), toY(s.pi), 1.8, 0, Math.PI * 2);
        chartCtx.fill();
    }
};

const syncStats = () => {
    throws.value = total;
    hits.value = hit;
};

/** 投针数每跨过一个 1.5 倍里程碑就记一个样点 */
const takeSample = () => {
    if (total < nextSampleAt) return;
    while (total >= nextSampleAt) nextSampleAt = Math.ceil(nextSampleAt * 1.5);
    if (hit > 0) samples.push({n: total, pi: (2 * needleLen.value * total) / (hit * lineGap.value)});
    dirty = true;
};

const loop = () => {
    frameId = requestAnimationFrame(loop);
    if (running.value) throwBatch(NEEDLES_PER_FRAME);
    takeSample();
    if (!dirty) return;
    dirty = false;
    render();

    const now = performance.now();
    if (now - lastSync < SYNC_INTERVAL) return;
    lastSync = now;
    syncStats();
    drawChart();
};

/** canvas 的像素尺寸跟 CSS 尺寸、devicePixelRatio 对齐，否则线条发虚 */
const sizeCanvas = (canvas, ctx) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return {w, h};
};

const layout = () => {
    const stage = stageRef.value;
    const chart = chartRef.value;
    if (!stage || !chart) return;

    const rect = sizeCanvas(stage, stageCtx);
    stageW = rect.w;
    stageH = rect.h;
    // 取整数个线间距，剩下的零头上下对半分，采样带居中
    const periods = Math.max(Math.floor(stageH / lineGap.value), 1);
    bandH = periods * lineGap.value;
    bandTop = (stageH - bandH) / 2;

    sizeCanvas(chart, chartCtx);
    render();
    dirty = true;
};

const reset = () => {
    total = 0;
    hit = 0;
    recent.length = 0;
    samples = [];
    nextSampleAt = 20;
    syncStats();
    render();
    drawChart();
};

// 投完只置脏标记，画面和数字交给主循环去刷，避免两套渲染路径
const batch = (count) => {
    throwBatch(count);
};

const toggle = () => {
    running.value = !running.value;
};

let observer = null;

// 线距一变，采样带的位置和高度都要重算；同时把针长压回不超过线距
watch(lineGap, () => {
    if (needleLen.value > lineGap.value) needleLen.value = lineGap.value;
    layout();
});

onMounted(() => {
    stageCtx = stageRef.value.getContext('2d');
    chartCtx = chartRef.value.getContext('2d');
    layout();
    drawChart();

    observer = new ResizeObserver(layout);
    observer.observe(stageRef.value.parentElement);

    lastSync = performance.now();
    loop();
});

onBeforeUnmount(() => {
    cancelAnimationFrame(frameId);
    observer?.disconnect();
});
</script>

<style lang="less" scoped>
.needle-page {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

.stage-wrap {
  position: relative;
  /* 不能用 flex: 1 —— 简写会把 flex-basis 设为 0，
     窄屏切成竖排后 0 作用在纵轴上，560px 的高度就被吃掉了 */
  flex: 1 1 auto;
  min-width: 0;
  height: 560px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(160, 190, 220, 0.5);
}

.stage {
  display: block;
  width: 100%;
  height: 100%;
}

.legend {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(160, 190, 220, 0.5);
  font-size: 12px;
  color: #3a4a5c;
  user-select: none;

  .dot {
    width: 12px;
    height: 3px;
    border-radius: 2px;
    margin-left: 6px;

    &:first-child {
      margin-left: 0;
    }
  }

  .dot-hit {
    background: #d9503b;
  }

  .dot-miss {
    background: #7d9dbd;
  }
}

.side {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  padding: 14px 16px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(160, 190, 220, 0.5);
}

.card-title {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #2b3f57;
}

.card-note {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: #7b8b9c;
}

.formula {
  margin-bottom: 6px;
  font-family: 'Cambria Math', Georgia, serif;
  font-size: 15px;
  color: #5a6b7f;
}

.formula-strong {
  font-size: 17px;
  font-weight: 600;
  color: #3f7fd0;
}

.field,
.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 13px;

  .label {
    flex-shrink: 0;
    color: #5a6b7f;
  }
}

.field {
  .label {
    width: 46px;
  }

  :deep(.el-slider) {
    flex: 1;
  }

  .value {
    width: 52px;
    text-align: right;
    color: #33506e;
    font-variant-numeric: tabular-nums;
  }
}

.stat-row {
  justify-content: space-between;

  .num {
    color: #33506e;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .num-pi {
    color: #d9503b;
    font-size: 16px;
  }
}

.chart {
  display: block;
  width: 100%;
  height: 120px;
}

.actions {
  display: flex;
  gap: 10px;

  :deep(.el-button) {
    flex: 1;
    margin-left: 0;
  }
}

@media (max-width: 900px) {
  .needle-page {
    flex-direction: column;
  }

  .side {
    width: 100%;
  }
}
</style>
