const {
  mysql
} = require('../qcloud')
var config = require('../config'); //配置文件 appid 等信息
const moment = require('moment');
const uuid = require('node-uuid')
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

    let count3 = await mysql('ma').count('id').where({
      status: 0,
      begin_ts: moment(beginTs).format("YY-MM-DD hh:mm:ss"),
      end_ts: moment(endTs).format("YY-MM-DD hh:mm:ss"),
      open_id: openId,
    })
    if (count3[0]['count(`id`)']>0) {
      ctx.state.data = {
        status: 1,
        errMsg: `您已预约该时段！请勿重复操作！`
      }
      return;
    }

    //查找已预约的数量。
    let nextDayTs = moment(moment().format("YYMMDD"),"YYMMDD").add(1, 'd').format("YY-MM-DD hh:mm:ss");
    let count2 = await mysql('ma').count('id').where({
      open_id: openId,
      status: 0
    }).andWhere(function() {
      this.where('begin_ts', '>', nextDayTs)
    })
    if (count2[0]['count(`id`)'] >= config.maxMa) {
      ctx.state.data = {
        status: 1,
        errMsg: `单个用户最多只能预约${config.maxMa}次`
      }
      return;
    }

    //查找对应时间段已预约的人数。
    let count = await mysql('ma').count('id').where({
      status: 0,
      begin_ts: moment(beginTs).format("YY-MM-DD hh:mm:ss"),
      end_ts: moment(endTs).format("YY-MM-DD hh:mm:ss")
    });
    if (count[0]['count(`id`)'] >= config.maxQtMa){
      ctx.state.data = {
        status: 1,
        errMsg: '该时段已约满！'
      }
      return;
    }
    
    

    // //记录预约信息
    let id = uuid.v1()
    let maObj = {
      id:id,
      open_id: openId,
      begin_ts: moment(beginTs).format("YY-MM-DD hh:mm:ss"),
      end_ts: moment(endTs).format("YY-MM-DD hh:mm:ss"),
      status:0
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
  doMa,
  getQtMaInfo
}