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
const groupTag = ref([groupSelectOption.value[0]]);
const tempGroupTag = ref([groupSelectOption.value[0]]);
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
const getDataList = () => {
  let asc = '';
  let desc = '';
  groupTag.value.forEach((item) => {
    if (item.flag) {
      desc += item.value + ',';
    } else {
      asc += item.value + ',';
    }
  });
  asc = asc.slice(0, -1);
  desc = desc.slice(0, -1);
  console.log('asc:', asc, 'desc:', desc);
};

watch(
    () => groupTag.value,
    (newValue, oldValue) => {
      //console.log('watch', newValue, oldValue);
      let newValue_ = [];
      newValue.forEach((item) => {
        newValue_.push(item.value);
      });
      let oldValue_ = [];
      oldValue.forEach((item) => {
        oldValue_.push(item.value);
      });
      if (newValue_.length !== oldValue_.length || !newValue_.filter(t => !oldValue_.includes(t))) {
        //console.log('我们不一样');
        getDataList();
      } else {
        //console.log('我们都一样');
      }
    }
);
</script>

<style lang="less" scoped>
</style>
