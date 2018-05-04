const {
  mysql
} = require('../qcloud')
var config = require('../config'); //配置文件 appid 等信息
function isAdminJudge(openId){
  return config.openIds.indexOf(openId) != -1;
}
/**
 * 是否管理员
 */
async function isAdmin(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    ctx.state.data = {
      status: 0,
      isAdmin: isAdminJudge(ctx.state.$wxInfo.userinfo.openId)
    }
  } else {
    ctx.state.code = -1;
  }
}
/**
 * 查看会员列表
 */
async function memberList(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1 && isAdminJudge(ctx.state.$wxInfo.userinfo.openId)) {
    let users = await mysql('user').select('*');
    if(!users){
      ctx.state.data = {
        status: 1
      }
      return;
    }
    ctx.state.data = {
      status: 0,
      members: users
    }
  } else {
    ctx.state.code = -1;
  }
}
/**
 * 查看具体会员信息
 */
async function memberDetail(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1 && isAdminJudge(ctx.state.$wxInfo.userinfo.openId)) {
    let openId = ctx.state.$wxInfo.userinfo.openId;
    let users = await mysql('user').select('*');
    if(!users){
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
  isAdmin,
  memberList,
  memberDetail
}