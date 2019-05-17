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
    let reg1 = /([0-9]),/g
    let reg2 = /"/g
    reader.on('line', function (line) {
        let newline1 = line.replace(reg1, "$1\", \"")
        let newline2 = newline1.replace(reg2, "")
        writerStream.write(`${newline2}\n`)
    })
    reader.on('close', function () {
        writerStream.end()
        fs.unlinkSync(path.resolve(__dirname, `../csv/${filename}.csv`))
        fs.renameSync(path.resolve(__dirname, `../csv/${filename}-rebuild.csv`), path.resolve(__dirname, `../csv/${filename}.csv`))
    })
}


module.exports = formatter