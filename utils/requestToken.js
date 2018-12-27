const constant = require('../utils/constant.js');//获取接口配置文件 
  /**
	 * [saveToken 保存token]
	 * @param  {[type]} token [token对象]
	 * @return {[type]}       [无]
	 */
  function saveToken (token) {
    console.log("saveToken");
    wx.setStorageSync("access_token", token.access_token);
    wx.setStorageSync("refresh_token", token.refresh_token);
    wx.setStorageSync("expires_time", Date.parse(new Date()) + parseInt(token.expires_in) * 1000);
  };
  /* 获取token */
  function getToken() {
    var token = wx.getStorageSync("access_token");
    return token;
  };
/* 获取用户ID */
function getCustomerId () {
  var customerId = wx.getStorageSync("customerId");
  return customerId;
};
	/**
	 * [错误状态判断]
	 * @param  {[type]} status   [状态码] 
	  * @param  {[type]} location [当前页面相对于登录页面的位置]
	  *
	 * @return {[type]}          [description]
	 */
  function httpError(status, num) {
      wx.hideLoading();//停止数据加载
      if (status === 401) {
        var location = "";
        //跳转到登录页面
        wx.showToast({
          title: "请绑定手机账号",
          icon: "none",
          duration: 1500,
          mask: false,
        })
        setTimeout(function(){
          if (num === 0) {
            wx.reLaunch({//navigateTo
              url: "/pages/login/login"
            })
            return false;
          } else if (num === 1) {
            wx.reLaunch({
              url: "/pages/login/login"
            })
            return false;
          }
        },1000)
        function jumpLink (location){
          if (location) {
            setTimeout(function () {
              wx.reLaunch({
                url: location
              })
            }, 1000);
          }
          return true;
        }
        return
      } else {
        console.log(status);
        wx.showToast({
          title: "请求错误: 代码:" + status,
          icon: "none",
          duration: 2000,
          mask: false,
        })
        return false;
      }
    };
  function resError(res) {//展示数据请求成功而返回-1的错误信息
    setTimeout(function(){
      wx.showToast({
        title: "对不起:" + res,
        icon: "none",
        duration: 2000,
      })
    },500)
    return false;
  }
	/**
	 * [checkToken 判断token是否到期，如果到期，服务器 则向服务发送交换token请求]
	 * @param  {[type]} expires_time [token到期时间]
	 * @return {[type]}             [true 或false]
	 */
   function checkToken () {
     var expire_time = wx.getStorageSync("expires_time");
    if (expire_time) { //有token
      var now = Date.parse(new Date());
      var res = now > parseInt(expire_time);
      if (res) {
        //向服务器请求token交换
        var refresh_token = wx.getStorageSync("refresh_token");
        var data = {
          "refresh_token": refresh_token
        };
        console.log("交换Token:***");
        wx.request({
          method: "POST",
          url: constant.EXCHANGE_TOKEN,
          data: data,
          dataType: "json",
          header: { 'content-type': 'application/json' },
          success: function (result) {
            
            console.log(result);
            if (result.statusCode === 200 && result.data.status === 1) {
              console.log("交换成功！");
              console.log(result.data);
              saveToken(result.data.data);
              return true;
            } else {
              console.log("交换失败！");
              httpError(401,0);
              return false;
            }
          },
          fail: function (xhr) {
            httpError(401, 0);
            return false;
          }
        });
      } else {
        //不交换
        return true;
      }
    } else { //用户已注销
      httpError(401, 0);
      return false;
    }
  };
  /**
   * [tokenAjaxPost 带token的post ajax请求]
   * @param  {[type]} options [ options 对象必须有url,data ,succes 方法,error 方法  ]
   * @return {[type]}         [description]
   */
   function tokenAjaxPost (options) {
    var isOk = checkToken();
    if (isOk == "false") {
      return false; //终止发送请求
    }
    var authorization = 'Bearer ' + getToken();
     wx.request({
      method: "POST",
      url: options.url,
      data: options.data,
      dataType: "json",
       header: {
         "content-type": 'application/json',
         "Authorization": authorization
       },
      success: options.success,
       fail(res) {
         wx.showToast({
           title: "服务器或网络错误，请稍后重试！",
           icon: "none",
           duration: 1500,
           mask: false,
         })
       },
    });
    return true;
  };
	/**
	 * [tokenAjaxGet 带token的get ajax请求]
	 * @param  {[type]} options [options 对象必须有url ,succes 方法,error 方法]
	 * @return {[type]}         [description]
	 */
function tokenAjaxGet (options) {
    var isOk = checkToken();
    if (!isOk) {
      return false; //终止发送请求
    };
    var authorization = 'Bearer ' + getToken();
    wx.request({
        method: "GET",
        url: options.url,
        dataType: "json",
        header: { 
          "content-type": 'application/json',
          "Authorization": authorization
        },
        success: options.success,
        fail(res){
          wx.showToast({
            title: "服务器或网络错误，请稍后重试！",
            icon: "none",
            duration: 1500,
            mask: false,
          })
        },
        complete: options
      });
      return true;
  };
/*时间处理*/
function changeDetaTime(dataTime){
  Date.prototype.toLocaleString = function () {
    return this.getFullYear() + "-" + (this.getMonth() + 1) + "-" + checkTime(this.getDate()) + " " + checkTime(this.getHours()) + ":" + checkTime(this.getMinutes()) + ":" + checkTime(this.getSeconds());
  };
  function checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  };
  dataTime = new Date(dataTime).toLocaleString();
  return dataTime;
}
/* 配置 */
module.exports = {
  getCustomerId:getCustomerId,
  saveToken: saveToken,
  httpError: httpError,
  resError: resError,
  checkToken: checkToken,
  tokenAjaxPost: tokenAjaxPost,
  tokenAjaxGet: tokenAjaxGet,
  changeDetaTime: changeDetaTime
}



