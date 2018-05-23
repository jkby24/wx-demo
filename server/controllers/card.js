const {
  mysql
} = require('../qcloud')
const uuid = require('node-uuid')
const moment = require('moment');
const wxpay = require('../tools/pay.js');
const config = require('../config');
async function isMember(openid){
  //查询订单中已付款的记录
  let orders = await mysql('order').select('*').where({
    status: 1,
    openid: openid
  });
  if (!orders || orders.length == 0) {
    return { isMember :false};
  }
  let validOrders = [],
    currentTs = moment(),
    isMember = false;
  for (let i = 0; i < orders.length; i++) {
    let order = orders[i];
    // if (!order.endts) {
    //   continue;
    // }
    //判断卡是否有效
    // let endts = moment(order.endts);
    let endts = moment(config.deadTime);
    if (currentTs.isBefore(endts)) { //还处于生效期
      validOrders.push(order);
      isMember = true;
    }
  }
  return {
    isMember: isMember,
    orders: orders
  }
}
/**
 * 列表
 */
async function list(ctx, next) {
  let data = await mysql('card').select('*').where({
    status: 0
  })
  ctx.state.data = data
}
/**
 * 购买
 */
async function buy(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    //todo 只能够买同类型的进行续费
    let openid = ctx.state.$wxInfo.userinfo.openId;
    const reqBody = ctx.request.body;
    let cardId = reqBody.id;
    if (!cardId) {
      ctx.state.data = {
        status: 1,
        errMsg: ''
      }
      return;
    }
    let data = await mysql('card').select('*').where({
      status: 0,
      id: cardId
    }).first()
    if (!data) {
      ctx.state.data = {
        status: 1,
        errMsg: ''
      }
      return;
    }

    // //微信支付demo  
    let id = uuid.v1();
    let ts = moment().format("YYYYMMDDHHmmssSSS");
    let code = "";
    for (var i = 0; i < 3; i++) {
      code += Math.floor(Math.random() * 10)
    }
    var attach = id;
    var body = data.title;
    var mch_id = config.mch_id; //商户ID
    var bookingNo = `${ts}${code}`; //订单号
    var total_fee = 1; //data.price;       
    let ip = "";
    let payInfo = await wxpay.order(attach, body, mch_id, openid, bookingNo, total_fee);

    await mysql('order')
    .where({
      openid: openid,
      status: 0
    })
    .del()
    //记录订单信息
    let order = {
      id: bookingNo,
      openid: openid,
      cardId: cardId,
      price: total_fee,
      card_type: data.type,
      status: 0,
      ts: moment().format("YYYY/MM/DD HH:mm:ss")
    }
    await mysql("order").insert(order); //增加订单

    //返回
    ctx.state.data = {
      status: 0,
      data: order,
      payInfo: payInfo
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
    let orders = await mysql('order').select('*').where({
      status: 1,
      openid: openid
    });
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
    let openId = ctx.state.$wxInfo.userinfo.openId;
    let memberInfo = await isMember(openId);
    //返回
    ctx.state.data = {
      status: 0,
      memberInfo: memberInfo
    }
  } else {
    ctx.state.code = -1;
  }
}
/**
 * 更新卡信息（微信支付平台通知）https://segmentfault.com/a/1190000006886519
 */
async function notify(ctx, next) {
  // "https://xqthxszo.qcloud.la/weapp/card/notify"
  // let xmlStr = `<xml><appid><![CDATA[wxa30d31d1e77b9d5e]]></appid>
  // <attach><![CDATA[bb1aff70-51fb-11e8-8f85-85cf25acbad4]]></attach>
  // <bank_type><![CDATA[CFT]]></bank_type>
  // <cash_fee><![CDATA[1]]></cash_fee>
  // <fee_type><![CDATA[CNY]]></fee_type>
  // <is_subscribe><![CDATA[N]]></is_subscribe>
  // <mch_id><![CDATA[1503154531]]></mch_id>
  // <nonce_str><![CDATA[5a2yk4781b4]]></nonce_str>
  // <openid><![CDATA[ocNp_4gokWUwkWL88-ej8Hfp-0x8]]></openid>
  // <out_trade_no><![CDATA[20180507213705256907]]></out_trade_no>
  // <result_code><![CDATA[SUCCESS]]></result_code>
  // <return_code><![CDATA[SUCCESS]]></return_code>
  // <sign><![CDATA[30580E9BAF679D07FC3C7B9A77CCB472]]></sign>
  // <time_end><![CDATA[20180507213709]]></time_end>
  // <total_fee>1</total_fee>
  // <trade_type><![CDATA[JSAPI]]></trade_type>
  // <transaction_id><![CDATA[4200000115201805074954048116]]></transaction_id>
  // </xml>`
  let xmlStr = await parsePostData(ctx);
  let xmlObj = await wxpay.xmlToJson(xmlStr);
  let info = xmlObj['xml'];
  ctx.response.body = wxpay.notify(info);
  if (!(info.result_code == "SUCCESS" && info.return_code == "SUCCESS")) {
    return;
  }
  let sign = info["sign"];
  delete info["sign"]; 
  let resultSign = wxpay.resultsignjsapi(info);

  if (sign != resultSign){
    return;
  }
  let out_trade_no = info['out_trade_no'],
    total_fee = info['total_fee'];
  let order = await mysql("order").where({
    id: out_trade_no
  }).first();
  if (!order || order.status == 1 || order.price != total_fee) {
    return;
  }
  // let data = {
  //   status: 1,
  //   buyts: moment().format("YYYY/MM/DD HH:mm:ss")
  // }
  // let orders = await mysql('order').select('*').where({
  //   status: 1,
  //   openid: order.openid
  // });
  // let lastEndTs = moment(),
  //   currentTs = moment();
  // if (orders && orders.length > 0) {
  //   for (let i = 0; i < orders.length; i++) {
  //     let order = orders[i];
  //     if (!order.endts) {
  //       continue;
  //     }
  //     //判断卡是否有效
  //     let endts = moment(order.endts);
  //     if (currentTs.isBefore(endts) && lastEndTs.isBefore(endts)) { //还处于生效期
  //       lastEndTs = endts;
  //     }
  //   }
  // }
  // let begints = lastEndTs.format("YYYY/MM/DD HH:mm:ss");
  // let endts;
  // switch (order.card_type) {
  //   case "1": //年卡
  //     endts = lastEndTs.add(365, 'd').format("YYYY/MM/DD HH:mm:ss");
  //     break;
  //   case "2": //季卡
  //     endts = lastEndTs.add(90, 'd').format("YYYY/MM/DD HH:mm:ss");
  //     break;
  //   case "3": //月卡
  //     endts = lastEndTs.add(30, 'd').format("YYYY/MM/DD HH:mm:ss");
  //     break;
  //   default: //单次卡
  //     endts = lastEndTs.add(1, 'd').format("YYYY/MM/DD HH:mm:ss");
  //     break;
  // }
  let updateData = {
    status: 1,
    buyts: moment().format("YYYY/MM/DD HH:mm:ss")
    // begints: begints,
    // endts: endts
  }
  await mysql("order").update(updateData).where({
    id:out_trade_no
  })
}

function parsePostData(ctx) {
  return new Promise((resolve, reject) => {
    try {
      let postdata = "";
      ctx.req.addListener('data', (data) => {
        postdata += data
      })
      ctx.req.addListener("end", function () {
        // let parseData = parseQueryStr( postdata )
        resolve(postdata)
      })
    } catch (err) {
      reject(err)
    }
  })
}
module.exports = {
  list,
  buy,
  member,
  notify,
  history,
  isMember
}