var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
var timer = null;
Page({
  data: {
    orderArr: [],//当前订单
    orderId: ""
  },
  onLoad: function (options) {
    var _this = this;
    console.log("load");
    console.log(options);
    if (options.orderId){
      _this.setData({
        orderId: options.orderId
      })
    }else{
      wx.showToast({
        title: '未知错误,请返回重新查看!',
        icon: "none"
      })
      _this.backToIndex();
    }
  },
  onShow: function () {
    var that = this;
    console.log("onShow");
    that.onPullDownRefresh();
  },
  onReady: function () {
    var _this = this;
    var orderId = _this.data.orderId;
    console.log("ready");
    
    clearInterval(timer);
    timer = setInterval(function(){
      _this.getOrderMes(orderId);
    },10000)
  },
  onPullDownRefresh: function () {//下拉刷新数据
    var _this = this;
    var orderId = _this.data.orderId;
    _this.getOrderMes(orderId);
  },
  getOrderMes: function (orderId) {//获取订单详情
    var that = this;
    var url = constant.API_GET_ORDER_DETAIL + orderId;
    requestToken.tokenAjaxGet({
      url: url,
      success(res) {
        console.log(res);
        wx.stopPullDownRefresh();//停止下拉刷新
        if (res.statusCode === 200) {
          console.log("请求成功!");
          if (res.data.status === 1) {
            console.log(res.data);
            var tempArr = res.data.data;
            tempArr.orderStatus = constant.orderAllStatusChange(tempArr.orderStatus);//转换状态
            tempArr.orderType = constant.changeOrderStatus(tempArr.orderType);//转换类型
            tempArr.item.size = constant.sizeChange(tempArr.item.size);//转换类型
            tempArr.vehicle = constant.vehChange(tempArr.vehicle);//转换类型
            tempArr.createTime = constant.changeDetaTime(tempArr.createTime);
            tempArr.accpetTime = constant.changeDetaTime(tempArr.accpetTime);
            tempArr.fetchTime = constant.changeDetaTime(tempArr.fetchTime);
            tempArr.fetchedTime = constant.changeDetaTime(tempArr.fetchedTime);
            tempArr.payTime = constant.changeDetaTime(tempArr.payTime);
            tempArr.sendTime = constant.changeDetaTime(tempArr.sendTime);
            tempArr.sentTime = constant.changeDetaTime(tempArr.sentTime);
            tempArr.distance = (tempArr.distance/1000).toFixed(2);
            that.setData({
              orderArr: tempArr
            })
            console.log(that.data.orderArr);
          } else {
            requestToken.resError(res.data.msg);
          }
        } else {
          requestToken.httpError(res.statusCode, 0);
        }
      }
    })
  },
  callTosender:function(e){
    console.log(e.currentTarget.dataset.sendexnumber);
    if (e.currentTarget.dataset.sendexnumber){
      wx.makePhoneCall({
        phoneNumber: e.currentTarget.dataset.sendexnumber
      })
    }
  },
  backToIndex: function () {//返回首页
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
  },
  /**
  * 生命周期函数--监听页面隐藏
  */
  onHide: function () {
    clearInterval(timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(timer);
  }
})