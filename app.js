//app.js
App({
  globalData: {
    chart_temp: wx.getStorageSync('chart_temp') 
      ? JSON.parse(wx.getStorageSync('chart_temp')) 
      : [],
    chart_rh: wx.getStorageSync('chart_rh') 
      ? JSON.parse(wx.getStorageSync('chart_rh')) 
      : [],
    chart_mq_2: wx.getStorageSync('chart_mq_2') 
      ? JSON.parse(wx.getStorageSync('chart_mq_2')) 
      : [],
    chart_lx: wx.getStorageSync("chart_lx") 
      ? JSON.parse(wx.getStorageSync("chart_lx")) 
      : [],
  },
  onHide()  {
    wx.setStorageSync('chart_temp', JSON.stringify(this.globalData.chart_temp));
    wx.setStorageSync('chart_rh', JSON.stringify(this.globalData.chart_rh));
    wx.setStorageSync('chart_mq_2', JSON.stringify(this.globalData.chart_mq_2));
    wx.setStorageSync('chart_lx', JSON.stringify(this.globalData.chart_lx));
  },
});