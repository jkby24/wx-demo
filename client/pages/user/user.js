//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        userInfo: {}
    },
    onLoad: function () {
        this.getUserInfo();
    },
    bind:function(){
        wx.navigateTo({
            url: 'bind/bind'
          })
    },

    // 用户登录示例
    getUserInfo: function () {
        let that = this;
        wx.getStorage({
            key: 'user',
            success: function (res) {
                that.setData({
                    userInfo : res.data.userInfo
                });
            }
        })
    },


})