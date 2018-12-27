//index.js
//获取应用实例
const app = getApp(); //获取全局配置
var consoleUtil = require('../../utils/consoleUtil.js'); //日志
var constant = require('../../utils/constant.js'); //获取接口配置文件
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js'); //腾讯地图
var mapChange = require('../../utils/mapTransform.js'); //地图经纬度转换
var dateTimePicker = require('../../utils/dateTimePicker.js'); //时间插件
var requestToken = require('../../utils/requestToken.js'); //token交换请求
Page({
  data: {
    //用户信息
    userInfo: {},
    helpMePickUp:false,//点击帮我取
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    AccountInfo: {
      moneyRechargeTotal: "0", //充值总额
      moneyRemain: "0", //可用余额
      moneySpendTotal: "0" //花费总额
    },
    //订单信息
    orderMessArr: {},
    clickNumber: { //快捷选择标记
      clickStartIndex: 0,
      clickReceiveIndex: 0,
      clickItemIndex: 0
    },
    //地图配置
    showOpenSting:false,//定位失败打开授权设置
    options: { //地图定位中心点 默认北京
      lng: 116.397475,
      lat: 39.908856
    },
    windowInfo: { //系统窗口信息
      windowWidth: 375,
      windowHeight: 672
    },
    mapHeight: "0", //460
    mapScale: 16,
    markers: [{
        id: 0,
        longitude: 0,
        latitude: 0,
        title: "发件位置",
        iconPath: "../images/map_start.png",
        width: 27,
        height: 44
      }, {
        id: 1,
        longitude: 0,
        latitude: 0,
        title: "收件位置",
        iconPath: "../images/map_receiver.png",
        width: 27,
        height: 44
      }],
      polyline: [{ //连线
        points: [{
          latitude: 0,
          longitude: 0
        }],
        color: '#FF0000DD',
        width: 2
    }],
    includePoints: {},
    distanceInfo:" 预计50分钟内可送达 ",
    //预约时间
    startDetaTimeArr: null, //取件时间组建数组
    fetchTime: null, //取件时间毫秒值
    fetchTimeVal: null, //取件时间显示
    endDetaTimeArr: null, //送件时间组建数组
    sendTime: null, //送件时间毫秒
    sendTimeVal: null, //送件时间显示
    dateTimeArray: null, //渲染时间数组
    dateTimeArrayEnd: null, //渲染时间数组
    startYear: 2018, //开始年
    endYear: 2018, //结束年
    isShowPrice: false, //显示价格距离
    isShowItem: false, //物品展示
    isShowDistance:true,//底部信息是否展示
    //订单相关信息
    orderTypeItems: [{
        name: 'MergeOrder',
        value: '拼单',
        checked: 'true'
      },
      {
        name: 'AppointmentOrder',
        value: '预约'
      },
      {
        name: 'AdvancedAppointmentOrder',
        value: '高级'
      },
      {
        name: 'DirectOrder',
        value: '直发'
      }
    ],
    clickPayIndex: 1, //付款方式索引
    //常用信息数组
    oftenStartArr: [],
    oftenReceiveArr: [],
    oftenItemArr: [],
    subLoading: false, //确认订单点击态
    distance:0,//用于计算距离
  },
  //事件处理函数
  onLaunch: function() { //小程序初始化完成时（全局只触发一次)(1)
    var _this = this;
    console.log("onLaunch");
  },
  onLoad: function(option) { //页面加载完成(2)
    var that = this;
    console.log("load");
    wx.showLoading({
      title: '数据加载中...',
    })
    console.log("option:");
    console.log(JSON.stringify(option));
    that.loadingData(); //加载快捷常用信息及地图初始化
    wx.getSystemInfo({
      success: function (res) {
        console.log("onReady 系统窗口信息: " + res.model + " 屏宽: " + res.windowWidth + " / 屏高: " + res.windowHeight); //windowHeight windowWidth
        var map_width = "windowInfo.windowWidth";
        var map_height = "windowInfo.windowHeight";
        that.setData({
          [map_width]: res.windowWidth, //获取屏幕宽高
          [map_height]: res.windowHeight,
          mapHeight: res.windowHeight - 200, //设置地图height210
        })
      }
    })
    //获取用户信息
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  onShow: function() { //页面渲染完成(其次执行)(3)
    var that = this;
    console.log("show");
    //数据处理
    console.log("全局数据:");
    console.log(app.globalData.orderMessageArr);
    if (app.globalData.orderMessageArr) {
      that.setData({
        orderMessArr: app.globalData.orderMessageArr
      })
      isOftenBack();//判断有无选用快捷方式
      that.setMapHeight(); //设置地图高度
      var orderMess = app.globalData.orderMessageArr;
      if (!orderMess.starter.addressName || !orderMess.starter.longitude || !orderMess.starter.latitude || !orderMess.receiver.addressName || !orderMess.receiver.longitude || !orderMess.receiver.latitude) {
        
        if (orderMess.starter.addressName && orderMess.starter.longitude && orderMess.starter.latitude) {
          var changePoint = mapChange.gcj02tobd09(orderMess.starter.longitude, orderMess.starter.latitude); //gcj02tobd09 bd09togcj02
          that.setData({ //设置标记数组
            options: { //地图定位中心点
              lng: orderMess.starter.Txlongitude,
              lat: orderMess.starter.Txlatitude
            },
            markers: [{
              id: 0,
              longitude: orderMess.starter.Txlongitude,
              latitude: orderMess.starter.Txlatitude,
              title: "发件位置",
              iconPath: "../images/map_start.png",
              width: 27,
              height: 44
            },{
                id: 1,
                longitude: orderMess.receiver.Txlongitude,
                latitude: orderMess.receiver.Txlatitude,
                title: "收件位置",
                iconPath: "../images/map_receiver.png",
                width: 27,
                height: 44
              }],
            polyline: [{
              points: [{
                latitude: 0,
                longitude: 0
              }],
              color: '#5e97ff',
              borderColor: "#333333",
              width: 4
            }]
          })
          return
        };
        if (orderMess.receiver.addressName && orderMess.receiver.longitude && orderMess.receiver.latitude) {
          that.setData({ //设置标记数组
            saveReceiveInfo: false, //是否保存收件地址
            options: { //地图定位中心点
              lng: orderMess.receiver.longitude,
              lat: orderMess.receiver.latitude
            },
            markers: [{
              id: 0,
              longitude: orderMess.starter.Txlongitude,
              latitude: orderMess.starter.Txlatitude,
              title: "发件位置",
              iconPath: "../images/map_start.png",
              width: 27,
              height: 44,
            }, {
                id: 1,
                longitude: orderMess.receiver.Txlongitude,
                latitude: orderMess.receiver.Txlatitude,
                title: "收件位置",
                iconPath: "../images/map_receiver.png",
                width: 27,
                height: 44,
              }],
            polyline: [{
              points: [{
                latitude: 0,
                longitude: 0
              }],
              color: '#5e97ff',
              borderColor: "#333333",
              width: 4
            }]
          })
          return
        }
        return
      } else {
        // that.setMapHeight(); //设置地图高度
        
        that.setData({ //设置标记数组
          saveStartInfo: false, //是否保存发件地址
          saveReceiveInfo: false, //是否保存收件地址
          saveItemInfo: false, //是否保存物品
          markers: [{
            id: 0,
            longitude: orderMess.starter.Txlongitude,
            latitude: orderMess.starter.Txlatitude,
            title: "发件位置",
            iconPath: "../images/map_start.png",
            width: 27,
            height: 44
          }, {
            id: 1,
            longitude: orderMess.receiver.Txlongitude,
            latitude: orderMess.receiver.Txlatitude,
            title: "收件位置",
            iconPath: "../images/map_receiver.png",
            width: 26,
            height: 44,
            callout: {
              content: that.data.distanceInfo,
              color: "#ffffff",
              fontSize: 16,
              borderRadius: 20,
              borderWidth: 1,
              padding: 6,
              borderColor: '#eeeeee',
              bgColor: "#6a8097",
              display: (that.data.orderMessArr.starter.poiName && that.data.orderMessArr.receiver.poiName) ? "ALWAYS" : "BYCLICK",//"ALWAYS":"BYCLICK"
              textAlign: "center"
            }
          }],
          includePoints: [{
            longitude: orderMess.starter.Txlongitude,
            latitude: orderMess.starter.Txlatitude,
          }, {
            longitude: orderMess.receiver.Txlongitude,
            latitude: orderMess.receiver.Txlatitude,
          }]
        })
        that.mapDriving(); //路线规划
        that.getPrice(); //请求价格
      }
    }
    function isOftenBack(){
      var starterNumber = "clickNumber.clickStartIndex";
      var receiverNumber = "clickNumber.clickReceiveIndex";
      var itemNumber = "clickNumber.clickItemIndex";
      if (app.globalData.saveMessages.saveStartInfo || app.globalData.oftenClickBack.clickStartInfo){
        that.setData({
          [starterNumber]:0
        })
      }
      if (app.globalData.saveMessages.saveReceiveInfo || app.globalData.oftenClickBack.clickReceiveInfo) {
        that.setData({
          [receiverNumber]: 0
        })
      }
      if (app.globalData.saveMessages.saveItemInfo || app.globalData.oftenClickBack.clickItemInfo) {
        that.setData({
          [itemNumber]: 0
        })
        console.log("11");
      }
      return
    }
  },
  onReady: function() { //页面初始化准备完成(4)
    var _this = this;
    console.log("ready");
    // 使用 wx.createMapContext 获取 map 上下文
    _this.mapCtx = wx.createMapContext('my_map');
    
    //预约时间
    // 获取完整的年月日 时分秒，以及默认显示的数组
    var dataObj = dateTimePicker.dateTimePicker(_this.data.startYear, _this.data.endYear);
    // 精确到分的处理，将数组的秒去掉
    dataObj.dateTimeArray.pop();
    dataObj.dateTime.pop();
    _this.setData({
      startDetaTime: dataObj.dateTime,
      endDetaTimeArr: dataObj.dateTime,
      dateTimeArray: dataObj.dateTimeArray,
    });
  },
  helpMeSend:function(){//帮我送
    var _this = this;
    _this.setData({
      helpMePickUp:false
    })
    _this.changeSendAndPick();//交换发收数据
  },
  helpMePick: function () {//帮我取
    var _this = this;
    _this.setData({
      helpMePickUp: true
    })
    _this.changeSendAndPick();//交换发收数据
  },
  changeSendAndPick: function () {//交换发收数据
    var _this = this;
    var tempStarter = _this.data.orderMessArr.starter;
    var tempReceiver = _this.data.orderMessArr.receiver;
    var starter = "orderMessArr.starter";
    var receiver = "orderMessArr.receiver";
    var dataIndexStarter = "clickNumber.clickStartIndex";
    var dataIndexReceiver = "clickNumber.clickReceiveIndex";
    var tempPickUp = {
      "name": "",
      "phonenumber": "",
      "longitude": 0,
      "latitude": 0,
      "Txlongitude": 0,
      "Txlatitude": 0,
      "addressName": "",
      "addressDetail": "",
      "poiName": ""
    };
    console.log(_this.data.orderMessArr);
    if (_this.data.helpMePickUp && tempStarter.longitude && tempStarter.latitude && tempStarter.addressName){
      _this.setData({
        [dataIndexStarter]:0,
        [dataIndexReceiver]:0,
        [receiver]: tempStarter,
        [starter]: tempPickUp
      })
      app.globalData.orderMessageArr.starter = _this.data.orderMessArr.starter;
      app.globalData.orderMessageArr.receiver = _this.data.orderMessArr.receiver;
      _this.onShow();//重新标点
      return
    }
   
    if (!_this.data.helpMePickUp && tempReceiver.longitude && tempReceiver.latitude && tempReceiver.addressName) {
      _this.setData({
        [dataIndexStarter]: 0,
        [dataIndexReceiver]: 0,
        [receiver]: tempPickUp,
        [starter]: tempReceiver
      })
      app.globalData.orderMessageArr.starter = _this.data.orderMessArr.starter;
      app.globalData.orderMessageArr.receiver = _this.data.orderMessArr.receiver;
      _this.onShow();//重新标点
      return
    }
  },
  loadingData: function () {//初始化加载loadingData
    var _this = this;
    var customerId = requestToken.getCustomerId();
    console.log(constant.API);
    getDefaultInfo();//获取默认发件及物品信息
    
    function getOftenStartLocation() { //获取常用发件人
      var url = constant.getStarterAddressUrl(customerId, 0, 2);
      requestToken.tokenAjaxPost({
        url: url,
        data: {},
        success(res) {
          // console.log(res);
          if (res.statusCode === 200) {
            wx.hideLoading(); //停止数据加载
            if (res.data.status === 1) {
              _this.setData({
                oftenStartArr: res.data.data
              })
              getOftenReceiveLocation(); //获取常用收件人
              getOftenItemList(); //获取常用物品
            } else {
              requestToken.resError(res.data.msg);
              return false;
            }
          } else {
            requestToken.httpError(res.statusCode, 0);
            return false;
          }
        }
      })
    }

    function getOftenReceiveLocation() { //获取常用收件人
      var url = constant.getReceiverAddressUrl(customerId, 0, 2);
      requestToken.tokenAjaxPost({
        url: url,
        data: {},
        success(res) {
          // console.log(res);
          if (res.statusCode === 200) {
            if (res.data.status === 1) {
              _this.setData({
                oftenReceiveArr: res.data.data
              })
            } else {
              requestToken.resError(res.data.msg);
              return false;
            }
          } else {
            requestToken.httpError(res.statusCode, 0);
            return false;
          }
        }
      })
    }

    function getOftenItemList() { //获取常用物品
      var url = constant.getItemList(customerId, 0, 2);
      requestToken.tokenAjaxGet({
        url: url,
        success(res) {
          // console.log(res);
          if (res.statusCode === 200) {
            if (res.data.status === 1) {
              _this.setData({
                oftenItemArr: res.data.data
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
    function getDefaultInfo(){//获取默认发件及物品信息
      console.log("开始获取默认信息");
      var url = constant.API_URL_GET_DEFAULT_ITEM_STARTER + customerId;
      requestToken.tokenAjaxGet({
        url: url,
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            if (res.data.status === 1) {
              console.log("默认信息");
              console.log(res.data.data);
              var default_starter = res.data.data.default_starter;
              var default_item = res.data.data.default_item;
              //判断发件信息
              if (default_starter){
                if (app.globalData.useDefauleStatus) {//是否为首次加载默认信息
                  var name = "orderMessArr.starter.name";
                  var phonenumber = "orderMessArr.starter.phonenumber";
                  var longitude = "orderMessArr.starter.longitude";
                  var latitude = "orderMessArr.starter.latitude";
                  var Txlongitude = "orderMessArr.starter.Txlongitude";
                  var Txlatitude = "orderMessArr.starter.Txlatitude";
                  var addressName = "orderMessArr.starter.addressName";
                  var addressDetail = "orderMessArr.starter.addressDetail";
                  var poiName = "orderMessArr.starter.poiName";
                  var dataIndex = "clickNumber.clickStartIndex";
                  var changePoint = mapChange.bd09togcj02(default_starter.starter.longitude, default_starter.starter.latitude);
                  var options = { //地图定位中心点
                    lng: changePoint[0],
                    lat: changePoint[1]
                  };
                  _this.setData({
                    showOpenSting: false,
                    [name]: default_starter.starter.name,
                    [phonenumber]: default_starter.starter.phonenumber,
                    [longitude]: default_starter.starter.longitude,
                    [latitude]: default_starter.starter.latitude,
                    [Txlongitude]: changePoint[0],
                    [Txlatitude]: changePoint[1],
                    [addressName]: default_starter.starter.addressName,
                    [addressDetail]: default_starter.starter.addressDetail,
                    [poiName]: default_starter.starter.poiName,
                    [dataIndex]: 0,
                    options: options,
                    markers: [{
                      id: 0,
                      longitude: changePoint[0],
                      latitude: changePoint[1],
                      title: "发件位置",
                      iconPath: "../images/map_start.png",
                      width: 27,
                      height: 44,

                    }]
                  })
                  app.globalData.orderMessageArr.starter = _this.data.orderMessArr.starter;
                  app.globalData.saveMessages.saveStartInfo = false;

                  setDefaultItem();

                  app.globalData.useDefauleStatus = false;
                }else{
                  if (!_this.data.orderMessArr.starter.Txlongitude || _this.data.orderMessArr.starter.Txlatitude){
                    _this.getLocationNow();//获取当前定位
                  }
                }
              }else{
                console.log("开始定位");
                _this.getLocationNow();//获取当前定位
              }
              getOftenStartLocation();////获取常用发件人
              //判断物品信息
              function setDefaultItem(){
                if (default_item && app.globalData.useDefauleStatus) {
                  var name = "orderMessArr.item.name";
                  var type = "orderMessArr.item.type";
                  var size = "orderMessArr.item.size";
                  var sizeValue = "orderMessArr.item.sizeValue";
                  var weight = "orderMessArr.item.weight";
                  var remark = "orderMessArr.item.remark";
                  var vehicle = "orderMessArr.vehicle";
                  var vehicleVal = "orderMessArr.item.vehicleVal";
                  var itemTypeIndex = "orderMessArr.item.itemTypeIndex";
                  var itemSizeIndex = "orderMessArr.item.itemSizeIndex";
                  var itemVehicleIndex = "orderMessArr.item.itemVehicleIndex";
                  var dataIndex = "clickNumber.clickItemIndex";
                  _this.setData({
                    [name]: default_item.item.itemName,
                    [type]: default_item.item.itemType,
                    [size]: default_item.item.itemSize,
                    [sizeValue]: default_item.item.itemSize,
                    [weight]: default_item.item.itemWeight,
                    [remark]: default_item.item.itemRemark,
                    [vehicle]: default_item.vehicle,
                    [vehicleVal]: default_item.vehicle,
                    [itemTypeIndex]: null,
                    [itemSizeIndex]: null,
                    [itemVehicleIndex]: null,
                    [dataIndex]: 0
                  })
                  if (default_item.item.itemSize) {
                    _this.setData({
                      [sizeValue]: constant.sizeChange(default_item.item.itemSize),
                      [vehicleVal]: constant.vehChange(default_item.vehicle)
                    })
                  }
                  app.globalData.orderMessageArr.item = _this.data.orderMessArr.item;
                  app.globalData.orderMessageArr.vehicle = _this.data.orderMessArr.vehicle;
                  app.globalData.saveMessages.saveItemInfo = false;
                }
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
  },
  //快捷选择信息
  ChooseQuickOftenStart: function(e) { //快速选择发件地址
    var _this = this;
    var name = "orderMessArr.starter.name";
    var phonenumber = "orderMessArr.starter.phonenumber";
    var longitude = "orderMessArr.starter.longitude";
    var latitude = "orderMessArr.starter.latitude";
    var Txlongitude = "orderMessArr.starter.Txlongitude";
    var Txlatitude = "orderMessArr.starter.Txlatitude";
    var addressName = "orderMessArr.starter.addressName";
    var addressDetail = "orderMessArr.starter.addressDetail";
    var poiName = "orderMessArr.starter.poiName";
    var dataIndex = "clickNumber.clickStartIndex";
    var changePoint = mapChange.bd09togcj02(e.currentTarget.dataset.startquick.starter.longitude, e.currentTarget.dataset.startquick.starter.latitude);
    _this.setData({
      [name]: e.currentTarget.dataset.startquick.starter.name,
      [phonenumber]: e.currentTarget.dataset.startquick.starter.phonenumber,
      [longitude]: e.currentTarget.dataset.startquick.starter.longitude,
      [latitude]: e.currentTarget.dataset.startquick.starter.latitude,
      [Txlongitude]: changePoint[0],
      [Txlatitude]: changePoint[1],
      [addressName]: e.currentTarget.dataset.startquick.starter.addressName,
      [addressDetail]: e.currentTarget.dataset.startquick.starter.addressDetail,
      [poiName]: e.currentTarget.dataset.startquick.starter.poiName,
      [dataIndex]: e.currentTarget.dataset.clickindex
    })
    app.globalData.orderMessageArr.starter = _this.data.orderMessArr.starter;
    app.globalData.saveMessages.saveStartInfo = false;
    app.globalData.oftenClickBack.clickStartInfo = false;
    //重新标点
    var startMarkLng = "markers[0].longitude";
    var startMarkLat = "markers[0].latitude";
    var option = {
      lng: changePoint[0],
      lat: changePoint[1]
    }
    _this.setData({
      [startMarkLng]: changePoint[0],
      [startMarkLat]: changePoint[1],
      // options: option
    })
    if (_this.data.orderMessArr.receiver.longitude && _this.data.orderMessArr.receiver.latitude) {
      _this.setData({
        includePoints: [{
          longitude: _this.data.orderMessArr.starter.Txlongitude,
          latitude: _this.data.orderMessArr.starter.Txlatitude,
        }, {
          longitude: _this.data.orderMessArr.receiver.Txlongitude,
          latitude: _this.data.orderMessArr.receiver.Txlatitude,
        }]
      })
      _this.mapDriving(); //路线规划
      _this.getPrice(); //请求价格
    } else {
      _this.setData({
        options: option
      })
      _this.mapCtx.translateMarker({
        markerId: 0,
        destination: {
          longitude: changePoint[0],
          latitude: changePoint[1]
        },
        autoRotate: false,
        rotate: 0,
        duration: 1500,
        animationEnd() {
          // console.log("11");
        },
        fail() {}
      })
    }
    _this.setMapHeight(); //设置地图高度
  },
  ChooseQuickOftenReceive: function(e) { //快速选择收件地址
    var _this = this;
    // console.log(e.currentTarget.dataset.receivequick);
    var name = "orderMessArr.receiver.name";
    var phonenumber = "orderMessArr.receiver.phonenumber";
    var longitude = "orderMessArr.receiver.longitude";
    var latitude = "orderMessArr.receiver.latitude";
    var Txlongitude = "orderMessArr.receiver.Txlongitude";
    var Txlatitude = "orderMessArr.receiver.Txlatitude";
    var addressName = "orderMessArr.receiver.addressName";
    var addressDetail = "orderMessArr.receiver.addressDetail";
    var poiName = "orderMessArr.receiver.poiName";
    var dataIndex = "clickNumber.clickReceiveIndex";
    var changePoint = mapChange.bd09togcj02(e.currentTarget.dataset.receivequick.receiver.longitude, e.currentTarget.dataset.receivequick.receiver.latitude);
    _this.setData({
      [name]: e.currentTarget.dataset.receivequick.receiver.name,
      [phonenumber]: e.currentTarget.dataset.receivequick.receiver.phonenumber,
      [longitude]: e.currentTarget.dataset.receivequick.receiver.longitude,
      [latitude]: e.currentTarget.dataset.receivequick.receiver.latitude,
      [Txlongitude]: changePoint[0],
      [Txlatitude]: changePoint[1],
      [addressName]: e.currentTarget.dataset.receivequick.receiver.addressName,
      [addressDetail]: e.currentTarget.dataset.receivequick.receiver.addressDetail,
      [poiName]: e.currentTarget.dataset.receivequick.receiver.poiName,
      [dataIndex]: e.currentTarget.dataset.clickindex
    })
    app.globalData.orderMessageArr.receiver = _this.data.orderMessArr.receiver;
    app.globalData.saveMessages.saveReceiveInfo = false;
    app.globalData.oftenClickBack.clickReceiveInfo = false;
    _this.getDistance();//距离计算
    //重新标点
    // var receiveMark = "markers[1]";
    // var receiveMarkMes = {
    //   id: 1,
    //   longitude: changePoint[0],
    //   latitude: changePoint[1],
    //   title: "收件位置",
    //   iconPath: "../images/map_receiver.png",
    //   width: 27,
    //   height: 44,
    //   callout: {
    //     content: _this.data.distanceInfo,
    //     color: "#ffffff",
    //     fontSize: 16,
    //     borderRadius: 20,
    //     borderWidth: 1,
    //     padding: 6,
    //     borderColor: '#eeeeee',
    //     bgColor: "#504c48",
    //     display: (_this.data.orderMessArr.starter.poiName &&_this.data.orderMessArr.receiver.poiName) ? "ALWAYS" : "BYCLICK",//"ALWAYS":"BYCLICK"
    //     textAlign: "center"
    //   }
    // }
    // var option = {
    //   lng: changePoint[0],
    //   lat: changePoint[1]
    // }
    // _this.setData({
    //   [receiveMark]: receiveMarkMes,
    //   // options: option
    // })
    if (_this.data.orderMessArr.starter.longitude && _this.data.orderMessArr.starter.latitude) {
      _this.setData({
        includePoints: [{
          longitude: _this.data.orderMessArr.starter.Txlongitude,
          latitude: _this.data.orderMessArr.starter.Txlatitude,
        }, {
          longitude: _this.data.orderMessArr.receiver.Txlongitude,
          latitude: _this.data.orderMessArr.receiver.Txlatitude,
        }]
      })
      _this.mapDriving(); //路线规划
      _this.getPrice(); //请求价格
    } else {
      _this.mapCtx.translateMarker({
        markerId: 1,
        destination: {
          longitude: changePoint[0],
          latitude: changePoint[1]
        },
        autoRotate: true,
        rotate: 0,
        duration: 1500,
        animationEnd() {
          // console.log("11");
        },
        fail() {}
      })
    }
    _this.setMapHeight(); //设置地图高度
  },
  ChooseQuickOftenItem: function(e) { //快速选择物品信息
    var _this = this;
    // console.log(e.currentTarget.dataset.itemquick);
    var name = "orderMessArr.item.name";
    var type = "orderMessArr.item.type";
    var size = "orderMessArr.item.size";
    var sizeValue = "orderMessArr.item.sizeValue";
    var weight = "orderMessArr.item.weight";
    var remark = "orderMessArr.item.remark";
    var vehicle = "orderMessArr.vehicle";
    var vehicleVal = "orderMessArr.item.vehicleVal";
    var itemTypeIndex = "orderMessArr.item.itemTypeIndex";
    var itemSizeIndex = "orderMessArr.item.itemSizeIndex";
    var itemVehicleIndex = "orderMessArr.item.itemVehicleIndex";
    var dataIndex = "clickNumber.clickItemIndex";
    _this.setData({
      [name]: e.currentTarget.dataset.itemquick.item.itemName,
      [type]: e.currentTarget.dataset.itemquick.item.itemType,
      [size]: e.currentTarget.dataset.itemquick.item.itemSize,
      [sizeValue]: e.currentTarget.dataset.itemquick.item.itemSize,
      [weight]: e.currentTarget.dataset.itemquick.item.itemWeight,
      [remark]: e.currentTarget.dataset.itemquick.item.itemRemark,
      [vehicle]: e.currentTarget.dataset.itemquick.vehicle,
      [vehicleVal]: e.currentTarget.dataset.itemquick.vehicle,
      [itemTypeIndex]: null,
      [itemSizeIndex]: null,
      [itemVehicleIndex]: null,
      [dataIndex]: e.currentTarget.dataset.clickindex
    })
    if (e.currentTarget.dataset.itemquick.item.itemSize) {
      _this.setData({
        [sizeValue]: constant.sizeChange(e.currentTarget.dataset.itemquick.item.itemSize),
        [vehicleVal]: constant.vehChange(e.currentTarget.dataset.itemquick.vehicle)
      })
    }
    app.globalData.orderMessageArr.item = _this.data.orderMessArr.item;
    app.globalData.orderMessageArr.vehicle = _this.data.orderMessArr.vehicle;
    app.globalData.saveMessages.saveItemInfo = false;
    app.globalData.oftenClickBack.clickItemInfo = false;
    _this.setMapHeight(); //设置地图高度
    _this.getPrice(); //请求价格
  },
  getLocationNow: function() { //获取当前定位
    var that = this;
    var qqMap = new QQMapWX({
      key: constant.tencentAk
    })
    //获取定位
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        console.log("定位数据:");
        console.log(res);
        that.setData({
          showOpenSting: false,
          options: {
            lng: res.longitude,
            lat: res.latitude
          },
          markers: [{
            id: 0,
            longitude: res.longitude,
            latitude: res.latitude,
            title: "发件位置",
            iconPath: "../images/map_start.png",
            width: 27,
            height: 44,
            
          }]
        })
        //逆地址解析
        qqMap.reverseGeocoder({
          location: {
            latitude: that.data.options.lat,
            longitude: that.data.options.lng
          },
          get_poi: 1,
          poi_options: "radius=3000;page_size=3;page_index=1;policy=1",
          success: function(res) {
            var changePoint = mapChange.gcj02tobd09(res.result.pois[0].location.lng, res.result.pois[0].location.lat);
            var startPoiName = "orderMessArr.starter.poiName";
            var startAddredd = "orderMessArr.starter.addressName";
            var startLng = "orderMessArr.starter.longitude";
            var startLat = "orderMessArr.starter.latitude";
            var TxstartLng = "orderMessArr.starter.Txlongitude";
            var TxstartLat = "orderMessArr.starter.Txlatitude";
            //初始化默认的姓名和电话号码
            var name = "orderMessArr.starter.name";
            var phoneNumber = "orderMessArr.starter.phonenumber";
            that.setData({
              [startPoiName]: res.result.pois[0].title,
              [startAddredd]: res.result.pois[0].address,
              [startLng]: changePoint[0],
              [startLat]: changePoint[1],
              [TxstartLng]: res.result.pois[0].location.lng,
              [TxstartLat]: res.result.pois[0].location.lat,

              [name]:"壹用户",
              [phoneNumber]: wx.getStorageSync("user_phonenumber")||""
            })
            app.globalData.orderMessageArr.starter.poiName = res.result.pois[0].title;
            app.globalData.orderMessageArr.starter.addressName = res.result.pois[0].address;
            app.globalData.orderMessageArr.starter.longitude = changePoint[0];
            app.globalData.orderMessageArr.starter.latitude = changePoint[1];
            app.globalData.orderMessageArr.starter.Txlongitude = res.result.pois[0].location.lng;
            app.globalData.orderMessageArr.starter.Txlatitude = res.result.pois[0].location.lat;

            app.globalData.orderMessageArr.starter.name = that.data.orderMessArr.starter.name;
            app.globalData.orderMessageArr.starter.phonenumber = that.data.orderMessArr.starter.phonenumber;
            // console.log("定位转百度:");
            // console.log(that.data.orderMessArr.starter);
          },
          fail: function(res) {
            wx.showModal({
              title: '位置获取失败',
              content: JSON.stringify(res),
              success: function(res) {
                if (res.confirm) {} else if (res.cancel) {}
              }
            })
            that.setData({
              showOpenSting: true
            })
          }
        });
      },
      fail: function (res) {
        that.setData({
          showOpenSting:true
        })
        wx.showModal({
          title: '定位失败,请开启授权服务',
          content: "请点击授权定位,允许使用地理位置!",
        })
      }
    })
  },
  openSetting:function(){
    var _this = this;
    wx.openSetting({
      success(res) {
        console.log(res.authSetting)
      }
    })
  },
  getUserInfo: function(e) { //获取用户信息
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  getDiscountNumber: function() { //请求可用红包数量
    var that = this;
    var customerId = requestToken.getCustomerId();
    var price = that.data.orderMessArr.price; //请求的现格
    var couponNumber = "orderMessArr.couponNumber";
    var url = constant.countCanUseCouponUrl(customerId, price, getOrderType(that.data.orderMessArr.orderType));
    requestToken.tokenAjaxGet({
      url: url,
      success(res) {
        // console.log(res);
        if (res.statusCode === 200) {
          if (res.data.status === 1) {
            that.setData({
              [couponNumber]: res.data.data,
            })
            app.globalData.orderMessageArr.couponNumber = that.data.orderMessArr.couponNumber;
          } else {
            requestToken.resError(res.data.msg);
            that.setData({
              [couponNumber]: null,
            })
            app.globalData.orderMessageArr.couponNumber = null;
          }
        } else {
          requestToken.httpError(res.statusCode, 0);
        }
      }
    })

    function getOrderType(type) {
      //订单的方式：拼单MergeOrder、单件DirectOrder、预约（AO、高级AOA有确定的送达时间）
      switch (type) {
        case 'MergeOrder':
          return 'merge';
        case 'DirectOrder':
          return 'direct';
        default:
          return 'common';
      }
    }
  },
  //价格预览
  getPrice: function() { //请求价格和距离
    var that = this;
    var canShow = false;
    var itemShow = false;
    var distanceShow = true;
    var customerId = requestToken.getCustomerId();
    var myOrderMes = that.data.orderMessArr;
    var myOrderMesStart = that.data.orderMessArr.starter;
    var myOrderMesReceive = that.data.orderMessArr.receiver;
    var myOrderMesItem = that.data.orderMessArr.item;
    var url = constant.API_PRICE_PREVIEW_COMMON + myOrderMes.orderChangeType + "/preview/" + customerId;
    if (!customerId) {
      canShow = false;
      itemShow = false;
      setShowPrice(canShow);
      setShowItem(itemShow);
      return
    }
    if (!myOrderMesStart.name || !myOrderMesStart.phonenumber || !myOrderMesStart.addressName || !myOrderMesStart.longitude || !myOrderMesStart.latitude) {
      canShow = false;
      itemShow = false;
      setShowPrice(canShow);
      setShowItem(itemShow);
      return
    }
    if (!myOrderMesReceive.name || !myOrderMesReceive.phonenumber || !myOrderMesReceive.addressName || !myOrderMesReceive.longitude || !myOrderMesReceive.latitude) {
      canShow = false;
      itemShow = false;
      setShowPrice(canShow);
      setShowItem(itemShow);
      return
    }
    itemShow = true;
    setShowItem(itemShow);
    if (!myOrderMesItem.type || !myOrderMesItem.size || !myOrderMesItem.weight) {
      canShow = false;
      setShowPrice(canShow);
      return
    }
    if (myOrderMes.orderType == "AppointmentOrder"){
      if (!myOrderMes.fetchTime){
        distanceShow = false;
        setShowDistance(distanceShow);
        return
      }else{

      }
    }
    if (myOrderMes.orderType == "AdvancedAppointmentOrder") {
      if (!myOrderMes.fetchTime || !myOrderMes.sendTime) {
        distanceShow = false;
        setShowDistance(distanceShow);
        return
      }
    }
    //显示
    setShowPrice(true);
    setShowItem(true);
    setShowDistance(true);
    function setShowPrice(canShow) {
      that.setData({
        isShowPrice: canShow
      })
    }

    function setShowItem(itemShow) {
      that.setData({
        isShowItem: itemShow
      })
    }
    function setShowDistance(itemShow) {
      that.setData({
        isShowDistance: distanceShow
      })
    }
    requestToken.tokenAjaxPost({
      url: url,
      data: that.data.orderMessArr,
      success(res) {
        // console.log(res);
        if (res.statusCode === 200) {
          var price = "orderMessArr.price"; //请求的现格
          var priceOrigin = "orderMessArr.priceOrigin"; //请求的原价
          var priceAdditional = "orderMessArr.priceAdditional"; //请求的加价
          var distance = "orderMessArr.distance"; //发件收件距离
          if (res.data.status === 1) {
            that.setData({
              [price]: res.data.data.price,
              [priceOrigin]: res.data.data.priceOrigin,
              [priceAdditional]: res.data.data.priceAdditional,
              [distance]: (res.data.data.distance / 1000).toFixed(2),
            })
            app.globalData.orderMessageArr.price = that.data.orderMessArr.price;
            app.globalData.orderMessageArr.priceOrigin = that.data.orderMessArr.priceOrigin;
            app.globalData.orderMessageArr.priceAdditional = that.data.orderMessArr.priceAdditional;
            app.globalData.orderMessageArr.distance = that.data.orderMessArr.distance;
            that.getDiscountNumber(); //红包数量
            getUserBalance(); //账户信息
            that.getDistance();//距离计算
          } else {
            wx.showToast({
              title: "对不起：" + JSON.stringify(res.data.msg),
              icon: "none",
              duration: 1500,
              mask: false,
            })
            that.setData({
              [price]: res.data.data.price,
              [priceOrigin]: res.data.data.priceOrigin,
              [priceAdditional]: res.data.data.priceAdditional,
              [distance]: (res.data.data.distance / 1000).toFixed(2),
            })
          }
        } else {
          requestToken.httpError(res.statusCode, 0);
        }
      }
    })

    function getUserBalance() { //请求余额信息
      var balanceUrl = constant.getAccountInfo(customerId);
      requestToken.tokenAjaxGet({
        url: balanceUrl,
        success(res) {
          if (res.statusCode === 200) {
            if (res.data.status === 1) {
              that.setData({
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
  },
  //测试getInfo
  getInfo: function() { //()测试请求用户信息(未启用 测试方法)
    var _this = this;
    wx.login({
      success(res) {
        console.log("login:");
        console.log(res)
      }
    })
  },
  radioTypeChange: function(e) { //订单类型改变
    var that = this;
    var orderType = "orderMessArr.orderType"
    that.setData({
      [orderType]: e.detail.value
    })
    app.globalData.orderMessageArr.orderType = e.detail.value;
    changeDataType(e.detail.value);
    changeType(that.data.orderMessArr.orderType);

    function changeDataType(dataType) {
      var typefetchTime = "orderMessArr.fetchTime";
      var typesendTime = "orderMessArr.sendTime";
      var typefetchTimeVal = "orderMessArr.fetchTimeVal";
      var typesendTimeVal = "orderMessArr.sendTimeVal";
      if (dataType === "MergeOrder" || dataType === "DirectOrder") {
        that.setData({
          [typefetchTime]: null,
          [typesendTime]: null,
          fetchTime: null,
          sendTime: null,
          fetchTimeVal: null,
          sendTimeVal: null,
          [typefetchTimeVal]: null,
          [typesendTimeVal]: null,
        })
        app.globalData.orderMessageArr.fetchTime = null;
        app.globalData.orderMessageArr.sendTime = null;
        app.globalData.orderMessageArr.fetchTimeVal = null;
        app.globalData.orderMessageArr.sendTimeVal = null;
        return
      }
      if (dataType === "AppointmentOrder") {
        that.setData({
          [typesendTime]: null,
          sendTime: null,
          sendTimeVal: null,
          [typesendTimeVal]: null,
        })
        app.globalData.orderMessageArr.sendTime = null;
        app.globalData.orderMessageArr.sendTimeVal = null;
        return
      }
    }

    function changeType(dataType) {
      var ordertype = "";
      var orderChangeType = "orderMessArr.orderChangeType";
      switch (dataType) {
        case "MergeOrder":
          ordertype = "mergeOrder";
          break;
        case "DirectOrder":
          ordertype = "directOrder";
          break;
        case "AppointmentOrder":
          ordertype = "appointmentOrder";
          break;
        case "AdvancedAppointmentOrder":
          ordertype = "advancedAppointmentOrder";
          break;
        default:
          ordertype = "mergeOrder";
          break;
      }
      that.setData({
        [orderChangeType]: ordertype
      })
      app.globalData.orderMessageArr.orderChangeType = ordertype;
      that.getPrice(); //请求价格
      // if (ordertype === "mergeOrder" || ordertype === "directOrder") {
      //   that.getPrice(); //请求价格
      //   return
      // } else {
      //   if (ordertype === "appointmentOrder" && that.data.orderMessArr.fetchTime) {
      //     that.getPrice(); //请求价格
      //     return
      //   } else if (ordertype === "advancedAppointmentOrder" && that.data.orderMessArr.fetchTime && that.data.orderMessArr.sendTime) {
      //     that.getPrice(); //请求价格
      //     return
      //   }
      // }
    }
  },
  radioPaymentChange: function(e) { //支付方式改变
    var that = this;
    var tempValue = e.currentTarget.dataset.value;
    var tempIndex = e.currentTarget.dataset.index;
    var payType = "orderMessArr.payType";
    var payMode = "orderMessArr.payMode";
    if (tempValue == 'ArrivalPay'){
      that.setData({
        [payType]: null,
        [payMode]: tempValue,
        clickPayIndex: tempIndex
      })
    }else{
      that.setData({
        [payType]: tempValue,
        [payMode]: null,
        clickPayIndex: tempIndex
      })
    }
    app.globalData.orderMessageArr.payType = that.data.orderMessArr.payType;
    app.globalData.orderMessageArr.payMode = that.data.orderMessArr.payMode;
    console.log("payType:" + app.globalData.orderMessageArr.payType + " / payMode:" + app.globalData.orderMessageArr.payMode);
  },
  //预约时间
  changeStartTime: function(e) { //发件时间确定
    var that = this;
    var time = that.data.dateTimeArray[0][that.data.startDetaTime[0]] + "/" + that.data.dateTimeArray[1][that.data.startDetaTime[1]] + "/" + that.data.dateTimeArray[2][that.data.startDetaTime[2]] + " " + that.data.dateTimeArray[3][that.data.startDetaTime[3]] + ":" + that.data.dateTimeArray[4][that.data.startDetaTime[4]];
    var haomiao = new Date(time).getTime();
    var fetchTime = "orderMessArr.fetchTime";
    var fetchTimeVal = "orderMessArr.fetchTimeVal";
    console.log(time);
    that.setData({
      fetchTimeVal: time,
      fetchTime: haomiao,
      [fetchTimeVal]: time,
      [fetchTime]: haomiao
    })
    console.log(that.data.orderMessArr.fetchTime);
    if (that.data.orderMessArr.fetchTime) {
      app.globalData.orderMessageArr.fetchTime = that.data.fetchTime;
      app.globalData.orderMessageArr.fetchTimeVal = that.data.fetchTimeVal;
      if (that.data.orderMessArr.orderType === "AppointmentOrder") {
        that.getPrice(); //重新获取价格
      }
    }
  },
  changeStartTimeColumn: function(e) { //发件时间滚动选择触发
    var that = this;
    var timeTemp = that.data.startDetaTime;
    var arrTemp = that.data.dateTimeArray;
    timeTemp[e.detail.column] = e.detail.value;
    arrTemp[2] = dateTimePicker.getMonthDay(arrTemp[0][timeTemp[0]], arrTemp[1][timeTemp[1]]);
    that.setData({
      startDetaTime: timeTemp,
      dateTimeArray: arrTemp
    })
    // that.changeStartTime();
  },
  changeEndTime: function(e) { //送件时间确定
    var that = this;
    var time = that.data.dateTimeArray[0][that.data.endDetaTimeArr[0]] + "/" + that.data.dateTimeArray[1][that.data.endDetaTimeArr[1]] + "/" + that.data.dateTimeArray[2][that.data.endDetaTimeArr[2]] + " " + that.data.dateTimeArray[3][that.data.endDetaTimeArr[3]] + ":" + that.data.dateTimeArray[4][that.data.endDetaTimeArr[4]];
    var haomiao = new Date(time).getTime();
    var sendTime = "orderMessArr.sendTime";
    var sendTimeVal = "orderMessArr.sendTimeVal";
    console.log(time);
    that.setData({
      sendTimeVal: time,
      sendTime: haomiao,
      [sendTimeVal]: time,
      [sendTime]: haomiao
    })
    if (that.data.sendTime) {
      app.globalData.orderMessageArr.sendTime = that.data.sendTime;
      app.globalData.orderMessageArr.sendTimeVal = that.data.sendTimeVal;
      if (that.data.fetchTime) {
        that.getPrice(); //重新获取价格
      }
    }
  },
  changeEndTimeColumn: function(e) { //收件时间滚动选择触发
    var that = this;
    var timeTemp = that.data.endDetaTimeArr;
    var arrTemp = that.data.dateTimeArray;
    timeTemp[e.detail.column] = e.detail.value;
    arrTemp[2] = dateTimePicker.getMonthDay(arrTemp[0][timeTemp[0]], arrTemp[1][timeTemp[1]]);
    that.setData({
      sendDetaTime: timeTemp,
      dateTimeArray: arrTemp
    })
    // that.changeEndTime();
  },
  //地图操作
  mapmark: function() { //标注点连线(未启用)
    var that = this;
    var startPolyline = that.data.markers[0];
    var receiverPolyline = that.data.markers[1];
    that.setData({
      polyline: [{
        points: [{
          latitude: startPolyline.latitude,
          longitude: startPolyline.longitude
        }, {
          latitude: receiverPolyline.latitude,
          longitude: receiverPolyline.longitude
        }],
        color: '#5e97ff',
        borderColor: "#333333",
        width: 4
      }]
    })
  },
  mapDriving: function() { //发件-收件连线-路线规划 bicycling
    var that = this;
    var startPolyline = that.data.markers[0];
    var receiverPolyline = that.data.markers[1];
    //请求路线规划
    (function(){
      //网络请求设置
      var opt = {
        //WebService请求地址，from为起点坐标，to为终点坐标，开发key为必填
        url: 'https://apis.map.qq.com/ws/direction/v1/bicycling/?from=' + startPolyline.latitude + ',' + startPolyline.longitude + '&to=' + receiverPolyline.latitude + ',' + receiverPolyline.longitude + '&key=' + constant.tencentAk,
        method: 'GET',
        dataType: 'json',
        //请求成功回调
        success: function (res) {
          var ret = res.data;
          // console.log(res);
          if (ret.status != 0) return; //服务异常处理
          var coors = ret.result.routes[0].polyline,
            pl = [];
          //坐标解压（返回的点串坐标，通过前向差分进行压缩）
          var kr = 1000000;
          for (var i = 2; i < coors.length; i++) {
            coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
          }
          //将解压后的坐标放入点串数组pl中
          for (var i = 0; i < coors.length; i += 2) {
            pl.push({
              latitude: coors[i],
              longitude: coors[i + 1]
            })
          }
          //设置polyline属性，将路线显示出来
          that.setData({
            polyline: [{
              points: pl,
              color: '#5e97ff',
              borderColor: "#333333",
              width: 4
            }]
          })
        }
      };
      wx.request(opt);
    })()
    that.getDistance();//距离计算
  },
  getDistance: function () {//距离计算
    var _this = this;
    //距离计算
    var distance_temp = 0;
    if (!_this.data.orderMessArr.distance){
      distanceCompute()//腾讯地图根据经纬度计算距离
    }else{
      distance_temp = _this.data.orderMessArr.distance;
    }
    
    var base_temp = 60000;//60*1000 1s=1000ms 1m/s=3.6km/h
    var number_temp = 52;//分钟
    var distanceInfo = "markers[1].callout.content";
    
    if (distance_temp){
      console.log(distance_temp);
      if (distance_temp <= 0){
        number_temp = 30;
        _this.setData({
          distanceInfo: " 请检查地址是否有误! ",
          [distanceInfo]: " 请检查地址是否有误! "
        })
        return
      } else if (distance_temp > 0 && distance_temp <= 5) {
        number_temp = 50;
      } else if (distance_temp > 5 && distance_temp <= 8){
        number_temp = 90;
      } else if (distance_temp > 8 && distance_temp <= 16){
        number_temp = 120;
      } else if (distance_temp > 16 && distance_temp <= 20) {
        number_temp = 150;
      } else if (distance_temp > 20 && distance_temp <= 30) {
        number_temp = 180;
      } else if (distance_temp > 30 && distance_temp <= 50){
        number_temp = 210;
      }else{
        number_temp = 600;
        _this.setData({
          distanceInfo: " 距离过远,请检查地址是否有误! ",
          [distanceInfo]: " 距离过远,请检查地址是否有误! "
        })
        return
      }
    }
    
    //气泡显示延时时间
    var delay_temp = number_temp * base_temp;
    var date = new Date(new Date().getTime() + delay_temp);//当前时间延时分钟
    var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    var minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    
    _this.setData({
      distanceInfo: " 预计" + hour + ":" + minute +"之前可送达 ",
      [distanceInfo]: _this.data.distanceInfo
    })
    console.log(_this.data.distanceInfo);
    console.log(_this.data.markers[1].callout.content);
    mark_callout();//气泡标注点
    function mark_callout(){//标记气泡
      var receiveMark = "markers[" + 1 +"]";
      var receiveMarkMes = {
        id: 1,
        longitude: _this.data.orderMessArr.receiver.Txlongitude,
        latitude: _this.data.orderMessArr.receiver.Txlatitude,
        title: "收件位置",
        iconPath: "../images/map_receiver.png",
        width: 27,
        height: 44,
        callout: {
          content: _this.data.distanceInfo,
          color: "#ffffff",
          fontSize: 16,
          borderRadius: 20,
          borderWidth: 1,
          padding: 6,
          borderColor: '#eeeeee',
          bgColor: "#504c48",
          display: (_this.data.orderMessArr.starter.poiName && _this.data.orderMessArr.receiver.poiName) ? "ALWAYS" : "BYCLICK",//"ALWAYS":"BYCLICK"
          textAlign: "center"
        }
      }
      _this.setData({
        [receiveMark]: receiveMarkMes,
      })
    }
    function distanceCompute() {//计算距离
      var qqMap = new QQMapWX({
        key: constant.tencentAk
      })
      qqMap.calculateDistance({
        from: {
          latitude: _this.data.orderMessArr.starter.Txlatitude,
          longitude: _this.data.orderMessArr.starter.Txlongitude
        },
        to: [{
          latitude: _this.data.orderMessArr.receiver.Txlatitude,
          longitude: _this.data.orderMessArr.receiver.Txlongitude
        }],
        success: function (res) {
          console.log("距离计算");
          console.log(res.result.elements[0]);
          if (res.status === 0) {
            console.log(res.result.elements[0].distance);
            if (res.result.elements[0].distance) {
              var distance = (res.result.elements[0].distance / 1000).toFixed(2);
              // _this.data.distanceInfo = " 距离约" + distance + "km 预计" + 60 + "分钟送达 ";
              _this.setData({
                distance: distance
                // distanceInfo: " 距离约" + distance + "km 预计" + 60 + "分钟送达 ",
              })
            }
          }
        },
        fail: function (res) {
          console.log(res);
        },
        complete: function (res) {
          // console.log(res);
        }
      });
    }
  },
  setMapHeight: function() { //动态设置地图高度
    var _this = this;
    var orderPageMes = _this.data.orderMessArr;
    if (orderPageMes.starter.longitude && orderPageMes.starter.latitude && orderPageMes.receiver.longitude && orderPageMes.receiver.latitude) {
      if (orderPageMes.starter.name && orderPageMes.starter.phonenumber && orderPageMes.receiver.name && orderPageMes.receiver.phonenumber && orderPageMes.item.type && orderPageMes.item.size && orderPageMes.item.weight) {
        _this.setData({
          mapHeight: _this.data.windowInfo.windowHeight - 430, //设置地图height
          includePoints: [{
            longitude: orderPageMes.starter.Txlongitude,
            latitude: orderPageMes.starter.Txlatitude,
          }, {
            longitude: orderPageMes.receiver.Txlongitude,
            latitude: orderPageMes.receiver.Txlatitude,
          }],
          mapScale: 16,
        })
        return
      } else if (orderPageMes.starter.name && orderPageMes.starter.phonenumber && orderPageMes.receiver.name && orderPageMes.receiver.phonenumber) {
        _this.setData({
          mapHeight: _this.data.windowInfo.windowHeight - 310, //设置地图height
          includePoints: [{
            longitude: orderPageMes.starter.Txlongitude,
            latitude: orderPageMes.starter.Txlatitude,
          }, {
            longitude: orderPageMes.receiver.Txlongitude,
            latitude: orderPageMes.receiver.Txlatitude,
          }],
          mapScale: 16,
        })
        return
      } else {
        _this.setData({
          includePoints: [{
            longitude: orderPageMes.starter.Txlongitude,
            latitude: orderPageMes.starter.Txlatitude,
          }, {
            longitude: orderPageMes.receiver.Txlongitude,
            latitude: orderPageMes.receiver.Txlatitude,
          }],
          mapScale: 16,
        })
        return
      }
    }
  },
  saveMessage: function(customerId, saveType) { //保存地址
    var _this = this;
    var saveType = saveType;
    var saveData = [];
    var saveUrl = "";
    switch (saveType) {
      case "saveStart":
        saveData = _this.data.orderMessArr.starter;
        saveUrl = constant.API_URL_POST_SAVE_STARTER_ADDRESS + customerId;
        saveRequest(saveData, saveUrl, saveType);
        break;
      case "saveReceive":
        saveData = _this.data.orderMessArr.receiver;
        saveUrl = constant.API_URL_POST_SAVE_RECEIVER_ADDRESS + customerId;
        saveRequest(saveData, saveUrl, saveType);
        break;
      case "saveItem":
        saveData = {
          itemId: null,
          name: _this.data.orderMessArr.item.name,
          type: _this.data.orderMessArr.item.type,
          size: _this.data.orderMessArr.item.size,
          vehicle: _this.data.orderMessArr.vehicle,
          weight: _this.data.orderMessArr.item.weight,
          remark: _this.data.orderMessArr.item.remark
        }
        saveUrl = constant.API_URL_POST_ITEM_SAVE + customerId;
        saveRequest(saveData, saveUrl, saveType);
        break;
      default:
        break;
    }
    //请求数据
    function saveRequest(saveData, saveUrl, saveType) {
      requestToken.tokenAjaxPost({
        url: saveUrl,
        data: saveData,
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            if (res.data.status === 1) {
              console.log("保存成功: " + saveType);
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
  //创建订单
  createOrder: function() {
    var _this = this;
    var customerId = requestToken.getCustomerId(); //拿取用户id
    var orderMessagesArr = _this.data.orderMessArr;
    if (!orderMessagesArr) {
      wx.showToast({
        title: "请先完善信息!"
      })
      _this.setData({
        subLoading: false
      })
      return false
    }
    //判断是否为微信支付类型   调用微信登录拿取code 换取openId
    if (_this.data.orderMessArr.payType == 'WXPAY_MINI') {
      wx.showLoading({
        title: '正在创建订单...',
      })
      wx.login({
        success(res) {
          console.log("login code:");
          console.log(res);
          if (res.code) {
            var codeId = res.code;
            getOpenId(customerId, codeId); //根据code拿取openId
          } else {
            wx.showToast({
              title: "获取微信code失败!"
            })
          }
        },
        fail() {
          wx.showToast({
            title: "获取微信code失败!"
          })
        }
      })
      return
    }
    //判断是否为余额支付类型
    if (_this.data.orderMessArr.payType === "CUSTOMER_RECHARGE") {
      wx.showLoading({
        title: '正在创建订单...',
      })
      creadeOrderMess(customerId); //执行创建余额支付订单
      return
    }
    //判断是否为到付类型
    if (!_this.data.orderMessArr.payType && _this.data.orderMessArr.payMode === "ArrivalPay") {
      wx.showModal({
        title: '到付订单提醒',
        content: '配送员取件时请提示此件需向收件人收取配送费用!'+"\n"+"是否确认到付下单?",
        cancelText:"返回",
        confirmText:"确定下单",
        success: function (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '正在创建订单...',
            })
            creadeOrderMess(customerId); //执行创建到付订单
          } else {
            _this.setData({
              subLoading: false
            })
            // console.log('用户点击取消')
          }
        }
      })
      
      return
    }
    //微信支付类型根据code拿取openId
    function getOpenId(customerId, codeId) {
      var getUrl = constant.wxCodeExchangeOpenId(customerId, codeId);
      requestToken.tokenAjaxGet({
        url: getUrl,
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            console.log(res)
            if (res.data.status === 1) {
              console.log(res.data);
              var getOpenId = res.data.data;
              var openId = "orderMessArr.openId";
              _this.setData({
                [openId]: getOpenId
              })
              console.log(_this.data.orderMessArr);
              // app.globalData.orderMessageArr.openId = _this.data.orderMessArr.openId;
              creadeOrderMess(customerId); //执行创建微信支付订单
            } else {
              _this.setData({ //提交按钮可点击
                subLoading: false
              })
              requestToken.resError(res.data.msg);
            }
          } else {
            requestToken.httpError(res.statusCode, 0);
          }
        }
      })
    }

    function creadeOrderMess(customerId) { //执行创建订单
      //根据类型创建不同类型的订单账单
      var creatUrl = constant.API_CREATE_ORDER_COMMON + _this.data.orderMessArr.orderChangeType + "/create/" + customerId;
      if (_this.data.orderMessArr.orderChangeType == "advancedAppointmentOrder") { //高级预约接口后台写的有误 与后台保持一致
        creatUrl = constant.API_CREATE_ORDER_COMMON + "advancedAppointmentOder/create/" + customerId;
      }
      requestToken.tokenAjaxPost({
        url: creatUrl,
        data: orderMessagesArr,
        success(res) {
          _this.setData({ //提交按钮可点击
            subLoading: false
          })
          wx.hideLoading(); //停止数据加载
          console.log(res);
          if (res.statusCode === 200) {
            if (res.data.status === 1) {
              var creadeOrderInfo = JSON.stringify(res.data.data);
              var payType = _this.data.orderMessArr.payType;
              var payMode = _this.data.orderMessArr.payMode;
              // var priceAdditional = "orderMessArr.priceAdditional"; //加价
              wx.navigateTo({ //订单预览
                url: "../previewOrder/previewOrder?creadeOrderInfo=" + creadeOrderInfo + "&orderType=" + _this.data.orderMessArr.orderType + "&payType=" + payType + "&payMode=" + payMode
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
  //(便民服务)一键呼叫
  oneButtonCall: function () {
    var _this = this;
    wx.showToast({
      title: '即将上线,敬请期待...',
      icon:"none"

    })
  },
  openCheapLife:function(){
    var _this = this;
    wx.navigateToMiniProgram({//打开惠生活
      appId:"wx5550c4e45763cd0e",
      fail(res){
        console.log("打开小程序失败数据:"+JSON.stringify(res));
      }
    })
  },
  //打开页面 
  clickSubmit: function() { //点击确认订单 到订单预览
    var _this = this;
    _this.setData({
      subLoading: true
    })
    console.log(app.globalData.orderMessageArr);
    _this.createOrder();
    var customerId = requestToken.getCustomerId();
    //保存地址
    if (app.globalData.saveMessages.saveStartInfo) {
      _this.saveMessage(customerId, "saveStart"); //saveStart saveReceive saveItem
    }
    if (app.globalData.saveMessages.saveReceiveInfo) {
      _this.saveMessage(customerId, "saveReceive"); //saveStart saveReceive saveItem
    }
    if (app.globalData.saveMessages.saveItemInfo) {
      _this.saveMessage(customerId, "saveItem"); //saveStart saveReceive saveItem
    }
  },
  userCenter: function() { //打开地图右上角个人中心
    this.canIUse;
    wx.navigateTo({
      url: "../userCenter/userCenter"
    })
  },
  openToStart: function() { //打开发件人信息填写页面
    wx.navigateTo({
      url: "../orderStart/orderStart"
    })
  },
  openToReceive: function() { //打开收件人信息填写页面
    wx.navigateTo({
      url: "../orderReceive/orderReceive"
    })
  },
  openToItem: function() { //打开收件人信息填写页面
    wx.navigateTo({
      url: "../orderItem/orderItem"
    })
  },
  openToRemark: function() { //打开备注信息填写页面
    wx.navigateTo({
      url: "../orderRemark/orderRemark"
    })
  },
  openToCandiscount: function() { //打开下单可用红包界面
    wx.navigateTo({
      url: "../canDiscount/canDiscount"
    })
  },
  openToOftenStart: function() { //打开常用发件地址界面
    wx.navigateTo({
      url: "../oftenStart/oftenStart?type=oftenStart"
    })
  },
  openToOftenReceive: function() { //打开常用收件地址界面
    wx.navigateTo({
      url: "../oftenStart/oftenStart?type=oftenReceive"
    })
  },
  openToOftenItem: function() { //打开常用物品界面
    wx.navigateTo({
      url: "../oftenItem/oftenItem"
    })
  },
  loginAgain: function() { //重新登录
    wx.navigateTo({
      url: "../login/login"
    })
  },
  resetMessages:function(){
    var _this = this;
    wx.showModal({
      title: '将刷新页面',
      content: '数据将丢失,您确定重载页面数据?',
      success: function (res) {
        if (res.confirm) {
          //清空信息 页面重定向
          var orderMessageArr = {
            "starter": {
              "name": "",
              "phonenumber": "",
              "longitude": 0,
              "latitude": 0,
              "Txlongitude": 0,
              "Txlatitude": 0,
              "addressName": "",
              "addressDetail": "",
              "poiName": ""
            },
            "receiver": {
              "name": "",
              "phonenumber": "",
              "longitude": 0,
              "latitude": 0,
              "Txlongitude": 0,
              "Txlatitude": 0,
              "addressName": "",
              "addressDetail": "",
              "poiName": "",
            },
            "item": {
              "name": "",
              "type": "",
              "size": "",//MIDDLE
              "sizeValue": "",//中件（50x50x30cm）
              "weight": "1",
              "vehicleVal": "",
              "remark": "",
              "itemTypeIndex": null,
              "itemSizeIndex": null,
              "itemVehicleIndex": null
            },
            "couponId": null,//红包ID
            "couponNumber": null,//可用红包数量
            "couponPre": 0,//红包金额
            "fetchTime": null,//取件时间
            "sendTime": null,//送件时间
            "fetchTimeVal": null,//时间预览
            "sendTimeVal": null,//时间预览
            "priceOrigin": 0,//原价
            "price": 0,//现价
            "priceAdditional": 0,//加价
            "distance": 0,//距离
            "distancePreview": 0,//距离预览
            "vehicle": null,//交通工具
            "orderType": "MergeOrder",//订单类型
            "orderChangeType": "mergeOrder",//预览使用的订单类型
            "payType": "WXPAY_MINI",//付款类型微信 CUSTOMER_RECHARGE
            "openId": null//用于微信支付
          };
          app.globalData.orderMessageArr = orderMessageArr;
          app.globalData.useDefauleStatus = true;
          // _this.setData({
          //   orderMessArr: orderMessageArr
          // })
          wx.redirectTo({
            url: '/pages/index/index'
          })

        } else {
          // console.log('用户点击取消')
        }
      }
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
    var _this = this;
    app.globalData.orderMessageArr = {
      "starter": {
        "name": "",
        "phonenumber": "",
        "longitude": 0,
        "latitude": 0,
        "Txlongitude": 0,
        "Txlatitude": 0,
        "addressName": "",
        "addressDetail": "",
        "poiName": ""
      },
      "receiver": {
        "name": "",
        "phonenumber": "",
        "longitude": 0,
        "latitude": 0,
        "Txlongitude": 0,
        "Txlatitude": 0,
        "addressName": "",
        "addressDetail": "",
        "poiName": "",
      },
      "item": {
        "name": "",
        "type": "",
        "size": "", //MIDDLE
        "sizeValue": "", //中件（50x50x30cm）
        "weight": "1",
        "vehicleVal": "",
        "remark": "",
        "itemTypeIndex": null,
        "itemSizeIndex": null,
        "itemVehicleIndex": null
      },
      "couponId": null, //红包ID
      "couponNumber": null, //可用红包数量
      "couponPre": 0, //红包金额
      "fetchTime": null, //取件时间
      "sendTime": null, //送件时间
      "fetchTimeVal": null, //时间预览
      "sendTimeVal": null, //时间预览
      "priceOrigin": 0, //原价
      "price": 0, //现价
      "priceAdditional": 0, //加价
      "distance": 0, //距离
      "distancePreview": 0, //距离预览
      "vehicle": null, //交通工具
      "orderType": "MergeOrder", //订单类型
      "orderChangeType": "mergeOrder", //预览使用的订单类型
      "payType": "WXPAY_MINI", //付款类型微信 CUSTOMER_RECHARGE
      "openId": null //用于微信支付
    }
    app.globalData.useDefauleStatus = true;
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let that = this;
    let path = 'pages/index/index';
    return {
      title: '壹配送同城物流综合平台',
      path: path,
      imageUrl: "/images/SEO/show_index_banner.png",
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: "分享成功",
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})