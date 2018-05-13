//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
// pages/index.js
const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'June.', 'July.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    year: new Date().getFullYear(),      // 年份
    month: new Date().getMonth() + 1,    // 月份
    day: new Date().getDate(),
    str: MONTHS[new Date().getMonth()],  // 月份字符串

    demo5_days_style: [],
  },
  dayClick: function (event) {
    console.log(event.detail);
    this.data.demo5_days_style.push({ month: 'current', day: event.detail.day, color: 'white', background: '#84e7d0' });

    this.setData({
      demo5_days_style: this.data.demo5_days_style
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const days_count = new Date(this.data.year, this.data.month, 0).getDate();
    

    let demo5_days_style = new Array;
    for (let i = 1; i <= days_count; i++) {
      const date = new Date(this.data.year, this.data.month - 1, i);
      if (date.getDay() == 0) {
        demo5_days_style.push({
          month: 'current', day: i, color: '#f488cd'
        });
      } else {
        demo5_days_style.push({
          month: 'current', day: i, color: '#a18ada'
        });
      }
    }
    demo5_days_style.push({ month: 'current', day: 12, color: 'white', background: '#b49eeb' });
    demo5_days_style.push({ month: 'current', day: 17, color: 'white', background: '#f5a8f0' });
    demo5_days_style.push({ month: 'current', day: 20, color: 'white', background: '#aad4f5' });
    demo5_days_style.push({ month: 'current', day: 25, color: 'white', background: '#84e7d0' });

    this.setData({
      demo5_days_style
    });

    
  },
})
