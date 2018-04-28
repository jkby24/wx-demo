const {
  mysql
} = require('../qcloud')
/**
 * 获取已绑定用户
 */
async function member(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    let openId = ctx.state.$wxInfo.userinfo.openId;
    let user = await mysql('user').select('*').where({
      openid: openId
    }).first();
    if(!user){
      ctx.state.data = {
        status: 1
      }
      return;
    }
    ctx.state.data = {
      status: 0,
      data: user
    }
  } else {
    ctx.state.code = -1;
  }
}
module.exports = {
  member
}