var fs = require('fs')

function getResultName(filepath) {
   var split = filepath.split(/[\\\/]/)
   var last = split [split.length - 1]

   var lastComma = last.lastIndexOf('.')

   if (lastComma > -1) return last.substring(0, lastComma)
   else return last
}

function getResultImage(filepath) {
   return '../../testRes/Chrome-Icon.png'
}

function prioritizeResults(inResults) {
    var outResults = inResults

    return outResults
}

exports.getResultName = getResultName
exports.getResultImage = getResultImage
exports.prioritizeResults = prioritizeResults
