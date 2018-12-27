//app.js
App({
  globalData: {
    userInfo: null,
    userMessages:{
      userName:"",
      phoneNumber:""
    },
    orderMessageArr: {
      "starter": {
        "name": "",
        "phonenumber": "",
        "longitude": 0,
        "latitude": 0,
        "Txlongitude":0,
        "Txlatitude": 0,
        "addressName": "",
        "addressDetail": "",
        "poiName": ""
      },
      "receiver": {
        "name": "",
        "phonenumber": "",
        "longitude": 0,
        "latitude": 0,
        "Txlongitude": 0,
        "Txlatitude": 0,
        "addressName": "",
        "addressDetail": "",
        "poiName": "",
      },
      "item": {
        "name": "",
        "type": "",
        "size": "",//MIDDLE
        "sizeValue": "",//中件（50x50x30cm）
        "weight": "1",
        "vehicleVal": "",
        "remark": "",
        "itemTypeIndex":null,
        "itemSizeIndex":null,
        "itemVehicleIndex":null
      },
      "couponId": null,//红包ID
      "couponNumber": null,//可用红包数量
      "couponPre": 0,//红包金额
      "fetchTime": null,//取件时间
      "sendTime": null,//送件时间
      "fetchTimeVal": null,//时间预览
      "sendTimeVal": null,//时间预览
      "priceOrigin": 0,//原价
      "price": 0,//现价
      "priceAdditional":0,//加价
      "distance":0,//距离
      "distancePreview": 0,//距离预览
      "vehicle": null,//交通工具
      "orderType": "MergeOrder",//订单类型
      "orderChangeType": "mergeOrder",//预览使用的订单类型
      "payType": "WXPAY_MINI",//付款类型微信 CUSTOMER_RECHARGE
      "payMode": null,//货到付款 与payType互斥 ArrivalPay
      "openId":null//用于微信支付
    },
    useDefauleStatus:true,//首页是否已经加载过默认信息
    helpMePickUp:false,//是否点击帮我取
    saveMessages:{
      saveStartInfo: false,//是否保存发件地址
      saveReceiveInfo: false,//是否保存收件地址
      saveItemInfo: false//是否保存物品
    },
    oftenClickBack:{
      clickStartInfo: false,//是否保存发件地址
      clickReceiveInfo: false,//是否保存收件地址
      clickItemInfo: false//是否保存物品
    }
  },
  onLaunch: function () {//小程序初始化完成 app.js会在index初始化完成之后执行
    var that = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              this.globalData.userMessages.userName = res.userInfo.nickName;
              var usernumber = wx.getStorageSync("user_phonenumber");
              if (usernumber){
                this.globalData.userMessages.phoneNumber = res.userInfo.nickName;
              }
              // console.log(res.userInfo);
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  }
})