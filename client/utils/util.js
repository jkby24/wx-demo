var qcloud = require('../vendor/wafer2-client-sdk/index')
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}


// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
})

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
})

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    })
}

var login = (cb)=>{
  showBusy('正在登录')
  var that = this
  let setUserInfo=  (data)=> {
    wx.setStorage({
      key: "user",
      data: data
    })
  };
  // 调用登录接口
  qcloud.login({
    success(result) {
      if (result) {
        showSuccess('登录成功')
        setUserInfo({
          userInfo: result,
          logged: true
        })
        cb(true);
      } else {
        // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
        qcloud.request({
          url: config.service.requestUrl,
          login: true,
          success(result) {
            showSuccess('登录成功')
            setUserInfo({
              userInfo: result.data.data,
              logged: true
            })
            cb(true);
          },

          fail(error) {
            cb(false);
            showModel('请求失败', error)
            console.log('request fail', error)
          }
        })
      }
    },

    fail(error) {
      cb(false);
      showModel('登录失败', error)
      console.log('登录失败', error)
    }
  });
}


module.exports = {
    formatTime,
    showBusy,
    showSuccess,
    showModel,
    login
}