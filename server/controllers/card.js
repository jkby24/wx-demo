const { mysql } = require('../qcloud')
const uuid = require('node-uuid')
const moment = require('moment');
/**
 * 列表
 */
async function list(ctx, next) {
  let data = await mysql('card').select('*').where({ status: 0 })
  ctx.state.data = data
}
/**
 * 购买
 */
async function buy(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    //todo 只能够买同类型的进行续费
    const body = ctx.request.body;
    let cardId = body.id;
    if (!cardId) {
      ctx.state.data = {
        status: 1,
        errMsg: ''
      }
      return;
    }
    //生成订单号、记录下并返回
    let datas = await mysql('card').select('*').where({ status: 0, id: cardId })
    if (!datas || datas.length ==0) {
      ctx.state.data = {
        status: 1,
        errMsg: ''
      }
      return;
    }
    //todo 发送微信后台请求订单

    //记录订单信息
    let id = uuid.v1()
    let order = {
      id: id,
      openid: ctx.state.$wxInfo.userinfo.openId,
      cardId: cardId,
      price: datas[0].price,
      card_type: datas[0].type,
      status:0,
      ts: moment().format("YYYY-MM-DD hh:mm:ss")
    }
    await mysql("order").insert(order);//增加订单

    //返回
    ctx.state.data = {
      status:0,
      data: order
    }
  } else {
    ctx.state.data = {
      status:1,
      errMsg: '未登录'
    }
  }
}
/**
 * 查询购卡信息
 */
async function history(ctx, next) {
}
/**
 * 查询会员信息
 */
async function member(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    let openid = ctx.state.$wxInfo.userinfo.openId;
    //查询订单中已付款的记录
    let orders = await mysql('order').select('*').where({ status: 1, openid: openid });
    let data;
    if(!orders || orders.length==0){
      data = {}
      return;
    }
    let currentTs = moment();
    for(let i=0;i<orders.length;i++ ){
      let order = orders[i];
      //判断卡是否有效
      let buyTs = order.buyts

    }
    //返回
    ctx.state.data = {
      status: 0,
      data: {}
    }
  } else {
    ctx.state.data = {
      status: 1,
      errMsg: '未登录'
    }
  }
}
module.exports = {
  list,
  buy
}