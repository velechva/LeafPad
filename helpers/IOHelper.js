/**
 * @module IOHelper
 */
var jsonfile = require('jsonfile')

function readFromFile(filepath) {
    console.log('Reading items from file')
    return jsonfile.readFileSync(filepath)
}

function writeToFile(filepath, items) {
    console.log('Writing items to file')
    jsonfile.writeFileSync(filepath, items)
}

exports.readFromFile = readFromFile
exports.writeToFile = writeToFile
