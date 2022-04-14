const { remote } = require('electron')
const { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, createWriteStream, statSync, renameSync } = require('fs')
const jsonfile = require('jsonfile')
const KeyManager = new HotKeyManager()
const ContextManager = new ContextMenuManager()
const dirDocument = remote.app.getPath('documents')+'\\Rule34 Browser'
if (!existsSync(dirDocument)) mkdirSync(dirDocument)
const ThisWindow = remote.getCurrentWindow(), loading = new Loading(), update_number = 0

// Set Windows Closing Event
ThisWindow.addListener('close', e => {
	e.preventDefault()
	CloseApp()
})

function CloseApp() {
	ThisWindow.removeAllListeners()
	remote.app.quit()
}

function MaximizeApp() {
	if (ThisWindow.isMaximized()) ThisWindow.unmaximize()
	else ThisWindow.maximize()
}

function MinimizeApp() { ThisWindow.minimize() }

function AskForQuitApp() {
	Confirm('Do you want to Quit?', [
		{
			text: 'Yes',
			class: 'btn btn-danger',
			click: 'remote.app.quit()'
		},
		{text: 'No'}
	])
}

function FormatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes'
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	const i = Math.floor(Math.log(bytes) / Math.log(1024))
	return parseFloat((bytes / Math.pow(1024, i)).toFixed(dm)) + ' ' + sizes[i]
}

function MemorySizeOf(obj) {
	let bytes = 0
	function sizeOf(obj) {
		if(obj !== null && obj !== undefined) {
			switch(typeof obj) {
			case 'number':
				bytes += 8
				break
			case 'string':
				bytes += obj.length * 2
				break
			case 'boolean':
				bytes += 4
				break
			case 'object':
				let objClass = Object.prototype.toString.call(obj).slice(8, -1)
				if(objClass === 'Object' || objClass === 'Array') {
					for (let key in obj) {
						if(!obj.hasOwnProperty(key)) continue
						sizeOf(obj[key])
					}
				} else bytes += obj.toString().length * 2
				break
			}
		}
		return bytes
	}
	return FormatBytes(sizeOf(obj))
}

function ChangeScreenMode(fullscreen = null, save = true) {
	if (fullscreen == null) fullscreen = !ThisWindow.isFullScreen()

	const style = document.documentElement.style
	if (fullscreen) {
		if (save) setting.full_screen = true
		ThisWindow.setFullScreen(true)
		document.getElementById('window-titlebar').style.display = 'none'
		style.setProperty('--topMenuSize', '0.000001px')
	} else {
		if (save) setting.full_screen = false
		ThisWindow.setFullScreen(false)
		document.getElementById('window-titlebar').style.display = 'grid'
		style.setProperty('--topMenuSize', '25px')
	}

	document.getElementById('sto_full_screen').checked = setting.full_screen
	if (save) jsonfile.writeFileSync(dirDocument+'/setting.json', setting)
}

function LastChar(char, txt, backward = false) {
	if (backward) return new String(txt).substring(0, txt.lastIndexOf(char))
	else return new String(txt).substring(txt.lastIndexOf(char) + 1)
}

function NoLoopArray(arr) {
	if (!Array.isArray(arr)) return arr
	const new_arr = []
	for (let i = 0, l = arr.length; i < l; i++) if (new_arr.indexOf(arr[i]) < 0) new_arr.push(arr[i])
	return new_arr
}

function SetHotKeys() {
	KeyManager.AddPublicHotKey(false, false, false, 122, 'ChangeScreenMode()')
	KeyManager.use_public = true

	KeyManager.AddCategory('default')
	KeyManager.AddHotKey('default', false, false, false, 37, 'browser.PrevPage()')
	KeyManager.AddHotKey('default', false, false, false, 39, 'browser.NextPage()')
	KeyManager.AddHotKey('default', true, false, false, 74, 'downloader.OpenPanel()')
	KeyManager.AddHotKey('default', true, false, false, 78, 'NewTab()')
	KeyManager.AddHotKey('default', true, false, false, 82, 'browser.ReloadTab(browser.selectedTab)')
	KeyManager.AddHotKey('default', true, false, false, 82, 'browser.ReloadTab(browser.selectedTab)')
	KeyManager.AddHotKey('default', true, false, false, 87, 'browser.CloseTab(browser.selectedTab)')
	KeyManager.AddHotKey('default', false, false, false, 27, 'AskForQuitApp()')
	
	KeyManager.AddCategory('downloads')
	KeyManager.AddHotKey('downloads', false, false, false, 27, 'downloader.ClosePanel()')

	KeyManager.AddCategory('setting')
	KeyManager.AddHotKey('setting', true, false, false, 83, 'SaveSetting()')
	KeyManager.AddHotKey('setting', false, false, false, 27, 'CloseSetting()')

	KeyManager.AddCategory('theme-manager')
	KeyManager.AddHotKey('theme-manager', true, false, false, 83, 'SaveThemeManager()')
	KeyManager.AddHotKey('theme-manager', false, false, false, 27, 'CloseThemeManager()')

	KeyManager.AddCategory('icon-manager')
	KeyManager.AddHotKey('icon-manager', true, false, false, 90, 'OpenAddIcon()')
	KeyManager.AddHotKey('icon-manager', true, false, false, 83, 'SaveIconManager()')
	KeyManager.AddHotKey('icon-manager', false, false, false, 27, 'CloseIconManager()')
}

