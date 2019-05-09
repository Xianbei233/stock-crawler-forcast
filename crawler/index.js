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
            /*'--single-process'*/], ignoreHTTPSErrors: true, dumpio: false
    });

    let date = new Date()
    crawler.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    crawler.page = (await crawler.browser.pages())[0]
    await crawler.pageSetting(crawler.page)
    crawler.pageTime = 0
    crawler.browserTime = 0
    console.log('launch success')
}

crawler.newPage = async function () {

    //console.log(`page success`)

    let page = await crawler.browser.newPage()

    await crawler.pageSetting(page)
    console.log('新页面创建成功')
    return page
}

crawler.pageSetting = async function (page) {
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
            request.url().endsWith('.svg') ||
            request.url().endsWith('404.js') ||
            request.url().endsWith('usercollect.min.js')) {
            request.abort();
        }
        else {
            request.continue();
        }
    });
    page.on('error', async () => {
        crawler.browserTime++

        await filecmd.wait(30000)
        await crawler.page.reload({
            waitUntil: 'load',
            timeout: 60000
        })
        crawler.pageTime++

    }

    )
    console.log('页面设置完成')
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
            timeout: 60000

        });
        //console.log(response._status)
        crawler.browserTime++
        crawler.pageTime++
    } catch (e) {
        //console.log(e)

    }
    // await page.waitForNavigation({
    //     waitUntil: 'load',
    //     timeout: 60000
    // })
    await filecmd.wait(1000)

    let res = await Promise.race([page.evaluate((date) => {

        function select(selector) {
            let Dom = document.querySelector(selector)
            let res
            if (Dom) {
                res = Dom.innerText
            }
            return res
        }

        function dateExc(str) {

            let newStr = str.replace(/[0-9]+(\.[0-9]*)?/g, function (e, num) {
                return `${e},`
            })
            console.log(newStr)
            let arr = newStr.split(',')
            let num = arr[0]
            console.log(arr)
            if (arr.indexOf('万手') != -1) {

                num = num.replace(/\./g, '')

                num = parseInt(num) * 100

            }
            return num
        }

        let close = select('#price9')
        if (isNaN(parseFloat(close))) {
            if (close == '停牌') {
                return close
            } else {
                return null
            }
        }
        let open = select('#gt1')
        let highest = select('#gt2')
        let lowest = select('#gt9')


        let volume = select('#gt5')


        return {
            date: date,
            highest: highest,
            lowest: lowest,
            open: open,
            close: close,
            volume: dateExc(volume)
        };
    }, crawler.date), page.waitFor(3000)]).then(res => {
        if (!res) {
            return null
        } else {
            return res
        }
    });

    await page.goto("about:blank");
    return res
}





crawler.pageChange = async function (page) {
    let newPage = await crawler.newPage()
    await page.close();
    crawler.pageTime = 0
    return newPage
}

crawler.reboot = async function () {
    await crawler.browser.close()
    await crawler.init()
    console.log('reboot success')
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




