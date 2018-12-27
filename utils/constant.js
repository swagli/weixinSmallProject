/* 常量类 */
// const API ="https://peter.xiaomiqiu.com";
// const API_SERVER = API;

const API = "https://yikesong.cc";
const API_SERVER = API + ":8080";

// const API = "https://czyhandsome.ink";
// const API_SERVER = API + "/core";
console.log(API);

/* 登陆接口-短信登录 */
const API_LOGIN_SMS = API_SERVER + "/api/public/customer/sms_login";
const API_SMS_LOGIN = API_SERVER + "/api/public/customer/loginBySms";

function setPassword(customerId) {
  return API_SERVER + "/api/customer/changePasswordByToken/" + customerId;
}
//手机账号-密码登录
const API_LOGIN = API_SERVER + "/api/public/customer/loginByPhonenumber";
/* 用户账户信息 */
//获取用户账户信息
function getAccountInfo(customerId) {
  return API_SERVER + "/api/customer/" + customerId + "/recharges/account";
}
//获取用户个人信息
function getCustomerInfo(customerId) {
  return API_SERVER + "/api/customer/getUserInfo/" + customerId;
}
/* 订单及价格预览接口 */
//通用价格预览
const API_PRICE_PREVIEW_COMMON = API_SERVER + "/api/customer/ordering/";
//查询所有可用的红包列表
const API_URL_GET_CAN_USE_ALL_COUPON_LIST = API_SERVER + "/api/customer/coupon/findCanUseCouponAllList/";
//查询所有已使用的红包和过期的红包列表
const API_URL_POST_FIND_HISTORY_COUPON_LIST = API_SERVER + "/api/customer/coupon/findHistoryCouponList";
/* 获可用红包数量*/
function countCanUseCouponUrl(customerId, orderPrice, type) {
  return API_SERVER + "/api/customer/coupon/countCanUseCoupon/" + customerId + "/orderPrice/" + orderPrice + "/" + type;
}
/* 获取下单可用红包*/
function findCanUseCouponListUrl(customerId, orderPrice, type) {
  return API_SERVER + "/api/customer/coupon/findCanUseCouponList/" + customerId + "/orderPrice/" + orderPrice + "/" + type;
}
/**
 * 获取联系常用地址
 */
//设置默认发件地址
function addOrEditDefaultStarter(customerId, starterId) {
  return API_SERVER + "/api/customer/frequentstarter/addOrEditDefaultStarter/" + customerId + "/" + starterId;
}
//设置常用物品
function addOrEditDefaultItem(customerId, itemId) {
  return API_SERVER + "/api/customer/item/addOrEditDefaultItem/" + customerId + "/" + itemId;
}
//获取默认的发件人和物品信息
const API_URL_GET_DEFAULT_ITEM_STARTER = API_SERVER + "/api/customer/item/getDefault/";
//常用发件人
function getStarterAddressUrl(customerId, pageIndex, pageSize) {
  return API_SERVER + "/api/customer/frequentstarter/findList/customerId/" + customerId + "/pageIndex/" + pageIndex + "/pageSize/" + pageSize;
}
//常用收件人地址
function getReceiverAddressUrl(customerId, pageIndex, pageSize) {
  return API_SERVER + "/api/customer/frequentreceiver/findList/customerId/" + customerId + "/pageIndex/" + pageIndex + "/pageSize/" + pageSize;
}
/**
 * 常用物品
 */
