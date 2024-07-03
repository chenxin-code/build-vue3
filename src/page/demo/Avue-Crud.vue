<template>
  <avue-crud
      :data="data"
      :option="option"
      @row-save="rowSave"
      @row-update="rowUpdate"
      @row-del="rowDel"
      @refresh-change="refreshChange"
      style="margin-top: 60px">
  </avue-crud>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';

const data = ref([{name: '张三', age: 22}, {name: '李四', age: 26}]);

const option = ref({
  rowKey: 'name',
  addBtn: false,
  addRowBtn: true,
  cellBtn: true,
  column: [{label: '姓名', prop: 'name', cell: true}, {label: '年龄', prop: 'age', cell: true}]
});

const rowSave = (row, done, loading) => {
  console.log('rowSave', row, done, loading);
  done(row);
  ElMessage.success('rowSave成功');
};

const rowUpdate = (row, index, done, loading) => {
  console.log('rowUpdate', row, index, done, loading);
  done(row);
  ElMessage.success('rowUpdate成功');
};

const rowDel = (row, index, done) => {
  console.log('rowDel', row, index, done);
  ElMessageBox.confirm('确定删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    done(row);
    ElMessage.success('rowDel成功');
  }).catch(() => {});
};

const refreshChange = () => {
  ElMessage('刷新');
};
</script>

<style lang="less" scoped>

</style>