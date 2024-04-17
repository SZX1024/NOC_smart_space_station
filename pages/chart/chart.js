import * as echarts from '../../ec-canvas/echarts';

const app = getApp();

function setOption(chart) {
  const option = {
    dataZoom:
      [{   //默认控制x轴
           type:'slider',//图标下方的伸缩条
           show:true,//是否显示
           xAxisIndex:[0],	//控制x轴，数组可以同时控制多个轴
           realtime:true,
           start:40,    //伸缩条开始位置
           end:20      //伸缩条结束位置
       },{
            // type:'inside',		//滚动条内置在坐标系中
            xAxisIndex: [0],
            start: 0,
            end:40
      }],
    legend: {
      data: ['A'],
      top: 50,
      left: 'center',
      backgroundColor: 'white',
      z: 100
    },
    grid: {
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    xAxis: {
      type: "time",
      data: ["none"]
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
      name: "none",
      data: [0],
      type: "line",
      smooth: true
      }
    ]
  };
  chart.setOption(option);
}

Page({

  onLoad(options) {
    let data = JSON.parse(options.param)
    this.setData({
      data : JSON.parse(options.param)
    })

    wx.setNavigationBarTitle({
      title: data.text + "记录",
    })

    let data_index = data.text === "温度" ? "chart_temp" : data.text === "湿度" ? "chart_rh" :
     data.text === "烟雾" ? "chart_mq_2" : "chart_lx"


    console.log(data_index)

    console.log(app.globalData[data_index])

    this.setData({
      chartData : app.globalData[data_index]
    })
  },

  onReady: function () {
    // 获取组件
    this.ecComponent = this.selectComponent('#mychart-dom-bar');
    this.init()
    
    setInterval(() => {
      console.log("定时器启动", this.data.chartData);
      if (this.data.chartData.length > 12 * 60 * 60 * 2) {
        console.log(this.data.chartData.length)
        let count = this.data.chartData.length - 12 * 60 * 60 * 2
        for (let i = 0; i < count; i++) {
          this.data.chartData.shift()
        }
      }
      this.data.chartData.length && this.chart.setOption({
        xAxis: {
            type: "category",
            data: this.data.chartData.map(item => item[0]),
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
            name: this.data.data.text,
            data: this.data.chartData.map(item => item[1]),
            type: "line"
            }
          ],
        });
    },500);
  },

  onHide() {
    clearInterval(1)
  },

  data: {
    data: "none",
    ec: {
      // 将 lazyLoad 设为 true 后，需要手动初始化图表
      lazyLoad: true
    },
    isLoaded: false,
    isDisposed: false,
    chartData: []
  },

  // 点击按钮后初始化图表
  init: function () {
    this.ecComponent.init((canvas, width, height, dpr) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      setOption(chart);

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      this.setData({
        isLoaded: true,
        isDisposed: false
      });

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },

  dispose: function () {
    if (this.chart) {
      this.chart.dispose();
    }

    this.setData({
      isDisposed: true
    });
  },
  clearAllData(){
    app.globalData.chart_temp = [];
    app.globalData.chart_rh = [];
    app.globalData.chart_mq_2 = [];
    app.globalData.chart_lx = [];

    wx.getStorageSync('chart_temp') && wx.removeStorageSync('chart_temp');
    wx.getStorageSync('chart_rh') && wx.removeStorageSync('chart_rh');
    wx.getStorageSync('chart_mq_2') && wx.removeStorageSync('chart_mq_2');
    wx.getStorageSync('chart_lx') && wx.removeStorageSync('chart_lx');

    wx.showToast({
      title: '清除成功',
    })

    setTimeout(() => {
      wx.navigateBack()
    }, 1500);
  }
});