function getItemList(customerId, pageIndex, pageSize) {
  return API_SERVER + "/api/customer/item/findItemList/" + customerId + "/pageIndex/" + pageIndex + "/pageSize/" + pageSize;
}
//设置默认发件地址
function addOrEditDefaultStarter(customerId, starterId) {
  return API_SERVER + "/api/customer/frequentstarter/addOrEditDefaultStarter/" + customerId + "/" + starterId;
}
//设置常用物品
function addOrEditDefaultItem(customerId, itemId) {
  return API_SERVER + "/api/customer/item/addOrEditDefaultItem/" + customerId + "/" + itemId;
}
/***保存常用信息 发件 收件 物品*/
//保存为常用发件人
const API_URL_POST_SAVE_STARTER_ADDRESS = API_SERVER + "/api/customer/frequentstarter/save/customerId/";
//保存为常用收件人
const API_URL_POST_SAVE_RECEIVER_ADDRESS = API_SERVER + "/api/customer/frequentreceiver/save/customerId/";
//保存为常用物品
const API_URL_POST_ITEM_SAVE = API_SERVER + "/api/customer/item/saveoredit/";
/**单个删除常用信息**/
const API_URL_POST_DELETE_RECEIVER_ADDRESS = API_SERVER + "/api/customer/frequentreceiver/delete/id/";
const API_URL_POST_DELETE_STARTER_ADDRESS = API_SERVER + "/api/customer/frequentstarter/delete/id/";
const API_URL_POST_ITEM_DELELE = API_SERVER + "/api/customer/item/deleteOne/";
/**下单接口**/
const API_CREATE_ORDER_COMMON = API_SERVER + "/api/customer/ordering/";
//微信创建订单前拿取openId
function wxCodeExchangeOpenId(customerId, codeId) {
  return API_SERVER + "/api/public/miniapp/code2Session/" + customerId + "/" + codeId;
}
//查看微信账单信息
function seeWxjsapiBillMess(customerId, orderId) {
  return API_SERVER + "/api/customer/" + customerId + "/pc/orderBill/miniapp/" + orderId;
}
//查看余额账单信息
function seeRechargeBillMess(customerId, orderId) {
  return API_SERVER + "/api/customer/" + customerId + "/pc/orderBill/" + orderId;
}
//用余额支付账单
function useRechargeToPayBill(customerId, billId) {
  return API_SERVER + "/api/customer/" + customerId + "/recharges/payOtherBill/billId/" + billId;
}
//查看充值记录
function getRechargeRecords(customerId, pageIndex, pageSize) {
  return API_SERVER + "/api/customer/" + customerId + "/recharges/rechargeRecords?pageIndex=" + pageIndex + "&pageSize=" + pageSize;
}
//查看支付记录
function getPaymentRecords(customerId, pageIndex, pageSize) {
  return API_SERVER + "/api/customer/" + customerId + "/recharges/payOtherBill/records?pageIndex=" + pageIndex + "&pageSize=" + pageSize;
}
//创建微信余额充值账单
function createRechargeBill(customerId) {
  return API_SERVER + "/api/customer/" + customerId + "/recharges/jsapi/bills";
}
//查看余额账单充值支付情况
function checkBillAlreadyPayed(customerId, billId) {
  return API_SERVER + "/api/customer/" + customerId + "/recharges/bills/" + billId + "/alreadyPayed";
}
/*订单接口*/
/**一年内所有订单**/
const API_URL_POST_HISTORY_ORDERS = API_SERVER + "/api/customer/order/historyOrders";
/**未完成订单**/
const API_URL_GET_NOW_ORDERS = API_SERVER + "/api/customer/order/unfinishedorder/";
/**根据状态查询订单**/ //PAYED：待取件，SENDING：配送中，FINISHED：已完成
//const API_URL_GET_STATUS_ORDER = API_SERVER + "/api/customer/";
/**** 重新派单 ****/
const API_URL_POST_AGAIN_SEND_ORDER = API_SERVER + "/api/customer/ordering/againSendOrder/";
/** 取消订单**/
const API_URL_POST_CANCEL_ORDER = API_SERVER + "/api/customer/ordering/cancel/";
/** 删除订单**/
const API_URL_POST_DELETE_HISTORY_ORDER = API_SERVER + "/api/customer/ordering/deleteOrder/";
/** 获取配送员信息 **/
const API_URL_GET_SENDERINFO = API_SERVER + "/api/customer/querySender/senderInfo/";
/**一天内已完成或已评价(可投诉 订单)**/
//投诉订单接口
function customerComplain(customerId, orderId, complainNum) {
  return API_SERVER + '/api/customer/' + customerId + '/complain/order/' + orderId + '/' + complainNum;
}
//获取投诉原因
function getComplainList(customerId, orderId) {
  return API_SERVER + '/api/customer/' + customerId + '/complain/' + orderId;
}
const API_URL_POST_TODAY_HISTORY_ORDERS = API_SERVER + "/api/customer/order/oneDay-historySentOrders";
/** 获取单个订单的详情*/
const API_GET_ORDER_DETAIL = API_SERVER + "/api/customer/order/"; //+orderId

