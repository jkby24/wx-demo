//shop.js 
//card images from http://www.qt86.com/
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
const Zan = require('../../libs/zanui-weapp-dev/dist/index');
Page(Object.assign({}, Zan.Dialog, Zan.Toast, {
  data: {
    card: []
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
  // 购买
  buy: function (event) {
    let item = event.currentTarget.dataset.item;
    var that = this;
    this.showZanDialog({
      title: '请确认订单',
      content: `卡类型【${item.title}】价格【￥${item.price/100}】`,
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
                // debugger
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
      }
    });
  },
}))