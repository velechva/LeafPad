/**
 * @module addItemWindow
 */
const {
    ipcRenderer
} = require('electron')

function selectShortcutPath() {
    ipcRenderer.send('icon-shortcut-browser', null)
}

function addItem() {
    var args = {
        'path': document.getElementById('shortcutPathText').innerHTML,
        'icon': document.getElementById('iconPathText').innerHTML,
        'name': document.getElementById('nameInput').value
    }

    alert('iconPathText: ' + args.icon)

    ipcRenderer.send('add-item', args)
}

function cancelItem() {
    var iconPath = document.getElementById('iconPathText').innerHTML

    ipcRendrer.send('cancel-item', iconPath)
}

ipcRenderer.on('shortcut-path-reply', (event, arg) => {
	path = arg.filePath
	icon = arg.iconPath

    console.log('filePath: ' + path + '\niconPath: ' + icon)

	document.getElementById('shortcutPathText').innerHTML = path
	document.getElementById('iconImage').src = icon
    document.getElementById('iconPathText').innerHTML = icon
})