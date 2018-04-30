//index.js
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')

Page({
  data: {
    orders:[]
  },
  onLoad: function () {
    this.getOrder();
  },

  // 获取用户订单
  getOrder: function () {
    let that = this;
    //获取会员信息
    qcloud.request({
      url: `${config.service.host}/weapp/card/history`,
      login: true,
      success(result) {
        switch (result.data.data.status) {
          case 0:
            that.setData({
              orders: result.data.data.orders
            });
        }
      },
      fail(error) {
        console.log('查询会员卡信息失败', error.message);
      }
    })
  },
})
