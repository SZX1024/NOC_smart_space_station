import * as echarts from '../../ec-canvas/echarts';

const app = getApp();

function setOption(chart) {
  const option = {
    xAxis: {
      type: "category",
      data: ["none"]
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
      data: [0],
      type: "line"
      }
    ]
  };
  chart.setOption(option);
}

Page({

  onLoad(options) {
    let data = JSON.parse(options.param)

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
    setTimeout(() => {
      console.log(this.data.chartData);
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
            data: this.data.chartData.map(item => item[1]),
            type: "line"
            }
          ]
        })
    }, 500);
  },

  data: {
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
