// pages/userCenter/userCenter.js
//获取应用实例
const app = getApp();//获取全局配置
var constant = require('../../utils/constant.js');//获取接口配置文件
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');//腾讯地图
var mapChange = require('../../utils/mapTransform.js');//地图经纬度转换
var requestToken = require('../../utils/requestToken.js');//token交换请求
Page({
  data: {
    userInfo:{},
    userLogo:"../images/logo.png",
    userName:"",
    phoneNumber:"",
    AccountInfo: {
      moneyRechargeTotal: "0",//充值总额
      moneyRemain: "0",//可用余额
      moneySpendTotal: "0"//花费总额
    },
  },
  onLoad: function (options) {//生命周期函数--监听页面加载
    var _this = this;
    
  },
  onReady: function () {//生命周期函数--监听页面初次渲染完成
    var _this = this;
  },
  onShow: function () {//生命周期函数--监听页面显示
    var _this = this;
    var customerId = requestToken.getCustomerId();
    getUserMess();//获取用户信息
    function getUserMess() {//获取用户信息
      if (app.globalData.userInfo) {
        _this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true,
          userLogo: app.globalData.userInfo.avatarUrl,
          userName: app.globalData.userInfo.nickName,
        })
      } else if (_this.data.canIUse) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = res => {
          _this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            userLogo: res.userInfo.avatarUrl,
            userName: res.userInfo.nickName,
          })
        }
      } else {
        // 在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          success: res => {
            app.globalData.userInfo = res.userInfo
            _this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true,
              userLogo: res.userInfo.avatarUrl,
              userName: res.userInfo.nickName,
            })
          }
        })
      }
    }
    getUserBalance();//请求余额信息
    function getUserBalance() {//请求余额信息
      var balanceUrl = constant.getAccountInfo(customerId);
      requestToken.tokenAjaxGet({
        url: balanceUrl,
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            console.log("余额请求成功!");
            if (res.data.status === 1) {
              console.log(res.data);
              _this.setData({
                AccountInfo: res.data.data
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
    _this.setData({
      phoneNumber: wx.getStorageSync("user_phonenumber")
    })
  },
  onHide: function () {//生命周期函数--监听页面隐藏
    var _this = this;
  },
  onUnload: function () {//生命周期函数--监听页面卸载
    var _this = this;
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let that = this;
    let path = 'pages/index/index';
    return {
      title: '壹配送同城物流综合平台',
      path: path,
      imageUrl: "/images/SEO/show_index_banner.png",
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
      }
    }
  },
  //打开功能页面
  openToMyDiscound: function () {//打开我的红包页面
    wx.navigateTo({
      url: "../myDiscount/myDiscount"
    })
  },
  openToLogin: function () {//打开登陆页面重新绑定
    wx.navigateTo({
      url: "../login/login"
    })
  },
  clearStorage:function(){//注销登录
    wx.clearStorage();
    wx.reLaunch({
      url: "../login/login"
    })
  },
  openToOrder: function () {//打开订单页面
    wx.navigateTo({
      url: "../order/order"
    })
  },
  openToRechargeRecord: function () {//打开余额记录
    wx.navigateTo({
      url: "../RechargeRecord/RechargeRecord"
    })
  },
  openToPassword: function () {//打开密码设置页
    wx.navigateTo({
      url: "../setPassword/setPassword"
    })
  },
  openToSEO: function () {//打开我的推广
    var _this= this;
    wx.showLoading({
      title: '数据加载中...',
    })
    var customerId = requestToken.getCustomerId();
    var applyStatus = "NOT_APPLIED";//"ALREADY_IS_BUSINESSMAN"//已通过 'ALREADY_APPLIED'//已申请 'NOT_APPLIED'; //还没有提出申请
    var url = constant.applicationStatusForSEO(customerId);
    requestToken.tokenAjaxGet({
      url: url,
      success(res) {
        console.log(res);
        wx.hideLoading();//停止数据加载
        if (res.statusCode === 200) {
          console.log("请求成功!");
          if (res.data.status === 1) {
            console.log(res.data.data);
            applyStatus = res.data.data;
            if (applyStatus === "ALREADY_IS_BUSINESSMAN") {//已通过
              wx.navigateTo({
                url: "/mySEO/myIndex/myIndex"
              })
            } else if (applyStatus === "ALREADY_APPLIED") {//已申请在审核
              wx.showToast({
                title: '申请仍在审核中,请等待审核结果...',
                icon:"loading"
              })
            } else {//未申请或未通过
              wx.navigateTo({
                url: "/mySEO/openUpIndex/openUpIndex"
              })
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
  openToBalanceRecord: function () {//打开余额充值
    wx.navigateTo({
      url: "../balanceRecord/balanceRecord"
    })
  },
  callToService: function () {//拨打客服电话
    wx.makePhoneCall({
      phoneNumber: "400-0828-929"
    })
  },
})