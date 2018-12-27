// mySEO/openUpIndex/openUpIndex.js
var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
Page({
  data: {
    DefaultCoefficient: {
      "businessmanId": null,//商户ID
      "customerFirstOrderReward": "10.00",//商户下首单优惠
      "customerOrderReward": "0.3",//每单提成奖励
      "senderFirstTaskReward": "10.00",//配送员首单奖励
      "senderTaskReward": "0.3"//每单提成奖励
    },//默认奖励系数
    userName:"",//注册姓名
    chooseCityData: "",//选择的城市数据对象
    isCanBack:false
  },
  onLoad: function (options) {
    
  },
  onReady: function () {
    var _this = this;
  },
  onShow: function () {
    var _this = this;
    wx.showLoading({
      title: '数据加载中...',
    })
    //请求奖励系数
    requestGet();
    function requestGet() {
      var customerId = requestToken.getCustomerId();
      var url = constant.getSEORewardDefault(customerId);
      requestToken.tokenAjaxGet({
        url: url,
        success(res) {
          console.log(res);
          wx.hideLoading();//停止数据加载
          if (res.statusCode === 200) {
            console.log("请求成功!");
            if (res.data.status === 1) {
              console.log(res.data.data);
              _this.setData({
                DefaultCoefficient: res.data.data
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
    _this.changeWrite();//检测输入情况判断返回按钮状态
  },
  bindKeyInput: function (e) {//姓名输入
    var _this = this;
    _this.setData({
      userName: e.detail.value
    })
    _this.changeWrite();//检测输入情况判断返回按钮状态
  },
  changeWrite: function () {//监听输入情况
    var _this = this;
    if (_this.data.userName && _this.data.chooseCityData.city && _this.data.chooseCityData.agentId){
      _this.setData({
        isCanBack:true
      })
    }else{
      _this.setData({
        isCanBack: false
      })
    }
  },
  requestRegister: function () {//点击提交注册业务员
    var _this = this;
    wx.showModal({
      title: '操作提示',
      content: '业务城市一旦确定无法更改,确定提交申请吗？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '数据加载中...',
          })
          requestPost();
        }
      }
    })
    function requestPost(){
      var customerId = requestToken.getCustomerId();
      var url = constant.becomeBusinessMan(customerId);
      var data = {
        "name": _this.data.userName,
        "agentId": _this.data.chooseCityData.agentId,
        "cityName": _this.data.chooseCityData.city
      }
      requestToken.tokenAjaxPost({
        url: url,
        data:data,
        success(res) {
          console.log(res);
          wx.hideLoading();//停止数据加载
          if (res.statusCode === 200) {
            console.log("请求成功!");
            if (res.data.status === 1) {
              console.log(res.data);
              wx.showModal({
                title: '申请成功',
                content: '已经提交申请,请等待审核...',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    _this.backToIndex();
                  }
                }
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
  //打开城市页面选择城市
  openCityList:function(){
    var _this = this;
    wx.navigateTo({
      url: "../openUpCityList/openUpCityList"
    })
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