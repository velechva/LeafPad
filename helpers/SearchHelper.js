/**
 * @module SearchHelper
 */
var fs = require('fs')

var highPriorityPaths = [
    'c:\\programdata\\microsoft\\windows\\start menu\\programs',
    'c:\\users\\%username%\\appdata\\roaming\\microsoft\\windows\\start menu\\programs',
    'c:\\users\\%username%\\downloads',
    'c:\\users\\%username%\\desktop',
    'c:\\users\\%username%\\documents',
    'c:\\users\\%username%\\'
]

/*
  Analyzes a list of search results. Removes duplicates and orders them by
  priority. Also adds icon information to each item.
*/
function analyze(stdout, numberOfSearchResults) {
    var paths = stdout.split('\n')
    var items = []

    // For each search result
    for (let i = 0; i < Math.min(paths.length, numberOfSearchResults); i++) {
        // Set default values
        var
            path = paths[i],
            name = '',
            icon = IconHelper.readIcon('../../graphics/unknown.png'),
            priority = 1.0,
            extension = ''

        var split = path.split(/[\\\/]/)
        var last = split[split.length - 1]
        var lastComma = last.lastIndexOf('.')

        // File extension
        extension = (lastComma > -1) ? last.substring(lastComma, last.length) : ''
        // Filename
        name = (extension != '') ? last.substring(0, lastComma) : last

        if (extension == 'exe' || extension == 'lnk') {
            IconHelper.getApplicationIcon(path, (data) => {
                icon = data
            })
        } else {
            if (extension == '') icon = IconHelper.readIcon('../../graphics/folder.png')
            else if (extension == 'png' || extension == 'jpg' || extension == 'bmp') icon = IconHelper.readIcon('../../graphics/image.png')
            else if (extension == 'mp3') icon = IconHelper.getIcon('../../graphics/audio.png')
            else if (extension == 'mkv' || extension == 'mp4' || extension == 'avi') icon = IconHelper.getIcon(icon = '../../graphics/video.png')
            else icon = IconHelper.readIcon('../../graphics/file.png')           
        }

        if (isHighPriorityPath(path)) priority = 2.0

        items.push({
            'name': name,
            'icon': icon,
            'path': path,
            'extension': extension,
            'priority': priority
        })

    }
    
    items.sort(priorityCompare)

    return items
}

function priorityCompare(a, b) {
    if (a.priority < b.priority) return -1
    if (a.priority > b.priority) return 1
    return 0
}

function isHighPriorityPath(path) {
    lPath = path.toLowerCase()

    for (var i = 0; i < highPriorityPaths.length; i++) {
        if (lPath.indexOf(highPriorityPaths[i].toLowerCase()) != -1) return true
    }

    return false
}

function getName(string) {
  var split = string.split(/[\\\/]/)
  var last = split[split.length - 1]
  var name = last.substring(0, last.lastIndexOf('.'))

  return name
}

exports.analyze = analyze
exports.getName = getName
