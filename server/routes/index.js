/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
    prefix: '/weapp'
})
const controllers = require('../controllers')

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态）
router.get('/user', validationMiddleware, controllers.user)

// --- 图片上传 Demo --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中
router.post('/upload', controllers.upload)

// --- 信道服务接口 Demo --- //
// GET  用来响应请求信道地址的
router.get('/tunnel', controllers.tunnel.get)
// POST 用来处理信道传递过来的消息
router.post('/tunnel', controllers.tunnel.post)

// --- 客服消息接口 Demo --- //
// GET  用来响应小程序后台配置时发送的验证请求
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)
router.get('/hello', validationMiddleware, controllers.hello)

//会员卡相关
router.get('/card/list', controllers.card.list)//卡列表
router.post('/card/buy', validationMiddleware, controllers.card.buy)//购卡
router.get('/card/member', validationMiddleware, controllers.card.member)//查询会员
router.post('/card/notify', controllers.card.notify)
router.get('/card/history', validationMiddleware,controllers.card.history)

//绑定相关
router.post('/bind/bind',validationMiddleware, controllers.bind.bind)//绑定手机
router.get('/bind/getCode',validationMiddleware, controllers.bind.getCode)//发送验证码


router.get('/member/member',validationMiddleware, controllers.member.member)//获取user表信息

router.get('/admin/isAdmin',validationMiddleware, controllers.admin.isAdmin)//是否会员
router.get('/admin/memberList',validationMiddleware, controllers.admin.memberList)//会员列表
router.get('/admin/memberDetail',validationMiddleware, controllers.admin.memberDetail)//会员详情
module.exports = router
