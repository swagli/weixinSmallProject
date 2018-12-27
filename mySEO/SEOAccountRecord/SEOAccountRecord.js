var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
var nowPageIndex = 0;
var nowPageSize = 8;
Page({
  data: {
    discountListArr:[],//奖励金记录
    historyListArr:[],//收支明细记录
    canUse: true,//查询记录类型false是充值记录被点击
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
    nowPageIndex++;
    wx.showLoading({
      title: '数据加载中...',
    })
    if (_this.data.canUse) {
      _this.getRedlist(customerId, nowPageIndex, nowPageSize);
    } else {
      _this.getHistoryLIst(customerId, nowPageIndex, nowPageSize);
    }
  },
  changeDetaTime:function(detaTimeArr){
    var _this = this;
    for (var i = 0, long = detaTimeArr.length;i<long;i++){
      detaTimeArr[i].createTime = constant.changeDetaTime(detaTimeArr[i].createTime);
    }
  },
  getRedlist: function (customerId, pageIndex, pageSize){//获取奖励金记录
    var _this = this;
    var url = constant.getBusinessManRewardsRecords(customerId, pageIndex, pageSize);
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
            var resultData = res.data.data.dataList;
            _this.changeDetaTime(resultData);
            if (pageIndex == 0) {
              _this.setData({
                discountListArr: resultData
              })
              console.log(_this.data.discountListArr);
              return
            }
            if (pageIndex > 0) {
              if (res.data.data.dataList.length == 0) {
                wx.showToast({
                  title: '没有更多数据了!',
                  icon: "none"
                })
              } else {
                var tempArr = [];
                tempArr = _this.data.discountListArr.concat(resultData);
                _this.setData({
                  discountListArr: tempArr
                })
              }
              console.log(_this.data.discountListArr);
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
  getHistoryLIst: function (customerId, pageIndex, pageSize) {//查看收支明细
    var _this = this;
    var url = constant.getBusinessManAccountRecords(customerId, pageIndex, pageSize);
    //请求数据
    requestToken.tokenAjaxGet({
      url: url,
      success(res) {
        console.log(res);
        wx.stopPullDownRefresh();//停止下拉刷新
        wx.hideLoading();//停止数据加载
        if (res.statusCode === 200) {
          if (res.data.status === 1) {
            var resultData = res.data.data.dataList;
            _this.changeDetaTime(resultData);
            if (pageIndex == 0) {
              _this.setData({
                historyListArr: resultData
              })
              console.log(_this.data.historyListArr);
              return
            }
            if (pageIndex > 0) {
              if (res.data.data.dataList.length == 0) {
                wx.showToast({
                  title: '没有更多数据了!',
                  icon: "none"
                })
              } else {
                var tempArr = [];
                tempArr = _this.data.historyListArr.concat(resultData);
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