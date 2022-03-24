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

function toBinary(val) {
	
}

const browser = new BrowserManager()

function OpenHistory() {}
function OpenDownloads() {}
function OpenBookmarks() {}