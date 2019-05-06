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
    }
}

module.exports = config