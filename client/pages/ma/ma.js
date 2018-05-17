//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var globalConfig = require('../../config')
import initDatepicker, {
  close,
  open,
  getSelectedDay,
  jumpToToday
} from '../../template/datepicker/index';
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

    items: [{
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
  handleZanSelectChange({
    componentId,
    value
  }) {
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
      endTs = (new Date(`${date} ${qts[1]}:00`)).getTime();
    var that = this;
    util.showBusy('提交中')
    qcloud.request({
      url: `${globalConfig.service.host}/weapp/ma/doMa`,
      login: true,
      method: 'POST',
      data: {
        beginTs: beginTs,
        endTs: endTs
      },
      success(result) {
        wx.hideToast();
        switch (result.data.data.status) {
          case 0:
            that.showZanToast({
              title: '预约成功！',
              icon: 'success'
            });
            break;
          default:
            that.showZanToast({
              title: result.data.data.errMsg,
              icon: 'fail'
            });
        }
      },
      fail(error) {
        wx.hideToast();
        that.showZanToast({
          title: '预约失败，请重试!',
          icon: 'fail'
        });
        console.log('绑定失败', error.message);
      }
    })
    console.log(this.data)
  },
  onShow: function () {
    let that = this;
    const date = new Date();
    const curYear = date.getFullYear();
    const curMonth = date.getMonth() + 1;
    const curDate = date.getDate() + 1;
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