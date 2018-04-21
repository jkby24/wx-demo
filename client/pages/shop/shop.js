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
      url: `${config.service.host}/weapp/card`,
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
    let item = event.currentTarget.dataset.item;
    util.showSuccess(`购买${item.title}`)
    // var that = this
    // qcloud.request({
    //   url: `${config.service.host}/weapp/hello`,
    //   login: false,
    //   success(result) {
    //     util.showSuccess(result.data.data[0].appid)
    //   },
    //   fail(error) {
    //     util.showModel('请求失败', error);
    //     console.log('request fail', error);
    //   }
    // })
    // var that = this
    // qcloud.request({
    //   url: `${config.service.host}/weapp/card`,
    //   login: false,
    //   success(result) {
    //     util.showSuccess(result.data.data[0].appid)
    //   },
    //   fail(error) {
    //     util.showModel('请求失败', error);
    //     console.log('request fail', error);
    //   }
    // })
  }
})
