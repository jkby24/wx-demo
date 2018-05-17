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
      }, {
        id: '2',
        title: '历史预约'
      }],
      selectedId: '0'
    },
    ma2:[],

    items: [{
        value: '6:00~8:00',
        name: '6:00~8:00',
      },
      {
        value: '8:00~12:00',
        name: '8:00~12:00',
      },
      {
        value: '14:00~16:00',
        name: '14:00~16:00',
      },
      {
        value: '16:00~18:00',
        name: '16:00~18:00',
      },
      {
        value: '18:00~20:00',
        name: '18:00~20:00',
      },
      {
        value: '20:00~22:00',
        name: '20:00~22:00',
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
    switch(selectedId){
      case '0':
        break;
      case '1':
        this.getMaFeature();
        break;
      case '2':
        break;
    }
  },
  getMaFeature:function(){
    let that = this;
    debugger;
    //获取会员信息
    qcloud.request({
      url: `${config.service.host}/weapp/ma/getMaList`,
      login: true,
      // data:{
      //   key:key?key:''
      // },
      success(result) {
        switch (result.data.data.status) {
          case 0:
            let datenew Date(result.data.data.mas[0].begin_ts)
            const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
            that.setData({
              ma2: result.data.data.mas
            });
        }
      },
      fail(error) {
        console.log('查询预约列表失败', error.message);
      }
    })
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