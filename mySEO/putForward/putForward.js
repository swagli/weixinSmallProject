// mySEO/putForward/putForward.js
var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
Page({
  data: {
    PutForwardApplyMes: {//提现字段
      "amount": "",
      "drawInfoName": "",
      "drawInfoCard": ""
    },
    words:"确认提现",
    moneyRemain:0.00,//可提现余额
    isCanBack:false,//提现按钮
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
  surePutForward:function(){
    var _this = this;
    var testAmount = Number(_this.data.PutForwardApplyMes.amount);
    console.log(_this.data.PutForwardApplyMes);
    console.log(testAmount);
    if (testAmount > _this.data.moneyRemain){
      wx.showModal({
        title: '余额不足',
        content: '余额不足无法提现,请检查提现金额!',
        showCancel:false,
      })
      return false;
    }
    if (!testAmount) {
      wx.showToast({
        title: '请输入有效金额！',
        icon: "none"
      })
      return false;
    }
    //请求提现
    wx.showLoading({
      title: '数据加载中...',
    })
    putForwardPost();
    function putForwardPost (){
      var customerId = requestToken.getCustomerId();
      var url = constant.postDraws(customerId);
      var amount = _this.data.PutForwardApplyMes.amount.trim();
      var drawInfoCard = _this.data.PutForwardApplyMes.drawInfoCard.replace(/\s|\xA0/g, "");
      var data = {
        "amount": amount,
        "drawInfo": "开户行: " + _this.data.PutForwardApplyMes.drawInfoName + ", 卡号:" + drawInfoCard
      }
      console.log(data);
      requestToken.tokenAjaxPost({
        url: url,
        data:data,
        success(res) {
          console.log(res);
          wx.hideLoading();//停止数据加载
          if (res.statusCode === 200) {
            console.log("申请成功!");
            if (res.data.status === 1) {
              wx.showModal({
                title: '申请成功',
                content: '申请已提交,请在申请记录中查看申请结果!',
                cancelText:"返回",
                confirmText:"查看记录",
                success(res){
                  if (res.confirm) {//用户点击确定
                    console.log('用户点击确定')
                  } else if (res.cancel) {//用户点击取消
                    console.log('用户点击取消')
                    _this.backToIndex();//返回上一页
                  }
                }
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
  allPut:function(){//点击全部提现
    var _this = this;
    var amount = "PutForwardApplyMes.amount";
    _this.setData({
      [amount]: _this.data.moneyRemain
    })
    _this.changeWrite();//监听输入情况
  },
  getDrawInfoName:function(e){
    var _this = this;
    var drawInfoName = "PutForwardApplyMes.drawInfoName";
    _this.setData({
      [drawInfoName]: e.detail.value
    })
    _this.changeWrite();//监听输入情况
  },
  getDrawInfoCard: function (e) {
    var _this = this;
    var card = e.detail.value;
    var drawInfoCard = "PutForwardApplyMes.drawInfoCard";
    card = card.replace(/\s/g, '').replace(/[^\d]/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    _this.setData({
      [drawInfoCard]: card
    })
    _this.changeWrite();//监听输入情况
  },
  getAmount: function (e) {
    var _this = this;
    var amount = "PutForwardApplyMes.amount";
    _this.setData({
      [amount]: e.detail.value
    })
    _this.changeWrite();//监听输入情况
  },
  changeWrite: function () {//检测输入情况判断返回按钮状态
    var _this = this;
    if (!_this.data.PutForwardApplyMes.drawInfoName || !_this.data.PutForwardApplyMes.drawInfoCard || !_this.data.PutForwardApplyMes.amount) {
      _this.setData({
        isCanBack: false
      })
    } else {
      _this.setData({
        isCanBack: true
      })
    }
  },
  openToPutForward_record: function () {
    wx.navigateTo({
      url: "/mySEO/putForwardRecord/putForwardRecord"
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})