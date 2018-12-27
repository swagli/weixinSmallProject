var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
var nowPageIndex = 0;
var nowPageSize = 8;
Page({
  data: {
    discountListArr:[],//提现记录
    historyListArr:[],//充值记录
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
    }
  },
  changeDetaTime:function(detaTimeArr){
    var _this = this;
    for (var i = 0, long = detaTimeArr.length;i<long;i++){
      detaTimeArr[i].createTime = constant.changeDetaTime(detaTimeArr[i].createTime);
    }
  },
  getRedlist: function (customerId, pageIndex, pageSize){//获取提现记录
    var _this = this;
    var url = constant.getDrawRecords(customerId, pageIndex, pageSize);
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
  seeDetaile:function(e){//查看提现详情
    var that = this;
    console.log(e.currentTarget.dataset.itendata);
    var temoData = JSON.stringify(e.currentTarget.dataset.itendata);
    wx.navigateTo({
      url: "/mySEO/putForwardDetaile/putForwardDetaile?temoData=" + temoData
    })
  },
  backToIndex : function() {//返回首页
    var that = this;
    var pagesNumber = getCurrentPages();//获取页面栈
    if (pagesNumber.length > 2) {
      wx.navigateBack({
        delta: 2
      })
    } else {
      wx.reLaunch({
        url: "../index/index"
      })
    }
  }
})