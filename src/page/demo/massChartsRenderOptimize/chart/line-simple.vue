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
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line'
      }
    ]
  };

  option && myChart.setOption(option);
});
</script>