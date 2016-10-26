var iconExtractor = require('icon-extractor')
var fs = require('fs')

function getIcon(filepath, name) {
    iconExtractor.emitter.on('icon', function(data) {
        if (data.Path == filepath) {
            saveIcon(name, data)
            return data.name
        }
    })

    iconExtractor.getIcon(name, filepath)
}

function saveIcon(name, data) {
    newPath = '__dirname' + '/IconData/' + name

    fs.writeFile(newPath, new Buffer(request.body.photo, 'base64'), function(err) {
        console.log('helpers/IconHelper.js: Error writing image to file')
    })
}

exports.getIcon = getIcon
