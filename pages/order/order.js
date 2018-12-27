var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
var mapChange = require('../../utils/mapTransform.js');//地图经纬度转换
var nowPageIndex = 0;
var nowPageSize = 5;
var timer = null;
Page({
  data: {
    presentOrderListArr:[],//当前订单
    todayListArr: [],//今日订单
    historyListArr:[],//历史订单
    nowOrder: true,//当前订单点击态 
    todayOrder: false,//今日订单点击态 
    historyOrder: false,//历史订单点击态 
  },
  onLoad: function () {
    var that = this;
    console.log("load");
    wx.showLoading({
      title: '数据加载中...',
    })
  },
  onShow: function () {
    var that = this;
    console.log("onShow");
    that.onPullDownRefresh();
    // wx.startPullDownRefresh();
  },
  onReady: function () {
    var _this = this;
    var customerId = requestToken.getCustomerId();
    console.log("ready");
    timer = null;
    clearInterval(timer);
    timer = setInterval(function () {
      _this.getNowOrderlist(customerId, 0, nowPageSize);
    }, 10000)
  },
  onPullDownRefresh: function () {//下拉刷新数据
    var _this = this;
    var customerId = requestToken.getCustomerId();
    nowPageIndex = 0;
    console.log(nowPageIndex + "/" + nowPageSize);
    if (_this.data.nowOrder){
      _this.getNowOrderlist(customerId, nowPageIndex, nowPageSize);
      return
    } else if (_this.data.todayOrder){
      _this.getTodayOrderLIst(customerId, nowPageIndex, nowPageSize);
      return
    }else{
      _this.getHistoryLIst(customerId, nowPageIndex, nowPageSize);
      return
    }
  },
  onReachBottom: function () {//上拉加载更多
    var _this = this;
    var customerId = requestToken.getCustomerId();
    if (_this.data.nowOrder) {
      _this.getNowOrderlist(customerId, 0, nowPageSize);
      wx.showToast({
        title: '没有更多数据了!',
        icon: "none"
      })
      return
    } else{
      nowPageIndex++;
      wx.showLoading({
        title: '数据加载中...',
      })
      if (_this.data.todayOrder) {
        _this.getTodayOrderLIst(customerId, nowPageIndex, nowPageSize);
        return
      } else {
        _this.getHistoryLIst(customerId, nowPageIndex, nowPageSize);
        return
      }
    }
  },
  getNowOrderlist: function (customerId, pageIndex, pageSize){//获取当前订单列表
    var that = this;
    var url = constant.API_URL_GET_NOW_ORDERS + customerId;
    requestToken.tokenAjaxGet({
      url: url,
      success(res) {
        console.log(res);
        wx.hideLoading();//停止数据加载
        wx.stopPullDownRefresh();//停止下拉刷新
        if (res.statusCode === 200) {
          console.log("当前订单请求成功!");
          if (res.data.status === 1) {
            console.log(res.data);
            var tempArr = res.data.data;
            for (var i = 0, long = tempArr.length; i < long;i++){
              tempArr[i].orderStatus = constant.orderAllStatusChange(tempArr[i].orderStatus);//转换状态
              tempArr[i].orderType = constant.changeOrderStatus(tempArr[i].orderType);//转换类型
            }
            that.setData({
              presentOrderListArr: tempArr
            })
            console.log(that.data.presentOrderListArr);
          } else {
            requestToken.resError(res.data.msg);
          }
        } else {
          requestToken.httpError(res.statusCode, 0);
        }
      }
    })
  },
  getTodayOrderLIst: function (customerId, pageIndex, pageSize) {//获取今日订单列表
    var _this = this;
    var url = constant.API_URL_POST_TODAY_HISTORY_ORDERS;
    var data = {
      "id": customerId,
      "pageIndex": pageIndex,
      "pageSize": pageSize
    }
    //请求数据
    requestToken.tokenAjaxPost({
      url: url,
      data: data,
      success(res) {
        console.log(res);
        wx.stopPullDownRefresh();//停止下拉刷新
        wx.hideLoading();//停止数据加载
        if (res.statusCode === 200) {
          console.log("今日订单请求成功");
          if (res.data.status === 1) {
            // console.log(res.data);
            var tempArr = res.data.data;
            for (var i = 0, long = tempArr.length; i < long; i++) {
              tempArr[i].orderStatus = constant.orderAllStatusChange(tempArr[i].orderStatus);//转换状态
              tempArr[i].orderType = constant.changeOrderStatus(tempArr[i].orderType);//转换类型
            }
            if (pageIndex == 0) {
              _this.setData({
                todayListArr: tempArr
              })
              console.log(_this.data.todayListArr);
              return
            }
            if (pageIndex > 0) {
              if (res.data.data.length == 0) {
                wx.showToast({
                  title: '没有更多数据了!',
                  icon: "none"
                })
              } else {
                var tempMess = [];
                tempMess = _this.data.todayListArr.concat(tempArr);
                _this.setData({
                  todayListArr: tempMess
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
  getHistoryLIst: function (customerId, pageIndex, pageSize) {//获取所有订单列表
    var _this = this;
    var url = constant.API_URL_POST_HISTORY_ORDERS;
    var data = {
      "id": customerId,
      "pageIndex": pageIndex,
      "pageSize": pageSize
    }
    //请求数据
    requestToken.tokenAjaxPost({
      url: url,
      data: data,
      success(res) {
        console.log(res);
        wx.stopPullDownRefresh();//停止下拉刷新
        wx.hideLoading();//停止数据加载
        if (res.statusCode === 200) {
          console.log("历史订单请求成功");
          if (res.data.status === 1) {
            // console.log(res.data);
            var tempArr = res.data.data;
            for (var i = 0, long = tempArr.length; i < long; i++) {
              tempArr[i].orderStatus = constant.orderAllStatusChange(tempArr[i].orderStatus);//转换状态
              tempArr[i].orderType = constant.changeOrderStatus(tempArr[i].orderType);//转换类型
            }
            if (pageIndex == 0) {
              _this.setData({
                historyListArr: tempArr
              })
              console.log(_this.data.historyListArr);
              return
            }
            if (pageIndex > 0) {
              if (res.data.data.length == 0) {
                wx.showToast({
                  title: '没有更多数据了!',
                  icon: "none"
                })
              } else {
                var tempMess = [];
                tempMess = _this.data.historyListArr.concat(tempArr);
                _this.setData({
                  historyListArr: tempMess
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
  seeOrderDetaile:function(e){//查看订单信息
    var _this = this;
    var detaileId = e.currentTarget.dataset.orderdata.id;
    console.log(e.currentTarget.dataset.orderdata);
    wx.navigateTo({
      url: "../orderDetaile/orderDetaile?orderId=" + detaileId
    })
  },
  seeReceiveLocation: function (e) {//查看收件位置
    var _this = this;
    var points = e.currentTarget.dataset.orderdata;
    // console.log(e.currentTarget.dataset.orderdata);
    var changePoint = mapChange.bd09togcj02(points.longitude, points.latitude);//gcj02tobd09 bd09togcj02
    const longitude = changePoint[0];
    const latitude = changePoint[1];
    wx.openLocation({
      latitude,
      longitude,
      scale: 17,
      name: points.poiName,
      address: points.addressName,
      success(res){//do
      }
    })
  },
  nowOrderClick:function(){//点击当前订单
    var _this = this;
    var customerId = requestToken.getCustomerId();
    _this.setData({
      nowOrder:true,
      todayOrder:false,
      historyOrder:false
    })
    timer = setInterval(function () {
      _this.getNowOrderlist(customerId, 0, nowPageSize);
    }, 10000)
    _this.getNowOrderlist(customerId, 0, nowPageSize);
  },
  todayClick: function () {//点击今日订单
    var _this = this;
    clearInterval(timer);
    _this.setData({
      nowOrder: false,
      todayOrder: true,
      historyOrder: false
    })
    var customerId = requestToken.getCustomerId();
    _this.getTodayOrderLIst(customerId, 0, nowPageSize);
  },
  historyClick: function () {//点击历史订单
    var _this = this;
    clearInterval(timer);
    _this.setData({
      nowOrder: false,
      todayOrder: false,
      historyOrder: true
    })
    var customerId = requestToken.getCustomerId();
    _this.getHistoryLIst(customerId, 0, nowPageSize);
  },
  complaintOrder: function (e) {//点击投诉订单
    var _this = this;
    var dataid = e.currentTarget.dataset.datalist.id;
    var senderName = e.currentTarget.dataset.datalist.senderName;
    var customerId = requestToken.getCustomerId();
    var url = constant.getComplainList(customerId, dataid);
    requestToken.tokenAjaxGet({
      url: url,
      success(res) {
        console.log(res);
        if (res.statusCode === 200) {
          console.log("理由请求成功!");
          if (res.data.status === 1) {
            wx.navigateTo({
              url: "../complaintOrder/complaintOrder?orderId=" + dataid + "&senderName=" + senderName
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
  ReRushOrder:function(e){//重推订单(只针对超时订单)
    var that = this;
    console.log(e.currentTarget.dataset);
    var orderId = e.currentTarget.dataset.dataid;
    wx.showModal({
      title: '你正在执行派单操作',
      content: '确定重新推送该订单?',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '数据加载中...',
          })
          isCanRequest(); //请求重推
        } else {
          // console.log('用户点击取消')
        }

      }
    })
    function isCanRequest (){
      if (orderId) {
        var url = constant.API_URL_POST_AGAIN_SEND_ORDER + orderId;
        requestToken.tokenAjaxPost({
          url: url,
          data: {},
          success(res) {
            console.log(res);
            wx.stopPullDownRefresh();//停止下拉刷新
            wx.hideLoading();//停止数据加载
            if (res.statusCode === 200) {
              if (res.data.status === 1) {
                console.log("重派成功!");
                wx.showToast({
                  title: '重派成功!',
                  icon: "success"
                })
                setTimeout(function(){
                  wx.startPullDownRefresh();
                  that.onPullDownRefresh();
                },500)
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
  cancelOrder: function (e) {//取消订单(只针未接单的订单)
    var _this  = this;
    console.log(e.currentTarget.dataset);
    var orderId = e.currentTarget.dataset.dataid;
    var customerId = requestToken.getCustomerId();
    var index = e.currentTarget.dataset.index;
    console.log("index:"+index);
    wx.showModal({
      title: '你正在执行取消操作',
      content: '确定取消该订单?',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '数据加载中...',
          })
          isCanRequest(); //请求删除
        } else {
          // console.log('用户点击取消')
        }
      }
    })
    function isCanRequest() {
      if (orderId) {
        var url = constant.API_URL_POST_CANCEL_ORDER + orderId + "/" + customerId;
        requestToken.tokenAjaxPost({
          url: url,
          data: {},
          success(res) {
            console.log(res);
            wx.stopPullDownRefresh();//停止下拉刷新
            wx.hideLoading();//停止数据加载
            if (res.statusCode === 200) {
              if (res.data.status === 1) {
                console.log("取消成功!");
                wx.showToast({
                  title: '取消成功!',
                  icon: "success"
                })
                if (_this.data.nowOrder) {
                  var tempMes = _this.data.presentOrderListArr;
                  tempMes.splice(index,1);
                  _this.setData({
                    presentOrderListArr: tempMes
                  })
                  return
                }
                if (_this.data.historyOrder) {
                  var tempMes = _this.data.historyListArr;
                  tempMes.splice(index, 1);
                  _this.setData({
                    historyListArr: tempMes
                  })
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
      }
    }
  },
  deleteOrderOne: function (e) {//删除订单记录(只针已完成历史订单)
    var _this = this;
    console.log(e.currentTarget.dataset);
    var orderId = e.currentTarget.dataset.dataid;
    var customerId = requestToken.getCustomerId();
    var index = e.currentTarget.dataset.index;
    console.log("index:" + index);
    wx.showModal({
      title: '你正在执行删除操作',
      content: '确定删除该订单记录?',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '数据加载中...',
          })
          isCanRequest(); //请求删除
        } else {
          // console.log('用户点击取消')
        }

      }
    })
    function isCanRequest() {
      if (orderId) {
        var url = constant.API_URL_POST_DELETE_HISTORY_ORDER + orderId;
        requestToken.tokenAjaxPost({
          url: url,
          data: {},
          success(res) {
            console.log(res);
            wx.stopPullDownRefresh();//停止下拉刷新
            wx.hideLoading();//停止数据加载
            if (res.statusCode === 200) {
              if (res.data.status === 1) {
                console.log("删除成功!");
                wx.showToast({
                  title: '删除成功!',
                  icon: "success"
                })
                if (_this.data.nowOrder) {
                  var tempMes = _this.data.presentOrderListArr;
                  tempMes.splice(index, 1);
                  _this.setData({
                    presentOrderListArr: tempMes
                  })
                  return
                }
                if (_this.data.historyOrder) {
                  var tempMes = _this.data.historyListArr;
                  tempMes.splice(index, 1);
                  _this.setData({
                    historyListArr: tempMes
                  })
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
      }
    }
  },
  backToIndex : function() {//返回首页
    var that = this;
    var pagesNumber = getCurrentPages();//获取页面栈
    if (pagesNumber.length > 2) {
      wx.navigateBack({
        delta: 2
      })
    } else {
      wx.navigateTo({
        url: "../index/index"
      })
    }
  },
  /**
  * 生命周期函数--监听页面隐藏
  */
  onHide: function () {
    clearInterval(timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(timer);
  }
})