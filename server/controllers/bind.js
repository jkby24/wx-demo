const {
  mysql
} = require('../qcloud')
const uuid = require('node-uuid')
const moment = require('moment');
const QcloudSms = require("qcloudsms_js");
const config = require('../config');
var Q = require("q");
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
      ts: moment().format("YYYY/MM/DD HH:mm:ss")
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
    let isSuccess = await sendSms(code, mobile);
    if(!isSuccess){
      ctx.state.data = {
        status: 1,
        errMsg: '短信发送失败，请重试'
      }
      return;
    }
    //保存验证码
    let id = uuid.v1()
    let order = {
      id: id,
      openid: openid,
      mobile: mobile,
      code: code,
      type: 1,
      ts: moment().format("YYYY/MM/DD HH:mm:ss")
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
// 短信应用SDK AppID
const appid = config.sms_appid;  // SDK AppID是1400开头

// 短信应用SDK AppKey
const appkey = config.sms_appkey;
// 短信模板ID，需要在短信应用中申请
const templateId = config.sms_tmpid;  // NOTE: 这里的模板ID`7839`只是一个示例，真实的模板ID需要在短信控制台中申请
// 签名
const smsSign = config.sms_sign;  // NOTE: 这里的签名只是示例，请使用真实的已申请的签名, 签名参数使用的是`签名内容`，而不是`签名ID`

// 实例化QcloudSms
let qcloudsms = QcloudSms(appid, appkey);
function sendSms(code,phone){
  var ssender = qcloudsms.SmsSingleSender();
  var params = [code,3];
  var deferred = Q.defer();
    
  ssender.sendWithParam(86, phone, templateId,
    params, smsSign, "", "", (err, res, resData) =>{
      if (err){
        deferred.resolve(false);
        console.log("sendWithParam err: ", err);
      }
      else{
        deferred.resolve(true);
        console.log("sendWithParam response data: ", resData);
      }
        
    });  // 签名参数未提供或者为空时，会使用默认签名发送短信
  return deferred.promise;
}
module.exports = {
  getCode,
  bind
}