const redis = require('redis')
const config = require('../config')

const client = redis.createClient(config.redis.port, config.redis.host)

const db = {}

client.on('error', (err) => {
    console.log('发生错误：' + err)
})

db.setStock = (id, date, highest, lowest, open, close) => {
    return new Promise((resolve, reject) => {
        let value = `${highest},${lowest},${open},${close}`
        client.hset(id, date, value, (res) => {
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

db.getStockCSV = id => {
    client.send_command(`--csv hgetall ${id} > ../csv/${id}.csv 2> stderr.txt`, (err, rep) => {
        if (err) {
            console.error(err)
        } else {
            console.log(rep)
        }
    })
}
module.exports = db