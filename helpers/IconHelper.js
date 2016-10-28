var iconExtractor = require('icon-extractor')
var fs = require('fs')

function getIcon(name, filepath) {
	var iconPath

	iconExtractor.emitter.on('icon', function(data) {
		if (data.Path == filepath) {
			savePath = '__dirname' + '/IconData/' + name
			saveIcon(name, data, savePath)
			return savePath
		}
	})

	iconExtractor.getIcon(name, filepath)
}

function saveIcon(name, data) {
	image = data.Base64ImageData
	console.log(image)
	newPath = __dirname + '/../IconData/' + name + '.jpg'
	var stream = image.replace(/^data:image\/\w+;base64,/, '')
	console.log('newPath: ' + newPath + '\nstream: ' + stream)
}

exports.getIcon = getIcon
