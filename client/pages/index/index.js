//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        info:{
          phone:"0591-23433299",
          position:{
            title:"大梦山游泳馆",
            latitude: 26.087590,
            longitude: 119.283940,
          }
        },
        movies:[    
            {index:0,url:'./images/1.jpg'} ,      
            {index:1,url:'./images/2.jpg'} ,      
            {index:2,url:'./images/3.jpg'}    
        ],
        markers: [{
          // iconPath: "/resources/others.png",
          // label:{
          //   content: "大梦山"
          // },
          // callout:{
          //   color:"red"
          // },
          id: 0,
          latitude: 26.087590,
          longitude: 119.283940,
        }]
    },
    onLoad: function () {
        this.login();
    }, 
    call:function(){
      wx.makePhoneCall({
        phoneNumber: this.data.info.phone
      })
    },
    go: function () {
      wx.openLocation({
        latitude: this.data.info.position.latitude,
        longitude: this.data.info.position.longitude,
        name: this.data.info.position.name,
        scale: 28
      }) 
    },
    setUserInfo:function(data){
        wx.setStorage({
            key:"user",
            data:data
          })
    },

    // 用户登录
    login: function() {
        util.showBusy('正在登录')
        var that = this

        // 调用登录接口
        qcloud.login({
            success(result) {
                if (result) {
                    util.showSuccess('登录成功')
                    that.setUserInfo({
                        userInfo: result,
                        logged: true
                    })
                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    qcloud.request({
                        url: config.service.requestUrl,
                        login: true,
                        success(result) {
                            util.showSuccess('登录成功')
                            that.setUserInfo({
                                userInfo: result.data.data,
                                logged: true
                            })
                        },

                        fail(error) {
                            util.showModel('请求失败', error)
                            console.log('request fail', error)
                        }
                    })
                }
            },

            fail(error) {
                util.showModel('登录失败', error)
                console.log('登录失败', error)
            }
        })
    },
})
