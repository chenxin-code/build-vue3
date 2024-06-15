<template>
  <div class="waterFall-box">
    <div
        v-for="(item, index) in waterList"
        :key="index"
        :style="{
        width: waterWidth + 'px',
				height: item.height + 'px',
				background: getRandomColor(),
        position: 'absolute',
				left: item.left + 'px',
				top: item.top + 'px',
				color: '#fff'
			}">{{ index + 1 }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, reactive, onMounted} from 'vue';

//获取指定整数范围内的随机整数
const getRandomInt = (start, end) => {
  return Math.floor(Math.random() * (end - start) + start);
};

//获取随机颜色
const getRandomColor = () => {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padEnd(6, '0')}`;
};

// 元素数量
const waterNum = 100;
// 元素宽度
const waterWidth = 120;
// 元素上下间距
const waterGap = 1;
// 初始数据数组
const iniData = ref([]);
// 瀑布流数组
const waterList = ref([]);
// 列高度数组
const heightList = reactive([]);
// 屏幕宽度需要在 onMounted 之后拿到
onMounted(() => {
  // 构建初始数据数组
  for (let i = 0; i < waterNum; i++) {
    iniData.value.push({height: getRandomInt(100, 500)});//随机高度
  }
  // 计算列数
  const column = Math.floor(document.body.clientWidth / waterWidth);
  // 核心内容就是维护每个元素的 left、top
  for (let i = 0; i < iniData.value.length; i++) {
    // 先铺上第1行（i < column 则表示是第1行）
    if (i < column) {
      iniData.value[i].top = 0;
      iniData.value[i].left = waterWidth * i;
      // 塞进瀑布流
      waterList.value?.push(iniData.value[i]);
      // 高度数据更新
      heightList[i] = iniData.value[i].height;
    }
    // 后面的就要一张张塞进去，每次找出最低的列往里塞
    else {
      // 最低的高度，先默认为第1列高度
      let current = heightList[0];
      // 最低的列，先默认为第1个
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
      iniData.value[i].left = col * waterWidth;
      iniData.value[i].top = current + waterGap;
      // 塞进瀑布流
      waterList.value.push(iniData.value[i]);
      // 更新列高度数组
      heightList[col] = current + waterGap + iniData.value[i].height;
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
  margin-top: 20px;
}
</style>
