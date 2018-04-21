const { mysql } = require('../qcloud')
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
    const body = ctx.request.body
    ctx.state.data = `购买${body.id}`
  } else {
    ctx.state.data = '未登录'
  }
}
module.exports = {
  list,
  buy
}