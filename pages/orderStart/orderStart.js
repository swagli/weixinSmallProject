var app = getApp();
var mapChange = require('../../utils/mapTransform.js');//地图经纬度转换
Page({
  data: {
    //发件信息数组填充字段
    name: "",
    phonenumber: "",
    longitude: 0,//百度
    latitude: 0,
    Txlongitude: 0,//腾讯
    Txlatitude: 0,
    addressName: "",
    addressDetail: "",
    poiName: "",
    //判断是否完成填写
    isCanBack:false,
    loadingOpenLocation:false
  },
  onLoad: function () {
    var that = this;
    var pages = getCurrentPages();//获取页面栈
  },
  onShow: function () {
    var that = this;
    var strterMessages = app.globalData.orderMessageArr.starter;
    console.log("加载渲染获取发件信息");
    console.log(strterMessages);;
    if (strterMessages.addressName && strterMessages.longitude && strterMessages.latitude) {
      var changePoint = mapChange.gcj02tobd09(strterMessages.longitude, strterMessages.latitude);
      if (strterMessages.name && strterMessages.phonenumber){
        that.setData({
          name: strterMessages.name,
          phonenumber: strterMessages.phonenumber,
          longitude: strterMessages.longitude,
          latitude: strterMessages.latitude,
          Txlongitude: strterMessages.Txlongitude,
          Txlatitude: strterMessages.Txlatitude,
          addressName: strterMessages.addressName,
          addressDetail: strterMessages.addressDetail,
          poiName: strterMessages.poiName,
        })
      }else{
        that.setData({
          longitude: strterMessages.longitude,
          latitude: strterMessages.latitude,
          Txlongitude: strterMessages.Txlongitude,
          Txlatitude: strterMessages.Txlatitude,
          addressName: strterMessages.addressName,
          addressDetail: strterMessages.addressDetail,
          poiName: strterMessages.poiName,
        })
      }
    } else if (!strterMessages.addressName && !strterMessages.longitude && !strterMessages.latitude && !that.data.loadingOpenLocation) {
      that.getLocation();//第一次加载弹出地址选择器
    }
    that.changeWrite();//检测输入情况判断返回按钮状态
  },
  getAddressDetaile:function(e){//获取输入的详细地址
    var that = this;
    that.setData({
      addressDetail: e.detail.value
    })
    that.changeWrite();//检测输入情况判断返回按钮状态
  },
  getPhoneNumber: function (e) {//获取输入的发件人号码
    var that = this;
    that.setData({
      phonenumber: e.detail.value
    })
    that.changeWrite();//检测输入情况判断返回按钮状态
  },
  testPhoneNumber:function(){
    var that = this;
    var phoneNumberTest = that.data.phonenumber.trim();
    if (!phoneNumberTest){
      return false
    }
    var isPhoneTit = /^([0-9]{3,4}-)?[0-9]{7,8}$/;//带前缀座机
    var isPhone = /^0\d{2,3}-?\d{7,8}$/;//不带前缀
    var isMob = /^((\+?86)|(\(\+86\)))?(1[0-9]{10})$/;//手机号码
    if (isPhone.test(phoneNumberTest) || isMob.test(phoneNumberTest) || isPhoneTit.test(phoneNumberTest)) {
      console.log("可以用!");
      return true;
    }else {
      wx.showToast({
        title: '手机或电话号码格式不正确',
        icon: "none"
      })
      return false;
    }
  },
  getCustomerName: function (e) {//获取输入的发件人姓名
    var that = this;
    console.log(e.detail.value);
    that.setData({
      name: e.detail.value
    })
    that.changeWrite();//检测输入情况判断返回按钮状态
  },
  getLocation:function(){//打开地图选择地址
    var that = this;
    that.setData({
      loadingOpenLocation: true
    })
    /*获取当前位置 */
    wx.chooseLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        console.log(res);
        var changePoint = mapChange.gcj02tobd09(res.longitude, res.latitude);
        console.log(changePoint);
        that.setData({
          poiName: res.name,
          addressName: res.address,
          Txlatitude: res.latitude,
          Txlongitude: res.longitude,
          latitude: changePoint[1],
          longitude: changePoint[0],
        })
        app.globalData.orderMessageArr.starter.poiName = that.data.poiName;
        app.globalData.orderMessageArr.starter.addressName = that.data.addressName;
        app.globalData.orderMessageArr.starter.latitude = that.data.latitude;
        app.globalData.orderMessageArr.starter.longitude = that.data.longitude;
        app.globalData.orderMessageArr.starter.Txlatitude = that.data.Txlatitude;
        app.globalData.orderMessageArr.starter.Txlongitude = that.data.Txlongitude;

        app.globalData.saveMessages.saveStartInfo = true;
        console.log(app.globalData.orderMessageArr.starter);
      },
      fail(e) {
        that.setData({
          loadingOpenLocation: true
        })
      }
    })
    that.changeWrite();//检测输入情况判断返回按钮状态
  },
  changeWrite: function () {//检测输入情况判断返回按钮状态
    var that = this;
    if (!that.data.addressName || !that.data.latitude || !that.data.longitude || !that.data.name || !that.data.phonenumber || !that.testPhoneNumber){
        that.setData({
          isCanBack:false
        })
    }else{
      that.setData({
        isCanBack: true
      })
    }
  },
  backToIndex:function(){//返回首页
    var that = this;
    that.testPhoneNumber();
    console.log(that.testPhoneNumber());
    if (!that.testPhoneNumber()){
      return false
    }
    var pagesNumber = getCurrentPages();//获取页面栈
    var orderStarterArr = {
      "name": that.data.name,
      "phonenumber": that.data.phonenumber,
      "longitude": that.data.longitude,
      "latitude": that.data.latitude,
      "Txlongitude": that.data.Txlongitude,
      "Txlatitude": that.data.Txlatitude,
      "addressName": that.data.addressName,
      "addressDetail": that.data.addressDetail,
      "poiName": that.data.poiName,
    }
    app.globalData.orderMessageArr.starter = orderStarterArr;
    console.log("全局数据:");
    console.log(app.globalData);
    if (pagesNumber.length > 1) {
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.navigateTo({
        url: "../index/index"
      })
    }
  }
})