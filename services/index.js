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
    //let promiseArr = []
    for (let market in stockList) {

        //promiseArr.push(cycleFetch(page, market, stockList))
        await cycleFetch(market, stockList)
    }
    //await Promise.all(promiseArr)
    console.log('update finish')
}

async function cycleFetch(market, stockList) {

    for (let n = 0; n < stockList[market].length; n++) {
        if (crawler.browserTime >= 200) {
            await crawler.reboot()
            await fileCmd.wait(30000)
        }
        if (crawler.pageTime >= 101) {
            crawler.page = await crawler.pageChange(crawler.page)
        }
        let id = stockList[market][n]
        await fetch(crawler.page, market, id)

    }

}

async function fetch(page, market, id) {
    let res = await crawler.getInfo(page, `${market}${id}`);
    if (!res) {
        console.log(`${market}${start}:不存在`)
        await fileCmd.wait(1500)
    }
    if (res == '停牌') {
        console.log(`${market}${start}:停牌`)
    }

    if (res && res !== '停牌') {
        await db.setStock(`${market}${id}`, res.date, res.highest, res.lowest, res.open, res.close, res.volume)
        console.log(`${market}${id}:success`)
    }
    await fileCmd.wait(1000)
}

async function boost(stockList) {
    //let promiseArr = []
    //let promiseArr2 = []
    //let promiseArr3 = []
    for (let market in stockList) {
        if (market == 'sz') {
            let start = '000001'
            let start2 = '001650'
            let start3 = '300000'
            let end = '001000'
            let end2 = '003000'
            let end3 = '300780'
            //promiseArr.push(firstFetch(start, end, market, stockList, await crawler.newPage()))
            //await Promise.all(promiseArr)
            await firstFetch(start, end, market, stockList)
            await firstFetch(start2, end2, market, stockList)
            await firstFetch(start3, end3, market, stockList)
        }
        if (market == 'sh') {
            let start = '600000'
            let start2 = '900929'
            let end = '604000'
            let end2 = '900960'
            //promiseArr2.push(firstFetch(start, end, market, stockList, await crawler.newPage()))
            //promiseArr2.push(firstFetch(start2, end2, market, stockList, await crawler.newPage()))
            //await Promise.all(promiseArr2)
            await firstFetch(start, end, market, stockList)
            await firstFetch(start2, end2, market, stockList)
        }
        if (market == 'hk/') {
            let start = '00001'
            let start2 = '80000'
            let end = '10000'
            let end2 = '90000'
            //promiseArr3.push(firstFetch(start, end, market, await crawler.newPage()))
            //promiseArr3.push(firstFetch(start2, end2, market, await crawler.newPage()))
            //await Promise.all(promiseArr3)
            await firstFetch(start, end, market, stockList)
            await firstFetch(start2, end2, market, stockList)
        }
    }



    console.log('create finish');
}



async function firstFetch(start, end, market, stockList) {

    while (start != end) {
        //console.log(`fetch ${market}${start}`)
        if (crawler.browserTime >= 450) {
            await crawler.reboot()
            await fileCmd.wait(30000)
        }
        if (crawler.pageTime >= 200) {
            crawler.page = await crawler.pageChange(crawler.page)
        }
        let res = await crawler.getInfo(crawler.page, `${market}${start}`)
        if (!res) {
            console.log(`${market}${start}:不存在`)
            await fileCmd.wait(1500)
        }
        if (res == '停牌') {
            stockList[market].push(start)
            console.log(`${market}${start}:停牌`)
        }

        if (res && res !== '停牌') {
            stockList[market].push(start)
            //console.log(res)
            await db.setStock(`${market}${start}`, res.date, res.highest, res.lowest, res.open, res.close, res.volume)
            console.log(`${market}${start}:success`)
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