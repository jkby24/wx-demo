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
    let data = await mysql('card').select('*').where({ status: 0, id: cardId }).first()
    if (!data) {
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
      price: data.price,
      card_type: data.type,
      status:0,
      ts: moment().format("YYYY-MM-DD HH:mm:ss")
    }
    await mysql("order").insert(order);//增加订单

    //返回
    ctx.state.data = {
      status:0,
      data: order
    }
  } else {
    ctx.state.code = -1;
  }
}
/**
 * 查询购卡信息
 */
async function history(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    let openid = ctx.state.$wxInfo.userinfo.openId;
    //查询订单中已付款的记录
    let orders = await mysql('order').select('*').where({ status: 1, openid: openid });
    //返回
    ctx.state.data = {
      status: 0,
      orders: orders
    }
  } else {
    ctx.state.code = -1;
  }
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
    let validOrders = [],
      currentTs = moment(),
      isMember = false;
    for(let i=0;i<orders.length;i++ ){
      let order = orders[i];
      if(!order.endts){
        continue;
      }
      //判断卡是否有效
      let endts = moment(order.endts);
      if(currentTs.isBefore(endts)){//还处于生效期
        validOrders.push(order);
        isMember = true;
      }
    }
    //返回
    ctx.state.data = {
      status: 0,
      isMember:isMember,
      orders:orders
    }
  } else {
    ctx.state.code = -1;
  }
}
/**
 * 更新卡信息（微信支付平台通知）
 */
async function update(ctx, next) {
  const {id} = ctx.query
  let order = await mysql("order").where({ id }).first();
  if(!order){
    return;
  }
  let data = {
    status:1,
    buyts:moment().format("YYYY-MM-DD HH:mm:ss")
  }
  let orders = await mysql('order').select('*').where({ status: 1, openid: order.openid });
  let lastEndTs = moment(),currentTs = moment();
  if(orders && orders.length>0){
    for(let i=0;i<orders.length;i++ ){
      let order = orders[i];
      if(!order.endts){
        continue;
      }
      //判断卡是否有效
      let endts = moment(order.endts);
      if(currentTs.isBefore(endts) && lastEndTs.isBefore(endts)){//还处于生效期
        lastEndTs = endts;
      }
    }
  }
  let begints = lastEndTs.format("YYYY-MM-DD HH:mm:ss");
  let endts;
  switch(order.card_type){
    case "1"://年卡
      endts = lastEndTs.add(365,'d').format("YYYY-MM-DD HH:mm:ss");
      break;
    case "2"://季卡
      endts = lastEndTs.add(90,'d').format("YYYY-MM-DD HH:mm:ss");
      break;
    case "3"://月卡
      endts = lastEndTs.add(30,'d').format("YYYY-MM-DD HH:mm:ss");
      break;
    default://单次卡
      endts = lastEndTs.add(1,'d').format("YYYY-MM-DD HH:mm:ss");
      break;
  }
  let updateData = {
    status:1,
    buyts:moment().format("YYYY-MM-DD HH:mm:ss"),
    begints:begints,
    endts:endts
  }
  await mysql("order").update(updateData).where({ id })
}
module.exports = {
  list,
  buy,
  member,
  update,
  history
}