/**
 * 我的推广
 */
//查看是否申请成功
function applicationStatusForSEO(customerId) {
  return API_SERVER + '/api/customer/' + customerId + '/businessman/statusChecker';
}
//已开通城市的列表
const API_URL_GET_CITY_LIST = API_SERVER + "/api/public/sender/getCityList";
//获取城市代理商列表
const API_URL_GET_PUBLIC_AGENT_LIST = API_SERVER + "/public/agent";
//推广码
function getSeoQrcode(customerId) {
  return API_SERVER + '/api/customer/' + customerId + '/businessman/qrcode';
}
//默认的奖励金额
function getSEORewardDefault(customerId) {
  return API_SERVER + "/api/customer/" + customerId + "/businessman/defaultRewardProperty";
}
//申请成为业务员
function becomeBusinessMan(customerId) {
  return API_SERVER + '/api/customer/' + customerId + '/businessman';
}
//查看奖励总体信息
function getCustomerRewards(customerId) {
  return API_SERVER + '/api/customer/' + customerId + '/businessman/rewards';
}
//查看推广账户余额
function getBusinessManAccount(customerId) {
  return API_SERVER + '/api/customer/' + customerId + '/businessman/account';
}
//金钱记录信息(明细)
function getBusinessManAccountRecords(customerId, pageIndex, pageSize) {
  return API_SERVER + '/api/customer/' + customerId + '/businessman/account/records?pageIndex=' + pageIndex + '&pageSize=' + pageSize;
}
//奖励金记录信息(明细)
function getBusinessManRewardsRecords(customerId, pageIndex, pageSize) {
  return API_SERVER + '/api/customer/' + customerId + '/businessman/rewards/records?pageIndex=' + pageIndex + '&pageSize=' + pageSize;
}
//推广用户记录
function getSpreadCustomers(customerId, pageIndex, pageSize) {
  return API_SERVER + '/api/customer/' + customerId + '/businessman/spreadCustomers?pageIndex=' + pageIndex + '&pageSize=' + pageSize;
}
//推广配送员记录
function getSpreadSenders(customerId, pageIndex, pageSize) {
  return API_SERVER + '/api/customer/' + customerId + '/businessman/spreadSenders?pageIndex=' + pageIndex + '&pageSize=' + pageSize;
}
//提现申请
function postDraws(customerId) {
  return API_SERVER + '/api/customer/' + customerId + '/businessman/account/draws';
}
//提现记录
function getDrawRecords(customerId, pageIndex, pageSize) {
  return API_SERVER + '/api/customer/' + customerId + '/businessman/account/draws?pageIndex=' + pageIndex + '&pageSize=' + pageSize;
}

/* 腾讯地图AK,自己申请的 AK */
const tencentAk = 'ZODBZ-XFC2Q-J6X5A-GEWJS-OBPDS-EKFVW';
//交换token接口
const EXCHANGE_TOKEN = API_SERVER + "/api/public/customer/refresh_token";
/*
 * 设置配置传递参数 
 */
