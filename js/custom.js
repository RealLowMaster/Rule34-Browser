const site = [

]

const db = {
	post: [],
	collection: [],
	artist: [],
	tag: [],
	parody: [],
	character: [],
	meta: []
}

const paths = {}

class Tab {
	constructor(index) {
		this.history = []
		this.selectedHistory = -1
		this.scroll = 0
		this.search = ''
		this.pageNumber = 1
		this.maxPages = 0
		this.realoding = false
		this.token = null
		this.site = -1
		this.tab = document.createElement('div')
		this.tab.onclick = () => browser.ActivateTab(index)
		this.tab.oncontextmenu = () => ContextManager.ShowMenu('tab', index)
		this.icon = document.createElement('img')
		this.icon.src = 'Image/favicon-32x32.png'
		this.tab.appendChild(this.icon)
		this.title = document.createElement('span')
		this.tab.appendChild(this.title)
		const save = document.createElement('div')
		save.innerText = '⨯'
		save.onclick = () => browser.CloseTab(index)
		this.tab.appendChild(save)
		document.getElementById('mb-tabs').appendChild(this.tab)
		this.page = document.createElement('div')
		document.getElementById('mb-pages').appendChild(this.page)
	}

	AddHistory(txt) {}

	Prev() {}
	
	Next() {}

	Reload() {}

	Change(ico, txt) {
		if (ico != null) this.icon.src = ico
		if (txt != null) {
			this.tab.title = txt
			this.title.innerText = txt
		}
	}

	Close() {
		this.tab.remove()
		this.page.remove()
	}
}

class BrowserManager {
	constructor() {
		this.tabs = []
		this.tabsIds = []
		this.selectedTab = null
	}

	AddTab() {
		const i = this.tabs.length
		const save = new Date().getTime().toString()
		const id = Number(save.substring(save.length - 8))
		this.tabs[i] = new Tab(id)
		this.tabsIds[i] = id
		this.ActivateTab(id)
		return id
	}

	CloseTab(index) {
		try { event.stopPropagation() } catch(err) { console.error(err) }
		console.log(false, index)
		for (let i = 0, l = this.tabsIds.length; i < l; i++) if (this.tabsIds[i] == index) {
			this.tabs[i].Close()
			this.tabs.splice(i, 1)
			this.tabsIds.splice(i, 1)

			if (index == this.selectedTab) {
				if (this.tabsIds.length > 0) {
					if (i == 0) this.ActivateTab(this.tabsIds[0])
					else if (i == this.tabsIds.length) this.ActivateTab(this.tabsIds[i-1])
					else this.ActivateTab(this.tabsIds[i])
				} else this.selectedTab = null
			}
			return
		}
	}

	ActivateTab(index) {
		if (this.selectedTab != null) {
			for (let i = 0, l = this.tabsIds.length; i < l; i++) if (this.tabsIds[i] == this.selectedTab) {
				this.tabs[i].tab.removeAttribute('active')
				this.tabs[i].page.style.display = 'none'
				break
			}
		}
		this.selectedTab = null
		for (let i = 0, l = this.tabsIds.length; i < l; i++) if (this.tabsIds[i] == index) {
			this.selectedTab = index
			this.tabs[i].tab.setAttribute('active','')
			this.tabs[i].page.style.display = 'block'
			return
		}
		this.selectedTab = null
	}

	CloseOtherTabs(index) {
		for (let i = this.tabsIds.length - 1; i >= 0; i--) if (this.tabsIds[i] != index) {
			this.tabs[i].Close()
			this.tabs.splice(i, 1)
			this.tabsIds.splice(i, 1)
		} else this.ActivateTab(this.tabsIds[i])
	}

	ClearTabs() {
		for (let i = this.tabsIds.length - 1; i >= 0; i--) this.tabs[i].Close()
		this.tabs = []
		this.tabsIds = []
	}

	ReloadTab(index) {}

	CopyTab(index) {}

	PasteTab() {}

	DuplicateTab(index) {}

	PinTab(index) {}
}

function ShowStartup() {
	const container = document.createElement('div')
	container.id = 'show-startup'
	let save = document.createElement('p')
	save.innerText = Language('cdl_path')
	container.appendChild(save)

	save = document.createElement('div')
	save.classList.add('btn')
	save.classList.add('btn-primary')
	save.innerText = Language('openfolder')
	save.onclick = ChooseDLPath
	container.appendChild(save)

	document.body.appendChild(container)
}

