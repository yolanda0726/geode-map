<template>
  <div class="box">
    <div id="container"></div>
  </div>
</template>

<script>
import AMap from "AMap"; // 引入高德地图

export default {
  name: "Map",
  props: {
    msg: String
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      // var GDPSpeed = {
      //     '520000':10,//贵州
      //     '540000':10,//西藏
      //     '530000':8.5,//云南
      //     '500000':8.5,//重庆
      //     '360000':8.5,//江西
      //     '340000':8.0,//安徽
      //     '510000':7.5,//四川
      //     '350000':8.5,//福建
      //     '430000':8.0,//湖南
      //     '420000':7.5, //湖北
      //     '410000':7.5,//河南
      //     '330000':7.0,//浙江
      //     '640000':7.5,//宁夏
      //     '650000':7.0,//新疆
      //     '440000':7.0,//广东
      //     '370000':7.0,//山东
      //     '450000':7.3,//广西
      //     '630000':7.0,//青海
      //     '320000':7.0,//江苏
      //     '140000':6.5,//山西
      //     '460000':7,// 海南
      //     '310000':6.5,//上海
      //     '110000':6.5, // 北京
      //     '130000':6.5, // 河北
      //     '230000':6, // 黑龙江
      //     '220000':6,// 吉林
      //     '210000':6.5, //辽宁
      //     '150000':6.5,//内蒙古
      //     '120000':5,// 天津
      //     '620000':6,// 甘肃
      //     '610000':8.5,// 甘肃
      //     '710000':2.64, //台湾
      //     '810000':3.0, //香港
      //     '820000':4.7 //澳门

      // }
      var adCode = 110000;
      var depth = 0; //通过depth字段设定数据的层级深度，depth为0的时候只显示省面，depth为1的时候显示市级，当depth为2的可以显示县一级。
      var map = new AMap.Map("container", {
        resizeEnable: false,
        zoom: 5,
        center: [116.412427, 39.303573],
        pitch: 0,
        viewMode: "3D"
      });

      AMap.plugin(["AMap.ControlBar"], function() {
        var bar = new AMap.ControlBar();
        map.addControl(bar);
      });

      // 创建省份图层
      var disProvince;
      function initPro(code, dep) {
        dep = typeof dep == "undefined" ? 2 : dep;
        adCode = code;
        depth = dep;

        disProvince && disProvince.setMap(null);

        disProvince = new AMap.DistrictLayer.Province({
          zIndex: 12,
          adcode: [code],
          depth: 1,
          styles: {
            fill: function(properties) {
              // properties为可用于做样式映射的字段，包含
              // NAME_CHN:中文名称
              // adcode_pro
              // adcode_cit
              // adcode
              var adcode = properties.adcode;
              return getColorByAdcode(adcode);
            },
            "province-stroke": "cornflowerblue",
            "city-stroke": "white", // 中国地级市边界
            "county-stroke": "rgba(255,255,255,0.5)" // 中国区县边界
          }
        });

        disProvince.setMap(map);
      }

      // 颜色辅助方法
      var colors = {};
      var getColorByAdcode = function(adcode) {
        if (!colors[adcode]) {
          var gb = Math.random() * 155 + 50;
          colors[adcode] = "rgb(" + gb + "," + gb + ",255)";
        }

        return colors[adcode];
      };

      // // 按钮事件
      // function changeAdcode(code) {
      //   if (code != 100000) {
      //     initPro(code, depth);
      //   }
      // }

      // function changeDepth(dep) {
      //   initPro(adCode, dep);
      // }

      initPro(adCode, depth);

      // new AMap.Map("container", {
      //   center: [116.397428, 39.90923], //中心点坐标
      //   viewMode: "3D" //使用3D视图
      // });

      /*
       * 添加Canvas图层
       */
      var canvas = document.createElement("canvas");
      canvas.width = canvas.height = 200;

      var context = canvas.getContext("2d");
      context.fillStyle = "rgb(0,100,255)";
      context.strokeStyle = "white";
      context.globalAlpha = 1;
      context.lineWidth = 2;

      var radious = 98;
      var draw = function() {
        context.clearRect(0, 0, 200, 200);
        context.globalAlpha = (context.globalAlpha - 0.01 + 1) % 1;
        radious = (radious + 1) % 100;

        context.beginPath();
        context.arc(100, 100, radious, 0, 2 * Math.PI);
        context.fill();
        context.stroke();

        //2D视图时可以省略
        CanvasLayer.reFresh();

        // AMap.Util.requestAnimFrame(draw);
      };

      // 覆盖区域
      var bounds_v = new AMap.Bounds(
        [105.406315, 34.908775],
        [115.406315, 44.908775]
      );
      var CanvasLayer = new AMap.CanvasLayer({
        canvas: canvas,
        bounds: bounds_v,
        zooms: [5, 6],
        zIndex: 10
      });

      CanvasLayer.setMap(map);
      draw();

      // var marker = new AMap.Marker({
      //   icon:
      //     "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
      //   position: bounds_v.getCenter( ),
      //   // offset: new AMap.Pixel(-23, -40),
      //   title: "有地震，快跑，跑慢了你就翘辫子拉~~~~",
      //   // anchor: "center",
      //   content:'.'
      // });
      // marker.setMap(map);

      var circleMarker = new AMap.CircleMarker({
        center: bounds_v.getCenter(),
        map: map,
        zIndex: 100,
        radius: 5,
        fillColor: "#ff000"
      });
      AMap.event.addListener(circleMarker, "mouseover", function() {
        //  console.log('ddf')
        var infoWindow = new AMap.InfoWindow({
          content: "<h1>快跑</h1>" //使用默认信息窗体框样式，显示信息内容
        });

        infoWindow.open(map, circleMarker.getCenter( ));
      });
      // AMap.event.addDomListener(circleMarker, 'mouseover', );
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.box {
  width: 100vw;
  height: 100vh;
}
#container {
  width: 100vw;
  height: 100vh;
}
</style>
