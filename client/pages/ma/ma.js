//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
// pages/index.js
// const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'June.', 'July.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

// Page({

//   /**
//    * 页面的初始数据
//    */
//   data: {
//     year: new Date().getFullYear(),      // 年份
//     month: new Date().getMonth() + 1,    // 月份
//     day: new Date().getDate(),
//     str: MONTHS[new Date().getMonth()],  // 月份字符串

//     demo5_days_style: [],
//   },
//   dayClick: function (event) {
//     console.log(event.detail);
//     this.data.demo5_days_style.push({ month: 'current', day: event.detail.day, color: 'white', background: '#84e7d0' });

//     this.setData({
//       demo5_days_style: this.data.demo5_days_style
//     });
//   },
//   /**
//    * 生命周期函数--监听页面加载
//    */
//   onLoad: function (options) {
//     const days_count = new Date(this.data.year, this.data.month, 0).getDate();


//     let demo5_days_style = new Array;
//     for (let i = 1; i <= days_count; i++) {
//       const date = new Date(this.data.year, this.data.month - 1, i);
//       if (date.getDay() == 0) {
//         demo5_days_style.push({
//           month: 'current', day: i, color: '#f488cd'
//         });
//       } else {
//         demo5_days_style.push({
//           month: 'current', day: i, color: '#a18ada'
//         });
//       }
//     }
//     demo5_days_style.push({ month: 'current', day: 12, color: 'white', background: '#b49eeb' });
//     demo5_days_style.push({ month: 'current', day: 17, color: 'white', background: '#f5a8f0' });
//     demo5_days_style.push({ month: 'current', day: 20, color: 'white', background: '#aad4f5' });
//     demo5_days_style.push({ month: 'current', day: 25, color: 'white', background: '#84e7d0' });

//     this.setData({
//       demo5_days_style
//     });


//   },
// })

import initDatepicker, { close, open, getSelectedDay, jumpToToday } from '../../template/datepicker/index';
const Zan = require('../../libs/zanui-weapp-dev/dist/index');
const conf = {
  data: {
    selectedDate: '',
    tab: {
      list: [{
        id: '0',
        title: '预约'
      }, {
        id: '1',
        title: '已预约'
      }],
      selectedId: '0'
    },

    items: [
      {
        value: '6:00~8:00',
        name: '6:00~8:00',
      },
      {
        value: '8:00~12:00',
        name: '8:00~12:00',
      },
      {
        value: '12:00~14:00',
        name: '12:00~14:00',
      }
    ],
    activeColor: '#ff4443'
  },
  handleZanSelectChange({ componentId, value }) {
    this.setData({
      [`checked.${componentId}`]: value
    });
  },
  handleZanTabChange(e) {
    var componentId = e.componentId;
    var selectedId = e.selectedId;

    this.setData({
      [`tab.selectedId`]: selectedId
    });
  },
  openDatePicker: function () {
    open(this.data.selectedDate);
  },
  commit: function () {

    if (!this.data.checked || !this.data.checked.qt) {
      this.showZanToast("请选择时间段！");
      return;
    }
    let date = this.data.selectedDate,
      qt = this.data.checked.qt;
    let qts = qt.split("~");
    var beginTs = (new Date(`${date} ${qts[0]}:00`)).getTime(),
      endTs = (new Date(`${date} ${qts[0]}:00`)).getTime();
    console.log(this.data)
  },
  onShow: function () {
    let that = this;
    const date = new Date();
    const curYear = date.getFullYear();
    const curMonth = date.getMonth() + 1;
    const curDate = date.getDate();
    that.setData({
      selectedDate: `${curYear}-${curMonth}-${curDate}`
    });
    initDatepicker({
      disablePastDay: true, // 是否禁选过去日期
      showInput: false, // 默认为 true
      // placeholder: '请选择日期', // input 输入框
      // type: 'normal', // [normal 普通单选模式(默认), timearea 时间段选择模式(待开发), multiSelect 多选模式(待完善)]
      /**
       * 选择日期后执行的事件
       * @param { object } currentSelect 当前点击的日期
       */
      afterTapDay: (currentSelect) => {
        console.log('当前点击的日期', currentSelect);
        console.log('getSelectedDay方法', getSelectedDay());
      },
      /**
       * 日期点击事件（此事件会完全接管点击事件）
       * @param { object } currentSelect 当前点击的日期
       * @param {object} event 日期点击事件对象
       */
      onTapDay(currentSelect, event) {
        that.setData({
          selectedDate: `${currentSelect.year}-${currentSelect.month}-${currentSelect.day}`
        });
        close();
      },
    });
  },
  /**
   * 跳转至今天
   */
  jump() {
    jumpToToday();
  }
};
Page(Object.assign({}, Zan.Select, Zan.Tab, Zan.Toast, conf));
