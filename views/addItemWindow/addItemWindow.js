/**
 * @module addItemWindow
 */
const {
    ipcRenderer
} = require('electron')

function selectIconPath() {
    ipcRenderer.send('open-icon-browser', null)
}

function selectShortcutPath() {
    ipcRenderer.send('icon-shortcut-browser', null)
}

function addItem() {
    var args = {
        'path': document.getElementById('shortcutPathText').innerHTML,
        'icon': document.getElementById('iconPathText').innerHTML,
        'name': document.getElementById('nameInput').value
    }
    ipcRenderer.send('add-item', args)
}

ipcRenderer.on('icon-path-reply', (event, arg) => {
    document.getElementById('iconPathText').innerHTML = arg;
})

ipcRenderer.on('shortcut-path-reply', (event, arg) => {
	path = arg.filePath
	icon = arg.iconPath
    console.log('filePath: ' + path + '\niconPath: ' + icon)
	document.getElementById('shortcutPathText').innerHTML = path;
	document.getElementById('iconImage').src = icon
})
