const redis = require('redis')
const config = require('../config')
const { exec } = require('child_process');
const utils = require('util')
const path = require('path')
const formatter = require('../csvPaser')
const newExec = utils.promisify(exec)
const client = redis.createClient(config.redis.port, config.redis.host)

const db = {}

client.auth(config.redis.auth, function () {
    console.log('认证通过')
})

client.on('error', (err) => {
    console.log('发生错误：' + err)
})

client.on('ready', function (res) {
    console.log('client ready');
});

db.setStock = (id, date, highest, lowest, open, close, volume) => {
    return new Promise((resolve, reject) => {
        let value = `${open},${highest},${lowest},${close},${volume}`
        client.hset(id, date, value, function (err, res) {
            if (err) {
                reject(err)
            }
            resolve(res)
        })

    })
}


db.getStock = id => {
    return new Promise((resolve, reject) => {
        client.hgetall(id, (err, res) => {
            if (err) {
                reject(err)
            }
            if (!res) {
                reject('There is no result')
            }
            res = JSON.parse(res)
            resolve(res)
        })
    })
}

db.getStockCSV = async id => {
    try {
        await newExec(`redis-cli -a ${config.redis.auth} --csv hgetall ${id} > ${path.resolve(__dirname, '../csv')}/${id}.csv 2> stderr.txt`)
        formatter(id)
    } catch (e) {
        console.log(e)
    }
}


module.exports = db