const { mysql } = require('../qcloud')
module.exports = async ctx => {
    let data = await mysql('card').select('*').where({ status: 0 })
    ctx.state.data = data
}