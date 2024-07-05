<template>
  <div :id="'main' + props.id"/>
</template>

<script lang="ts" setup>
import {defineProps, onMounted} from 'vue';

import * as echarts from 'echarts';

const props = defineProps(['id']);

onMounted(() => {
  var chartDom = document.getElementById('main' + props.id);
  var myChart = echarts.init(chartDom);
  var option;

  option = {
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        areaStyle: {}
      }
    ]
  };

  option && myChart.setOption(option);
});
</script>