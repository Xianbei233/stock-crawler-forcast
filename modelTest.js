let str = 'https://20.newspush.eastmoney.com/sse?cb=icomet_cb_0&cname=bdc02c361aab973818f3583fb8b5e6d5&seq=0&noop=0&token=&_=1557223543120'
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
const requestUrl = str.split('?')[0].split('#')[0];
console.log(requestUrl)
console.log(skippedResources.some(resource => {
    let res = requestUrl.indexOf(resource)
    if (res !== -1) {
        console.log(resource)
    }
    return res
}));

console.log(-1 == false)