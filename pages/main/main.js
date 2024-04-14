// pages/main/main.js

import mqtt from "../../utils/mqtt.min";
import { formatTime } from "../../utils/util";
const app = getApp();
const MQTTADDRESS = "iae7574a.ala.cn-hangzhou.emqxsl.cn"; //mqtt服务器地址
let client = null; //mqtt服务

// console.log(formatTime(new Date()).slice(5))

Page({
  /**
   * 页面的初始数据
   */
  data: {

    device: [{
      type: "灯",
      id: 0,
      isOpen: false,
      img: "/img/light.png"
    },
    {
      type: "灯",
      id: 1,
      isOpen: false,
      img: "/img/light.png"
    },
    {
      type: "开关",
      id: 2,
      isOpen: false,
      img: "/img/switch.png"
    },
    {
      type: "开关",
      id: 3,
      isOpen: false,
      img: "/img/switch.png"
    },
    {
      type: "开关",
      id: 4,
      isOpen: false,
      img: "/img/switch.png"
    },
    {
      type: "风扇",
      id: 5,
      isOpen: false,
      img: "/img/fan.png"
    }
    ],

    sensor: [{
      text: "温度",
      end_text: " ℃",
      value: wx.getStorageSync('aht20_temp'),
      img: "/img/temperature.png"
    },
    {
      text: "湿度",
      end_text: " %",
      value: wx.getStorageSync('aht20_rh'),
      img: "/img/humidity.png"
    },
    {
      text: "烟雾",
      end_text: " ppm",
      value: wx.getStorageSync('mq_2'),
      img: "/img/smoke.png"
    },
    {
      text: "光照",
      end_text: " lx",
      value: wx.getStorageSync('bh1750_lx'),
      img: "/img/light.png"
    }
    ],

    head_info: "01舱信息终端",

    isSetting: false,
    isConnect: false,
    isPush: false,
    isSub: false,

    address: wx.getStorageSync('address'),
    port: wx.getStorageSync('port'),
    username: wx.getStorageSync('username'),
    password: wx.getStorageSync('password'),

    pushaddr: wx.getStorageSync('pushaddr'),
    subaddr: wx.getStorageSync('subaddr')
  },

  // 生命周期
  onLoad(options) {

  },
  onReady() {
    this.connectMqtt()
  },

  // mqtt 连接
  connectMqtt() {
    let that = this;
    const options = {
      connectTimeout: 4000,
      address: this.data.address,//输入的地址
      port: this.data.port, //输入的端口号
      username: this.data.username,//输入的用户名
      password: this.data.password,//输入的密码
    };

    console.log("address是：", "wxs://" + options.address + "/mqtt");
    client = mqtt.connect("wxs://" + options.address + "/mqtt", options);

    client.on("connect", (e) => {
      console.log('连接成功');

      this.setData({ isConnect: true })

      wx.setStorageSync('address', this.data.address)
      wx.setStorageSync('port', this.data.port)
      wx.setStorageSync('username', this.data.username)
      wx.setStorageSync('password', this.data.password)

      if (wx.getStorageSync('pushaddr')) {
        this.addPush();
      }
      if (wx.getStorageSync('subaddr')) {
        this.addSub()
      }
    })

    client.on("message", (topic, message) => {
      console.log("收到消息");
      let getMessageObj = {};
      getMessageObj = JSON.parse(message);
      console.log(getMessageObj);


      if (getMessageObj.hasOwnProperty('aht20_temp')) {
        that.setData({
          "sensor[0].value": Number(getMessageObj.aht20_temp)
        })
        app.globalData.chart_temp.push(
          [formatTime(new Date()).slice(5), Number(getMessageObj.aht20_temp)]
        )
      }
      if (getMessageObj.hasOwnProperty('aht20_rh')) {
        that.setData({
          "sensor[1].value": Number(getMessageObj.aht20_rh)
        })
        app.globalData.chart_rh.push(
          [formatTime(new Date()).slice(5), Number(getMessageObj.aht20_rh)]
        )
      }
      if (getMessageObj.hasOwnProperty('mq_2')) {
        that.setData({
          "sensor[2].value": Number(getMessageObj.mq_2)
        })
        app.globalData.chart_mq_2.push(
          [formatTime(new Date()).slice(5), Number(getMessageObj.mq_2)]
        )
      }
      if (getMessageObj.hasOwnProperty('bh1750_lx')) {
        that.setData({
          "sensor[3].value": Number(getMessageObj.bh1750_lx)
        })
        app.globalData.chart_lx.push(
          [formatTime(new Date()).slice(5), Number(getMessageObj.bh1750_lx)]
        )
      }
    })

    client.on("reconnect", (error) => {
      console.log("正在重连：", error);
      wx.showToast({
        icon: "none",
        title: "正在重连",
      });
    });
    client.on("error", (error) => {
      console.log("连接失败：", error);
      wx.showToast({
        icon: "none",
        title: "mqtt连接失败",
      });
    });
  },
  addPush() {
    let that = this
    //订阅一个主题
    if (!this.data.isConnect) {
      wx.showToast({
        icon: "none",
        title: "请先连接",
      });
      return
    }
    client.subscribe(this.data.pushaddr, { qos: 0 }, function (err) {
      if (!err) {
        console.log("订阅成功");
        wx.showToast({
          icon: "none",
          title: "订阅成功",
        });
        that.setData({ isPush: true })
        wx.setStorageSync('pushaddr', that.data.pushaddr)
      }
    });
  },
  addSub() {
    if (!this.data.isConnect) {
      wx.showToast({
        icon: "none",
        title: "请先连接",
      });
      return
    }
    let that = this

    client.subscribe(this.data.subaddr, { qos: 0 }, function (err) {
      if (!err) {
        console.log("添加成功")
        wx.showToast({
          title: '连接成功',
          icon: "none",
        })
        that.setData({ isSub: true })
        wx.setStorageSync('subaddr', that.data.subaddr)
      }
    });
  },

  // 页面数据绑定
  passwdSync(e) {
    this.setData({
      password: e.detail.value
    })
  },
  usernameSync(e) {
    this.setData({
      username: e.detail.value
    })
  },
  portSync(e) {
    this.setData({
      port: e.detail.value
    })
  },
  addressSync(e) {
    this.setData({
      address: e.detail.value
    })
  },
  pushaddrSync(e) {
    this.setData({
      pushaddr: e.detail.value
    })
  },

  // 页面切换
  gotoSettingPage() {
    console.log("打开设置界面")
    this.setData({ isSetting: true })
  },
  leaveSettingPage() {
    console.log("关闭设置界面")
    this.setData({ isSetting: false })
  },
  toChart() {
    console.log("进入图表")
    wx.navigateTo({
      url: '/pages/chart/chart',
    })
  },

  // 事件处理
  sysChange(e) {
    let clickData = e.target.dataset.param
    let dataPath = "sensor[" + String(clickData.id) + "].isOpen"
    let msg

    console.log("切换事件:", clickData)

    if (clickData.isOpen) {
      msg = {
        id: clickData.id,
        isOpen: false
      }

      if (clickData.id == 0) {
        this.setData({
          "device[0].isOpen": false
        })
      }
      else if (clickData.id == 1) {
        this.setData({
          "device[1].isOpen": false
        })
      }
      else if (clickData.id == 2) {
        this.setData({
          "device[2].isOpen": false
        })
      }
      else if (clickData.id == 3) {
        this.setData({
          "device[3].isOpen": false
        })
      }
      else if (clickData.id == 4) {
        this.setData({
          "device[4].isOpen": false
        })
      }
      else if (clickData.id == 5) {
        this.setData({
          "device[5].isOpen": false
        })
      }

    } else {
      msg = {
        id: clickData.id,
        isOpen: true
      }

      if (clickData.id == 0) {
        this.setData({
          "device[0].isOpen": true
        })
      }
      else if (clickData.id == 1) {
        this.setData({
          "device[1].isOpen": true
        })
      }
      else if (clickData.id == 2) {
        this.setData({
          "device[2].isOpen": true
        })
      }
      else if (clickData.id == 3) {
        this.setData({
          "device[3].isOpen": true
        })
      }
      else if (clickData.id == 4) {
        this.setData({
          "device[4].isOpen": true
        })
      }
      else if (clickData.id == 5) {
        this.setData({
          "device[5].isOpen": true
        })
      }
    }

    client.subscribe(this.data.subaddr, { qos: 0 }, function (err) {
      if (!err) {
        //发布消息
        console.log("发出的", msg);
        client.publish("地址", JSON.stringify(msg));//转换json格式
      }
    });
  }
})