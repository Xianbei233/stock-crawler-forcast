const pup = require('puppeteer')
const baseUrl = 'http://quote.eastmoney.com/'

const crawler = {}


crawler.init = async function () {
    crawler.browser = await pup.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    console.log('launch success')
    crawler.page = await crawler.browser.newPage();
    console.log('page success')
}

crawler.getInfo = async function (id) {
    // crawler.browser = await pup.launch();
    // crawler.page = await crawler.browser.newPage();
    if (!crawler.page) {
        return null
    }
    await crawler.page.goto(`${baseUrl}${id}.html`);
    console.log('ok')
    let res = await crawler.page.evaluate(() => {

        function select(selector) {
            let Dom = document.querySelector(selector)
            let res
            if (Dom) {
                res = Dom.innerText
            }
            return res
        }
        let date = new Date()
        let dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`
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
