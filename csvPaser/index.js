const fs = require('fs')
const path = require('path')
const readline = require('readline')

function formatter(filename) {
    let readStream = fs.createReadStream(path.resolve(__dirname, `../csv/${filename}.csv`))
    let writerStream = fs.createWriteStream(path.resolve(__dirname, `../csv/${filename}-rebuild.csv`))
    writerStream.write('Date,Open,High,Low,Close,Volume\n')
    let reader = readline.createInterface({
        input: readStream
    })
    let reg = /"/g
    reader.on('line', function (line) {
        let arr = line.split('","')
        for (let i = 0; i < arr.length; i = i + 2) {
            let str = `${arr[i]},${arr[i + 1]}`
            let newStr = str.replace(reg, "")
            writerStream.write(`${newStr}\n`)
        }

    })
    reader.on('close', function () {
        writerStream.end()
        fs.unlinkSync(path.resolve(__dirname, `../csv/${filename}.csv`))
        fs.renameSync(path.resolve(__dirname, `../csv/${filename}-rebuild.csv`), path.resolve(__dirname, `../csv/${filename}.csv`))
        
    })
}


module.exports = formatter