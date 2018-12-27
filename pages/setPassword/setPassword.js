var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
Page({
  data: {
    password: "",
    againPassword: "",
    chooseCityData: "",//选择的城市数据对象 name城市名 code 代码
    nullClick: false,
    isCanBack: false
  },
  onLoad: function () {
    var that = this;
    var pages = getCurrentPages();//获取页面栈
  },
  onShow: function () {
    var that = this;
    console.log(requestToken);
    that.watchInput();
  },
  inputPassword: function (e) {//获取密码
    var that = this;
    var password = e.detail.value.trim();
    that.setData({
      password: password
    })
    that.watchInput();
  },
  inputagainPassword: function (e) {//重复密码
    var that = this;
    var againPassword = e.detail.value.trim();
    that.setData({
      againPassword: againPassword
    })
    that.watchInput();
  },
  testpassword: function () {//验证密码
    var that = this;
    var password = that.data.password.trim();
    var againPassword = that.data.againPassword.trim();
    if (!password || !againPassword) {
      return false
    }
    var isPass = /^[0-9a-zA-Z]+$/;//字母或数字
    if (isPass.test(password) && isPass.test(password)) {
      console.log("可以用!");
      if (password === againPassword){
        return true;
      }else{
        wx.showToast({
          title: "两次密码输入不一致!",
          icon: "none",
          duration: 1500,
          mask: false,
          success: function (res) { console.log(res); }
        })
        return false
      }
      
    } else if (!isPass.test(password)){
      wx.showToast({
        title: "密码格式不正确!",
        icon: "none",
        duration: 1500,
        mask: false,
        success: function (res) { console.log(res); }
      })
      return false;
    }
  },
  watchInput:function(){
    var _this = this;
    if (_this.data.password && _this.data.againPassword && _this.data.chooseCityData.code){
      _this.setData({
        isCanBack: true
      })
    }else{
      _this.setData({
        isCanBack: false
      })
    }
  },
  openCityList:function(){//打开城市列表
    wx.navigateTo({
      url: "/pages/openCityList/openCityList"
    })
  },
  submitLogin: function () {//确定 设置密码
    var that = this;
    if (!that.data.password) {
      wx.showToast({
        title: "密码不能为空!",
        icon: "none",
        duration: 1500,
        mask: false,
        success: function (res) { console.log(res); }
      })
      return false;
    }
    if (!that.data.password) {
      wx.showToast({
        title: "密码不能为空!",
        icon: "none",
        duration: 1500,
        mask: false,
        success: function (res) { console.log(res); }
      })
      return false;
    }
    if (!that.data.againPassword) {
      wx.showToast({
        title: "请填写重复密码!",
        icon: "none",
        duration: 1500,
        mask: false,
        success: function (res) { console.log(res); }
      })
      return false;
    }
    that.testpassword();
    if (!that.testpassword()) {
      return false;
    }
    //请求登陆
    that.setData({ isCanBack: false });
    wx.showLoading({
      title: "正在设置",
    })
    var customerId = requestToken.getCustomerId();
    var url = constant.setPassword(customerId);
    
    var data = {
      "password": that.data.password,
      "againPassword": that.data.againPassword,
      "cityCode": that.data.chooseCityData.code,
    };
    console.log("数据");
    console.log(url);
    console.log(data);
    requestToken.tokenAjaxPost({
      url: url,
      data: data,
      success(res) {
        console.log(res);
        wx.hideLoading();//停止数据加载
        if (res.statusCode === 200) {
          console.log("请求成功!");
          if (res.data.status === 1) {
            console.log(res.data.data);
            wx.showToast({
              title: '设置成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(function(){
              gotoIndex();
            },1000)
            
          } else {
            requestToken.resError(res.data.msg);
          }
        } else {
          requestToken.httpError(res.statusCode, 0);
        }
      }
    })
    function gotoIndex() {//跳转至首页面
      var pagesNumber = getCurrentPages();//获取页面栈
      if (pagesNumber.length > 1) {
        wx.navigateBack({
          delta: 1
        })
      } else {
        wx.reLaunch({
          url: "../index/index"
        })
      }
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