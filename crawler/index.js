const pup = require('puppeteer')
const config = require('../config')
const filecmd = require('file-cmd')
const baseUrl = 'http://quote.eastmoney.com/'
const userAgent = config.userAgentList.auto
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


crawler.pageTime = 0

crawler.init = async function () {
    crawler.browser = await pup.launch({
        headless: true,
        args: ['--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process'], ignoreHTTPSErrors: true, dumpio: false
    });
    console.log('launch success')
    let date = new Date()
    crawler.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

crawler.newPage = async function () {

    //console.log(`page success`)
    let page = await crawler.browser.newPage();
    //await page.setCacheEnabled(false)
    await page.setRequestInterception(true);
    const agent = randomProperty(userAgent)
    await page.setUserAgent(agent)
    page.on('request', request => {
        const requestUrl = request._url.split('?')[0].split('#')[0];
        if (blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
            skippedResources.some(resource => requestUrl.indexOf(resource) == -1 ? false : true) !== false ||
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
    console.log('页面创建成功')
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
            waitUntil: 'load',
            timeout: 25000

        });
        //console.log(response._status)
        crawler.pageTime++
    } catch (e) {
        console.log(e)
        await filecmd.wait(300000)
        await page.reload({
            waitUntil: 'load',
            timeout: 250000
        })
        crawler.pageTime++
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

crawler.pageChange = async function (page) {
    await page.close();
    crawler.pageTime = 0
    return await crawler.newPage()
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
