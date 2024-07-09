<template>
  <div class="container">
    <div v-for="n in chartNum" :key="'line-simple' + n">
      <line-simple :id="'line-simple' + n" v-if="!isOptimize || useDefer(n)" style="height: 100%"/>
    </div>
  </div>
  <div class="container">
    <div v-for="n in chartNum" :key="'bar-simple' + n">
      <bar-simple :id="'bar-simple' + n" v-if="!isOptimize || useDefer(n + chartNum)" style="height: 100%"/>
    </div>
  </div>
  <div class="container">
    <div v-for="n in chartNum" :key="'area-basic' + n">
      <area-basic :id="'area-basic' + n" v-if="!isOptimize || useDefer(n + chartNum + chartNum)" style="height: 100%"/>
    </div>
  </div>
  <div class="container">
    <div v-for="n in chartNum" :key="'candlestick-simple' + n">
      <candlestick-simple :id="'candlestick-simple' + n" v-if="!isOptimize || useDefer(n + chartNum + chartNum + chartNum)" style="height: 100%"/>
    </div>
  </div>
  <div class="container">
    <div v-for="n in chartNum" :key="'scatter-simple' + n">
      <scatter-simple :id="'scatter-simple' + n" v-if="!isOptimize || useDefer(n + chartNum + chartNum + chartNum + chartNum)" style="height: 100%"/>
    </div>
  </div>
  <div class="container">
    <div v-for="n in chartNum" :key="'gauge' + n">
      <gauge :id="'gauge' + n" v-if="!isOptimize || useDefer(n + chartNum + chartNum + chartNum + chartNum + chartNum)" style="height: 100%"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import lineSimple from './chart/line-simple.vue';
import barSimple from './chart/bar-simple.vue';
import areaBasic from './chart/area-basic.vue';
import candlestickSimple from './chart/candlestick-simple.vue';
import scatterSimple from './chart/scatter-simple.vue';
import gauge from './chart/gauge.vue';
import {defer} from './../../../toolFunc.ts';

const chartNumLevel = 20;//图表数量级
const chartNum = 41 * chartNumLevel;// 41=20+1+20 与样式相关
//是否优化
const isOptimize = true;
//白屏优化
const useDefer = (() => defer(chartNum * 6))();//6种图表
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(20, 2%) 20% repeat(20, 2%);
}
</style>