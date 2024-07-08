<template>
  <div :id="props.id"/>
</template>

<script lang="ts" setup>
import {defineProps, onMounted} from 'vue';
import * as echarts from 'echarts';

const props = defineProps(['id']);

onMounted(() => {
  echarts.init(document.getElementById(props.id)).setOption({
    series: {
      type: 'sunburst',
      // emphasis: {
      //     focus: 'ancestor'
      // },
      data: [
        {
          name: 'Grandpa',
          children: [
            {
              name: 'Uncle Leo',
              value: 15,
              children: [
                {
                  name: 'Cousin Jack',
                  value: 2
                },
                {
                  name: 'Cousin Mary',
                  value: 5,
                  children: [
                    {
                      name: 'Jackson',
                      value: 2
                    }
                  ]
                },
                {
                  name: 'Cousin Ben',
                  value: 4
                }
              ]
            },
            {
              name: 'Father',
              value: 10,
              children: [
                {
                  name: 'Me',
                  value: 5
                },
                {
                  name: 'Brother Peter',
                  value: 1
                }
              ]
            }
          ]
        },
        {
          name: 'Nancy',
          children: [
            {
              name: 'Uncle Nike',
              children: [
                {
                  name: 'Cousin Betty',
                  value: 1
                },
                {
                  name: 'Cousin Jenny',
                  value: 2
                }
              ]
            }
          ]
        }
      ],
      radius: [0, '90%'],
      label: {
        rotate: 'radial'
      }
    }
  });
});
</script>