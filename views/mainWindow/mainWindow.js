const {ipcRenderer, remote} = require('electron')
const {Menu, MenuItem} = remote

var Sortable = require('../../js-libs/sortable.min.js')
var exec = require('child_process').exec

var SearchHelper = require('../../helpers/SearchHelper.js')

var list = document.getElementById('itemList')
var body = document.getElementById('body')
var searchResults = document.getElementById('searchResults')

var searchMode = false

Sortable.create(list, {
	// Called when an item is click-and-dragged to another spot
	onUpdate: (evt) => {
		console.log('Item ' + evt.oldIndex + ' moved to number ' + evt.newIndex)

		ipcRenderer.send('item-updated', evt)
	}
})

// Keep track of which element is being 'right-clicked' so that the delete function knows
// what to delete
var lastContextClicked = null

function addIconClick() {
	ipcRenderer.send('add-button-clicked', null)
}

function searchBoxKeyDown() {
	ipcRenderer.send('search-key-down', document.getElementById('searchBox').value);
}

const menu = new Menu()
menu.append(new MenuItem
({
	label: 'Delete',
	click() {
		ipcRenderer.send('item-deleted', getIndex())
	}
}))

document.getElementById('body').addEventListener('contextmenu', (e) => {
	if (e.target.className == 'item-icon') {
		lastContextClicked = e.target
		menu.popup(remote.getCurrentWindow)
	}
})

// Returns the list index of the last list element that has been
function getIndex() {
	return (Array.prototype.indexOf.call(list.childNodes, lastContextClicked.parentNode) - 1)
}

// Remove an item from the grid
function deleteItem() {
	list.removeChild(lastContextClicked.parentNode)
}

// IPC HANDLERS //

ipcRenderer.on('add-item-response', (event, arg) => {

	var div = document.createElement('div')
	div.className = 'list-group-item'

	var img = document.createElement('img')
	img.className = 'item-icon'
	img.src = 'file:///' + arg.icon
	img.onclick = function() { exec(arg.path).unref() }

	var title = document.createElement('p')
	title.className = 'item-name'
	title.innerHTML = arg.name

	div.appendChild(img)
	div.appendChild(title)

	list.appendChild(div)
})

ipcRenderer.on('search-update', (event, results) => {
	if (!searchMode) {
		body.style.display = 'none'
		searchResults.style.display = 'block'
	}

	while (searchResults.firstChild)
		searchResults.removeChild(searchResults.firstChild)

	var fileResults = results.split('\n')

	for (var i = 0; i < fileResults.length; i++) {
		var div = document.createElement('div')
		div.className = 'searchResultDiv'
		div.setAttribute('exec-path', fileResults [i])

		var span = document.createElement('span')
		span.className = 'searchResultText'
		span.innerHTML = SearchHelper.getResultName(fileResults [i]) + '</br>'

		var span2 = document.createElement('span')
		span2.className = 'searchResultPath'
		span2.innerHTML = fileResults [i]

		/*
		var img = document.createElement('img')
		img.className = 'searchResultImage'
		img.src = SearchHelper.getResultImage(fileResults [i])

		div.appendChild(img)
		*/

		div.onclick = function(event) {
			var cmd = 'explorer ' + event.target.getAttribute('exec-path')

			exec(cmd, function(error, stdout, stderr) {})
		}

		div.appendChild(span)
		div.appendChild(span2)

		searchResults.appendChild(div)
	}
})

ipcRenderer.on('search-exit', (event, args) => {
	searchResults.style.display = 'none'
	body.style.display = 'block'

	searchMode = false
})
