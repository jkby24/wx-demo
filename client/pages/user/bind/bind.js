//index.js
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var util = require('../../../utils/util.js')
const Zan = require('../../../libs/zanui-weapp-dev/dist/index');
const config = require('./config');
var globalConfig = require('../../../config')
var app = getApp()
Page(Object.assign({}, Zan.Field, Zan.Toast, {
    data: {
        config,
        code: "",
        mobile: "",
        btnTitle: "",
        btnVisable: true
    },
    onReady: function () {
        if (app.globalData.codeSecond != 0) {
            this.setData({
                btnTitle: `已发送(${app.globalData.codeSecond}s)`,
                btnVisable: false
            })
            this.countdown(this);
        } else {
            this.setData({
                btnVisable: true
            })
        }
    },

    // 输入框内容更改时触发
    handleZanFieldChange({
        componentId,
        detail
    }) {
        /*
         * componentId 即为在模板中传入的 componentId
         * 用于在一个页面上使用多个 tab 时，进行区分
         * detail 即输入框中的内容
         */
        /*
         * 处理函数可以直接 return 一个字符串，将替换输入框的内容。
         */
    },
    // 输入框聚焦时触发
    handleZanFieldFocus({
        componentId,
        detail
    }) {},
    // 输入框失焦时触发
    handleZanFieldBlur({
        componentId,
        detail
    }) {
        this.setData({
            mobile: detail.value
        })
    },
    isValid: function (value) {
        let reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        return reg.test(value);
    },
    commit: function () {
        if (!this.data.mobile || !this.isValid(this.data.mobile)) {
            this.showZanToast("请输入正确的手机号");
            return;
        }
        if (!this.data.code || this.data.code.length != 4) {
            this.showZanToast("请输入正确的验证码");
            return;
        }
        var that = this
        qcloud.request({
            url: `${globalConfig.service.host}/weapp/bind/bind`,
            login: true,
            method: 'POST',
            data: {
                mobile: this.data.mobile,
                code: this.data.code
            },
            success(result) {
                switch (result.data.data.status) {
                    case 0:
                        that.showZanToast("绑定成功");
                        wx.navigateBack();
                        break;
                    default:
                        that.showZanToast(result.data.data.errMsg);
                }
            },
            fail(error) {
                console.log('绑定失败', error.message);
                that.showZanToast("绑定失败，请重试");
            }
        })
    },

    countdown: (that) => {
        var second = app.globalData.codeSecond
        if (second == 0) {
            that.setData({
                btnVisable: true
            });
            app.globalData.codeSecond = 0;
            return;
        }
        var time = setTimeout(function () {
            that.setData({
                btnTitle: `已发送(${second - 1}s)`,
                btnVisable: false
            });
            app.globalData.codeSecond = second - 1;
            that.countdown(that);
        }, 1000)
    },
    getCode: function () {
        if (!this.data.mobile || !this.isValid(this.data.mobile)) {
            this.showZanToast("请输入正确的手机号！");
            return;
        }
        let that = this;
        qcloud.request({
            url: `${globalConfig.service.host}/weapp/bind/getCode`,
            login: true,
            data: {
                mobile: this.data.mobile
            },
            success(result) {
                switch (result.data.data.status) {
                    case 0:
                        //60秒倒计时
                        app.globalData.codeSecond = 60;
                        that.setData({
                            btnTitle: `已发送(60s)`,
                            btnVisable: false
                        });
                        that.countdown(that);
                        break;
                    default:
                        that.showZanToast(result.data.data.errMsg);
                }
            },
            fail(error) {
                console.log('验证码发送失败', error.message);
                that.showZanToast("验证码发送失败，请重试");
            }
        })
    },
    codeInput: function (e) {
        this.setData({
            code: e.detail.value
        })
    }
}));