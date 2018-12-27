var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
var nowPageIndex = 0;
var nowPageSize = 8;
Page({
  data: {
    discountListArr:[],//可用红包
    historyListArr:[],//历史红包
    canUse: true,//可用红包点击态 false是历史红包被点击
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
  onPullDownRefresh: function () {//下拉刷新数据
    var _this = this;
    var customerId = requestToken.getCustomerId();
    nowPageIndex = 0;
    if (_this.data.canUse){
      _this.getRedlist(customerId, nowPageIndex, nowPageSize);
    }else{
      _this.getHistoryLIst(customerId, nowPageIndex, nowPageSize);
    }
    console.log(nowPageIndex + "/" + nowPageSize);
  },
  onReachBottom: function () {//上拉加载更多
    var _this = this;
    var customerId = requestToken.getCustomerId();
    if (_this.data.canUse) {
      _this.getRedlist(customerId, 0, nowPageSize);
      wx.showToast({
        title: '没有更多数据了!',
        icon: "none"
      })
    } else {
      nowPageIndex++;
      wx.showLoading({
        title: '数据加载中...',
      })
      _this.getHistoryLIst(customerId, nowPageIndex, nowPageSize);
    }
  },
  getRedlist: function (customerId, pageIndex, pageSize){//获取红包列表
    var that = this;
    var url = constant.API_URL_GET_CAN_USE_ALL_COUPON_LIST + customerId;
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
  getHistoryLIst: function (customerId, pageIndex, pageSize) {//获取常用地址列表
    var _this = this;
    var url = constant.API_URL_POST_FIND_HISTORY_COUPON_LIST;
    var data = {
      "id": customerId,
      "pageIndex": pageIndex,
      "pageSize": pageSize
    }
    //请求数据
    requestToken.tokenAjaxPost({
      url: url,
      data: data,
      success(res) {
        console.log(res);
        wx.stopPullDownRefresh();//停止下拉刷新
        wx.hideLoading();//停止数据加载
        if (res.statusCode === 200) {
          if (res.data.status === 1) {
            // console.log(res.data);
            if (pageIndex == 0) {
              _this.setData({
                historyListArr: res.data.data
              })
              console.log(_this.data.historyListArr);
              return
            }
            if (pageIndex > 0) {
              if (res.data.data.length == 0) {
                wx.showToast({
                  title: '没有更多数据了!',
                  icon: "none"
                })
              } else {
                var tempArr = [];
                tempArr = _this.data.historyListArr.concat(res.data.data);
                _this.setData({
                  historyListArr: tempArr
                })
              }
              return
            }
          } else {
            requestToken.resError(res.data.msg);
          }
        } else {
          requestToken.httpError(res.statusCode, 0);
        }
      }
    })
  },
  canUseClick:function(){
    var _this = this;
    var customerId = requestToken.getCustomerId();
    _this.setData({
      canUse:true
    })
    _this.getRedlist(customerId, 0, nowPageSize);
  },
  historyClick: function () {
    var _this = this;
    _this.setData({
      canUse: false
    })
    var customerId = requestToken.getCustomerId();
    _this.getHistoryLIst(customerId, 0, nowPageSize);
  },
  chooseRedToindex:function(e){//选择并使用(未使用)
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
    if (pagesNumber.length > 2) {
      wx.navigateBack({
        delta: 2
      })
    } else {
      wx.navigateTo({
        url: "../index/index"
      })
    }
  }
})