module.exports = {
  API: API, //服务器域名
  API_SERVER: API_SERVER,
  //推广
  applicationStatusForSEO: applicationStatusForSEO, //判断申请状态
  API_URL_GET_CITY_LIST: API_URL_GET_CITY_LIST, //已开通城市列表
  API_URL_GET_PUBLIC_AGENT_LIST: API_URL_GET_PUBLIC_AGENT_LIST, //已开通的城市代理商列表
  getSeoQrcode: getSeoQrcode, //推广码
  getSEORewardDefault: getSEORewardDefault, //默认奖励金额
  becomeBusinessMan: becomeBusinessMan, //申请成为业务员
  getCustomerRewards: getCustomerRewards, //查看奖励总体信息
  getBusinessManAccount: getBusinessManAccount, //查看推广账户余额
  getBusinessManAccountRecords: getBusinessManAccountRecords, //金钱记录信息(明细)
  getBusinessManRewardsRecords: getBusinessManRewardsRecords, //奖励金记录信息(明细)
  getSpreadCustomers: getSpreadCustomers, //推广用户记录
  getSpreadSenders: getSpreadSenders, //推广配送员记录
  postDraws: postDraws, //提现申请
  getDrawRecords: getDrawRecords, //提现记录
  //订单
  API_URL_POST_HISTORY_ORDERS: API_URL_POST_HISTORY_ORDERS, //一年内所有订单
  API_URL_GET_NOW_ORDERS: API_URL_GET_NOW_ORDERS, //当前未完成订单
  API_URL_POST_AGAIN_SEND_ORDER: API_URL_POST_AGAIN_SEND_ORDER, //重新派单
  API_URL_POST_CANCEL_ORDER: API_URL_POST_CANCEL_ORDER, //取消订单
  API_URL_POST_DELETE_HISTORY_ORDER: API_URL_POST_DELETE_HISTORY_ORDER, //删除订单记录
  API_URL_GET_SENDERINFO: API_URL_GET_SENDERINFO, //获取配送员信息
  API_URL_POST_TODAY_HISTORY_ORDERS: API_URL_POST_TODAY_HISTORY_ORDERS, //当天可投诉订单
  API_GET_ORDER_DETAIL: API_GET_ORDER_DETAIL, //单个订单详情
  getComplainList: getComplainList, //投诉原因
  customerComplain: customerComplain, //投诉
  vehChange: vehChange, //交通工具转换
  sizeChange: sizeChange, //体积转换
  orderAllStatusChange: orderAllStatusChange, //订单状态转换
  changeOrderStatus: changeOrderStatus, //订单类型转换
  changeDetaTime: changeDetaTime, //转化时间
  tencentAk: tencentAk, //腾讯地图KEY
  //登录
  API_LOGIN_SMS,
  API_LOGIN_SMS,
  API_SMS_LOGIN: API_SMS_LOGIN,
  API_LOGIN: API_LOGIN,
  setPassword: setPassword,
  getAccountInfo: getAccountInfo, //用户账户信息
  getCustomerInfo,
  getCustomerInfo,
  EXCHANGE_TOKEN: EXCHANGE_TOKEN,
  API_PRICE_PREVIEW_COMMON: API_PRICE_PREVIEW_COMMON,
  API_URL_POST_SAVE_STARTER_ADDRESS: API_URL_POST_SAVE_STARTER_ADDRESS, //保存发件收件物品信息
  API_URL_POST_SAVE_RECEIVER_ADDRESS: API_URL_POST_SAVE_RECEIVER_ADDRESS,
  API_URL_POST_ITEM_SAVE: API_URL_POST_ITEM_SAVE,
  API_URL_POST_DELETE_RECEIVER_ADDRESS: API_URL_POST_DELETE_RECEIVER_ADDRESS, //删除发件收件物品单个信息
  API_URL_POST_DELETE_STARTER_ADDRESS: API_URL_POST_DELETE_STARTER_ADDRESS,
  API_URL_POST_ITEM_DELELE: API_URL_POST_ITEM_DELELE,
  API_URL_GET_CAN_USE_ALL_COUPON_LIST: API_URL_GET_CAN_USE_ALL_COUPON_LIST, //所有可用红包
  API_URL_POST_FIND_HISTORY_COUPON_LIST: API_URL_POST_FIND_HISTORY_COUPON_LIST, //所有过期或已使用红包
  countCanUseCouponUrl: countCanUseCouponUrl, //可用红包数量
  findCanUseCouponListUrl: findCanUseCouponListUrl, //获取下单可用红包
  getStarterAddressUrl: getStarterAddressUrl, //获取常用发件地址
  getReceiverAddressUrl: getReceiverAddressUrl, //获取常用收件地址
  getItemList: getItemList, //获取常用物品列表
  addOrEditDefaultStarter: addOrEditDefaultStarter, //设置默认发件地址
  addOrEditDefaultItem: addOrEditDefaultItem, //设置默认物品 
  API_URL_GET_DEFAULT_ITEM_STARTER: API_URL_GET_DEFAULT_ITEM_STARTER, //获取默认发件和物品信息
  API_CREATE_ORDER_COMMON: API_CREATE_ORDER_COMMON, //订单创建
  wxCodeExchangeOpenId: wxCodeExchangeOpenId, //微信账单拿取openid
  seeRechargeBillMess: seeRechargeBillMess, //查看余额支付账单
  useRechargeToPayBill: useRechargeToPayBill, //余额-支付-账单
  seeWxjsapiBillMess: seeWxjsapiBillMess, //查看微信付账单
  getRechargeRecords: getRechargeRecords, //充值记录
  getPaymentRecords: getPaymentRecords, //支付记录
  createRechargeBill: createRechargeBill, //创建余额充值账单
  checkBillAlreadyPayed: checkBillAlreadyPayed, //查看余额充值账单支付情况


}
/**
 * 工具 体积 类型 状态 时间转换
 * @param veh size orderType orderStatus dataTime
 */
