const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const path = require('path')
const koaStatic = require('koa-static')
const process = require('process')
const schedule = require('./schedule')
const autoRoutes = require('koa-auto-routes')

const app = new Koa()

app.use(koaStatic(path.join(__dirname, 'public')))

app.use(bodyparser())

autoRoutes(app, path.join(__dirname, '/routers'))


if (process.argv.slice(2).indexOf('crawler') !== -1) {
    console.log("爬虫模式启动")
    schedule.start()
}



app.listen(8000)