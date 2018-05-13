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
    1、年卡有效期至2019年4月30日。
    2、游泳时请主动出示此卡，听从工作人员劝导，遵守泳池管理规定每天限用一次，每次两个小时，限本人使用。
    3、本卡不可转让、转借，具体使用规则以现场公告或微信公众号公告为准。
    4、本卡最终解释权归福建省康健体育文化发展有限公司所有。
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