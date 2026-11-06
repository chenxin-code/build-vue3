<template>
  <div>
    <el-divider>DEMO</el-divider>
    <div class="tab-container">
      <div class="arrow-left" v-if="showArrows" @click="scrollLeft">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="tab-row" ref="tabRow">
        <el-button-group>
          <el-button
              :type="$route.path === '/demo/' + item.path ? 'primary' : ''"
              @click="$router.push({ path: '/demo/' + item.path })"
              :disabled="$route.path === '/demo/' + item.path"
              size="large"
              v-for="(item,index) in demoIndex"
              :key="index">
            {{ item.title }}
          </el-button>
        </el-button-group>
      </div>
      <div class="arrow-right" v-if="showArrows" @click="scrollRight">
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>
    <router-view/>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, onBeforeUnmount} from 'vue';
import {ArrowLeft, ArrowRight} from '@element-plus/icons-vue';
import {shuffle} from 'lodash';

const demoIndex = ref([
  {title: '分组排序', path: 'group-order'},
  {title: '打印/导出PDF', path: 'print-exportPDF'},
  {title: 'Avue-Crud组件', path: 'Avue-Crud'},
  {title: '瀑布流', path: 'waterFall'},
  {title: '百度地图搜索/定位', path: 'baiduMap-search-locate'},
  {title: '大量图表渲染优化', path: 'massChartsRenderOptimize'},
  {title: 'el-select 加载更多', path: 'selectLoadMore'},
  {title: '太阳系', path: 'solarSystem'},
  {title: '同步/异步组件测试', path: 'sync-async-component'},
]);

const showArrows = ref(false);
const tabRow = ref<HTMLElement | null>(null);

const checkOverflow = () => {
  if (!tabRow.value) return;
  showArrows.value = tabRow.value.scrollWidth > tabRow.value.clientWidth;
};

const scrollLeft = () => {
  if (!tabRow.value) return;
  const buttonGroup = tabRow.value.querySelector('.el-button-group');
  if (!buttonGroup) return;
  const buttons = buttonGroup.querySelectorAll('.el-button');
  const currentScroll = tabRow.value.scrollLeft;
  let targetButton: HTMLElement | null = null;

  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i] as HTMLElement;
    if (btn.offsetLeft < currentScroll) {
      targetButton = btn;
    } else {
      break;
    }
  }

  if (targetButton) {
    tabRow.value.scrollTo({left: targetButton.offsetLeft - 20, behavior: 'smooth'});
  } else {
    tabRow.value.scrollTo({left: 0, behavior: 'smooth'});
  }
};

const scrollRight = () => {
  if (!tabRow.value) return;
  const buttonGroup = tabRow.value.querySelector('.el-button-group');
  if (!buttonGroup) return;
  const buttons = buttonGroup.querySelectorAll('.el-button');
  const currentScroll = tabRow.value.scrollLeft;
  const rightEdge = currentScroll + tabRow.value.clientWidth;
  let scrollAmount = tabRow.value.scrollWidth;

  for (const btn of buttons) {
    const btnEl = btn as HTMLElement;
    if (btnEl.offsetLeft + btnEl.offsetWidth > rightEdge) {
      scrollAmount = btnEl.offsetLeft - 20;
      break;
    }
  }

  tabRow.value.scrollTo({
    left: Math.min(scrollAmount, tabRow.value.scrollWidth - tabRow.value.clientWidth),
    behavior: 'smooth'
  });
};

onMounted(() => {
  demoIndex.value = shuffle(demoIndex.value);
  checkOverflow();
  window.addEventListener('resize', checkOverflow);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkOverflow);
});
</script>

<style lang="less" scoped>
.tab-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 10px;
}

.arrow-left,
.arrow-right {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 40px;
  cursor: pointer;
  color: #606266;
  flex-shrink: 0;
  transition: color 0.2s;

  &:hover {
    color: #409eff;
  }
}

.tab-row {
  overflow-x: auto;
  max-width: 80%;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  :deep(.el-button-group) {
    flex-wrap: nowrap;
    display: inline-flex;
  }
}
</style>
