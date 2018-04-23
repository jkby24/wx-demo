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
    const body = ctx.request.body;
    let cardId = body.id;
    if (!cardId) {
      return;
    }
    //生成订单号、记录下并返回
    let data = await mysql('card').select('*').where({ status: 0, id: cardId })
    if (!data) {
      return;
    }
    //todo 发送微信后台请求订单

    //记录订单信息
    let id = uuid.v1()
    let book = {
      id: id,
      name: "冰与火之歌",
      price: 88,
      ts: moment()
    }
    // await mysql("order").insert(book);//增加订单

    //返回
    ctx.state.data = book
  } else {
    ctx.state.data = '未登录'
  }
}
module.exports = {
  list,
  buy
}