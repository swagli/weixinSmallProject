//该页面用于存放内嵌网页
var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
var ctxPath = constant.API;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    web_src: ''//接受要跳转的路径
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    _this.setData({// web_src: ctxPath + "/agent/views/businessmanSpread.html?businessmanId=" + options.businessmanId
      web_src: options.shareUrl + "?businessmanId=" +options.businessmanId
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    let that = this;
    let return_url = encodeURIComponent(options.webViewUrl);
    console.log("分享的URl");
    console.log(return_url);
    var path = 'mySEO/shareToLink/shareToLink?shareUrl=' + return_url
    console.log(path, options)
    return {
      title: '注册壹配送,单单享提成!',
      path: path,
      imageUrl: "/images/SEO/seo_banner_1.png",
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: "转发成功",
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  backToIndex: function () {//返回
    var that = this;
    var pagesNumber = getCurrentPages();//获取页面栈
    if (pagesNumber.length > 1) {
      wx.navigateBack({
        delta: 1
      })
    } else {
      // wx.reLaunch({
      //   url: "/pages/index/index"
      // })
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.backToIndex();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // wx.reLaunch({
    //   url: "/pages/index/index"
    // })
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

  }
})