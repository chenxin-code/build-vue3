<template>
  <avue-crud
      :data="data"
      :option="option"
      @row-save="rowSave"
      @row-update="rowUpdate"
      @row-del="rowDel"
      @refresh-change="refreshChange">
  </avue-crud>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';

const data = ref([{name: '张三', age: 22}, {name: '李四', age: 26}]);

const option = ref({
  addBtn: false,
  addRowBtn: true,
  cellBtn: true,
  column: [{label: '姓名', prop: 'name', cell: true}, {label: '年龄', prop: 'age', cell: true}]
});

const rowSave = (row, done, loading) => {
  ElMessage.success('新增数据' + JSON.stringify(row));
  done(row);
};

const rowUpdate = (row, index, done, loading) => {
  ElMessage.success('模拟网络请求');
  setTimeout(() => {
    ElMessage.success('关闭按钮等待');
    loading();
  }, 1000);
  setTimeout(() => {
    ElMessage.success('编辑数据' + JSON.stringify(row) + '数据序号' + index);
    done(row);
  }, 2000);
};

const rowDel = (row, index, done) => {
  ElMessageBox.confirm('此操作将永久删除该文件, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    done(row);
    ElMessage({
      type: 'success',
      message: '删除成功!'
    });
  }).catch(() => {
  });
};

const refreshChange = () => {
  ElMessage.success('刷新回调');
};
</script>

<style lang="less" scoped>

</style>