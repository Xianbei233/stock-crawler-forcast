const pup = require('puppeteer')

async function test() {
    const borwser = await pup.launch()
    const page = await borwser.newPage()
    const res = await page.waitFor(1000)
    console.log(res)
}

test()