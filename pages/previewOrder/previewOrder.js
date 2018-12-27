var app = getApp();
var constant = require('../../utils/constant.js'); //获取接口配置文件
var requestToken = require('../../utils/requestToken.js'); //token交换请求
var timer = null;
Page({
  data: {
    AccountInfo: {
      moneyRechargeTotal: "0", //充值总额
      moneyRemain: "0", //可用余额
      moneySpendTotal: "0", //花费总额
      priceAdditional:0//加价
    },
    //预览信息
    orderArr: {},
    orderId: "",
    orderType: "",
    payType: null,
    payMode: null,
    successPay: false, //付款成功? false未成功
    successCancel:false,//取消成功?
    //定时器
    minutes: 9, //分
    second: 59 //秒
  },
  onLoad: function(options) { //onLoad(1)
    var _this = this;
    //获得modeldialog组件
    _this.dialog = _this.selectComponent("#dialog");
    console.log("接收参数");
    console.log(options);

    _this.getOrderMes(options.creadeOrderInfo); //设置渲染
    var payType = options.payType;
    var payMode = options.payMode;
    if (!payType || payType=='null'){
      payType = null;
      if (payMode == 'ArrivalPay'){
        _this.setData({
          successPay:true//到付订单 无需支付
        })
      }
    }
    if (!payMode || payMode == 'null') {
      payMode = null;
    }
    _this.setData({
      orderType: constant.changeOrderStatus(options.orderType),
      payType: payType,
      payMode: payMode,
    })
  },
  onShow: function() { //onShow(2)
    var _this = this;
    //如果是余额支付 自动调起自定义支付框
    // if (_this.data.payType == 'CUSTOMER_RECHARGE'){
    //   setTimeout(function () {
    //     _this.showDialog();
    //   }, 1500)
    //   return
    // }

    //如果微信支付 自动调起微信支付框(不用 存在二次调起BUG)
    // if (_this.data.payType == 'WXPAY_MINI'){
    //   setTimeout(function () {
    //     _this.wxPayment();
    //   }, 1000)
    //   return
    // }
  },
  onReady: function() { //onReady(3)
    var _this = this;
    var orderId = _this.data.orderId;
    if (_this.data.payType == 'CUSTOMER_RECHARGE') {
      getUserBalance();//请求余额信息 用于比对余额是否满足支付要求
      return
    }
    function getUserBalance() { //请求余额信息
      var customerId = requestToken.getCustomerId();
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
    // var timer = null;
    // clearInterval(timer);
    // timer = setInterval(function(){
    //   _this.getOrderMes(orderId);
    // },10000)
  },
  getOrderMes: function(messages) { //获取订单预览信息
    var _this = this;
    app.globalData.orderMessageArr.couponId = null;//红包清空
    app.globalData.orderMessageArr.couponNumber = null;//红包清空
    app.globalData.orderMessageArr.couponPre = null;//红包清空
    var priceAdditional = app.globalData.orderMessageArr.priceAdditional;
    if (priceAdditional && !isNaN(priceAdditional)){
      _this.setData({
        priceAdditional: priceAdditional
      })
    }
    
    var acceptMes = JSON.parse(messages);
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
      var tempArr = acceptMes;
      tempArr.orderStatus = constant.orderAllStatusChange(tempArr.orderStatus); //转换状态
      tempArr.orderType = constant.changeOrderStatus(tempArr.orderType); //转换类型
      tempArr.item.size = constant.sizeChange(tempArr.item.size); //转换类型
      tempArr.vehicle = constant.vehChange(tempArr.vehicle); //转换类型
      tempArr.createTime = constant.changeDetaTime(tempArr.createTime);
      tempArr.fetchTime = constant.changeDetaTime(tempArr.fetchTime);
      tempArr.sendTime = constant.changeDetaTime(tempArr.sendTime);
      tempArr.distance = (tempArr.distance / 1000).toFixed(2);
      _this.setData({
        orderArr: tempArr,
        orderId: tempArr.id
      })
      return
    } else {
      _this.backToIndex();
      return
    }
  },
  //余额支付
  balancePay: function() {
    var _this = this;
    wx.showLoading({
      title: '支付中...',
    })
    var customerId = requestToken.getCustomerId();
    var orderId = _this.data.orderId;
    if (!orderId) {
      wx.showToast({
        title: "出错了,请返回重新下单!"
      })
      return false;
    }
    var balanceUrl = constant.seeRechargeBillMess(customerId, orderId);
    requestToken.tokenAjaxGet({
      url: balanceUrl,
      success(res) {
        console.log(res);
        if (res.statusCode === 200) {
          console.log("请求Bill...!");
          console.log(res.data.data.id);
          if (res.data.status === 1) {
            var billId = res.data.data.id;
            var billUrl = constant.useRechargeToPayBill(customerId, billId);
            //支付账单
            requestToken.tokenAjaxPost({
              url: billUrl,
              data: {},
              success(res) {
                console.log("请求支付...");
                console.log(res);
                if (res.statusCode === 200) {
                  if (res.data.status === 1) {
                    clearInterval(timer);
                    _this.setData({
                      successPay: true,
                      successCancel: false
                    })
                    wx.hideLoading();
                    wx.showToast({
                      title: "支付成功",
                      icon: "success",
                      duration:10000
                    })
                    
                    setTimeout(function() {
                      wx.navigateTo({
                        url: "../order/order"
                      })
                    }, 1000)
                    
                  } else {
                    requestToken.resError(res.data.msg);
                  }
                } else {
                  requestToken.httpError(res.statusCode, 0);
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
  },
  //微信支付
  wxPayment:function(){
    var _this = this;
    wx.showLoading({
      title: '支付中...',
    })
    var customerId = requestToken.getCustomerId();
    var orderId = _this.data.orderId;
    if (!orderId) {
      wx.showToast({
        title: "出错了,请返回重新下单!"
      })
      return false;
    }
    var payUrl = constant.seeWxjsapiBillMess(customerId, orderId);
    requestToken.tokenAjaxGet({
      url: payUrl,
      success(res) {
        console.log(res);
        if (res.statusCode === 200) {
          console.log("请求Bill...!");
          console.log(res.data.data);
          if (res.data.status === 1) {
            var signData = res.data.data;
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
                  duration: 10000
                })
                
                _this.setData({
                  successPay: true,
                  successCancel: false
                })
                
                setTimeout(function () {
                  wx.navigateTo({
                    url: "../order/order"
                  })
                }, 1000)
                clearInterval(timer);
              },
              fail(res) {
                wx.showLoading({
                  title: '您已关闭支付!',
                })
                setTimeout(function(){
                  wx.hideLoading();//关闭加载提示
                },2000);
                console.log("微信支付已取消!");
                console.log(res);
              }
            })
          return true
          } else {
            requestToken.resError(res.data.msg);
            return false
          }
        } else {
          requestToken.httpError(res.statusCode, 0);
          return false
        }
      }
    })
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
          _this.sureCancelOrder(); //请求取消
        } else {
          // console.log('用户点击取消')
        }
      }
    })
  },
  sureCancelOrder:function(){
    var _this = this;
    var orderId = _this.data.orderId;
    var customerId = requestToken.getCustomerId();
    isCanRequest();
    function isCanRequest() {
      if (orderId) {
        var url = constant.API_URL_POST_CANCEL_ORDER + orderId + "/" + customerId;
        requestToken.tokenAjaxPost({
          url: url,
          data: {},
          success(res) {
            console.log(res);
            wx.hideLoading();//停止数据加载
            if (res.statusCode === 200) {
              if (res.data.status === 1) {
                wx.showToast({
                  title: '已取消支付!',
                  icon: "none"
                })
                _this.setData({
                  successPay:false,
                  successCancel:true
                })
                if (_this.data.successCancel && !_this.data.successPay){
                  setTimeout(function () {
                    wx.reLaunch({
                      url: "../index/index"
                    })
                  }, 1000)
                }
              } else {
                requestToken.resError(res.data.msg);
              }
            } else {
              requestToken.httpError(res.statusCode, 0);
            }
          }
        })
      }
    }
  },
  backToIndex: function() { //返回首页
    var _this = this;
    _this.hideDialog();
    var pagesNumber = getCurrentPages(); //获取页面栈
    if (pagesNumber.length > 1) {
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.reLaunch({
        url: "../index/index"
      })
    }
  },
  autoCancelOrder:function(){
    var _this = this;
    if (!_this.data.successPay && !_this.data.successCancel) {
      var orderId = _this.data.orderId;
      var customerId = requestToken.getCustomerId();
      isCanRequest();
      function isCanRequest() {
        if (orderId) {
          var url = constant.API_URL_POST_CANCEL_ORDER + orderId + "/" + customerId;
          requestToken.tokenAjaxPost({
            url: url,
            data: {},
            success(res) {
              console.log(res);
              wx.hideLoading();//停止数据加载
              if (res.statusCode === 200) {
                if (res.data.status === 1) {
                  wx.showToast({
                    title: '已取消支付!',
                    icon: "none"
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
      }
    }
  },
  openToRecharge: function () {//打开余额充值
    wx.navigateTo({
      url: "../balanceRecord/balanceRecord"
    })
  },
  seeOrder:function(){
    wx.navigateTo({
      url: "../order/order"
    })
  },
  /**自定义弹窗 及事件*/
  showDialog() {
    this.dialog.showDialog();
  },
  hideDialog() {
    this.dialog.hideDialog();
  },
  //取消事件
  _cancelEvent() {
    console.log('你点击了取消');
    this.dialog.hideDialog();
  },
  //确认事件
  _confirmEvent() {
    var _this = this;
    _this.dialog.hideDialog();
    _this.balancePay();
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
    _this.autoCancelOrder();//自动取消订单
  }
})