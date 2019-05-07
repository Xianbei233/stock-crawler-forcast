const config = {
    redis: {
        port: 6379,
        host: 'localhost',
        auth: 'xianbei233'

    },
    stockMarket: {
        default: 'sz',
        list: [
            'sz',//深股通，代码6位数，起始000001，上限300769
            'sh',//沪股通，代码6位数，起始600000/900929，上限603999/900957
            'hk/',//港股，代码5位数，00001-09999，80000-89999
            //'us/',//美股，不做，代码是英文字符组成不好进行遍历抓取，除非有现成的表

        ]
    },
    userAgentList: {
        auto: {
            baidu: 'Mozilla/ 5.0(compatible; Baiduspider / 2.0; +http://www.baidu.com/search/spider.html)',
            Google: 'Mozilla / 5.0(compatible; Googlebot / 2.1; +http://www.google.com/bot.html)',
            Sogou: 'Sogou web spider / 4.0(+http://www.sogou.com/docs/help/webmasters.htm#07)',
            Yahoo: 'Mozilla / 5.0(compatible; Yahoo! Slurp / 3.0; http://help.yahoo.com/help/us/ysearch/slurp)'
        },
        man: {
            ie10: 'Mozilla/5.0 (MSIE 10.0; Windows NT 6.1; Trident/5.0)',
            ip6: 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25',
            ipad: 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25',
            android: 'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36',
            chrome: 'Mozilla/5.0 (Windows NT 5.2) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.122 Safari/534.30',
            firefox: 'Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0',
            opera: 'Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0',
            Safari: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
            weixin: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_4 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11B554a MicroMessenger/6.2.1',
            sogou: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; SE 2.X MetaSr 1.0; SE 2.X MetaSr 1.0; .NET CLR 2.0.50727; SE 2.X MetaSr 1.0)',
            360: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; SE 2.X MetaSr 1.0; SE 2.X MetaSr 1.0; .NET CLR 2.0.50727; SE 2.X MetaSr 1.0)',
            tencent: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; TencentTraveler 4.0; .NET CLR 2.0.50727)'
        }
    }
}

module.exports = config