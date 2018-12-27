var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
Page({
  data: {
    discountListArr:[],
    isCanBack:true
  },
  onLoad: function () {
    var that = this;
    console.log("load");
    wx.showLoading({
      title: '数据加载中...',
    })
  },
  onShow: function () {
    var that = this;
    console.log("onShow");
    that.onPullDownRefresh();
  },
  onReady: function () {
    var that = this;
    console.log("ready");
  },
  onPullDownRefresh:function(){//开始下拉刷新
    var _this = this;
    _this.getRedlist();
  },
  getRedlist:function(){//获取红包列表
    var that = this;
    var customerId = requestToken.getCustomerId();
    var price = app.globalData.orderMessageArr.priceOrigin;//请求的原价
    var url = constant.findCanUseCouponListUrl(customerId, price, getOrderType(app.globalData.orderMessageArr.orderType));
    // var url = constant.findCanUseCouponListUrl(customerId, 20, "merge");
    requestToken.tokenAjaxGet({
      url: url,
      success(res) {
        console.log(res);
        wx.stopPullDownRefresh();//停止下拉刷新
        wx.hideLoading();//停止数据加载
        if (res.statusCode === 200) {
          console.log("请求成功!");
          if (res.data.status === 1) {
            console.log(res.data);
            that.setData({
              discountListArr: res.data.data
            })
            console.log(that.data.discountListArr);
          } else {
            requestToken.resError(res.data.msg);
            app.globalData.orderMessageArr.couponPre = null;
          }
        } else {
          requestToken.httpError(res.statusCode, 0);
        }
      }
    })
    function getOrderType(type) {
      switch (type) {
        case 'MergeOrder':
          return 'merge';
        case 'DirectOrder':
          return 'direct';
        default:
          return 'common';
      }
    }
  },
  notUseRedToindex: function (e) {//不使用红包
    var that = this;
    app.globalData.orderMessageArr.couponId = null;
    app.globalData.orderMessageArr.couponPre = null;
    that.backToIndex();
  },
  chooseRedToindex:function(e){//选择并使用
    var that = this;
    var url = constant.API_SMS_LOGIN;
    console.log(e.currentTarget.dataset.reddata);
    var redData = e.currentTarget.dataset.reddata;
    if (redData){
      app.globalData.orderMessageArr.couponId = redData.couponId;
      app.globalData.orderMessageArr.couponPre = redData.couponPrice;
    }
    that.backToIndex();
  },
  backToIndex : function() {//返回首页
    var that = this;
    var pagesNumber = getCurrentPages();//获取页面栈
    if (pagesNumber.length > 1) {
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.reLaunch({
        url: "../index/index"
      })
    }
  }
})