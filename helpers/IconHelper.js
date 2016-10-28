var iconExtractor = require('icon-extractor')
var fs = require('fs')

function getIcon(name, filepath) {

	iconExtractor.emitter.on('icon', function(data) {
		saveIcon(name, data.Base64ImageData)
		return savePath
	})

	iconExtractor.getIcon(name, filepath)
}

function saveIcon(name, data) {
	var savePath = '__dirname' + '/IconData/' + name + '.png'

    var rawData = data.replace(/^data:image\/png;base64,/, "")

    fs.writeFile(savePath, rawData, 'base64', (err) => {
        console.log(err)
    })
}

exports.getIcon = getIcon
