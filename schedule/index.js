let nodeSchedule = require('node-schedule')
let service = require('../services')

//每小时的40分钟执行
let rule = new nodeSchedule.RecurrenceRule()
rule.minute = 0
rule.hour = 15
rule.dayOfWeek = [1, 2, 3, 4, 5]

let schedule = {}

schedule.start = () => {
    //开始任务的时候先更新一次
    service.updateStockInfo()
    //注册定时任务
    schedule.job = nodeSchedule.scheduleJob(rule, () => {
        service.updateStockInfo()
    });
}

module.exports = schedule