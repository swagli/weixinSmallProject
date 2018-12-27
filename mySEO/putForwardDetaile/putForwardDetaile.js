var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
Page({
  data: {
    orderArr: {
      "applicationId": "",
      "amount": "",
      "drawStatus": "",
      "drawInfo": "",
      "createTime": "2018-8-30 16:18:06",
      "rejectTime": null,
      "rejectReason": null,
      "acceptTime": null,
      "operatorName": null
    },
    orderId: "",
    isCanBack:true
  },
  onLoad: function (options) {
    var _this = this;
    console.log("load");
    console.log(options);
    if (options.temoData){
      var temp= JSON.parse(options.temoData);
      temp.drawInfo = temp.drawInfo.replace(/[，,]/g, "\n");//去掉逗号替换为\n
      _this.setData({
        orderArr: temp
      })
    }else{
      wx.showToast({
        title: '未知错误,请返回重新查看!',
        icon: "none"
      })
      _this.backToback();
    }
  },
  onShow: function () {
    var that = this;
    console.log("onShow");
    
  },
  onReady: function () {
    var _this = this;
  },
  onPullDownRefresh: function () {//下拉刷新数据
    var _this = this;
  },
  backToback: function () {//返回首页
    var that = this;
    var pagesNumber = getCurrentPages();//获取页面栈
    if (pagesNumber.length > 1) {
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.reLaunch({
        url: "/pages/index/index"
      })
    }
  },
  /**
  * 生命周期函数--监听页面隐藏
  */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  }
})