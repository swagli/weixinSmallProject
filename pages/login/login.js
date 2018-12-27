var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
Page({
  data: {
    phonenumber:"",
    smsCode:"",
    password:"",
    codeNumber:60,
    nullClick:false,
    isCanBack:true
  },
  onLoad: function () {
    var that = this;
    var pages = getCurrentPages();//获取页面栈
  },
  onShow: function () {
    var that = this;
    console.log(requestToken);
  },
  inputCodeNumber:function(e){//数去焦点 获取手机号码
    var that = this;
    var smsCode = e.detail.value.trim();
    that.setData({
      smsCode: smsCode
    })
  },
  inputPhoneNumber: function (e) {//数去焦点 获取验证码
    var that = this;
    var phonenumber = e.detail.value.trim();
    that.setData({
        phonenumber: phonenumber
    })
  },
  testPhoneNumber: function () {
    var that = this;
    var phoneNumberTest = that.data.phonenumber.trim();
    if (!phoneNumberTest) {
      return false
    }
    var isMob = /^((\+?86)|(\(\+86\)))?(1[0-9]{10})$/;//手机号码
    // var isMob = /^((\+?86)|(\(\+86\)))?(13[0-9][0-9]{8}|15[0-9][0-9]{8}|16[0-9][0-9]{8}|17[0-9][0-9]{8}|18[0-9][0-9]{8}|147[0-9]{8}|1349[0-9]{7})$/;
    if (isMob.test(phoneNumberTest)) {
      console.log("可以用!");
      return true;
    } else {
      wx.showToast({
        title: "手机号码格式不正确!",
        icon: "none",
        duration: 1500,
        mask: false,
        success: function (res) { console.log(res); }
      })
      return false;
    }
  },
  getSmsCode:function(){
    var that = this;
    if (!that.data.phonenumber){
      wx.showToast({
        title:"手机号码不能为空!",
        icon:"none",
        duration:1500,
        mask:false,
        success:function(res){console.log(res);}
      })
      return false;
    }
    that.testPhoneNumber();
    if (!that.testPhoneNumber()){
      return false;
    }
    var timer = null;
    var timeNumber = 60;
    getCode();
    that.setData({
      nullClick: true,
      codeNumber: timeNumber
    })
    timer = setInterval(function(){
      if(timeNumber > 1){
        timeNumber--;
        that.setData({
          codeNumber: timeNumber
        })
        return
      }else{
        timeNumber = 60;
        clearInterval(timer);
        that.setData({
          nullClick:false,
          codeNumber: timeNumber
        })
      }
    },1000)
    function getCode(){
      var url = constant.API_LOGIN_SMS;
        wx.request({
          url: url,
          data: {
            phonenumber: that.data.phonenumber,
          },
          method: 'POST',
          header: { 'content-type': 'application/json' },
          success: function (res) {
            console.log("请求成功");
            console.log(res);
          },
          fail: function (res) {
            console.log("请求失败");
            console.log(res);
          }
        })
    }
  },
  test: function () {//登陆测试( 没用)
    var that = this;
    wx.login({
      success:function(res){
        console.log(res);
      }
    })
  },
  submitLogin:function(){//登陆
    var that = this;
    if (!that.data.phonenumber) {
      wx.showToast({
        title: "手机号码不能为空!",
        icon: "none",
        duration: 1500,
        mask: false,
        success: function (res) { console.log(res); }
      })
      return false;
    }
    if (!that.data.smsCode) {
      wx.showToast({
        title: "验证码不能为空!",
        icon: "none",
        duration: 1500,
        mask: false,
        success: function (res) { console.log(res); }
      })
      return false;
    }
    that.testPhoneNumber();
    if (!that.testPhoneNumber()) {
      return false;
    }
    //请求登陆
    that.setData({ isCanBack: false});
    wx.showLoading({
      title	:"正在登陆...",
    })
    var url = constant.API_SMS_LOGIN;
    wx.request({
      url: url,
      data: {
        phonenumber: that.data.phonenumber,
        smsCode: that.data.smsCode
      },
      method: 'POST',
      header: { 'content-type': 'application/json' },
      success: function (res) {
        that.setData({ isCanBack: true });
        // wx.hideLoading({
        //   title: "",
        // })
        if (res.data.status === 1){
          console.log(res.data.data);
          try{//塞token id
            wx.setStorageSync('customerId', res.data.data.customerId);
            requestToken.saveToken(res.data.data.tokenObject);
          } catch(e){
            console.log(e);
          }
          wx.setStorageSync("user_phonenumber", that.data.phonenumber);
          setTimeout(function () {
            gotoIndex();
            wx.hideLoading();
          },1000)
        }else{
          wx.showToast({
            title: JSON.stringify(res.data.msg),
            icon: "none",
            duration: 1500,
          })
        }
      },
      fail: function (res) {
        that.setData({ isCanBack: true });
        console.log("请求失败" + JSON.stringify(res));
      }
    })
    function gotoIndex (){//跳转至首页面
      var pagesNumber = getCurrentPages();//获取页面栈
      wx.reLaunch({
        url: "../index/index"
      })
      // if (pagesNumber.length > 1) {
      //   wx.navigateBack({
      //     delta: 1
      //   })
      // } else {
      //   wx.redirectTo({
      //     url: "../index/index"
      //   })
      // }
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  getUserInfos:function(){
    var _this = this;
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let that = this;
    // let return_url = ctxPath + "/agent/views/businessmanSpread.html";
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
  }
})