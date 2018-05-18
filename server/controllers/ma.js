const {
  mysql
} = require('../qcloud')
var config = require('../config'); //配置文件 appid 等信息
const moment = require('moment');
const uuid = require('node-uuid')
const fomatStr = "YY/MM/DD HH:mm:ss"
var card = require('./card.js'); //
function isAdminJudge(openId) {
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
    let memberInfo = await card.isMember(openId);
    if (!memberInfo.isMember){
      ctx.state.data = {
        status: 1,
        errMsg: `您还未购买会员卡或已过期！无法进行预约！`
      }
      return;
    }
    let beginTs = body.beginTs;
    let endTs = body.endTs;

    let beginMoment = moment(beginTs),currentTime = moment();
    if(beginMoment.isBefore(currentTime)){
      ctx.state.data = {
        status: 1,
        errMsg: `预约的时段已过期！请重新选择！`
      }
      return;
    }


    let count3 = await mysql('ma').count('id').where({
      status: 0,
      begin_ts: moment(beginTs).format(fomatStr),
      end_ts: moment(endTs).format(fomatStr),
      open_id: openId,
    })
    if (count3[0]['count(`id`)'] > 0) {
      ctx.state.data = {
        status: 1,
        errMsg: `您已预约该时段！请勿重复操作！`
      }
      return;
    }

    //查找已预约的数量
    let count2 = await mysql('ma').count('id').where({
      open_id: openId,
      status: 0
    }).andWhere(function () {
      this.where('begin_ts', '>', currentTime.format(fomatStr))
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
      begin_ts: moment(beginTs).format(fomatStr),
      end_ts: moment(endTs).format(fomatStr)
    });
    if (count[0]['count(`id`)'] >= config.maxQtMa) {
      ctx.state.data = {
        status: 1,
        errMsg: '该时段已约满！'
      }
      return;
    }



    // //记录预约信息
    let id = uuid.v1()
    let maObj = {
      id: id,
      open_id: openId,
      begin_ts: moment(beginTs).format(fomatStr),
      end_ts: moment(endTs).format(fomatStr),
      status: 0
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
 * 预约取消
 * beginTs:
 * endTs
 */
async function maCancel(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    
    let openId = ctx.state.$wxInfo.userinfo.openId;
    const {
      id
    } = ctx.query;

    let currentTime = moment();
    let ma = await mysql('ma').select('*').where({
      status: 0,
      id: id,
      open_id: openId,
    }).andWhere(function () {
      this.where('begin_ts', '>', currentTime.format(fomatStr))
    }).first()
    if (!ma) {
      ctx.state.data = {
        status: 1,
        errMsg: `预约不存在或已过期！`
      }
      return;
    }

    let updateData = {
      status: 1
    }
    await mysql("ma").update(updateData).where({
      id:id
    })

    //返回
    ctx.state.data = {
      status: 0
    }
  } else {
    ctx.state.code = -1;
  }
}
/**
 * 获取用户预约列表
 */
async function getMaList(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    let openId = ctx.state.$wxInfo.userinfo.openId;
    const {
      isHistory
    } = ctx.query;
    let mas;
    if (isHistory == 'true') {
      mas = await mysql('ma').select('*').where({
        open_id: openId
      }).orderBy('begin_ts', 'desc')
    } else {
      let currentTs = moment().format(fomatStr);
      mas = await mysql('ma').select('*').where({
        open_id: openId,
        status: 0,
      }).andWhere(function () {
        this.where('begin_ts', '>', currentTs)
      }).orderBy('begin_ts', 'asc')

    }
    if (!mas) {
      ctx.state.data = {
        status: 1
      }
      return;
    }
    ctx.state.data = {
      status: 0,
      mas: mas
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
    const {
      day
    } = ctx.query;
    let startTs = moment(day).format(fomatStr),
      endTs = moment(day).add(1,"d").format(fomatStr);
    let mas = await mysql('ma').select('*').where({
      status: 0
    }).whereBetween('begin_ts', [startTs, endTs]).orderBy('begin_ts', 'asc')
    let infos = {};
    for(let i=0;i<mas.length;i++){
      let ma = mas[i];
      let begints = moment(ma.begin_ts).unix(),
          endts = moment(ma.end_ts).unix();
      let key = `${begints}-${endts}`;
      let info = infos[key];
      if(info){
        infos[key] += 1;
      }else{
        infos[key] = 1;
      }
    }


    //返回
    ctx.state.data = {
      status: 0,
      total: config.maxQtMa,
      qtInfo: infos
    }
  } else {
    ctx.state.code = -1;
  }
}

module.exports = {
  getMaList,
  doMa,
  maCancel,
  getQtMaInfo
}