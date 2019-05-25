const pup = require('puppeteer')
const config = require('../config')
const filecmd = require('file-cmd')
const process = require('process')
const baseUrl = 'http://quote.eastmoney.com/'
const userAgent = config.userAgentList.auto
const crawler = {}

const blockedResourceTypes = [
    //'image',
    'media',
    'font',
    'texttrack',
    'object',
    'beacon',
    'csp_report',
    //'imageset',
];

const skippedResources = [
    'gbfek.dfcfw.com',
    'bdstatic.eastmoney.com',
    'gubawebapi.eastmoney.com',
    'bdstatics.eastmoney.com',
    'emres.dfcfw.com'
];

const needJs = [
    'require',
    'config',
    'Bstock',
    'baseStock',
    'common',
    'emZjlChart',
    'jquery',
    'emcharts',
    'template',
    'emChart',
    'stocksuggest2017'
]


let testmode = process.argv.slice(2).indexOf('test')

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
    await page.setCacheEnabled(false)
    await page.setRequestInterception(true);
    const agent = randomProperty(userAgent)
    await page.setUserAgent(agent)
    page.on('request', request => {
        let requestUrl = request.url().split('/')
        let requestJs = requestUrl[requestUrl.length - 1].split(".")[0].split('-')[0]
        //console.log(requestJs)
        if (blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
            skippedResources.some(resource => requestUrl.indexOf(resource) == -1 ? false : true) !== false ||
            requestUrl.indexOf('api') !== -1 ||
            request.url().endsWith('.png') ||
            request.url().endsWith('.jpg') ||
            request.url().endsWith('.ico') ||
            request.url().endsWith('.css') ||
            (request.url().endsWith('.gif') && !request.url().endsWith('picknotfund.gif')) ||
            request.url().endsWith('.svg') ||
            (request.url().endsWith('.js') && !needJs.some(js => requestJs == js))) {
            if (testmode !== -1) {
                console.log(`${request.url()}请求已屏蔽`)
            }

            request.abort();
        }
        else {
            request.continue();
        }
    });
    page.on('error', async () => {
        crawler.browserTime++
        if (testmode !== -1) {
            console.log("页面出错，开始重载")
        }
        await filecmd.wait(30000)
        await crawler.page.reload({
            waitUntil: 'load',
            timeout: 600000
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
    if (crawler.browserTime == 1 || crawler.pageTime == 1) {
        await filecmd.wait(3000)
    } else {
        await filecmd.wait(1500)
    }


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

            let newStr = str.replace(/[0-9]+(\.[0-9]*)?/g, function (e) {
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

        function sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }

        async function test(time) {
            let temple = await sleep(time);

            return temple
        }

        let close = select('#price9')
        if (isNaN(parseFloat(close))) {
            if (close == '停牌' || close == '暂停上市') {
                return close
            }
            if (close == 'NaN' || close == '-') {
                test(20000)
                close = select('#price9')
            }
            else {
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
    }, crawler.date), page.waitFor(30000)]).then(res => {
        if (!res) {
            return null
        } else {
            return res
        }
    });
    try {
        await page.goto("about:blank", {
            waitUntil: 'load',
            timeout: 60000

        });
    } catch (e) {
        await crawler.reboot()
    }

    return res
}

crawler.getInfoB = async function (page, id) {
    // crawler.browser = await pup.launch();
    // crawler.page = await crawler.browser.newPage();


    if (!page) {
        return null
    }

    try {
        if (testmode !== -1) {
            console.log("开始页面跳转");
        }


        await page.goto(`${baseUrl}${id}.html`, {
            waitUntil: 'load',
            timeout: 60000

        });
        if (testmode !== -1) {
            console.log("页面跳转成功")
        }

        //console.log(response._status)
        crawler.browserTime++
        crawler.pageTime++
    } catch (e) {
        //console.log(e)
        if (testmode !== -1) {
            console.log("页面跳转超时")
        }

    }
    // await page.waitForNavigation({
    //     waitUntil: 'load',
    //     timeout: 60000
    // })
    if (crawler.browserTime == 1 || crawler.pageTime == 1) {
        await filecmd.wait(3000)
    } else {
        await filecmd.wait(1000)
    }


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

            let newStr = str.replace(/[0-9]+(\.[0-9]*)?/g, function (e) {
                return `${e},`
            })
            console.log(newStr)
            let arr = newStr.split(',')
            let num = arr[0]
            console.log(arr)
            if (arr.indexOf('万') != -1) {

                num = num.replace(/\./g, '')

                num = parseInt(num) * 100

            }
            return num
        }

        function sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }

        async function test(time) {
            let temple = await sleep(time);

            return temple
        }

        let close = select('#arrowud > strong')
        if (isNaN(parseFloat(close))) {
            if (close == '停牌' || close == '暂时上市') {
                return close
            }
            if (close == 'NaN' || close == '-') {
                test(20000)
                close = select('#arrowud > strong')
            }
            else {
                return null
            }
        }
        let open = select('body > div:nth-child(1) > div.qphox.layout.mb7 > div.data-middle > table > tbody > tr:nth-child(1) > td.txtl.jkj')
        let highest = select('body > div:nth-child(1) > div.qphox.layout.mb7 > div.data-middle > table > tbody > tr:nth-child(1) > td.txtl.zgj.red')
        let lowest = select('body > div:nth-child(1) > div.qphox.layout.mb7 > div.data-middle > table > tbody > tr:nth-child(2) > td.txtl.zdj')


        let volume = select('body > div:nth-child(1) > div.qphox.layout.mb7 > div.data-middle > table > tbody > tr:nth-child(1) > td:nth-child(10) > span')

        return {
            date: date,
            highest: highest,
            lowest: lowest,
            open: open,
            close: close,
            volume: dateExc(volume)
        };
    }, crawler.date), page.waitFor(300000)]).then(res => {
        if (!res) {
            if (testmode !== -1) {
                console.log("数据获取超时")
            }

            return null
        } else {
            if (testmode !== -1) {
                console.log("数据获取成功")
            }

            return res
        }
    });
    try {
        await page.goto("about:blank", {
            waitUntil: 'load',
            timeout: 60000

        });
        if (testmode !== -1) {
            console.log("跳转空白成功")
        }

    } catch (e) {
        if (testmode !== -1) {
            console.log("跳转空白失败，浏览器重启")
        }
        await crawler.reboot()
    }

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




