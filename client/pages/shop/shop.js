//shop.js 
//card images from http://www.qt86.com/
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
const Zan = require('../../libs/zanui-weapp-dev/dist/index');
Page(Object.assign({}, Zan.Dialog, Zan.Toast, {
  data: {
    card: [],
    page: 0,
    currentItem: {},
    content: `
    1、普通单人年卡原价1588元，现价399元；（65周岁以下）
    2、家庭亲子卡原价2999元，现价598元（一大65周岁以下一小为14周岁以下）
    3、培训卡：此卡已含十次门票，限本人使用，不可转借或转让，遗失可补卡（补卡工本费20元），报名后未开卡可全额退款；开课2节内按实际上课次数计算，并扣除15%违约金后可退回余款；开课后2节后不予退款；学员开课后应在20天内完成培训。儿童培训卡原价850元10节课/成人培训卡原价950元10节课一次课程1.5小时，任选一种泳姿。
    4、需注册成大梦山游泳馆会员，方可享受该优惠。
    5、年卡有效期至2019年4月30日。
    6、游泳时请主动出示此卡，听从工作人员劝导，遵守泳池管理规定
    每天限用一次，每次两个小时，限本人使用。
    7、办理本卡需出示本人身份证及一百元储物柜押金，押金可于退卡时退还。
    8、本卡不可转让、转借，具体使用规则以现场公告或微信公众号公告为准。
    9、本卡最终解释权归福建省康健体育文化发展有限公司所有。
    客服热线：0591-83775953
    `
  },
  onLoad: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/card/list`,
      login: false,
      success(result) {
        that.setData({
          card: result.data.data
        });
      },
      fail(error) {
        console.log('请求会员卡列表失败', error);
      }
    })
  },
  onReady: function () {

  },
  buy: function (event) {
    let that = this;
    wx.getStorage({
      key: 'user',
      success: function (res) {
        let item = event.currentTarget.dataset.item;
        that.setData({
          page: 1,
          currentItem: item,
        })
      },
      fail: function (res) {
        that.showZanDialog({
          title: '提示',
          content: `您还未登录，无法进行操作，是否前往登录？`,
          buttons: [{
            text: '确定',
            color: '#3CC51F',
            type: 'yes'
          }, {
            text: '取消',
            type: 'cancel'
          }]
        }).then(({
      type
    }) => {
          if (type == "yes") {
            wx.switchTab({
              url: '../user/user'
            })
          }
        });
      }
    })

  },
  buyCancel: function () {
    this.setData({
      page: 0
    })
  },
  // 购买
  doBuy: function (event) {
    let item = this.data.currentItem;
    var that = this;
    qcloud.request({
      url: `${config.service.host}/weapp/card/buy`,
      login: true,
      method: 'POST',
      data: {
        id: item.id
      },
      success(result) {
        let payResult = result.data.data.payInfo;
        // util.showSuccess(`购买订单号${order.id}`)
        console.log(payResult);
        wx.requestPayment({
          'timeStamp': payResult.timeStamp.toString(),
          'nonceStr': payResult.nonceStr,
          'package': `prepay_id=${payResult.package}`,
          'signType': payResult.signType,
          'paySign': payResult.paySign,
          'success': function (succ) {
            that.showZanToast({
              title: '购买成功！',
              icon: 'success'
            });
          },
          'fail': function (err) {
            that.showZanToast({
              title: '购买失败！',
              icon: 'fail'
            });
          },
          'complete': function (comp) {
            that.setData({
              page: 0
            })
          }
        })
      },
      fail(error) {
        that.showZanToast({
          title: '购买失败！',
          icon: 'fail'
        });
        console.log('购买失败', error.message);
      }
    })
    // this.showZanDialog({
    //   title: '请确认订单',
    //   content: `卡类型【${item.title}】价格【￥${item.price/100}】卡类型【${item.title}】价格【￥${item.price/100}】卡类型【${item.title}】价格【￥${item.price/100}】卡类型【${item.title}】价格【￥${item.price/100}】卡类型【${item.title}】价格【￥${item.price/100}】卡类型【${item.title}】价格【￥${item.price/100}】卡类型【${item.title}】价格【￥${item.price/100}】卡类型【${item.title}】价格【￥${item.price/100}】卡类型【${item.title}】价格【￥${item.price/100}】`,
    //   buttons: [{
    //     text: '确定',
    //     color: '#3CC51F',
    //     type: 'yes'
    //   }, {
    //     text: '取消',
    //     type: 'cancel'
    //   }]
    // }).then(({
    //   type
    // }) => {
    //   if (type == "yes") {

    //   }
    // });
  },
}))