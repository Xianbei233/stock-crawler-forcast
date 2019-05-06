const pup = require('puppeteer')
const baseUrl = 'http://quote.eastmoney.com/'

const crawler = {}

crawler.pageNum = 0

crawler.init = async function () {
    crawler.browser = await pup.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable - dev - shm - usage'], ignoreHTTPSErrors: true, dumpio: false });
    console.log('launch success')
}

crawler.newPage = async function () {
    crawler.pageNum++
    console.log(`page${crawler.pageNum} success`)
    let page = await crawler.browser.newPage();
    //await page.setCacheEnabled(false)
    return page
}


crawler.getInfo = async function (page, id) {
    // crawler.browser = await pup.launch();
    // crawler.page = await crawler.browser.newPage();
    if (!page) {
        return null
    }
    await page.goto(`${baseUrl}${id}.html`, {
        timeout: 0

    });
    let res = await page.evaluate(() => {

        function select(selector) {
            let Dom = document.querySelector(selector)
            let res
            if (Dom) {
                res = Dom.innerText
            }
            return res
        }
        let date = new Date()
        let dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        let highest = select('#gt2')
        let lowest = select('#gt9')
        let open = select('#gt1')
        let close = select('#price9')
        if (!open) {
            return null
        }
        return {
            date: dateStr,
            highest: highest,
            lowest: lowest,
            open: open,
            close: close
        };
    });

    // await crawler.browser.close();
    return res
}

crawler.Close = async function () {
    if (crawler.browser) {
        console.log('close success')
        await crawler.browser.close();

    }

}

module.exports = crawler
