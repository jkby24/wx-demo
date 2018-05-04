//index.js
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
const { Tab, extend } = require('../../../libs/zanui-weapp-dev/dist/index');
Page(extend({}, Tab, {
  data: {
    members:[],
    tab: {
      list: [{
        id: '0',
        title: '会员列表'
      },{
        id: '1',
        title: '会员列表2'
      }],
      selectedId: '0'
    }
  },
  handleZanTabChange(e) {
    var componentId = e.componentId;
    var selectedId = e.selectedId;

    this.setData({
      [`tab.selectedId`]: selectedId
    });
  },
  onLoad: function () {
    this.getMembers();
  },

  // 获取会员列表
  getMembers: function () {
    let that = this;
    //获取会员信息
    qcloud.request({
      url: `${config.service.host}/weapp/admin/memberList`,
      login: true,
      success(result) {
        switch (result.data.data.status) {
          case 0:
            that.setData({
              members: result.data.data.members
            });
        }
      },
      fail(error) {
        console.log('查询会员列表失败', error.message);
      }
    })
  },
}));
