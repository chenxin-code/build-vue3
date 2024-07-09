<template>
  <div :id="props.id"/>
</template>

<script lang="ts" setup>
import {defineProps, onMounted} from 'vue';
import _ from 'lodash';
import * as echarts from 'echarts';

const props = defineProps(['id']);

onMounted(() => {
  echarts.init(document.getElementById(props.id)).setOption({
    xAxis: {},
    yAxis: {},
    series: [
      {
        symbolSize: 3,
        data: [
          [_.random(0, 15, true), _.random(0, 10, true)],
          [_.random(0, 15, true), _.random(0, 10, true)],
          [_.random(0, 15, true), _.random(0, 10, true)],
          [_.random(0, 15, true), _.random(0, 10, true)],
          [_.random(0, 15, true), _.random(0, 10, true)],
          [_.random(0, 15, true), _.random(0, 10, true)],
          [_.random(0, 15, true), _.random(0, 10, true)],
          [_.random(0, 15, true), _.random(0, 10, true)]
        ],
        type: 'scatter'
      }
    ]
  });
});
</script>