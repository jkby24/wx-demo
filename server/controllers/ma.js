const {
  mysql
} = require('../qcloud')
var config = require('../config'); //配置文件 appid 等信息
function isAdminJudge(openId){
  return config.openIds.indexOf(openId) != -1;
}

//预约表
// id:唯一id
// openid:用户id
// beginTs:开始时间：
// endTs:结束时间：
/**
 * 预约
 * beginTs:
 * endTs
 */
async function doMa(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {

    const body = ctx.request.body;
    let openId = ctx.state.$wxInfo.userinfo.openId;
    let beginTs = body.beginTs;
    let endTs = body.endTs;

    //查找对应时间段已预约的人数。
    let count = await mysql('ma').select('*').where({
      status: 0,
      beginTs: beginTs,
      endTs: endTs
    });
    if (count >= config.maxQtMa){
      ctx.state.data = {
        status: 1,
        errMsg: '已约满！'
      }
      return;
    }

    //查找已预约的数量。
    let count2 = await mysql('ma').select('*').where({
      status: 0,
      beginTs: beginTs,
      endTs: endTs
    });
    if (count2 >= config.maxMa) {
      ctx.state.data = {
        status: 1,
        errMsg: `单个用户最多只能预约${config.maxMa}次`
      }
      return;
    }

    //记录预约信息
    let id = uuid.v1()
    let maObj = {
      id:id,
      openid: openId,
      beginTs: mobile,
      endTs: endTs,
      ts: moment().format("YYYY-MM-DD HH:mm:ss")
    }
    await mysql("ma").insert(maObj);

    //返回
    ctx.state.data = {
      status: 0
    }
  } else {
    ctx.state.code = -1;
  }
}

/**
 * 获取指定某一天所有时间段的预约信息
 */
async function getQtMaInfo(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    let day = body.day;

    let count = await mysql('ma').select('*').where({
      status: 0,
      beginTs: beginTs,
      endTs: endTs
    });

    

    //返回
    ctx.state.data = {
      status: 0,
      data:{

      }
    }
  } else {
    ctx.state.code = -1;
  }
}

module.exports = {
  getCode,
  bind
}