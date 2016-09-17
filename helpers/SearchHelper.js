var fs = require('fs')

function analyze(stdout, numberOfSearchResults) {
    var paths = stdout.split('\n')
    var items = []

    for (var i = 0; i < Math.min(paths.length, numberOfSearchResults); i++) {
        var name, icon, priority, path = paths[i]

        var split = path.split(/[\\\/]/)
        var last = split[split.length - 1]
        var lastComma = last.lastIndexOf('.')

        var extension = (lastComma > -1) ? last.substring(lastComma, last.length) : null

        if (extension) name = last.substring(0, lastComma)
        else name = last

        if (!extension) icon = '../../graphics/folder.png'
        else if (extension == 'png' || extension == 'jpg' || extension == 'bmp') icon = '../../graphics/image.png'
        else if (extension == 'exe') icon = '../../graphics/application.png'
        else if (extension == 'mp3') icon = '../../graphics/audio.png'
        else if (extension == 'mkv' || extension == 'mp4' || extension == 'avi') icon = '../../graphics/video.png'
        else icon = '../../graphics/file.png'

        items.push({
            'name': name,
            'icon': icon,
            'path': path,
            'extension', extension,
            'priority', priority
        })
    }

    return items
}

exports.analyze = analyze
