var fs = require('fs')

var highPriorityPaths = [
   'c:\\programdata\\microsoft\\windows\\start menu\\programs',
   'c:\\users\\%username%\\appdata\\roaming\\microsoft\\windows\\start menu\\programs',
   'c:\\users\\%username%\\downloads',
   'c:\\users\\%username%\\desktop',
   'c:\\users\\%username%\\documents',
   'c:\\users\\%username%\\'
]

function analyze(stdout, numberOfSearchResults) {
    var paths = stdout.split('\n')
    var items = []

    for (var i = 0; i < Math.min(paths.length, numberOfSearchResults); i++) {
        var
            path = paths[i],
            name = '',
            icon = '../../graphics/unknown.png',
            priority = 1.0,
            extension = ''

        var split = path.split(/[\\\/]/)
        var last = split[split.length - 1]
        var lastComma = last.lastIndexOf('.')

        extension = (lastComma > -1) ? last.substring(lastComma, last.length) : ''
        name = (extension != '') ? last.substring(0, lastComma) : last

        if (extension == '') icon = '../../graphics/folder.png'
        else if (extension == 'png' || extension == 'jpg' || extension == 'bmp') icon = '../../graphics/image.png'
        else if (extension == 'exe') icon = '../../graphics/application.png'
        else if (extension == 'mp3') icon = '../../graphics/audio.png'
        else if (extension == 'mkv' || extension == 'mp4' || extension == 'avi') icon = '../../graphics/video.png'
        else icon = '../../graphics/file.png'

        if (isHighPriorityPath(path)) priority = 10

        items.push({
            'name': name,
            'icon': icon,
            'path': path,
            'extension': extension,
            'priority': priority
        })
    }
    items.sort(prioritySort)

    return items
}

function prioritySort(a, b) {
   if (a.priority < b.priority) return -1
   if (a.priority > b.priority) return 1
   return 0
}

function isHighPriorityPath(path) {
   lPath = path.toLowerCase()

   for (var i = 0; i < highPriorityPaths.length; i++) {
      if (lPath.indexOf(highPriorityPaths [i].toLowerCase()) != -1) return true
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