function SetContextMenus() {
	let i = ContextManager.AddMenu('menu')
	ContextManager.AddItem(i, { text:'newtab', click: () => NewTab() })
	ContextManager.AddItem(i, {})
	ContextManager.AddItem(i, { text:'history', click: () => {
		const id = browser.AddTab()
		browser.ActivateTab(id)
		LoadHistory(id, 1)
	} })
	ContextManager.AddItem(i, { text:'downloads', click: () => downloader.OpenPanel() })
	ContextManager.AddItem(i, { text:'bookmarks', click: () => OpenBookmarks() })
	ContextManager.AddItem(i, {})
	ContextManager.AddItem(i, { text:'settings', click: () => OpenSettings() })
	ContextManager.AddItem(i, { text:'exit', click: () => remote.app.quit() })

	document.getElementById('menu').onclick = e => {
		e.preventDefault()
		e.stopImmediatePropagation()
		ContextManager.ShowMenu('menu')
	}

	i = ContextManager.AddMenu('tab')
	ContextManager.AddItem(i, { text:'copy', click: () => browser.CopyTab(ContextManager.save) })
	ContextManager.AddItem(i, { text:'reload', click: () => browser.ReloadTab(ContextManager.save) })
	ContextManager.AddItem(i, { text:'duplicate', click: () => browser.DuplicateTab(ContextManager.save) })
	// ContextManager.AddItem(i, { text:'pin', click: () => browser.PinTab(ContextManager.save) })
	// ContextManager.AddItem(i, { text:'add-bookmarks', click: () =>  })
	ContextManager.AddItem(i, {})
	ContextManager.AddItem(i, { text:'close', click: () => browser.CloseTab(ContextManager.save) })
	ContextManager.AddItem(i, { text:'cls-other-tabs', click: () => browser.CloseOtherTabs(ContextManager.save) })

	i = ContextManager.AddMenu('tab-copy')
	ContextManager.AddItem(i, { text:'paste', click: () => browser.PasteTab() })
	ContextManager.AddItem(i, { text:'cls-all-tabs', click: () => browser.CloseAllTabs() })
	document.getElementById('mb-tabs').oncontextmenu = e => {
		if (e.target.id != 'mb-tabs') return
		ContextManager.ShowMenu('tab-copy')
	}

	i = ContextManager.AddMenu('nor-links')
	ContextManager.AddItem(i, { text:'open', click: () => browser.LinkClick(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { text:'open-in-ntab', click: () => browser.OpenLinkInNewTab(ContextManager.save[0], ContextManager.save[1]) })

	i = ContextManager.AddMenu('nor-links-book')
	ContextManager.AddItem(i, { text:'open', click: () => browser.LinkClick(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { text:'open-in-ntab', click: () => browser.OpenLinkInNewTab(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { text:'add-bookmarks', click: () => browser.AddLinkToBookmarks() })

	i = ContextManager.AddMenu('br-posts')
	ContextManager.AddItem(i, { text:'open', click: () => browser.LinkClick(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { text:'open-in-ntab', click: () => browser.OpenLinkInNewTab(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { text:'add-bookmarks', click: () => browser.AddLinkToBookmarks() })
	ContextManager.AddItem(i, { text:'add-to-dls', click: () => AddToHave(ContextManager.save[2], ContextManager.save[3]) })
	ContextManager.AddItem(i, { text:'remove-from-dls', click: () => RemoveFromHave(ContextManager.save[2], ContextManager.save[3]) })
	ContextManager.AddItem(i, { text:'dl', click: () =>  DownloadClick(ContextManager.save[2], ContextManager.save[3]) })
	ContextManager.AddItem(i, { text:'delete', click: () => ConfirmDeletingPost(ContextManager.save[2], ContextManager.save[3]) })
	
	i = ContextManager.AddMenu('posts')
	ContextManager.AddItem(i, { text:'open', click: () => browser.LinkClick(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { text:'open-in-ntab', click: () => browser.OpenLinkInNewTab(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { text:'redownload', click: () => ReDownloadPost(ContextManager.save[2], ContextManager.save[3]) })
	ContextManager.AddItem(i, { text:'rethumb', click: () => {} })
	ContextManager.AddItem(i, { text:'delete', click: () => ConfirmDeletingPost(ContextManager.save[2], ContextManager.save[3]) })
	ContextManager.AddItem(i, { text:'properties', click: () => OpenPostProperties(ContextManager.save[2], ContextManager.save[3]) })
}