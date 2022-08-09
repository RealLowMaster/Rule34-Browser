const { remote } = require('electron')
const { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, createWriteStream, statSync, renameSync, readdirSync } = require('fs')
const jsonfile = require('jsonfile')
const KeyManager = new HotKeyManager()
const ContextManager = new ContextMenuManager()
const dirDocument = remote.app.getPath('documents')+'\\Rule34 Browser'
if (!existsSync(dirDocument)) mkdirSync(dirDocument)
const ThisWindow = remote.getCurrentWindow(), loading = new Loading(), update_number = 5, app_version = 0

// Set Windows Closing Event
ThisWindow.addListener('close', e => {
	e.preventDefault()
	if (UpdateScript.updating) return
	browser.SaveOpenTabs()
	if (downloader.HasDownload()) {
		Confirm(Language('ydl-are-sure-cls-app'), [
			{
				text: Language('yes'),
				class: 'btn btn-danger',
				click: 'downloader.CancelAll(() => CloseApp())'
			},
			{
				text: Language('no')
			}
		])
	} else CloseApp()
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
	Confirm(Language('sure-wanna-quit'), [
		{
			text: Language('yes'),
			class: 'btn btn-danger',
			click: 'remote.app.quit()'
		},
		{text: Language('no')}
	])
}

function FormatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes'
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	const i = Math.floor(Math.log(bytes) / Math.log(1024))
	return parseFloat((bytes / Math.pow(1024, i)).toFixed(dm)) + ' ' + sizes[i]
}

function FormatSeconds(second) {
	if (second === 0) return '0 sec'
	if (second < 60) return isNaN(second) ? '?' : second+' secs'
	else if (second < 3600) {
		const remSec = second % 60
		const min = (second - remSec) / 60
		let res = isNaN(min) ? '?' : min+' Mins'
		if (remSec != 0) res += ' and '+isNaN(remSec) ? '?' : remSec+' secs'
		return res
	} else {
		const remSec = second % 60
		const min = (second - remSec) / 60
		const remMin = min % 60
		const hours = (min - remMin) / 60
		let res = isNaN(hours) ? '?' : hours+' Hours'
		if (remMin != 0) res += ' and '+isNaN(remMin) ? '?' : remMin+' Mins'
		if (remSec != 0) res += ' and '+isNaN(remSec) ? '?' : remSec+' secs'
		return res
	}
	const sizes = ['Secends', 'Minutes', 'Hours']
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
	KeyManager.AddPublicHotKey(false, false, false, 122, ChangeScreenMode)
	KeyManager.use_public = true

	KeyManager.AddCategory('default')
	KeyManager.AddHotKey('default', false, false, false, 37, () => browser.PrevPage()) // LeftArrow
	KeyManager.AddHotKey('default', false, false, false, 39, () => browser.NextPage()) // RightArrow
	KeyManager.AddHotKey('default', true, false, false, 72, () => browser.OpenInNewTab(-4, 1)) // h
	KeyManager.AddHotKey('default', true, false, false, 74, downloader.OpenPanel) // j
	KeyManager.AddHotKey('default', true, false, false, 78, () => browser.OpenInNewTab(-1, 1)) // n
	KeyManager.AddHotKey('default', true, false, false, 68, OpenReads) // d
	KeyManager.AddHotKey('default', true, false, false, 83, () => AddThisTabToReads(browser.selectedTab)) // s
	KeyManager.AddHotKey('default', true, false, false, 82, () => browser.ReloadTab(browser.selectedTab)) // r
	KeyManager.AddHotKey('default', true, true, false, 84, OpenLastTab) // t
	KeyManager.AddHotKey('default', true, false, false, 87, () => browser.CloseTab(browser.selectedTab)) // w
	KeyManager.AddHotKey('default', false, false, false, 27, AskForQuitApp) // Esc
	
	KeyManager.AddCategory('slider')
	KeyManager.AddHotKey('slider', false, false, false, 65, SliderPrev)
	KeyManager.AddHotKey('slider', false, false, false, 68, SliderNext)
	KeyManager.AddHotKey('slider', false, false, false, 67, () => OpenAddPostCollection(slider.post_index))
	KeyManager.AddHotKey('slider', false, false, false, 37, SliderPrev)
	KeyManager.AddHotKey('slider', false, false, false, 39, SliderNext)
	KeyManager.AddHotKey('slider', false, false, false, 72, () => {if (slider.hide) {SliderHide(false)} else SliderHide(true)})
	KeyManager.AddHotKey('slider', false, false, false, 73, () => {if (slider.overview) {SliderOverview(false)} else SliderOverview(true)})
	KeyManager.AddHotKey('slider', false, false, false, 79, SliderToggleOSize)
	KeyManager.AddHotKey('slider', false, false, false, 27, CloseSlider)
	
	KeyManager.AddCategory('downloads')
	KeyManager.AddHotKey('downloads', false, false, false, 27, downloader.ClosePanel)

	KeyManager.AddCategory('collection')
	KeyManager.AddHotKey('collection', false, false, false, 27, CloseAddPostCollection)

	KeyManager.AddCategory('setting')
	KeyManager.AddHotKey('setting', true, false, false, 83, SaveSetting)
	KeyManager.AddHotKey('setting', false, false, false, 27, CloseSetting)

	KeyManager.AddCategory('icon-manager')
	KeyManager.AddHotKey('icon-manager', true, false, false, 90, 'OpenAddIcon()')
	KeyManager.AddHotKey('icon-manager', true, false, false, 83, 'SaveIconManager()')
	KeyManager.AddHotKey('icon-manager', false, false, false, 27, 'CloseIconManager()')
}

