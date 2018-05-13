//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        userInfo: {},
        member: {},
        bind: false,
        isMember: false,
        isAdmin: false,
        logged:false
    },
    onLoad: function () {},
    onShow: function () {
      this.getUserInfo();  
    },
    bind: function () {
        wx.navigateTo({
            url: 'bind/bind'
        })
    },
    buy: function () {
        wx.switchTab({
            url: '../shop/shop'
        })
    },
    order: function () {
        wx.navigateTo({
            url: 'order/order'
        })
    },
    goToAdminPage: function () {
        wx.navigateTo({
            url: 'admin/admin'
        })
    },
    // 用户登录示例
    getUserInfo: function () {
        let that = this;
        wx.getStorage({
            key: 'user',
            success: function (res) {
                that.setData({
                    userInfo: res.data.userInfo,
                    logged:true
                });
                //获取手机信息
                qcloud.request({
                    url: `${config.service.host}/weapp/member/member`,
                    login: true,
                    success(result) {
                        switch (result.data.data.status) {
                            case 0:
                                that.setData({
                                    member: result.data.data.data,
                                    bind: true
                                });
                            default:
                        }
                    },
                    fail(error) {
                        console.log('读取会员信息失败', error.message);
                    }
                });

                //获取会员信息
                qcloud.request({
                    url: `${config.service.host}/weapp/card/member`,
                    login: true,
                    success(result) {
                        switch (result.data.data.status) {
                            case 0:
                                let isMember = result.data.data.isMember;
                                if (isMember) {
                                    that.setData({
                                        isMember: true
                                    });
                                }
                        }
                    },
                    fail(error) {
                        console.log('查询会员卡信息失败', error.message);
                    }
                })
                //是否管理员
                qcloud.request({
                    url: `${config.service.host}/weapp/admin/isAdmin`,
                    login: true,
                    success(result) {
                        switch (result.data.data.status) {
                            case 0:
                                let isAdmin = result.data.data.isAdmin;
                                if (isAdmin) {
                                    that.setData({
                                        isAdmin: true
                                    });
                                }
                        }
                    },
                    fail(error) {
                    }
                })
            },
            fail:function(res){
            }
        })
    },
    

    // 用户登录
    login: function () {
      var that = this;
      util.login((success) => {
        if (success) {
          that.getUserInfo();
        }
      })
    }

})