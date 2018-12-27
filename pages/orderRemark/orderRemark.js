var app = getApp();

Page({
  data: {
    remark:"",
    isCanBack:true
  },
  onLoad: function () {
    var that = this;
    var pages = getCurrentPages();//获取页面栈
  },
  onShow: function () {
    var that = this;
    var getremark = app.globalData.orderMessageArr.item.remark;
    getremark.trim();
    console.log("加载渲染获取备注信息");
    console.log(getremark);
    if (getremark) {
      that.setData({
        remark: getremark
      })
    }
  },
  changeRemark:function(e){//数去焦点 获取输入值
    var that = this;
    that.setData({
      remark: e.detail.value
    })
    var getremark = that.data.remark.trim();
    app.globalData.orderMessageArr.item.remark = getremark;
  },
  backToIndex:function(){//返回首页
    var that = this;
    var pagesNumber = getCurrentPages();//获取页面栈
    app.globalData.orderMessageArr.item.remark = that.data.remark.trim();
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