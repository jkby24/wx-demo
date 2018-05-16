const CONF = {
    port: '5757',
    rootPathname: '',

    // 微信小程序 App ID
    appId: 'wxa30d31d1e77b9d5e',
    payKey: '192006340b4c09247ec02edce69f6a3d', 
    openIds: ['ocNp_4gokWUwkWL88-ej8Hfp-0x8'],
    notify_url:"https://xqthxszo.qcloud.la/weapp/card/notify",
    mch_id:"1503154531",
    ip:"111.143.57.127",
    // 短信应用SDK AppID
    sms_appid : 1400090938,  // SDK AppID是1400开头

    // 短信应用SDK AppKey
    sms_appkey : "dcd1e9e94224a8b851ba6e60c446231f",
    sms_tmpid : "120567",
    sms_sign : "福州云动大梦山体育文化",

    // 微信小程序 App Secret
    appSecret: '',

    // 是否使用腾讯云代理登录小程序
    useQcloudLogin: true,
    //时间段预约最大人数
    maxQtMa:500,
    //可预约的次数
    maxMa: 3,
    /**
     * MySQL 配置，用来存储 session 和用户信息
     * 若使用了腾讯云微信小程序解决方案
     * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
     */
    mysql: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        db: 'cAuth',
        pass: '1qaz2wsx',
        char: 'utf8mb4'
    },

    cos: {
        /**
         * 地区简称
         * @查看 https://cloud.tencent.com/document/product/436/6224
         */
        region: 'ap-guangzhou',
        // Bucket 名称
        fileBucket: 'qcloudtest',
        // 文件夹
        uploadFolder: ''
    },

    // 微信登录态有效期
    wxLoginExpires: 7200,
    wxMessageToken: 'abcdefgh'
}

module.exports = CONF
