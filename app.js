const {app, BrowserWindow, ipcMain, globalShortcut, dialog} = require('electron')

var IOHelper = require('./helpers/IOHelper.js')
var SearchHelper = require('./helpers/SearchHelper.js')
var exec = require('child_process').exec

let mainWindow, addItemWindow, mainWindowContents, addItemWindowContents

const dataStorePath = 'items.json'

var items = []

var numberOfSearchResults = 15

function createWindow() {
	items = IOHelper.readFromFile(dataStorePath)

	// Set up the main window

	mainWindow = new BrowserWindow({width: 500, height: 600})
	mainWindow.loadURL(`file://${__dirname}/views/mainWindow/mainWindow.html`)
	mainWindow.setMenu(null)

	mainWindow.on('close', function(event) {
		IOHelper.writeToFile('items.json', items)
		mainWindow.hide()
		event.preventDefault()
	})

	// Setup the 'add item' window

	addItemWindow = new BrowserWindow({width:500, height:250})
	addItemWindow.loadURL(`file://${__dirname}/views/addItemWindow/addItemWindow.html`)
	addItemWindow.setMenu(null)
	addItemWindow.hide()

	// Prevent the application from terminating when the close button is hit
	addItemWindow.on('close', function(event) {
		addItemWindow.hide()
		event.preventDefault()
	})

	// The shortcut 'alt + space' is used to open up the application at any time
	globalShortcut.register('alt+space', function() {
		addItemWindow.hide()

		mainWindow.show()
	})

	mainWindow.openDevTools()
	addItemWindow.openDevTools()

	mainWindowContents = mainWindow.webContents
	addItemWindowContents = addItemWindow.webContents

	// Take the parsed items from file and add them to the list of shortcuts in the main window
	mainWindowContents.on('did-finish-load', () => {
			for (var i = 0; i < items.length; i++)
				mainWindowContents.send('add-item-response', items [i])
	})

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
	app.quit()
})

// IPC Handlers //

// Add icon was clicked, which means the add item window should be displayed
ipcMain.on('add-button-clicked', (event, arg) => {
	if (addItemWindow.isVisible()) {
		mainWindow.show()
		addItemWindow.hide()
	}
	else {
		mainWindow.hide()
		addItemWindow.show()
	}
})

// The user wants to browse for an icon
ipcMain.on('open-icon-browser', (event, arg) => {
	var options = {
		title: 'Select an icon',
		defaultPath: 'c:/',
		filters: [
			{ name: 'Png', extensions: ['png'] }
		]
	}
	var filePath = dialog.showOpenDialog(options) [0]

	console.log('Icon path selected: ' + filePath)

	addItemWindowContents.send('icon-path-reply', filePath)
})

// The user wants to browse for a shortcut
ipcMain.on('icon-shortcut-browser', (event, arg) => {
	var options = {
		title: 'Select a shortcut',
		defaultPath: 'c:/',
		filters: [
			{ name: 'Shortcut', extensions: ['lnk'] }
		]
	}
	var filePath = dialog.showOpenDialog(options) [0]

	console.log('Shortcut path selected: ' + filePath)

	addItemWindowContents.send('shortcut-path-reply', filePath)
})

// Add a new item to the list
ipcMain.on('add-item', (event, args) => {
	mainWindowContents.send('add-item-response', args)

	items.push(args)
	IOHelper.writeToFile(dataStorePath, items)

	addItemWindow.hide()
	mainWindow.show()
})

// When an item has been dragged to another spot, update the items list
ipcMain.on('item-updated', (event, args) => {
	var oldIndex = args.oldIndex
	var newIndex = args.newIndex

	console.log('Updating drag from: ' + oldIndex + ' to ' + newIndex)

	// Shift the items array and place everything in the correct order

	if (oldIndex > newIndex) {
		var temp = items[oldIndex]

		for (var i = oldIndex; i > newIndex; i--) {
			items[i] = items[i - 1]
		}

		items[newIndex] = temp
	} else if (oldIndex < newIndex) {
		var temp = items[oldIndex]

		for (var i = oldIndex; i < newIndex; i++) {
			items[i] = items[i + 1]
		}

		items[newIndex] = temp
	}

})

// When an item has been deleted, update the items list
ipcMain.on('item-deleted', (event, index) => {
	// Remove items [index]
})

// When the user types in the search box
ipcMain.on('search-key-down', (event, value) => {
	if (value == '' || value == ' ') {
		mainWindowContents.send('search-exit')
		return
	}

	var cmd = 'es -n ' + numberOfSearchResults + ' ' + value
	exec(cmd, function(error, stdout, stderr) {
		mainWindowContents.send('search-update', SearchHelper.prioritizeResults(stdout))
	})
})
