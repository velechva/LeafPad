/**
 * @module app
 */
// Imports //

const {
    app,
    BrowserWindow,
    ipcMain,
    globalShortcut,
    dialog
} = require('electron')

var IOHelper = require('./helpers/IOHelper.js')
var SearchHelper = require('./helpers/SearchHelper.js')
var IconHelper = require('./helpers/IconHelper.js')
var exec = require('child_process').exec

// Keep variables that represent the various 'views'
let mainWindow, addItemWindow, mainWindowContents, addItemWindowContents

let escape = 'esc'
/**
 * Quits the app
 */
let quitApp = function() {
    addItemWindow.hide()
    mainWindow.hide()

    IOHelper.writeToFile('items.json', items)

    globalShortcut.unregister(escape)

    mainWindowContents.send('search-exit')
}

// Path of the file that stores app item data
const dataStorePath = 'items.json'

var items = []

// How many search results should the everything CLI call return
var numberOfSearchResults = 8

/**
 * Initially set up all the views
 */
function createWindow() {
    items = IOHelper.readFromFile(dataStorePath)

    // Set up the main window

    mainWindow = new BrowserWindow({
        width: 500,
        height: 600
    })
    mainWindow.loadURL(`file://${__dirname}/views/mainWindow/mainWindow.html`)
    mainWindow.setMenu(null)

    mainWindow.on('close', function(event) {
        IOHelper.writeToFile('items.json', items)
        mainWindow.hide()
        event.preventDefault()
    })

    // Setup the 'add item' window

    addItemWindow = new BrowserWindow({
        width: 500,
        height: 250
    })
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
        globalShortcut.register(escape, quitApp)
    })

    // The shortcut 'esc' will close (hide) the application at any time
    globalShortcut.register(escape, quitApp)

    //mainWindow.openDevTools()
    //addItemWindow.openDevTools()

    mainWindowContents = mainWindow.webContents
    addItemWindowContents = addItemWindow.webContents

    // Take the parsed items from file and add them to the list of shortcuts in the main window
    mainWindowContents.on('did-finish-load', () => {
        for (var i = 0; i < items.length; i++)
            mainWindowContents.send('add-item-response', items[i])
    })

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    app.quit()
    globalShortcut.register(escape)
})

// IPC Handlers //

/**
 * 'Add icon' was clicked - display the add item window
 */
ipcMain.on('add-button-clicked', (event, arg) => {
    if (addItemWindow.isVisible()) {
        mainWindow.show()
        addItemWindow.hide()
    } else {
        mainWindow.hide()
        addItemWindow.show()
    }
})

/**
 * Opens a browser window to select a shortcut
 */
ipcMain.on('icon-shortcut-browser', (event, arg) => {
	var options = {
		title: 'Select a shortcut',
		defaultPath: 'c:/',
		filters: [
			{ name: 'Shortcut', extensions: ['lnk'] }
		]
	}

	var filePath = dialog.showOpenDialog(options) [0]

    if (!filePath) {
        console.log("Please select a link before continuing")
    } else {
        var name = SearchHelper.getName(filePath)
        var savePath = IconHelper.savePath(name)
        
        IconHelper.getIcon(name, savePath, filePath, () => {
            var sendData = {
                'filePath': filePath,
                'iconPath': savePath
            }

            addItemWindowContents.send('shortcut-path-reply', sendData)
        })
    }

})

/**
 * Add a new item to the list
 */
ipcMain.on('add-item', (event, args) => {
    mainWindowContents.send('add-item-response', args)

    items.push(args)
    IOHelper.writeToFile(dataStorePath, items)

    addItemWindow.hide()
    mainWindow.show()
})

ipcMain.on('cancel-item', (event, args) => {
    IconHelper.removeIcon(args)
})

/**
 * When an item has been dragged to another spot, update the items list
 */
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

/**
 * When an item has been deleted, update the items list
 */
ipcMain.on('item-deleted', (event, index) => {
    IconHelper.removeIcon(items[index].icon)
    
    items.splice(index, 1)
})

/**
 * Called when the user types in the search box
 */
ipcMain.on('search-key-down', (event, value) => {
    if (value == '' || value == ' ' || value == null) {
        mainWindowContents.send('search-exit')
        return
    }

    var cmd = 'es -n 20 ' + value
    exec(cmd, function(error, stdout, stderr) {
        mainWindowContents.send('search-update', SearchHelper.analyze(stdout, numberOfSearchResults))
    })
})

/**
 * Quits (hides) the app
 */
ipcMain.on('hide-app', (event, value) => {
    quitApp()
})
