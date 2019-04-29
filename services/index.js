const crawler = require('../')
const fileCmd = require('file-cmd')
const config = require('../config')
const fs = require('fs')
const path = require('path');
const db = require('../db')

const service = {}

service.getStock = async function (stockType, id) {
    if (!id) {
        return '请填写股票代码'
    }

    let res = await db.getStock(`${stockType}${id}`)
    return res
}


service.updateStockInfo = async function () {
    let hasStockList = fs.exists(path.resolve(__dirname, '../config/stockList.json'))//判断存储股票代码的json文件是否存在
    if (hasStockList) {
        let stockList = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config/stockList.json'), 'utf8'))
        for (let market in stockList) {

            stockList[market].forEach(id => {
                let res = await crawler.getInfo(`${market}${id}`)
                if (res) {
                    db.setStock(`${market}${start}`, res.date, res.highest, res.lowest, res.open, res.close).then(res => { console.log(`${market}${start}:${res}`) }, err => {
                        console.error(`${market}${start}:${err}`)
                    })
                }
            });

        }
    } else {
        let stockList = {}
        config.stockMarket.list.forEach(market => {
            stockList[market] = []
        })
        for (let market in stockList) {
            if (market == 'sz') {
                let start = '000001'
                let end = '300770'
                firstFetch(start, end, market, stockList)
            }
            if (market == 'sh') {
                let start = '600000'
                let start2 = '900929'
                let end = '604000'
                let end2 = '900960'
                firstFetch(start, end, market, stockList)
                firstFetch(start2, end2, market, stockList)
            }
            if (market == 'hk') {
                let start = '00001'
                let start2 = '80000'
                let end = '10000'
                let end2 = '90000'
                firstFetch(start, end, market, stockList)
                firstFetch(start2, end2, market, stockList)
            }

        }

        fs.writeFileSync(path.resolve(__dirname, '../config/stockList.json'), JSON.stringify(stockList), 'utf8')

    }



}

service.getLanguages = function () {
    return config.language.list
}

async function firstFetch(start, end, market, stockList) {

    while (start != end) {
        let res = await crawler.getInfo(`${market}${start}`)
        if (res) {
            stockList[market].push(start)
            db.setStock(`${market}${start}`, res.date, res.highest, res.lowest, res.open, res.close).then(res => { console.log(`${market}${start}:${res}`) }, err => {
                console.error(`${market}${start}:${err}`)
            })
        }
        addstrnums(start)
        await fileCmd.wait(3000)    //每发一次请求等待3秒避免被发现
    }

}

function addstrnums(str) {
    var tmp = str.replace(/[^0-9]/ig, "");
    var pos = str.indexOf(tmp);

    if (tmp != "") {
        var nn = parseInt(tmp) + 1;
        nn = pad(nn, tmp.length);
        var left = str.substring(0, pos);
        var right = str.substring(pos + tmp.length);
        return left + nn + right;
    }
    else {
        return str;
    }
}


pad = function (tbl) {
    return function (num, n) {
        return (0 >= (n = n - num.toString().length)) ? num : (tbl[n] || (tbl[n] = Array(n + 1).join(0))) + num;
    }
}([]);

module.exports = service