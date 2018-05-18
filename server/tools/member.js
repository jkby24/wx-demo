//https://blog.csdn.net/yxz1025/article/details/51496847
var config = require('../config'); //配置文件 appid 等信息  
var Q = require("q");
const {
  mysql
} = require('../qcloud')
const moment = require('moment');
var Member = {
  isMember: (openid)=> {
    //查询订单中已付款的记录
    let orders = await mysql('order').select('*').where({
      status: 1,
      openid: openid
    });
    let data;
    if (!orders || orders.length == 0) {
      data = {}
      return;
    }
    let validOrders = [],
      currentTs = moment(),
      isMember = false;
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      if (!order.endts) {
        continue;
      }
      //判断卡是否有效
      let endts = moment(order.endts);
      if (currentTs.isBefore(endts)) { //还处于生效期
        validOrders.push(order);
        isMember = true;
      }
    }
    return {
      isMember: isMember,
      orders: orders
    }
  }
};
module.exports = Member; 