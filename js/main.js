const { remote } = require('electron')
const { existsSync, mkdirSync, writeFileSync, readFileSync } = require('fs')
const jsonfile = require('jsonfile')
const KeyManager = new HotKeyManager()
const ContextManger = new ContextMenuManager()
const dirDocument = remote.app.getPath('documents')+'\\APP_NAME'
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
			onclick: 'this.parentElement.parentElement.remove();remote.app.quit()'
		},
		{
			text: 'No',
			onclick: 'KeyManager.BackwardCategory();this.parentElement.parentElement.remove()'
		}
	], 'KeyManager.BackwardCategory();this.parentElement.remove()')
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
	let i = ContextManger.AddMenu('default')
	ContextManger.AddItem(i, {text:'Hello'})
	ContextManger.AddItem(i, {text:'test',click:"console.log('test')"})
	ContextManger.AddItem(i, {text:'test',click:"console.log('test')"})
	ContextManger.AddItem(i, {})
	ContextManger.AddItem(i, {text:'test',click:"console.log('test')"})
	ContextManger.AddItem(i, {text:'test',click:"console.log('test')"})
	ContextManger.AddEvent(i, document.body)
}