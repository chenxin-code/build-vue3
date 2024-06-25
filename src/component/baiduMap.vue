<template>
  <el-dialog v-model="dialogVisible" :title="addressDetail" :destroy-on-close="true" width="60%" append-to-body draggable>
    经纬度： [{{ coord }}]
    <div
      id="container"
      style="width: 100%; height: 400px; background: #fafafa"
    ></div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      addressDetail: '',
      coordX: '',
      coordY: '',
      coord:'',
    };
  },

  methods: {
    init(coord, addressDetail) {
      this.dialogVisible = true;
      this.addressDetail = addressDetail;
      coord = coord ? coord : '116.404,39.915';
      this.coord = coord;
      if (coord) {
        let arr = coord.split(',');
        this.coordX = arr[0];
        this.coordY = arr[1];
        this.$nextTick(() => {
          this.initMap(addressDetail);
        });
      }
    },
    initMap(addressDetail) {
      const _this = this;
      const map = new BMapGL.Map('container');
      map.enableScrollWheelZoom(true); //滚轮缩放
      map.addControl(new BMapGL.CityListControl());  // 添加城市列表控件
      map.addControl(new BMapGL.	ZoomControl());  // 添加缩放控件

      //创建地址解析器实例
      const myGeo = new BMapGL.Geocoder();
      // 将地址解析结果显示在地图上，并调整地图视野
      myGeo.getPoint(addressDetail, function (point) {
        if (point) {
          map.centerAndZoom(point, 16);
          // 标注
          map.addOverlay(new BMapGL.Marker(point, {title: addressDetail}));

          _this.coordX = point.lng;
          _this.coordY = point.lat;
          _this.coord = _this.coordX+","+ _this.coordY;
        } else {
          alert('您选择的地址没有解析到结果！');
        }
      }, '北京市')
    },
  },
};
</script>

<style lang="less" scoped>

</style>