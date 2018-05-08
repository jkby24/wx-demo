const { mysql } = require('../qcloud')
const uuid = require('node-uuid')
const moment = require('moment');
const wxpay = require('../tools/pay.js');
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
    let data = await mysql('card').select('*').where({ status: 0, id: cardId }).first()
    if (!data) {
      ctx.state.data = {
        status: 1,
        errMsg: ''
      }
      return;
    }
    //todo 发送微信后台请求订单

    //微信支付demo  
    let id = uuid.v1();
    let ts = moment().format("YYYYMMDDHHmmssSSS");
    let code = "";
    for (var i = 0; i < 3; i++) {
      code += Math.floor(Math.random() * 10)
    }
    var attach = id;
    var body = "测试支付";
    var mch_id = "1503154531"; //商户ID
    var bookingNo = `${ts}${code}`; //订单号
    var total_fee = 0.01;//data.price;
    var notify_url = "https://xqthxszo.qcloud.la/weapp/card/notify"; //通知地址        
    let ip = "";
    let payInfo = await wxpay.order(attach, body, mch_id, openid, bookingNo, total_fee, notify_url);

    //记录订单信息
    let order = {
      id: bookingNo,
      openid: openid,
      cardId: cardId,
      price: data.price,
      card_type: data.type,
      status:0,
      ts: moment().format("YYYY-MM-DD HH:mm:ss")
    }
    // await mysql("order").insert(order);//增加订单

    //返回
    ctx.state.data = {
      status:0,
      data:order,
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
    let orders = await mysql('order').select('*').where({ status: 1, openid: openid });
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
    let openid = ctx.state.$wxInfo.userinfo.openId;
    //查询订单中已付款的记录
    let orders = await mysql('order').select('*').where({ status: 1, openid: openid });
    let data;
    if(!orders || orders.length==0){
      data = {}
      return;
    }
    let validOrders = [],
      currentTs = moment(),
      isMember = false;
    for(let i=0;i<orders.length;i++ ){
      let order = orders[i];
      if(!order.endts){
        continue;
      }
      //判断卡是否有效
      let endts = moment(order.endts);
      if(currentTs.isBefore(endts)){//还处于生效期
        validOrders.push(order);
        isMember = true;
      }
    }
    //返回
    ctx.state.data = {
      status: 0,
      isMember:isMember,
      orders:orders
    }
  } else {
    ctx.state.code = -1;
  }
}
/**
 * 更新卡信息（微信支付平台通知）
 */
async function notify(ctx, next) {
  
  const {id} = ctx.query
  const reqBody = ctx.request.body;
  // let data = await parsePostData(ctx);
  // "https://xqthxszo.qcloud.la/weapp/card/notify"
  let data = `<xml><appid><![CDATA[wxa30d31d1e77b9d5e]]></appid>
  <attach><![CDATA[bb1aff70-51fb-11e8-8f85-85cf25acbad4]]></attach>
  <bank_type><![CDATA[CFT]]></bank_type>
  <cash_fee><![CDATA[1]]></cash_fee>
  <fee_type><![CDATA[CNY]]></fee_type>
  <is_subscribe><![CDATA[N]]></is_subscribe>
  <mch_id><![CDATA[1503154531]]></mch_id>
  <nonce_str><![CDATA[5a2yk4781b4]]></nonce_str>
  <openid><![CDATA[ocNp_4gokWUwkWL88-ej8Hfp-0x8]]></openid>
  <out_trade_no><![CDATA[20180507213705256907]]></out_trade_no>
  <result_code><![CDATA[SUCCESS]]></result_code>
  <return_code><![CDATA[SUCCESS]]></return_code>
  <sign><![CDATA[30580E9BAF679D07FC3C7B9A77CCB472]]></sign>
  <time_end><![CDATA[20180507213709]]></time_end>
  <total_fee>1</total_fee>
  <trade_type><![CDATA[JSAPI]]></trade_type>
  <transaction_id><![CDATA[4200000115201805074954048116]]></transaction_id>
  </xml>`
  let appid = wxpay.getXMLNodeValue('prepay_id', data),
    attach = wxpay.getXMLNodeValue('attach', data),
    body = "测试支付",
    mch_id = wxpay.getXMLNodeValue('mch_id', data),
    nonce_str = wxpay.getXMLNodeValue('nonce_str', data),
    notify_url = "https://xqthxszo.qcloud.la/weapp/card/notify",
    openid = wxpay.getXMLNodeValue('openid', data),
    out_trade_no = wxpay.getXMLNodeValue('out_trade_no', data),
    ip = "111.143.57.127",
    total_fee = wxpay.getXMLNodeValue('total_fee', data),
    orginSign = wxpay.getXMLNodeValue('sign', data);

    let sign = wxpay.paysignjsapi(appid, attach, body, mch_id, nonce_str, notify_url, openid, out_trade_no, ip, total_fee, 'JSAPI');
    if (sign != orginSign){
      return;
    }
    let order = await mysql("order").where({ id: out_trade_no}).first();
    if(!order){
      return;
    }
    if(order.status ==1){
      return;
    }
  // let data = {
  //   status:1,
  //   buyts:moment().format("YYYY-MM-DD HH:mm:ss")
  // }
  // let orders = await mysql('order').select('*').where({ status: 1, openid: order.openid });
  // let lastEndTs = moment(),currentTs = moment();
  // if(orders && orders.length>0){
  //   for(let i=0;i<orders.length;i++ ){
  //     let order = orders[i];
  //     if(!order.endts){
  //       continue;
  //     }
  //     //判断卡是否有效
  //     let endts = moment(order.endts);
  //     if(currentTs.isBefore(endts) && lastEndTs.isBefore(endts)){//还处于生效期
  //       lastEndTs = endts;
  //     }
  //   }
  // }
  // let begints = lastEndTs.format("YYYY-MM-DD HH:mm:ss");
  // let endts;
  // switch(order.card_type){
  //   case "1"://年卡
  //     endts = lastEndTs.add(365,'d').format("YYYY-MM-DD HH:mm:ss");
  //     break;
  //   case "2"://季卡
  //     endts = lastEndTs.add(90,'d').format("YYYY-MM-DD HH:mm:ss");
  //     break;
  //   case "3"://月卡
  //     endts = lastEndTs.add(30,'d').format("YYYY-MM-DD HH:mm:ss");
  //     break;
  //   default://单次卡
  //     endts = lastEndTs.add(1,'d').format("YYYY-MM-DD HH:mm:ss");
  //     break;
  // }
  // let updateData = {
  //   status:1,
  //   buyts:moment().format("YYYY-MM-DD HH:mm:ss"),
  //   begints:begints,
  //   endts:endts
  // }
  // await mysql("order").update(updateData).where({ id })
}
function parsePostData( ctx ) {
  return new Promise((resolve, reject) => {
    try {
      let postdata = "";
      ctx.req.addListener('data', (data) => {
        postdata += data
      })
      ctx.req.addListener("end",function(){
        // let parseData = parseQueryStr( postdata )
        resolve( postdata )
      })
    } catch ( err ) {
      reject(err)
    }
  })
}
module.exports = {
  list,
  buy,
  member,
  notify,
  history
}