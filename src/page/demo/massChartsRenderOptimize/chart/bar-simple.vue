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
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar'
      }
    ]
  };

  option && myChart.setOption(option);
});
</script>