function vehChange(veh) {
  if (!veh) {
    return null;
  }
  if (veh === "ELECTRIC_BICYCLE") {
    return "电动车";
  }
  if (veh === "CAR") {
    return "小汽车";
  }
  if (veh === "VAN") {
    return "面包车";
  }
  if (veh === "MOBILE_TRICYCLE") {
    return "机动三轮车";
  }
  if (veh === "TRUCK") {
    return "小型货车";
  }
  if (veh === "MIDDLE_TRUCK") {
    return "中型货车";
  }
}

function sizeChange(size) {
  if (size === "SMALL") {
    return "小件（30x30x30cm）";
  }
  if (size === "MIDDLE") {
    return "中件（50x50x30cm）";
  }
  if (size === "BIG") {
    return "大件（1x1x0.5m）";
  }
  if (size === "VERY_BIG") {
    return "小型货运(1x1.5x1.5m)";
  }
  if (size === "HUGE") {
    return "中型货运(2x1.5x1.5m)";
  }
}

function changeOrderStatus(orderType) {
  if (orderType === "ImportedMergeOrder") {
    return "导入拼单";
  }
  if (orderType === "ImportedDirectOrder") {
    return "导入直发";
  }
  if (orderType === "ImportedAppointmentOrder") {
    return "导入预约";
  }
  if (orderType === "ImportedAdvancedAppointmentOrder") {
    return "导入高级预约";
  }
  if (orderType === "MergeOrder") {
    return "拼单";
  }
  if (orderType === "DirectOrder") {
    return "直发";
  }
  if (orderType === "AppointmentOrder") {
    return "预约";
  }
  if (orderType === "AdvancedAppointmentOrder") {
    return "高级预约";
  }
  if (orderType === "SubMergeOrder") {
    return "复合拼单";
  }
  if (orderType === "SubDirectOrder") {
    return "复合直发";
  }
}

function orderAllStatusChange(orderStatus) {
  switch (orderStatus) {
    case "JUST_CREATED":
      return "刚创建";
    case "PAYED": //已支付状态 
      return "推送中";
    case "WAITING":
      return "推送中";
    case "PUSHING":
      return "推送中";
    case "FETCHING":
      return "取件中";
    case "SENDER_VERIFIED":
      return "已验证配送员";
    case "FETCHED":
      return "已取件";
    case "SENDING":
      return "送件中";
    case "RECEIVER_VERIFIED":
      return "已验证收件人";
    case "SENT":
      return "已送达";
    case "ESTIMATED":
      return "已评价";
    case "CANCEL":
      return "已取消";
    case "CANCELLED":
      return "超时取消";
    case "FETCH_ABNORMAL":
      return "取件异常";
    case "SEND_ABNORMAL":
      return "送件异常";
    case "TIMEOUT":
      return "已超时";
    default:
      return "未知状态";
  }
}

function changeDetaTime(dataTime) {
  if (!dataTime) {
    return "--:--"
  }
  Date.prototype.toLocaleString = function() {
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