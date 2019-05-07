const pup = require('puppeteer')
const baseUrl = 'http://quote.eastmoney.com/'

const crawler = {}

const blockedResourceTypes = [
    'image',
    'media',
    'font',
    'texttrack',
    'object',
    'beacon',
    'csp_report',
    'imageset',
];

const skippedResources = [
    'quantserve',
    'adzerk',
    'doubleclick',
    'adition',
    'exelator',
    'sharethrough',
    'cdn.api.twitter',
    'google-analytics',
    'googletagmanager',
    'google',
    'fontawesome',
    'facebook',
    'analytics',
    'optimizely',
    'clicktale',
    'mixpanel',
    'zedo',
    'clicksor',
    'tiqcdn',
];

const userAgent = {
    baidu: 'Mozilla/ 5.0(compatible; Baiduspider / 2.0; +http://www.baidu.com/search/spider.html)',
    Google: 'Mozilla / 5.0(compatible; Googlebot / 2.1; +http://www.google.com/bot.html)',
    Sogou: 'Sogou web spider / 4.0(+http://www.sogou.com/docs/help/webmasters.htm#07)',
    Yahoo: 'Mozilla / 5.0(compatible; Yahoo! Slurp / 3.0; http://help.yahoo.com/help/us/ysearch/slurp)'
}
crawler.pageNum = 0

crawler.init = async function () {
    crawler.browser = await pup.launch({
        args: ['--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'], ignoreHTTPSErrors: true, dumpio: false
    });
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
    page.on('request', request => {
        const requestUrl = request._url.split('?')[0].split('#')[0];
        if (blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
            skippedResources.some(resource => requestUrl.indexOf(resource)) !== -1 ||
            request.url().endsWith('.png') ||
            request.url().endsWith('.jpg') ||
            request.url().endsWith('.ico') ||
            request.url().endsWith('.css') ||
            request.url().endsWith('.gif') ||
            request.url().endsWith('.svg')) {
            request.abort();
        }
        else {
            request.continue();
        }
    });
    return page
}


crawler.getInfo = async function (page, id) {
    // crawler.browser = await pup.launch();
    // crawler.page = await crawler.browser.newPage();
    await page.setUserAgent(randomProperty(userAgent))
    if (!page) {
        return null
    }
    try {
        await page.goto(`${baseUrl}${id}.html`, {
            timeout: 25000,
            waitUntil: 'load',
        });
    } catch (e) {
        await page.reload({
            waitUntil: 'load',
            timeout: 250000
        })
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

function randomProperty(obj) {
    let keys = Object.keys(obj)
    return obj[keys[keys.length * Math.random() << 0]];
};

module.exports = crawler
