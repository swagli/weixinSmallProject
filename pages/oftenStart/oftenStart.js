var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
var mapChange = require('../../utils/mapTransform.js');//地图经纬度转换
var nowPageIndex = 0;
var nowPageSize = 6;
Page({
  data: {
    oftenListArr:[],//储存数据
    requestType:""
  },
  onLoad: function (option) {
    var _this = this;
    console.log("load");
    console.log(option.type);
    _this.setData({
      requestType: option.type
    })
    if (option.type == 'oftenStart'){
      wx.setNavigationBarTitle({
        title: '常用发件地址'
      })
    }else{
      wx.setNavigationBarTitle({
        title: '常用收件地址'
      })
    }
  },
  onShow: function () {
    var that = this;
    console.log("onShow");
    that.onPullDownRefresh();
  },
  onReady: function () {
    var that = this;
    console.log("ready");
  },
  aaa:function(){
      console.log("1");
  },
  onPullDownRefresh:function(){//下拉刷新数据
    var _this = this;
    var customerId = requestToken.getCustomerId();
    nowPageIndex = 0;
    _this.getOftenLIst(customerId, 0, nowPageSize);
    console.log(nowPageIndex + "/" + nowPageSize);
  },
  onReachBottom: function () {//上拉加载更多
    var _this = this;
    var customerId = requestToken.getCustomerId();
    nowPageIndex++;
    wx.showLoading({
      title: '数据加载中...',
    })
    _this.getOftenLIst(customerId, nowPageIndex, nowPageSize);
  },
  getOftenLIst: function (customerId, pageIndex, pageSize){//获取常用地址列表
    var _this = this;
    console.log(pageIndex + "*/*" + pageSize);
    var url = "";
    if (_this.data.requestType == 'oftenStart'){
      url = constant.getStarterAddressUrl(customerId, pageIndex, pageSize);
    } else if (_this.data.requestType == 'oftenReceive'){
      url = constant.getReceiverAddressUrl(customerId, pageIndex, pageSize);
    }else{
      wx.showToast({
        title: '页面出错了',
        icon: 'none',
      })
      return
    }
    //请求数据
    requestToken.tokenAjaxPost({
      url: url,
      data:{},
      success(res) {
        console.log(res);
        wx.stopPullDownRefresh();//停止下拉刷新
        wx.hideLoading();//停止数据加载
        if (res.statusCode === 200) {
          if (res.data.status === 1) {
            // console.log(res.data);
            if (pageIndex == 0){
              _this.setData({
                oftenListArr: res.data.data
              })
              console.log(_this.data.oftenListArr);
              return
            }
            if (pageIndex > 0){
              if (res.data.data.length == 0){
                wx.showToast({
                  title: '没有更多数据了!',
                  icon: "none"
                })
              }else{
                var tempArr = [];
                tempArr = _this.data.oftenListArr.concat(res.data.data);
                _this.setData({
                  oftenListArr: tempArr
                })
              }
              return
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
  chooseLocationStart:function(e){//选择并使用
    var that = this;
    console.log(e.currentTarget.dataset.location);
    var location = e.currentTarget.dataset.location.starter;
    var changePoint = mapChange.bd09togcj02(location.longitude, location.latitude);//百度转腾讯
    if (location){
      app.globalData.orderMessageArr.starter.name = location.name;
      app.globalData.orderMessageArr.starter.phonenumber = location.phonenumber;
      app.globalData.orderMessageArr.starter.addressName = location.addressName;
      app.globalData.orderMessageArr.starter.addressDetail = location.addressDetail;
      app.globalData.orderMessageArr.starter.longitude = location.longitude;
      app.globalData.orderMessageArr.starter.latitude = location.latitude;
      app.globalData.orderMessageArr.starter.poiName = location.poiName;
      app.globalData.orderMessageArr.starter.Txlongitude = changePoint[0];
      app.globalData.orderMessageArr.starter.Txlatitude = changePoint[1];
    }
    app.globalData.saveMessages.saveStartInfo = false;
    app.globalData.oftenClickBack.clickStartInfo = true;
    that.backToIndex();
  },
  chooseLocationReceive: function (e) {//选择并使用
    var that = this;
    console.log(e.currentTarget.dataset.location);
    var location = e.currentTarget.dataset.location.receiver;
    var changePoint = mapChange.bd09togcj02(location.longitude, location.latitude);//百度转腾讯
    if (location) {
      app.globalData.orderMessageArr.receiver.name = location.name;
      app.globalData.orderMessageArr.receiver.phonenumber = location.phonenumber;
      app.globalData.orderMessageArr.receiver.addressName = location.addressName;
      app.globalData.orderMessageArr.receiver.addressDetail = location.addressDetail;
      app.globalData.orderMessageArr.receiver.longitude = location.longitude;
      app.globalData.orderMessageArr.receiver.latitude = location.latitude;
      app.globalData.orderMessageArr.receiver.poiName = location.poiName;
      app.globalData.orderMessageArr.receiver.Txlongitude = changePoint[0];
      app.globalData.orderMessageArr.receiver.Txlatitude = changePoint[1];
    }
    app.globalData.saveMessages.saveReceiveInfo = false;
    app.globalData.oftenClickBack.clickReceiveInfo = true;
    that.backToIndex();
  },
  setDefault: function (e) {//设置默认发件地址
    var _this = this;
    console.log(e.currentTarget.dataset);
    var defaultId = e.currentTarget.dataset.defaultid;
    // var defaultIndex = e.currentTarget.dataset.defaultindex;
    if (defaultId) {
      var customerId = requestToken.getCustomerId();
      var url = constant.addOrEditDefaultStarter(customerId, defaultId);
      //请求数据
      requestToken.tokenAjaxPost({
        url: url,
        data: {},
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            console.log("请求成功!");
            if (res.data.status === 1) {
              wx.showToast({
                title: '设置默认成功',
                icon: 'none',
                duration:2000
              })
              _this.getOftenLIst(customerId, nowPageIndex, nowPageSize);//刷新数据
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
  deleteOneData: function (e) {
    var _this = this;
    console.log(e.currentTarget.dataset);
    var deleteId = e.currentTarget.dataset.deleteid;
    var deleteIndex = e.currentTarget.dataset.deleteindex;
    wx.showModal({
      title: '你正在删除信息',
      content: '确定删除该地址记录吗?',
      success: function (res) {
        if (res.confirm) {
          deleRequest(); //请求删除
        } else {
          // console.log('用户点击取消')
        }

      }
    })
    function deleRequest() {//请求删除
      if (deleteId) {
        var customerId = requestToken.getCustomerId();
        var url = "";
        if (_this.data.requestType == "oftenStart"){
          url = constant.API_URL_POST_DELETE_STARTER_ADDRESS + deleteId;
        }else if (_this.data.requestType == "oftenReceive") {
          url = constant.API_URL_POST_DELETE_RECEIVER_ADDRESS + deleteId;
        };
        //请求数据
        requestToken.tokenAjaxPost({
          url: url,
          data: {
            "addressId": deleteId
          },
          success(res) {
            console.log(res);
            if (res.statusCode === 200) {
              if (res.data.status === 1) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'none',
                })
                var deleList = _this.data.oftenListArr;
                deleList.splice(deleteIndex, 1);
                _this.setData({
                  oftenListArr: deleList
                })
                //_this.getOftenLIst(customerId, nowPageIndex, nowPageSize);//刷新数据
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
  backToIndex : function() {//返回首页
    var that = this;
    var pagesNumber = getCurrentPages();//获取页面栈
    if (pagesNumber.length > 1) {
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.navigateTo({
        url: "../index/index"
      })
    }
  }
})