function ChooseDLPath() {
	const directory = remote.dialog.showOpenDialogSync({title:Language('choosedirectory'), properties:['openDirectory']})

	if (directory == null || directory.length == 0 || directory[0] == null || !existsSync(directory[0])) return

	setting.dl_path = directory[0]
	try {
		jsonfile.writeFileSync(dirDocument+'/setting.json',{a:setting})
		ThisWindow.reload()
	} catch(err) {
		console.error(err)
		error('SavingSettings->'+err)
	}
}

function LoadDatabase() {
	loading.Forward()
	if (
		typeof setting.dl_path !== 'string' ||
		!existsSync(setting.dl_path)
	) {
		loading.Close()
		ShowStartup()
		return
	}
	paths.db = setting.dl_path+'/'
	paths.dl = paths.db+'DL/'
	paths.thumb = paths.db+'thumb/'

	// Check Folders
	if (!existsSync(paths.dl)) try { mkdirSync(paths.dl) } catch(err) {
		console.error(err)
		error('MakingDownloadFolder->'+err)
	}

	if (!existsSync(paths.thumb)) try { mkdirSync(paths.thumb) } catch(err) {
		console.error(err)
		error('MakingThumbFolder->'+err)
	}

	// -------------> Check Databases
	// post
	if (!existsSync(paths.db+'post')) try { jsonfile.writeFileSync(paths.db+'post', {a:[]}) } catch(err) {
		console.error(err)
		error('CreatingPostDB->'+err)
	} else try { db.post = jsonfile.readFileSync(paths.db+'post').a } catch(err) {
		db.post = []
		console.error(err)
		error('LoadingPostDB->'+err)
	}

	// collection
	if (!existsSync(paths.db+'collection')) try { jsonfile.writeFileSync(paths.db+'collection', {a:[]}) } catch(err) {
		console.error(err)
		error('CreatingCollectionDB->'+err)
	} else try { db.collection = jsonfile.readFileSync(paths.db+'collection').a } catch(err) {
		db.collection = []
		console.error(err)
		error('LoadingCollectionDB->'+err)
	}

	// artist
	if (!existsSync(paths.db+'artist')) try { jsonfile.writeFileSync(paths.db+'artist', {a:[]}) } catch(err) {
		console.error(err)
		error('CreatingArtistDB->'+err)
	} else try { db.artist = jsonfile.readFileSync(paths.db+'artist').a } catch(err) {
		db.artist = []
		console.error(err)
		error('LoadingArtistDB->'+err)
	}

	// tag
	if (!existsSync(paths.db+'tag')) try { jsonfile.writeFileSync(paths.db+'tag', {a:[]}) } catch(err) {
		console.error(err)
		error('CreatingTagDB->'+err)
	} else try { db.tag = jsonfile.readFileSync(paths.db+'tag').a } catch(err) {
		db.tag = []
		console.error(err)
		error('LoadingTagDB->'+err)
	}
	
	// parody
	if (!existsSync(paths.db+'parody')) try { jsonfile.writeFileSync(paths.db+'parody', {a:[]}) } catch(err) {
		console.error(err)
		error('CreatingParodyDB->'+err)
	} else try { db.parody = jsonfile.readFileSync(paths.db+'parody').a } catch(err) {
		db.parody = []
		console.error(err)
		error('LoadingParodyDB->'+err)
	}
	
	// character
	if (!existsSync(paths.db+'character')) try { jsonfile.writeFileSync(paths.db+'character', {a:[]}) } catch(err) {
		console.error(err)
		error('CreatingCharacterDB->'+err)
	} else try { db.character = jsonfile.readFileSync(paths.db+'character').a } catch(err) {
		db.character = []
		console.error(err)
		error('LoadingCharacterDB->'+err)
	}

	// Meta
	if (!existsSync(paths.db+'meta')) try { jsonfile.writeFileSync(paths.db+'meta', {a:[]}) } catch(err) {
		console.error(err)
		error('CreatingMetaDB->'+err)
	} else try { db.meta = jsonfile.readFileSync(paths.db+'meta').a } catch(err) {
		db.meta = []
		console.error(err)
		error('LoadingMetaDB->'+err)
	}

	loading.Close()
	KeyManager.ChangeCategory('default')
}

const browser = new BrowserManager()

function OpenHistory() {}
function OpenDownloads() {}
function OpenBookmarks() {}