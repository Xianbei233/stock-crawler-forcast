const fs = require('fs')
const path = require('path')
const readline = require('readline')

function formatter(filename) {
    let readStream = fs.createReadStream(path.resolve(__dirname, `../csv/${filename}.csv`))
    let writerStream = fs.createWriteStream(path.resolve(__dirname, `../csv/${filename}-rebuild.csv`))
    writerStream.write('Date,Open,Highest,Lowest,Close,Volume\n')
    let reader = readline.createInterface({
        input: readStream
    })
    let reg = /([0-9]),/g
    reader.on('line', function (line) {
        let newline = line.replace(reg, "$1\", \"")
        writerStream.write(`${newline}\n`)
    })
    reader.on('close', function () {
        writerStream.end()
        fs.unlinkSync(path.resolve(__dirname, `../csv/${filename}.csv`))
        fs.renameSync(path.resolve(__dirname, `../csv/${filename}-rebuild.csv`), path.resolve(__dirname, `../csv/${filename}.csv`))
    })
}


module.exports = formatter