<template>
  <div style="margin: 30px 0"/>
  <el-tag
      :key="index"
      v-for="(item,index) in groupTag"
      closable
      size="large"
      style="margin-right: 10px;vertical-align: middle;cursor: pointer"
      @click="item.flag = !item.flag;getDataList()"
      @close="groupTag.splice(index, 1);getDataList()">
    <el-icon>
      <CaretBottom v-if="item.flag"/>
      <CaretTop v-else/>
    </el-icon>
    {{ item.label }}
  </el-tag>
  <el-popover
      placement="top-start"
      trigger="click"
      @show="tempGroupTag = JSON.parse(JSON.stringify(groupTag))"
      @hide="groupTag = tempGroupTag">
    <template #reference>
      <el-button :icon="Setting" style="margin-right: 10px">分组管理</el-button>
    </template>
    <el-checkbox
        @change="value => checkboxChange(value, item)"
        v-for="(item,index) in groupSelectOption"
        :model-value="tempGroupTag.some(item2 => { return item2.value === item.value })"
        :label="item.label"
        :key="index"/>
  </el-popover>
  <el-alert
      :description="'升序：' + asc + ' 降序：' + desc"
      type="success"
      :closable="false"
      center
      style="margin-top: 10px;width: 500px"/>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue';
import {Setting} from '@element-plus/icons-vue';

const groupSelectOption = ref([
  {label: '字段a', value: 'a', flag: true},
  {label: '字段b', value: 'b', flag: true},
  {label: '字段c', value: 'c', flag: true},
  {label: '字段d', value: 'd', flag: true},
  {label: '字段e', value: 'e', flag: true},
  {label: '字段f', value: 'f', flag: true},
  {label: '字段g', value: 'g', flag: true},
]);
const groupTag = ref([]);
const tempGroupTag = ref([]);
groupTag.value.push(groupSelectOption.value[0]);//初始化赋值
tempGroupTag.value.push(groupSelectOption.value[0]);//初始化赋值
const checkboxChange = (value, item) => {
  if (value) {
    tempGroupTag.value.push(item);
  } else {
    tempGroupTag.value.forEach((item2, index2) => {
      if (item2.value === item.value) {
        tempGroupTag.value.splice(index2, 1);
      }
    });
  }
};
const asc = ref('');
const desc = ref('');
const getDataList = () => {
  asc.value = '';
  desc.value = '';
  groupTag.value.forEach((item) => {
    if (item.flag) {
      desc.value += item.value + ',';
    } else {
      asc.value += item.value + ',';
    }
  });
  asc.value = asc.value.slice(0, -1);
  desc.value = desc.value.slice(0, -1);
  //console.log('asc:', asc.value, 'desc:', desc.value);
};

watch(
    () => groupTag.value,
    (newValue, oldValue) => {
      //console.log('watch', newValue, oldValue);
      let newValue_ = [];
      newValue && newValue.forEach((item) => {
        newValue_.push(item.value);
      });
      let oldValue_ = [];
      oldValue && oldValue.forEach((item) => {
        oldValue_.push(item.value);
      });
      if (newValue_.length !== oldValue_.length || !newValue_.filter(t => !oldValue_.includes(t))) {
        //console.log('我们不一样');
        getDataList();
      } else {
        //console.log('我们都一样');
      }
    },
    {immediate: true}//初始化立即执行
);
</script>

<style lang="less" scoped>
</style>
