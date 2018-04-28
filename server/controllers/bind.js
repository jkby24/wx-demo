const {
  mysql
} = require('../qcloud')
const uuid = require('node-uuid')
const moment = require('moment');
/**
 * 绑定
 */
async function bind(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {

    const body = ctx.request.body;
    let openId = ctx.state.$wxInfo.userinfo.openId;
    let mobile = body.mobile;
    let code = body.code;

    let sms = await mysql('sms').select('*').where({
      type: 1,
      openid: openId,
      mobile: mobile,
      code: code
    }).first();
    let isValid = true;
    if (!sms) {
      isValid = false;
    } else {
      let currentTs = moment();
      let ts = moment(sms.ts).add(3, "m");
      if (currentTs.isBefore(ts)) { //最后的短信未满1分钟
        isValid = true;
      } else {
        isValid = false;
      }
    }
    if (!isValid) {
      ctx.state.data = {
        status: 1,
        errMsg: '验证码错误或已失效，请重试'
      }
      return;
    }

    //记录订单信息
    let id = uuid.v1()
    let order = {
      openid: openId,
      mobile: mobile,
      ts: moment().format("YYYY-MM-DD HH:mm:ss")
    }
    await mysql("user").insert(order); //增加会员信息

    //返回
    ctx.state.data = {
      status: 0
    }
  } else {
    ctx.state.code = -1;
  }
}
/**
 * 获取code
 */
async function getCode(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {

    let openid = ctx.state.$wxInfo.userinfo.openId;
    const {
      mobile
    } = ctx.query;
    //查询订单中已付款的记录
    let smses = await mysql('sms').select('*').where({
      type: 1,
      openid: openid
    });
    let isValid = true;
    if (smses && smses.length > 0) { //验证能否发送
      let currentTs = moment();
      for (let i = 0; i < smses.length; i++) {
        let sms = smses[i];
        let ts = moment(sms.ts).add(1, "m");
        if (currentTs.isBefore(ts)) { //最后的短信未满1分钟
          isValid = false;
        }
      }
    }
    if (!isValid) {
      ctx.state.data = {
        status: 1,
        errMsg: '短信发送太频繁，请稍后再试'
      }
      return;
    }

    let code = "";
    for (var i = 0; i < 4; i++) {
      code += Math.floor(Math.random() * 10)
    }

    //调用短信机器发送

    //保存验证码
    let id = uuid.v1()
    let order = {
      id: id,
      openid: openid,
      mobile: mobile,
      code: code,
      type: 1,
      ts: moment().format("YYYY-MM-DD HH:mm:ss")
    }
    await mysql("sms").insert(order); //增加订单

    //返回
    ctx.state.data = {
      status: 0
    }
  } else {
    ctx.state.code = -1;
  }
}
module.exports = {
  getCode,
  bind
}