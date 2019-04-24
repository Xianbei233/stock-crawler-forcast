const crawler = require('../')
const fileCmd = require('file-cmd')
const config = require('../config')
const fs = require('fs')
const path = require('path');

let db = config.db.type == 'local' ? require('../db/local') : require('../db')

const service = {}

service.getStock = async function (stockType,id) {
    if(!id){
        return '请填写股票代码'
    }
    fs.exists(``)
    let list = await db.getStock(`${stockType}${id}`)
    return list
}


service.updateStockInfo = async function () {
    for (let i = 0; i < config.language.list.length; ++i) {
        let item = config.language.list[i]
        let list = []
        if (item == 'C++') {
            list = await crawler.getList('Cpp')
        } else {
            list = await crawler.getList(item)
        }
        await db.setList(item, list)
        //每发一次请求等待3秒避免被GitHub发现
        await fileCmd.wait(3000)
    }
}

service.getLanguages = function () {
    return config.language.list
}

module.exports = service