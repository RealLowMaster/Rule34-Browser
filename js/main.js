const { remote } = require('electron')
const { existsSync, mkdirSync, writeFileSync, readFileSync } = require('fs')
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

function MinimizeApp() {
	ThisWindow.minimize()
}

function AskForQuitApp() {
	KeyManager.ChangeCategory(null)
	Confirm('Do you want to Quit?', [
		{
			text: 'Yes',
			class: 'btn btn-danger',
			click: 'remote.app.quit()'
		},
		{text: 'No'}
	])
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

function SetHotKeys() {
	KeyManager.AddPublicHotKey(false, false, false, 122, 'ChangeScreenMode()')
	KeyManager.use_public = true

	KeyManager.AddCategory('default')
	KeyManager.AddHotKey('default', true, false, false, 83, 'browser.AddTab()')
	KeyManager.AddHotKey('default', false, false, false, 27, 'AskForQuitApp()')

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
	ContextManager.AddItem(i, { text:'New Tab', click: () =>  browser.AddTab() })
	ContextManager.AddItem(i, {})
	ContextManager.AddItem(i, { text:'History', click: () => OpenHistory() })
	ContextManager.AddItem(i, { text:'Downloads', click: () => OpenDownloads() })
	ContextManager.AddItem(i, { text:'Bookmarks', click: () => OpenBookmarks() })
	ContextManager.AddItem(i, {})
	ContextManager.AddItem(i, { text:'Settings', click: () => OpenSettings() })
	ContextManager.AddItem(i, { text:'Exit', click: () => remote.app.quit() })

	document.getElementById('menu').onclick = e => {
		e.preventDefault()
		e.stopImmediatePropagation()
		ContextManager.ShowMenu('menu')
	}

	i = ContextManager.AddMenu('tab')
	ContextManager.AddItem(i, { text:'Copy', click: () => browser.CopyTab(ContextManager.save) })
	ContextManager.AddItem(i, { text:'Reload', click: () => browser.ReloadTab(ContextManager.save) })
	ContextManager.AddItem(i, { text:'Duplicate', click: () => browser.DuplicateTab(ContextManager.save) })
	ContextManager.AddItem(i, { text:'Pin', click: () => browser.PinTab(ContextManager.save) })
	ContextManager.AddItem(i, {})
	ContextManager.AddItem(i, { text:'Close', click: () => browser.CloseTab(ContextManager.save) })
	ContextManager.AddItem(i, { text:'Close other tabs', click: () => browser.CloseOtherTabs(ContextManager.save) })

	i = ContextManager.AddMenu('posts')
	ContextManager.AddItem(i, { text:'Open', click:'' })
	ContextManager.AddItem(i, { text:'Open in new tab', click:'' })
	ContextManager.AddItem(i, { text:'Pack', click:'' })
	ContextManager.AddItem(i, { text:'UnPack', click:'' })
	ContextManager.AddItem(i, { text:'Delete', click:'' })
	ContextManager.AddItem(i, { text:'Properties', click:'' })
}