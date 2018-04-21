const { mysql } = require('../qcloud')
module.exports = async ctx => {
  if (ctx.state.$wxInfo.loginState === 1) {
    let data = await mysql('cAppinfo').select('*').where({ appid: 'wx5d62aa9aca8eeedf' })
    ctx.state.data = data
  } else {
    ctx.state.data = '未登录'
  }
}

// const { mysql } = require('../qcloud')
// const uuid = require('node-uuid')

// module.exports = async ctx => {
//   var id = uuid.v1()
//   // 增
//   var book = {
//     id: id,
//     name: "冰与火之歌",
//     price: 88
//   }
//   await mysql("Book").insert(book)
//   // 查
//   var res = await mysql("Book").where({ id }).first()
//   // 改
//   await mysql("Book").update({ price: 66 }).where({ id })
//   // 删
//   await mysql("Book").del().where({ id })

//   ctx.state.data = "OK"
// }