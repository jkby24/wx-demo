//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  data: {
    card: []
  },
  onLoad: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/card/list`,
      login: false,
      success(result) {
        that.setData({ card: result.data.data });
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
    //todo防止重复点击
    let item = event.currentTarget.dataset.item;
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/card/buy`,
      login: true,
      method:'POST',
      data: {
        id: item.id
      },
      success(result) {
        let order = result.data.data.data;
        util.showSuccess(`购买订单号${order.id}`)
      },
      fail(error) {
        console.log('购买失败', error.message);
      }
    })
  },
})
