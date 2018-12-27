//该页面用于存放内嵌网页
var app = getApp();
var constant = require('../../utils/constant.js');//获取接口配置文件
var requestToken = require('../../utils/requestToken.js');//token交换请求
var ctxPath = constant.API;
var ctxPath_API_SERVER = constant.API_SERVER;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banner_img:"/images/SEO/seo_banner_code.png",//焦点图
    banner_img_null: "/images/SEO/index_refash.png",//焦点图
    shareQRCode: "/images/SEO/index.jpg",//生成的二维码
    businessmanId:""//标识
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    _this.setData({
      businessmanId: options.businessmanId
    })
    _this.QRcodeShare();//获取二维码
  },
  QRcodeShare: function () {//扫码分享好友
    var _this = this;
    wx.showLoading({
      title: '数据加载中...',
    })
    // let return_url = ctxPath + "/agent/views/businessmanSpread.html";
    // var path = return_url + "&businessmanId=" + _this.data.businessmanId;
    // var path = "mySEO/shareToQRCode/shareToQRCode";
    var path = "pages/index/index";
    // _this.jieya(_this.data.businessmanId);
    getQRCode();
    function getQRCode() {
      var QRurl = ctxPath + "/public/miniapp/qrcode";
      
      var data = {
        page: path,
        scene: "1011"
      }
      requestToken.tokenAjaxPost({
        url: QRurl,
        data: data,
        success(res) {
          console.log(res);
          wx.hideLoading();//停止数据加载
          if (res.statusCode === 200) {
            if (res.data.status === 1) {
              // console.log("二维码:" + JSON.stringify(res.data.data));
              var datas = wx.base64ToArrayBuffer(res.data.data)
              if (datas){
                var baseUrl = "data:image/png;base64," + wx.arrayBufferToBase64(datas);
              }else{
                var baseUrl ="";
              }
              _this.setData({
                shareQRCode: baseUrl
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
  jieya: function (strNormalString){
    /**
     * 压缩
     */
    Compress(strNormalString);
    function Compress(strNormalString) {
      console.log("压缩前长度：" + strNormalString.length);
      var strCompressedString = "";

      var ht = new Array();
      for (i = 0; i < 128; i++) {
        ht[i] = i;
      }

      var used = 128;
      var intLeftOver = 0;
      var intOutputCode = 0;
      var pcode = 0;
      var ccode = 0;
      var k = 0;

      for (var i = 0; i < strNormalString.length; i++) {
        ccode = strNormalString.charCodeAt(i);
        k = (pcode << 8) | ccode;
        if (ht[k] != null) {
          pcode = ht[k];
        } else {
          intLeftOver += 12;
          intOutputCode <<= 12;
          intOutputCode |= pcode;
          pcode = ccode;
          if (intLeftOver >= 16) {
            strCompressedString += String.fromCharCode(intOutputCode >> (intLeftOver - 16));
            intOutputCode &= (Math.pow(2, (intLeftOver - 16)) - 1);
            intLeftOver -= 16;
          }
          if (used < 4096) {
            used++;
            ht[k] = used - 1;
          }
        }
      }

      if (pcode != 0) {
        intLeftOver += 12;
        intOutputCode <<= 12;
        intOutputCode |= pcode;
      }

      if (intLeftOver >= 16) {
        strCompressedString += String.fromCharCode(intOutputCode >> (intLeftOver - 16));
        intOutputCode &= (Math.pow(2, (intLeftOver - 16)) - 1);
        intLeftOver -= 16;
      }

      if (intLeftOver > 0) {
        intOutputCode <<= (16 - intLeftOver);
        strCompressedString += String.fromCharCode(intOutputCode);
      }

      console.log("压缩后长度：" + strCompressedString.length);
      return strCompressedString;
    }

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    let that = this
    if (options.webViewUrl) {
      let return_url = encodeURIComponent(options.webViewUrl);
    } else {
      let return_url = ctxPath + "/agent/views/businessmanSpread.html&businessmanId=" + _this.data.businessmanId;
    }
    console.log("分享的URl");
    console.log(return_url);
    var path = 'mySEO/shareToLink/shareToLink?shareUrl=' + return_url
    console.log(path, options)
    return {
      title: '注册壹配送：推荐用户、配送员，获高额奖励金、单单享提成。',
      path: path,
      imageUrl: "/images/SEO/seo_banner_1.png",
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: "转发成功",
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  openToMySEORecord: function () {//打开推广记录
    wx.navigateTo({
      url: "/mySEO/mySEORecord/mySEORecord"
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
    this.backToIndex();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // wx.reLaunch({
    //   url: "/pages/index/index"
    // })
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