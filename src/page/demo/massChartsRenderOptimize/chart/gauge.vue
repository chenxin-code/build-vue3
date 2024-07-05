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
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
      {
        name: 'Pressure',
        type: 'gauge',
        detail: {
          formatter: '{value}'
        },
        data: [
          {
            value: 50,
            name: 'SCORE'
          }
        ]
      }
    ]
  };

  option && myChart.setOption(option);
});
</script>