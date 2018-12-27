// mySEO/myIndex/myIndex.js
var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
var ctxPath = constant.API;
var ctxPath_API_SERVER = constant.API_SERVER;
Page({
  data: {
    customerAccountInfo: {//默认奖励系数
      "businessmanId": "",//推广商户标识
      "name": "",
      "phonenumber": "",
      "businessmanType": "SENDER_BUSINESSMAN",//业务员类型
      "numberSendersSpread": 0,//推广数量
      "numberCustomersSpread": 0,
      "numberBigCustomerSpread": 0,
      "moneyRemain": "0.00",//奖励金总额
      "bigCustomerOrderReward": "0.50",//推广大商户数据
      "bigCustomerOrderRewardTotal": "0.00",
      "customerFirstOrderReward": "10.00",//推广普通商户数据
      "customerFirstOrderRewardTotal": "0.00",
      "customerOrderReward": "0.50",
      "customerOrderRewardTotal": "0.00",
      "senderFirstTaskReward": "10.00",//推广配送员数据
      "senderTaskReward": "0.50",
      "senderFirstTaskRewardTotal": "0.00",
      "senderTaskRewardTotal": "0.00",
    },
    moneyRemain:0.00,//可提现余额
    shareUrl: "https://yikesong.cc/public/spread/entrance?businessId=",//+customerAccountInfo.businessmanId 分享的链接
    showImg:"/images/SEO/seo_banner_code.png",//生成的二维码
  },
  onLoad: function (options) {
    var _this = this;
    wx.showLoading({
      title: '数据加载中...',
    })
    _this.loadingData();
  },
  onReady: function () {

  },
  onShow: function () {

  },
  loadingData: function () {
    var _this = this;
    var customerId = requestToken.getCustomerId();
    //请求查看奖励总体信息及奖励系数
    getRewards();
    function getRewards() {
      var url = constant.getCustomerRewards(customerId);
      requestToken.tokenAjaxGet({
        url: url,
        success(res) {
          console.log(res);
          wx.hideLoading();//停止数据加载
          if (res.statusCode === 200) {
            console.log("请求成功!");
            console.log(res.data);
            if (res.data.status === 1) {
              _this.setData({
                customerAccountInfo: res.data.data
              })
              console.log(res.data.data);
            } else {
              requestToken.resError(res.data.msg);
            }
          } else {
            requestToken.httpError(res.statusCode, 0);
          }
        }
      })
    }
    //请求可提现余额
    getBalance();
    function getBalance() {
      var url = constant.getBusinessManAccount(customerId);
      requestToken.tokenAjaxGet({
        url: url,
        success(res) {
          console.log(res);
          wx.hideLoading();//停止数据加载
          if (res.statusCode === 200) {
            console.log("请求成功!");
            console.log(res.data);
            if (res.data.status === 1) {
              _this.setData({
                moneyRemain: res.data.data.moneyRemain
              })
              console.log(res.data.data);
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
  linkShare:function(){//链接分享给好友
    var _this= this;
    wx.showShareMenu();//打开分享
  },
  QRcodeShare: function () {//扫码分享好友
    var _this = this;
    wx.showToast({
      title: '暂不可用',
      icon:"none"
    })
    return
    // wx.navigateTo({
    //   url: '/mySEO/QRCode/QRCode?businessmanId=' + _this.data.customerAccountInfo.businessmanId,
    // })
  },
  backToIndex: function () {//返回
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
  openToMySEORecord: function () {//打开推广记录
    wx.navigateTo({
      url: "/mySEO/mySEORecord/mySEORecord"
    })
  },
  openToPutForward:function(){//打开提现
    wx.navigateTo({
      url: "/mySEO/putForward/putForward"
    })
  },
  openToPutForward_record: function () {//打开提现记录
    wx.navigateTo({
      url: "/mySEO/putForwardRecord/putForwardRecord"
    })
  },
  openToSEOAccountRecord: function () {//打开奖励金记录
    wx.navigateTo({
      url: "/mySEO/SEOAccountRecord/SEOAccountRecord"
    })
  },
  openToOther: function () {//打开其他
    wx.showToast({
      title: '敬请期待...',
      icon:"none"
    })
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

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let that = this;//public/spread/entrance?businessId=
    let return_url = ctxPath + "/agent/views/businessmanSpread.html";
    var path = 'mySEO/shareToLink/shareToLink?shareUrl=' + return_url + "&businessmanId=" + that.data.customerAccountInfo.businessmanId;
    console.log("分享的URl");
    console.log(path);
    return {
      title: '注册壹配送：推荐用户、配送员，获高额奖励金、单单享提成。',
      path: path,
      imageUrl: "/images/SEO/seo_banner_1.png",
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: "分享成功",
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        // 转发失败
        wx.showToast({
          title: "分享已取消",
          icon: 'none',
          duration: 1500
        })
      }
    }
  }
})