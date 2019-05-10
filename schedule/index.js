const nodeSchedule = require('node-schedule')
const service = require('../services')
const path = require('path')
const fs = require('fs')

//每小时的40分钟执行
let rule = new nodeSchedule.RecurrenceRule()
rule.minute = 0
rule.hour = 15
rule.dayOfWeek = [1, 2, 3, 4, 5]

let schedule = {}

schedule.start = () => {
    let hasStockList = fs.existsSync(path.resolve(__dirname, '../config/stockList.json'))//判断存储股票代码的json文件是否存在
    if (!hasStockList) {
        service.updateStockInfo()
    }

    //注册定时任务
    schedule.job = nodeSchedule.scheduleJob(rule, () => {
        service.updateStockInfo()
    });
}

module.exports = schedule