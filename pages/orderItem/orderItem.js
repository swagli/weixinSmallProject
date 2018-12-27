var app = getApp();

Page({
  data: {
    //渲染数组
    itemTypeList: [
      {
        index: 0,
        value:"食品"},
      {
        index: 1,
        value: "鲜花"
      },
      {
        index: 2,
        value: "饮料"
      },
      {
        index: 3,
        value: "水果"
      },
      {
        index: 4,
        value: "生鲜"
      },
      {
        index: 5,
        value: "蛋糕"
      },
      {
        index: 6,
        value: "文件"
      },
      {
        index: 7,
        value: "证件"
      },
      {
        index: 8,
        value: "数码"
      },
      {
        index: 9,
        value: "衣服"
      },
      {
        index: 10,
        value: "建材"
      }, 
      {
        index: 11,
        value: "其他"
      }
    ],
    itemSizeList: [
      {
        "index":0,
        "type":"SMALL",
        "value":"小件（30x30x30cm）"
      },
      {
        "index": 1,
        "type": "MIDDLE",
        "value": "中件（50x50x30cm）"
      },
      {
        "index": 2,
        "type": "BIG",
        "value": "大件（100x100x40cm）"
      },
      {
        "index": 3,
        "type": "VERY_BIG",
        "value": "小型货运（100x150x150cm）"
      },
      {
        "index": 4,
        "type": "HUGE",
        "value": "中型货运（200x150x150cm）"
      }
    ],
    itemVehicleList: [
      {
        "index": 0,
        "type": "ELECTRIC",
        "value": "电动车"
      },
      {
        "index": 1,
        "type": "CAR",
        "value": "小汽车"
      },
      {
        "index": 2,
        "type": "VAN",
        "value": "面包车"
      },
      {
        "index": 3,
        "type": "MOBILE_TRICYCLE",
        "value": "机动三轮车"
      },
      {
        "index": 4,
        "type": "TRUCK",
        "value": "小型货车"
      },
      {
        "index": 5,
        "type": "MIDDLE_TRUCK",
        "value": "中型货车"
      }
    ],
    //物品填写选择判断
    itemTypeIndex:null,
    itemSizeIndex: null,
    itemVehicleIndex: null,
    weigthNumber:1,//物品重量
    minNumber:false,//是否达到最大或最小
    maxNumber:false,
    //物品数组填充字段整理
    itemName: "",//物品名称
    itemType: "",//物品类型
    itemSize: null,//物品大小
    itemRemark: "",//物品备注
    itemSizeVal: null,////物品大小中文
    vehicle: null,//交通工具
    vehicleVal: null,////交通工具中文
    //判断是否可以返回
    isBack:false
  },
  onLoad: function () {
    var pages = getCurrentPages();
    console.log("物品信息页面栈长度:" + pages.length);
  },
  onShow:function(){
    var that = this;
    var itemMessages = app.globalData.orderMessageArr.item;
    console.log("加载渲染");
    console.log(itemMessages);
    if (itemMessages.type && itemMessages.name && itemMessages.size && itemMessages.weight) {
      if (itemMessages.itemTypeIndex !== null && itemMessages.itemSizeIndex!==null){
          that.setData({
            itemName: itemMessages.name,//物品名称
            itemType: itemMessages.type,//物品类型
            itemSize: itemMessages.size,//物品大小
            weigthNumber: itemMessages.weight,//物品重量
            itemRemark: itemMessages.remark,//物品备注
            itemSizeVal: itemMessages.sizeValue,////物品大小中文
            vehicle: app.globalData.orderMessageArr.vehicle,//交通工具
            vehicleVal: itemMessages.vehicleVal,////交通工具中文
            itemTypeIndex: itemMessages.itemTypeIndex,
            itemSizeIndex: itemMessages.itemSizeIndex,
            itemVehicleIndex: itemMessages.itemVehicleIndex,
          })
        }
    }
    that.judgeFunction();//判断是否完成填写
  },
  onReady: function () {
    var that = this;
  },
  chooseItemType:function(e){//物品类型选择
    var that = this;
    that.setData({
      itemTypeIndex: e.currentTarget.dataset.index,
      itemName: e.currentTarget.dataset.name,
      itemType: e.currentTarget.dataset.name
    })
    that.judgeFunction();//判断是否完成填写
  },
  chooseItemSize: function (e) {//物品大小选择
    var that = this;
    console.log(e.currentTarget.dataset);
    that.setData({
      itemSizeIndex: e.currentTarget.dataset.index,
      itemSize: e.currentTarget.dataset.type,
      itemSizeVal: e.currentTarget.dataset.name
    })
    console.log(that.data.itemSize);
    that.judgeFunction();//判断是否完成填写
    console.log(that.data.vehicle);
  },
  chooseItemVehicle: function (e) {//交通工具选择
    var that = this;
    console.log(e.currentTarget.dataset);
    that.setData({
      itemVehicleIndex: e.currentTarget.dataset.index,
      vehicle: e.currentTarget.dataset.type,
      vehicleVal: e.currentTarget.dataset.name,
    })
    that.judgeFunction();//判断是否完成填写
  },
  clickReduce:function(){//重量减
    var that = this;
    if (that.data.weigthNumber>1){
      that.data.weigthNumber--;
      that.data.minNumber = false;
      that.data.maxNumber = false;
    }else{
      that.data.weigthNumber = 1;
      that.data.minNumber = true;
    }
    that.setData({
      minNumber: that.data.minNumber,
      maxNumber: that.data.maxNumber,
      weigthNumber: that.data.weigthNumber,
      itemListArr: {
        "weight": that.data.weigthNumber,
      }
    })
    that.judgeFunction();//判断是否完成填写
  },
  clickAdd: function () {//重量加
    var that = this;
    that.judgeFunction();//判断是否完成填写
    if (that.data.weigthNumber < 100) {
      that.data.weigthNumber++;
      that.data.minNumber = false;
      that.data.maxNumber = false;
    } else {
      that.data.weigthNumber = 100;
      that.data.maxNumber = true;
    }
    that.setData({
      minNumber: that.data.minNumber,
      maxNumber: that.data.maxNumber,
      weigthNumber: that.data.weigthNumber,
    })
  },
  backToIndex: function () {//点击确认物品
    var that = this;
    var pagesNumber = getCurrentPages();//页面栈长度
    that.judgeFunction();//判断是否完成填写
    if (that.data.isBack && that.judgeFunction()){
      var itemListArr = {//数据整理
        "name": that.data.itemName,
        "type": that.data.itemType,
        "size": that.data.itemSize,//MIDDLE
        "sizeValue": that.data.itemSizeVal,//中件（50x50x30cm）
        "weight": that.data.weigthNumber,
        "vehicle": that.data.vehicle,
        "vehicleVal": that.data.vehicleVal,
        "remark": that.data.itemRemark,
        "itemTypeIndex": that.data.itemTypeIndex,
        "itemSizeIndex": that.data.itemSizeIndex,
        "itemVehicleIndex": that.data.itemVehicleIndex
      }
      //全局赋值
      app.globalData.orderMessageArr.item = itemListArr;
      app.globalData.orderMessageArr.vehicle = that.data.vehicle;
      app.globalData.saveMessages.saveItemInfo = true;
      //跳转判断
      if (pagesNumber.length > 1) {
        wx.navigateBack({
          delta: 1
        })
      } else {
        wx.navigateTo({
          url: "../index/index"
        })
      }
      console.log(itemListArr);
    }else{
      wx.showModal({
        title: '提示',
        content: '请完善物品信息',
        success: function (res) {
          if (res.confirm) {
            // console.log('用户点击确定')
          } else if (res.cancel) {
            // console.log('用户点击取消')
          }
        }
      })
    }
  },
  //判断是否完成填写
  judgeFunction:function(){
    var that = this;
    console.log("1");
    var itemListArr = {
      "name": that.data.itemName,
      "type": that.data.itemType,
      "size": that.data.itemSize,//MIDDLE
      "sizeValue": that.data.itemSizeVal,//中件（50x50x30cm）
      "weight": that.data.weigthNumber,
      "vehicle": that.data.vehicle,
      "vehicleVal": that.data.vehicleVal,
      "remark": that.data.itemRemark
    }
    if (!itemListArr.type || !itemListArr.name || !itemListArr.size || !itemListArr.weight) {
      that.setData({
        isBack: false
      })
      return false;
    } else {//根据尺寸判断对应的交通工具
      if (itemListArr.size === 'SMALL' || itemListArr.size === 'MIDDLE') {
        that.setData({
          isBack: true,
          vehicle: null,//交通工具
          vehicleVal: null,////交通工具中文
          itemVehicleIndex:null
        })
        return true;
      }else{
        if (itemListArr.size === 'BIG'){
          if (that.data.itemVehicleIndex == 2 || that.data.itemVehicleIndex == 3 || that.data.itemVehicleIndex == 4){
            that.setData({
              isBack: true,
            })
            return true;
          }else{
            that.setData({
              isBack: false,
            })
            return false;
          }
        } else if (itemListArr.size === 'VERY_BIG') {
          if (that.data.itemVehicleIndex == 4 || that.data.itemVehicleIndex == 5) {
            that.setData({
              isBack: true,
            })
            return true;
          }else{
            that.setData({
              isBack: false,
            })
            return false;
          }
        } else if (itemListArr.size === 'HUGE') {
          if (that.data.itemVehicleIndex == 5) {
            that.setData({
              isBack: true,
            })
            return true;
          } else {
            that.setData({
              isBack: false,
            })
            return false;
          }
        }else{
          that.setData({
            isBack: false,
            vehicle: null,//交通工具
            vehicleVal: null,////交通工具中文
            itemVehicleIndex: null
          })
          return false;
        }
      }
    }
  }
})