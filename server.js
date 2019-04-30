const Koa = require('koa')
const cors = require('koa-cors')
const bodyparser = require('koa-bodyparser')
const path = require('path')
const koaStatic = require('koa-static')
const schedule = require('./schedule')
//const service = require('./services')

const app = new Koa()

app.use(koaStatic(path.join(__dirname, 'public')))

app
    .use(cors())
    .use(bodyparser())


//service.updateStockInfo()
schedule.start()

app.listen(8000)