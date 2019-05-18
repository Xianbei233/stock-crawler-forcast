const Router = require('koa-router')
const fs = require('fs')
const path = require('path')
const services = require('../services')
const router = new Router()

router.all('/getStock', async function (cxt, next) {
    try {
        let id = cxt.request.body.id

        let data = await services.getStock(id)

        if (!data) {
            throw ('无该股票')
        } else {
            cxt.body = data
        }


    } catch (e) {
        cxt.throw(e, 404)
    }
    await next
})


module.exports = router