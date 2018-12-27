var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
Page({
  data: {
    reasonList:[],
    orderId:"",
    clickIndex:0,
    senderName:"",
    isCanBack:true
  },
  onLoad: function (option) {
    var _this = this;
    console.log(option);
    var customerId = requestToken.getCustomerId();
    var senderName = option.senderName;
    var orderId = option.orderId;//投诉订单号
    _this.setData({
      orderId: orderId,
      senderName: senderName
    })
    var senderName = option.senderName;
    var url = constant.getComplainList(customerId, orderId);
    requestToken.tokenAjaxGet({
      url: url,
      success(res) {
        console.log(res);
        wx.stopPullDownRefresh();//停止下拉刷新
        if (res.statusCode === 200) {
          console.log("理由请求成功!");
          if (res.data.status === 1) {
            _this.setData({
              reasonList: res.data.data
            })
            console.log(_this.data.reasonList);
          } else {
            requestToken.resError(res.data.msg);
          }
        } else {
          requestToken.httpError(res.statusCode, 0);
        }
      }
    })
  },
  onShow: function () {
    var _this = this;
  },
  chooseList: function (e) {//返回首页
    var _this = this;
    var index = e.currentTarget.dataset.index;
    _this.setData({
      clickIndex: index
    })
  },
  requestFunction:function(){
    var _this = this;
    var customerId = requestToken.getCustomerId();
    var orderId = _this.data.orderId;
    var complainNum = _this.data.clickIndex;
    var url = constant.customerComplain(customerId, orderId, complainNum);
    wx.showModal({
      title: '你正在执行投诉操作',
      content: '确定投诉该配送员?',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '数据加载中...',
          })
          isCanRequest(); //请求投诉
        } else {
          // console.log('用户点击取消')
        }
      }
    })
    function isCanRequest() {//请求投诉
      requestToken.tokenAjaxPost({
        url: url,
        data:{},
        success(res) {
          console.log(res);
          wx.stopPullDownRefresh();//停止下拉刷新
          if (res.statusCode === 200) {
            console.log("当前订单请求成功!");
            if (res.data.status === 1) {
              wx.showToast({
                title: '投诉成功!',
                icon: "success"
              })
              setTimeout(function(){
                _this.backToOrder();
              },1000)
            } else {
              requestToken.resError(res.data.msg);
            }
          } else {
            requestToken.httpError(res.statusCode, 0);
          }
        }
      })
    }
  },
  backToOrder:function(){//返回首页
    var _this = this;
    var pagesNumber = getCurrentPages();//获取页面栈
    if (pagesNumber.length > 1) {
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.reLaunch({
        url: "../order/order"
      })
    }
  }
})