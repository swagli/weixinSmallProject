// pages/balanceRecord/balanceRecord.js
var app = getApp();
var constant = require('../../utils/constant.js'); //获取接口配置文件
var requestToken = require('../../utils/requestToken.js'); //token交换请求
Page({

  /**
   * 页面的初始数据
   */
  data: {
    numberList: ["10", "30", "50", "100", "300", "500"],//渲染数组
    moneyNumber:"",
    clickNumber:null,//初始化选择为无
    subLoading:false,//提交点击状态
    // openId:"",//微信支付必填字段
    payType:"WXPAY_MINI",//微信小程序支付
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  chooseNumber: function (e) {//快速选择金额
    var _this = this;
    console.log(e.currentTarget.dataset);
    _this.setData({
      clickNumber: e.currentTarget.dataset.index,
      moneyNumber: e.currentTarget.dataset.number
    })
  },
  inputPayNumber:function(e){//自定义输入金额
    var _this = this;
    var getNumber = e.detail.value;
    _this.setData({
      clickNumber:null,
      moneyNumber: getNumber
    })
  },
  wxPayment:function(){//微信支付
    var _this = this;

  },
  clickSubmit:function(){//提交立即支付
    var _this = this;
    _this.setData({
      subLoading:true
    })
    wx.showLoading({
      title: '请求支付中...',
    })
    //判断输入金额是否有效
    if (!_this.data.moneyNumber || _this.data.moneyNumber <= 0){
      wx.showToast({
        title: '请输入有效金额',
        icon:"none"
      })
      setTimeout(function(){
        wx.hideLoading();//关闭加载提示
        _this.setData({
          subLoading: false
        })
      },2000)
      
      return false;
    }
    var customerId = requestToken.getCustomerId();//拿取用户id
    //调用微信登录
    wx.login({
      success(res) {
        console.log("login code:");
        console.log(res);
        if (res.code) {
          var codeId = res.code;//拿到code
          getOpenId(customerId, codeId);//根据code拿取openId
        } else {
          wx.showToast({
            title: "获取微信code失败!"
          })
          _this.setData({
            subLoading: false
          })
        }
      },
      fail() {
        wx.showToast({
          title: "获取微信code失败!"
        })
        setTimeout(function () {
          wx.hideLoading();//关闭加载提示
          _this.setData({
            subLoading: false
          })
        },2000)
      }
    })
    //拿取openId
    //根据code拿取openId
    function getOpenId(customerId, codeId) {
      var getUrl = constant.wxCodeExchangeOpenId(customerId, codeId);
      requestToken.tokenAjaxGet({
        url: getUrl,
        success(res) {
          setTimeout(function () {
            wx.hideLoading();//关闭加载提示
            _this.setData({
              subLoading: false
            })
          },1500)
          console.log(res);
          if (res.statusCode === 200) {
            console.log(res)
            if (res.data.status === 1) {
              console.log(res.data);
              var getOpenId = res.data.data;//拿到openId
              var payAmount = _this.data.moneyNumber;
              wx.navigateTo({//账单预览
                url: "../balanceRecordPreview/balanceRecordPreview?openId=" + getOpenId + "&payAmount=" + payAmount
              })
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

  }
})