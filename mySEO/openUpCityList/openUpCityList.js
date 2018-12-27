// mySEO/openUpCityList/openUpCityList.js
var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cityList:[],//城市列表
    chooseCityData:""//选择城市
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '数据加载中...',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var _this = this;
    _this.getCityList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var _this = this;

  },
  //请求城市列表
  getCityList:function(){
    var _this = this;
    var customerId = requestToken.getCustomerId();
    var url = constant.API_URL_GET_PUBLIC_AGENT_LIST;
    requestToken.tokenAjaxGet({
      url: url,
      success(res) {
        console.log(res);
        wx.hideLoading();//停止数据加载
        if (res.statusCode === 200) {
          console.log("请求成功!");
          if (res.data.status === 1) {
            console.log(res.data);
            _this.setData({
              cityList: res.data.data
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
  chooseClickCity:function(e){
    var _this = this;
    var cityData = e.currentTarget.dataset.items;
    console.log(cityData);
    let pagesNumber = getCurrentPages();//获取页面栈
    let prevPage = pagesNumber[pagesNumber.length - 2];
    prevPage.setData({
      chooseCityData: cityData,
    })
    _this.backToIndex();
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

  }
})