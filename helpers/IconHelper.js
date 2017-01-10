/**
 * @module IconHelper
 */
var iconExtractor = require('icon-extractor')
var fs = require('fs')

function savePath(name) {
	return __dirname + '/../IconData/' + name + '.png'
}

function getIcon(name, savePath, filepath, done) {
	iconExtractor.emitter.on('icon', function(data) {
		if (data.Context == name) {
			saveIcon(name, data.Base64ImageData, savePath)

			done()
		}
	})

	iconExtractor.getIcon(name, filepath)
}

function saveIcon(name, data, savePath) {
    var rawData = data.replace(/^data:image\/png;base64,/, "")

    fs.writeFile(savePath, rawData, 'base64', function(err) {
		if (err) console.log('IconHelper: fs.writeFile() error:\n' + err)
	})
}

function removeIcon(path) {
	fs.unlink(path, (err) => {
		if (err) console.log('IconHelper - removeIcon() - fs.unlink error')
	})
}

exports.getIcon = getIcon
exports.savePath = savePath
exports.removeIcon = removeIcon