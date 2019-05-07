const pup = require('puppeteer')
const baseUrl = 'http://quote.eastmoney.com/'

const crawler = {}

crawler.pageNum = 0

crawler.init = async function () {
    crawler.browser = await pup.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], ignoreHTTPSErrors: true, dumpio: false });
    console.log('launch success')
    let date = new Date()
    crawler.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

crawler.newPage = async function () {
    crawler.pageNum++
    console.log(`page${crawler.pageNum} success`)
    let page = await crawler.browser.newPage();
    //await page.setCacheEnabled(false)
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg') || interceptedRequest.url().endsWith('.ico') || interceptedRequest.url().endsWith('.css') || interceptedRequest.url().endsWith('.gif') || interceptedRequest.url().endsWith('.svg'))
            interceptedRequest.abort();
        else
            interceptedRequest.continue();
    });
    return page
}


crawler.getInfo = async function (page, id) {
    // crawler.browser = await pup.launch();
    // crawler.page = await crawler.browser.newPage();
    if (!page) {
        return null
    }
    try {
        await page.goto(`${baseUrl}${id}.html`, {
            waitUntil: 'load'
        });
    } catch (e) {
        await page.reload()
    }


    let res = await page.evaluate((date) => {

        function select(selector) {
            let Dom = document.querySelector(selector)
            let res
            if (Dom) {
                res = Dom.innerText
            }
            return res
        }

        let highest = select('#gt2')
        let lowest = select('#gt9')
        let open = select('#gt1')
        let close = select('#price9')
        if (!open) {
            return null
        }
        if (isNaN(parseFloat(close))) {
            return null
        }
        return {
            date: date,
            highest: highest,
            lowest: lowest,
            open: open,
            close: close
        };
    }, crawler.date);

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
