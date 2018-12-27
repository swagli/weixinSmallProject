var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
var mapChange = require('../../utils/mapTransform.js');//地图经纬度转换
var nowPageIndex = 0;
var nowPageSize = 10;
Page({
  data: {
    oftenListArr:[],//储存数据
  },
  onLoad: function (option) {
    var _this = this;
    console.log("load");
    console.log(option);
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
    var url = constant.getItemList(customerId, pageIndex, pageSize);
    //请求数据
    requestToken.tokenAjaxGet({
      url: url,
      success(res) {
        console.log(res);
        wx.stopPullDownRefresh();//停止下拉刷新
        wx.hideLoading();//停止数据加载
        if (res.statusCode === 200) {
          console.log("请求成功!");
          if (res.data.status === 1) {
            console.log(res.data);
            if (pageIndex == 0){
              console.log("1");
              _this.setData({
                oftenListArr: res.data.data
              })
              console.log(_this.data.oftenListArr);
              return
            }
            if (pageIndex > 0){
              console.log("2");
              if (res.data.data.length == 0){
                wx.showToast({
                  title: '没有更多数据了!',
                  icon: "none"
                })
              }else{
                var tempArr = [];
                console.log(tempArr);
                tempArr = _this.data.oftenListArr.concat(res.data.data);
                _this.setData({
                  oftenListArr: tempArr
                })
                console.log(tempArr);
                console.log(_this.data.oftenListArr);
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
  chooseItemList:function(e){//选择并使用
    var that = this;
    // console.log(e.currentTarget.dataset.datalist);
    var datalist = e.currentTarget.dataset.datalist.item;
    if (datalist){
      app.globalData.orderMessageArr.item.name = datalist.itemName;
      app.globalData.orderMessageArr.item.type = datalist.itemType;
      app.globalData.orderMessageArr.item.size = datalist.itemSize;
      app.globalData.orderMessageArr.item.sizeValue = constant.sizeChange(datalist.itemSize);
      app.globalData.orderMessageArr.item.weight = datalist.itemWeight;
      app.globalData.orderMessageArr.vehicle = e.currentTarget.dataset.datalist.vehicle;
      app.globalData.orderMessageArr.item.vehicleVal = constant.vehChange(e.currentTarget.dataset.datalist.vehicle);
      app.globalData.orderMessageArr.item.remark = datalist.itemRemark;
      app.globalData.orderMessageArr.item.itemTypeIndex = null;
      app.globalData.orderMessageArr.item.itemSizeIndex = null;
      app.globalData.orderMessageArr.item.itemVehicleIndex = null;
    }
    app.globalData.saveMessages.saveItemInfo = false;
    app.globalData.oftenClickBack.clickItemInfo = true;
    that.backToIndex();
  },
  setDefault:function(e){
    var _this = this;
    console.log(e.currentTarget.dataset);
    var defaultId = e.currentTarget.dataset.defaultid;
    if (defaultId){
      var customerId = requestToken.getCustomerId();
      var url = constant.addOrEditDefaultItem(customerId, defaultId);
      //请求数据
      requestToken.tokenAjaxPost({
        url: url,
        data:{},
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            console.log("请求成功!");
            if (res.data.status === 1) {
              wx.showToast({
                title: '设置默认成功',
                icon: 'none',
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
  deleteOneData:function(e){
    var _this = this;
    console.log(e.currentTarget.dataset);
    var deleteId = e.currentTarget.dataset.deleteid;
    var deleteIndex = e.currentTarget.dataset.deleteindex;
    wx.showModal({
      title: '你正在删除信息',
      content: '确定删除该物品记录吗?',
      success: function (res) {
        if (res.confirm) {
          deleRequest(); //请求删除
        } else {
          // console.log('用户点击取消')
        }

      }
    })
    function deleRequest(){//请求删除
      if (deleteId) {
        var customerId = requestToken.getCustomerId();
        var url = constant.API_URL_POST_ITEM_DELELE + customerId + "/" + deleteId;
        //请求数据
        requestToken.tokenAjaxPost({
          url: url,
          data: {},
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