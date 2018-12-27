var app = getApp();
var constant = require('../../utils/constant.js'); //获取接口配置文件
var requestToken = require('../../utils/requestToken.js'); //token交换请求
var timer = null;
Page({
  data: {
    openId:"",//支付签名等字段
    payAmount:0,//充值金额
    payType: "WXPAY_MINI",//微信小程序支付
    successPay: false, //付款成功? false未成功
    successCancel:false,//取消成功?
    //定时器
    minutes: 9, //分
    second: 59 //秒
  },
  onLoad: function(options) { //onLoad(1)
    var _this = this;
    console.log("接收参数");
    console.log(options);
    _this.getOrderMes(options); //设置数据渲染
    _this.setData({
      openId: options.openId,
      payAmount: options.payAmount
    })
  },
  onShow: function() { //onShow(2)
    var _this = this;
  },
  onReady: function() { //onReady(3)
    var _this = this;
  },
  getOrderMes: function(messages) { //获取订单预览信息
    var _this = this;
    var acceptMes = messages.openId;
    console.log(acceptMes);
    (function() { //倒计时取消未支付订单定时器
      clearInterval(timer);
      var minutes = _this.data.minutes;
      var second = _this.data.second;
      timer = setInterval(function() {
        if (second > 0) {
          second--;
        } else if (second == 0 && minutes > 0) {
          second = 59;
          minutes--;
        } else {
          second = 0;
          minutes = 0;
          clearInterval(timer);
          _this.autoCancelOrder();//自动取消订单
          setTimeout(function () {//返回首页
            _this.backToIndex();
          }, 1000)
        }
        _this.setData({
          minutes: minutes,
          second: checkTime(second)
        })
      }, 1000)

      function checkTime(i) {
        if (i < 10) {
          i = "0" + i;
        }
        return i;
      };
    })()
    // return
    if (acceptMes) {
      // tempArr.distance = (tempArr.distance / 1000).toFixed(2);
      // _this.setData({
      //   orderArr: tempArr,
      //   orderId: tempArr.id
      // })
      return
    } else {
      _this.backToIndex();
      return
    }
  },
  //微信支付
  wxPayment:function(){
    var _this = this;
    wx.showLoading({
      title: '支付中...',
    })
    var customerId = requestToken.getCustomerId();
    var openId = _this.data.openId;
    if (!openId) {
      wx.showToast({
        title: "请求出错了,请检查原因!"
      })
      return false;
    }
    //创建微信支付账单
    creadeWxPay(customerId);
    function creadeWxPay(customerId) {//执行创建订单
      //根据类型创建不同类型的订单账单
      var data = {
        "openId": _this.data.openId,
        "payAmount": _this.data.payAmount,
        "payType": _this.data.payType//微信小程序支付
      };
      var creatUrl = constant.createRechargeBill(customerId);
      requestToken.tokenAjaxPost({
        url: creatUrl,
        data: data,
        success(res) {
          _this.setData({//提交按钮可点击
            subLoading: false
          })
          wx.hideLoading();//停止数据加载
          console.log(res);
          if (res.statusCode === 200) {
            if (res.data.status === 1) {
              console.log(res.data.data);
              console.log("success");
              startWxpay(res.data.data);
            } else {
              requestToken.resError(res.data.msg);
            }
          } else {
            requestToken.httpError(res.statusCode, 0);
          }
        }
      })
    }
    function startWxpay(signData){
      var signData = signData;
      //调起微信支付账单
      wx.requestPayment({
        timeStamp: signData.timeStamp,
        nonceStr: signData.nonceStr,
        package: signData.package,
        signType: signData.signType,
        paySign: signData.paySign,
        success(res) {
          wx.hideLoading();//关闭加载提示
          console.log(res);
          wx.showToast({
            title: "支付成功",
            icon: "success",
            duration: 5000
          })

          _this.setData({
            successPay: true,
            successCancel: false
          })

          setTimeout(function () {
            // wx.navigateTo({
            //   url: "../RechargeRecord/RechargeRecord"
            // })
          }, 1000)
          clearInterval(timer);
        },
        fail(res) {
          wx.showLoading({
            title: '您已关闭支付!',
          })
          setTimeout(function () {
            wx.hideLoading();//关闭加载提示
          }, 2000);
          console.log("微信支付已取消!");
          console.log(res);
        }
      })
    }
    
  },
  isCancelOrder: function () {//取消订单
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '确定放弃支付该订单?',
      success: function (res) {
        if (res.confirm) {
          // wx.showLoading({
          //   title: '数据加载中...',
          // })
          _this.backToIndex(); //返回首页
        } else {
          // console.log('用户点击取消')
        }
      }
    })
  },
  backToIndex: function() { //返回首页
    var _this = this;
    var pagesNumber = getCurrentPages(); //获取页面栈
    wx.reLaunch({
      url: "../index/index"
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    // clearInterval(timer);
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(timer);
    var _this = this;
  }
})