function SetContextMenus() {
	let i = ContextManager.AddMenu('menu')
	ContextManager.AddItem(i, { icon:'new-tab', text:'newtab', click: () => browser.OpenInNewTab(-1, 1) })
	ContextManager.AddItem(i, {})
	ContextManager.AddItem(i, { icon:'history', text:'history', click: () => browser.OpenInNewTab(-4, 1)})
	ContextManager.AddItem(i, { icon:'download', text:'downloads', click: () => downloader.OpenPanel() })
	// ContextManager.AddItem(i, { icon:'bookmarks', text:'bookmarks', click: () => OpenBookmarks() })
	ContextManager.AddItem(i, { icon:'reads', text:'reads', click: () => OpenReads() })
	ContextManager.AddItem(i, { icon:'setting', text:'settings', click: () => OpenSettings() })
	ContextManager.AddItem(i, { icon:'exit', text:'exit', click: () => remote.app.quit() })

	document.getElementById('menu').onclick = e => {
		e.preventDefault()
		e.stopImmediatePropagation()
		ContextManager.ShowMenu('menu')
	}

	i = ContextManager.AddMenu('history')
	// ContextManager.AddItem(i, { text:'open', click: () => {} })
	ContextManager.AddItem(i, { icon:'open-new-link', text:'open-in-ntab', click: () => {
		browser.OpenInNewTab(db.history[ContextManager.save][2], db.history[ContextManager.save][3])
		db.history.splice(ContextManager.save, 1)
		browser.SetNeedReload(-2)
		try { jsonfile.writeFileSync(dirDocument+'/history', { v:db.manager.history, a:db.history }) } catch(err) { console.log(err) }
	} })
	// ContextManager.AddItem(i, { text:'add-bookmarks', click: () => {} })
	ContextManager.AddItem(i, { icon:'trash', text:'delete', click: () => DeleteHistory(ContextManager.save) })

	i = ContextManager.AddMenu('tab')
	ContextManager.AddItem(i, { icon:'copy', text:'copy', click: () => browser.CopyTab(ContextManager.save) })
	ContextManager.AddItem(i, { icon:'reload', text:'reload', click: () => browser.ReloadTab(ContextManager.save) })
	ContextManager.AddItem(i, { icon:'add-reads', text:'addtoreads', click: () => AddThisTabToReads(ContextManager.save) })
	ContextManager.AddItem(i, { icon:'duplicate', text:'duplicate', click: () => browser.DuplicateTab(ContextManager.save) })
	// ContextManager.AddItem(i, { icon:'pin', text:'pin', click: () => browser.PinTab(ContextManager.save) })
	// ContextManager.AddItem(i, { text:'add-bookmarks', click: () =>  })
	ContextManager.AddItem(i, {})
	ContextManager.AddItem(i, { icon:'xmark', text:'close', click: () => browser.CloseTab(ContextManager.save) })
	ContextManager.AddItem(i, { icon:'rectangle-xmark', text:'cls-other-tabs', click: () => browser.CloseOtherTabs(ContextManager.save) })

	i = ContextManager.AddMenu('tab-copy')
	ContextManager.AddItem(i, { icon:'paste', text:'paste', click: () => browser.PasteTab() })
	ContextManager.AddItem(i, { icon:'rectangle-xmark', text:'cls-all-tabs', click: () => browser.CloseAllTabs() })
	document.getElementById('mb-tabs').oncontextmenu = e => {
		if (e.target.id != 'mb-tabs') return
		ContextManager.ShowMenu('tab-copy')
	}

	i = ContextManager.AddMenu('nor-links')
	ContextManager.AddItem(i, { icon:'link', text:'open', click: () => browser.LinkClick(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { icon:'open-new-link', text:'open-in-ntab', click: () => browser.OpenLinkInNewTab(ContextManager.save[0], ContextManager.save[1]) })

	i = ContextManager.AddMenu('nor-links-book')
	ContextManager.AddItem(i, { icon:'link', text:'open', click: () => browser.LinkClick(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { icon:'open-new-link', text:'open-in-ntab', click: () => browser.OpenLinkInNewTab(ContextManager.save[0], ContextManager.save[1]) })
	// ContextManager.AddItem(i, { text:'add-bookmarks', click: () => browser.AddLinkToBookmarks() })

	i = ContextManager.AddMenu('br-posts')
	ContextManager.AddItem(i, { icon:'link', text:'open', click: () => browser.LinkClick(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { icon:'open-new-link', text:'open-in-ntab', click: () => browser.OpenLinkInNewTab(ContextManager.save[0], ContextManager.save[1]) })
	// ContextManager.AddItem(i, { text:'add-bookmarks', click: () => browser.AddLinkToBookmarks() })
	ContextManager.AddItem(i, { icon:'add-to-list', text:'add-to-dls', click: () => AddToHave(ContextManager.save[2], ContextManager.save[3]) })
	ContextManager.AddItem(i, { icon:'remove-form-list', text:'remove-from-dls', click: () => RemoveFromHave(ContextManager.save[2], ContextManager.save[3]) })
	ContextManager.AddItem(i, { icon:'download', text:'dl', click: () =>  DownloadClick(ContextManager.save[2], ContextManager.save[3]) })
	ContextManager.AddItem(i, { icon:'trash', text:'delete', click: () => ConfirmDeletingPost(ContextManager.save[2], ContextManager.save[3], false) })
	ContextManager.AddItem(i, { icon:'delete-file', text:'delete-shave', click: () => ConfirmDeletingPost(ContextManager.save[2], ContextManager.save[3], true) })
	
	i = ContextManager.AddMenu('posts')
	ContextManager.AddItem(i, { icon:'link', text:'open', click: () => browser.LinkClick(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { icon:'open-new-link', text:'open-in-ntab', click: () => browser.OpenLinkInNewTab(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { icon:'layer', text:'slider', click: () => OpenSlider(browser.GetTab(ContextManager.save[0]).save, ContextManager.save[4]) })
	ContextManager.AddItem(i, { icon:'box', text:'pack', click: () => OpenPacking(ContextManager.save[2], ContextManager.save[3]) })
	ContextManager.AddItem(i, { icon:'box-open', text:'unpack', click: () => AskForUnPack(ContextManager.save[3]) })
	ContextManager.AddItem(i, { icon:'edit', text:'editpack', click: () => EditPack(ContextManager.save[3]) })
	ContextManager.AddItem(i, { icon:'redownload', text:'redownload', click: () => ReDownloadPost(ContextManager.save[2], ContextManager.save[3]) })
	ContextManager.AddItem(i, { icon:'collection', text:'collections', click: () => OpenAddPostCollection(ContextManager.save[5]) })
	// ContextManager.AddItem(i, { text:'rethumb', click: () => {} })
	ContextManager.AddItem(i, { icon:'trash', text:'delete', click: () => ConfirmDeletingPost(ContextManager.save[2], ContextManager.save[3], false) })
	ContextManager.AddItem(i, { icon:'delete-file', text:'delete-shave', click: () => ConfirmDeletingPost(ContextManager.save[2], ContextManager.save[3], true) })
	ContextManager.AddItem(i, { icon:'info', text:'properties', click: () => OpenPostProperties(ContextManager.save[2], ContextManager.save[3]) })

	i = ContextManager.AddMenu('pack')
	ContextManager.AddItem(i, { icon:'xmark', text:'r-pack', click: () => RemoveFromPack(ContextManager.save[0], ContextManager.save[1]) })

	i = ContextManager.AddMenu('collection')
	ContextManager.AddItem(i, { icon:'link', text:'open', click: () => browser.LinkClick(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { icon:'open-new-link', text:'open-in-ntab', click: () => browser.OpenLinkInNewTab(ContextManager.save[0], ContextManager.save[1]) })
	ContextManager.AddItem(i, { icon:'edit', text:'rename', click: () => OpenAddCollection(ContextManager.save[2]) })
	ContextManager.AddItem(i, { icon:'trash', text:'delete', click: () => AskDeleteCollection(ContextManager.save[2]) })
}