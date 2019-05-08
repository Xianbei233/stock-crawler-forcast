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
        console.log(num)
        num = parseInt(num) * 100
        console.log(num)
    }
    return num
}



console.log(dateExc('6.29万手'))