const crawler = require('../crawler')
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
    await crawler.init()
    let hasStockList = fs.existsSync(path.resolve(__dirname, '../config/stockList.json'))//判断存储股票代码的json文件是否存在
    if (hasStockList) {
        let stockList = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config/stockList.json'), 'utf8'))
        await accelerate(stockList)
    } else {
        let stockList = {}
        config.stockMarket.list.forEach(market => {
            stockList[market] = []
        })
        await boost(stockList)

        fs.writeFileSync(path.resolve(__dirname, '../config/stockList.json'), JSON.stringify(stockList), 'utf8')
        console.log('list store finish');

    }
    console.log('closing')
    await crawler.Close()

}

service.getLanguages = function () {
    return config.language.list
}

async function accelerate(stockList) {
    let promiseArr = []
    for (let market in stockList) {
        let page = await crawler.newPage()
        promiseArr.push(cycleFetch(page, market, stockList))

    }
    await Promise.all(promiseArr)
    console.log('update finish')
}

async function cycleFetch(page, market, stockList) {
    for (let n = 0; n < stockList[market].length; n++) {
        let id = stockList[market][n]
        await fetch(page, market, id)
    }
}

async function boost(stockList) {
    let promiseArr = []
    for (let market in stockList) {
        if (market == 'sz') {
            let start = '000001'
            let end = '300770'
            promiseArr.push(firstFetch(start, end, market, stockList, await crawler.newPage()))
        }
        if (market == 'sh') {
            let start = '600000'
            let start2 = '900929'
            let end = '604000'
            let end2 = '900960'
            promiseArr.push(firstFetch(start, end, market, stockList, await crawler.newPage()))
            promiseArr.push(firstFetch(start2, end2, market, stockList, await crawler.newPage()))
        }
        if (market == 'hk/') {
            let start = '00001'
            let start2 = '80000'
            let end = '10000'
            let end2 = '90000'
            promiseArr.push(firstFetch(start, end, market, await crawler.newPage()))
            promiseArr.push(firstFetch(start2, end2, market, await crawler.newPage()))
        }
    }
    await Promise.all(promiseArr)
    console.log('create finish');
}

async function fetch(page, market, id) {
    let res = await crawler.getInfo(page, `${market}${id}`);
    if (res) {
        await db.setStock(`${market}${id}`, res.date, res.highest, res.lowest, res.open, res.close)
        console.log(`${market}${id}:success`)
    } else {
        console.log(`${market}${id}:failed`)
    }
    await fileCmd.wait(1000)
}

async function firstFetch(start, end, market, stockList, page) {

    while (start != end) {
        console.log(`fetch ${market}${start}`)
        let res = await crawler.getInfo(page, `${market}${start}`)
        if (res) {
            stockList[market].push(start)
            await db.setStock(`${market}${start}`, res.date, res.highest, res.lowest, res.open, res.close)
            console.log(`${market}${start}:success`)
        } else {
            console.log(`${market}${start}:failed`)
        }
        start = addstrnums(start)
        await fileCmd.wait(1000)    //每发一次请求等待1秒避免被发现
    }

}

function addstrnums(str) {
    let tmp = str.replace(/[^0-9]/ig, "");
    let pos = str.indexOf(tmp);

    if (tmp != "") {
        let nn = parseInt(tmp) + 1;
        nn = pad(nn, tmp.length);
        let left = str.substring(0, pos);
        let right = str.substring(pos + tmp.length);
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