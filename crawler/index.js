const axios = require('axios')
const cheerio = require('cheerio')

const baseUrl = 'http://quote.eastmoney.com/'

const crawler = {}

crawler.getInfo = id => {
    return new Promise((resolve, reject) => {
        let url = `{baseUrl}{id}.html`
        axios.get(url).then(res => {
            resolve(cutInfo(res.data))
        }).catch(err => {
            reject(err)
        })
    })
}


function cutInfo(res) {
    let $ = cheerio.load(res)
    let date = new Date()
    let dateStr = date.toDateString()
    let target = $('.quote-digest')
    console.log(target)
}




module.exports = crawler