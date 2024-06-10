<template>
  <div class="waterFall-box">
    <div
        v-for="(item, index) in waterList"
        :key="index"
        :style="{
        width: width + 'px',
				height: item.height + 'px',
				background: item.background,
        position: 'absolute',
				left: item.left + 'px',
				top: item.top + 'px'
			}"/>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';

const data = ref([
  {
    height: 300,
    background: 'red',
  },
  {
    height: 400,
    background: 'pink',
  },
  {
    height: 500,
    background: 'blue',
  },
  {
    height: 200,
    background: 'green',
  },
  {
    height: 300,
    background: 'gray',
  },
  {
    height: 400,
    background: '#CC00FF',
  },
  {
    height: 200,
    background: 'pink',
  },
  {
    height: 100,
    background: '#996666',
  },
  {
    height: 300,
    background: 'gray',
  },
  {
    height: 400,
    background: '#CC00FF',
  },
  {
    height: 200,
    background: 'gray',
  },
  {
    height: 100,
    background: '#996666',
  },
  {
    height: 300,
    background: 'gray',
  },
  {
    height: 400,
    background: '#CC00FF',
  },
  {
    height: 200,
    background: 'gray',
  },
  {
    height: 100,
    background: '#996666',
  },
  {
    height: 300,
    background: 'gray',
  },
  {
    height: 400,
    background: '#CC00FF',
  }
]);
// 元素宽度
const width = 120;
// 元素上下间距
const gap = 1;
// 瀑布流数组
const waterList = ref([]);
// 列高度数组
const heightList = reactive([]);
// 屏幕宽度需要在 onMounted 之后拿到
onMounted(() => {
  // 计算列数
  const column = Math.floor(document.body.clientWidth / width);
  // 核心内容就是维护每个元素的 left、top
  for (let i = 0; i < data.value.length; i++) {
    // 先铺上第一行（i < column 则表示是第一行）
    if (i < column) {
      data.value[i].top = 0;
      data.value[i].left = width * i;
      // 塞进瀑布流
      waterList.value?.push(data.value[i]);
      // 高度数据更新
      heightList[i] = data.value[i].height;
    }
    // 后面的就要一张张塞进去，每次找出最低的列往里塞
    else {
      // 最低的高度，先默认为第一列高度
      let current = heightList[0];
      // 最低的列，先默认为第一个
      let col = 0;
      // 循环每一列进行比较
      heightList.forEach((h, i) => {
        if (h < current) {
          current = h;
          col = i;
        }
      });
      console.log('最低的列', col, '高度为', current);
      // 由此计算出该元素的 left、top
      data.value[i].left = col * width;
      data.value[i].top = current + gap;
      // 塞进瀑布流
      waterList.value.push(data.value[i]);
      // 更新列高度数组
      heightList[col] = current + gap + data.value[i].height;
    }
  }
  console.log('waterList', waterList.value);
  console.log('heightList', heightList);
});
</script>

<style lang="less" scoped>
.waterFall-box {
  position: relative;
  height: 100vh;
  overflow-y: auto;
  width: 100%;
}
</style>
