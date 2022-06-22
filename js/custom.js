const sharp = require('sharp'), request = require('request'), ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(__dirname+'/bin/ffmpeg')
sharp.cache(false)
// sharp('Image/sites/rule34.xyz-72x72.png').resize(32, 32).png({ quality: 100 }).toFile('Image/sites/img.png')

const loading_img = new Image()
loading_img.src = 'Image/loading.gif'

const mb_tabs = document.getElementById('mb-tabs')
const mb_pages = document.getElementById('mb-pages')
const mb_search = document.getElementById('mb-search')
const mb_jump_page = document.getElementById('mb-jump-page')

const pack_overview = { id: null, element: null, index: null, timer: null }
const status = [403, 404, 500, 503]

const sites = [
	{
		name: 'Rule34.xxx',
		url: 'rule34.xxx',
		icon: 'png',
		tags: ['All'],
		ip: '104.26.1.234',
		location: 'USA - California - San Francisco',
		home: Rule34XXXHome
	}
]

const db = {
	history: [],
	post: [],
	post_have: [],
	have: [],
	collection: [],
	artist: [],
	artist_index: [],
	artist_link: [],
	tag: [],
	tag_index: [],
	tag_link: [],
	parody: [],
	parody_index: [],
	parody_link: [],
	character: [],
	character_index: [],
	character_link: [],
	meta: [],
	meta_index: [],
	meta_link: [],
	manager: {
		history: 0,
		post: 0,
		have: 0,
		collection: 0,
		artist: 0,
		tag: 0,
		parody: 0,
		character: 0,
		meta: 0
	}
}

const paths = {}

class Tab {
	constructor(index, before = null, pid = null) {
		this.id = index
		this.pid = pid
		this.save = null
		this.history = []
		this.historyValue = []
		this.selectedHistory = -1
		this.customizing = false
		this.scroll = 0
		this.search = ''
		this.submit_search = ''
		this.jumpPage = -1
		this.pageNumber = 1
		this.maxPages = 0
		this.loading = false
		this.token = null
		this.site = -1
		this.needReload = false
		this.reloading = false
		this.links = []
		this.linksValue = []
		this.tab = document.createElement('div')
		this.tab.draggable = true
		this.tab.ondragstart = e => { browser.draging = index; e.target.classList.add('dragging') }
		this.tab.ondragend = e => { browser.draging = null; e.target.classList.remove('dragging') }
		this.tab.setAttribute('ti', index)
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
		if (before == null) mb_tabs.appendChild(this.tab)
		else mb_tabs.insertBefore(this.tab, before)
		this.page = document.createElement('div')
		mb_pages.appendChild(this.page)
	}

	Loading(site = -1, jumpPage = -1) {
		if (!this.customizing) {
			browser.AddHistory(this.title.innerText, this.site, this.history[this.selectedHistory], this.historyValue[this.selectedHistory])
			browser.SetNeedReload(-2)
			try { jsonfile.writeFileSync(dirDocument+'/history', { v:db.manager.history, a:db.history}) } catch(err) { console.log(err) }
		}
		this.loading = true
		this.needReload = false
		this.scroll = 0
		this.site = site
		this.jumpPage = jumpPage
		this.links = []
		this.linksValue = []
		if (browser.selectedTab == this.id) {
			mb_pages.scrollTop = 0
			if (this.site < 0) mb_search.style.display = 'none'
			else mb_search.style.display = 'block'
			mb_jump_page.style.display = 'none'
		}
		this.Change(loading_img.src, 'Loading...')
		this.page.style.backgroundColor = 'var(--primary-bg)'
		this.page.innerHTML = '<div class="br-loading"><p>Loading...</p><img src="'+loading_img.src+'"></div>'
		this.token = new Date().getTime()
		return this.token
	}

	Load(token, html, txt, bg = null, page = 1, maxPage = 1) {
		if (token != this.token) return
		this.needReload = false
		this.page.innerHTML = null
		this.page.appendChild(html)
		this.loading = false
		this.reloading = false
		let icon
		if (this.site < 0) icon = 'Image/favicon-32x32.png'
		else icon = 'Image/sites/'+sites[this.site].url+'-32x32.'+sites[this.site].icon
		this.Change(icon, txt)
		if (bg == null) this.page.style.backgroundColor = 'var(--primary-bg)'
		else this.page.style.backgroundColor = bg
		this.pageNumber = page
		this.maxPages = maxPage

		if (browser.selectedTab == this.id) {
			mb_pages.scrollTop = 0
			if (this.jumpPage != -1) {
				mbjp.value = this.pageNumber
				mb_jump_page.children[1].innerText = '/ '+this.maxPages
				mb_jump_page.style.display = 'block'
			} else mb_jump_page.style.display = 'none'
		} 
	}

	AddLink(index, value = null) {
		const i = this.links.length
		this.links[i] = index
		this.linksValue[i] = value
		return i
	}

	AddHistory(index, value) {
		if (this.customizing) return
		const i = this.history.length
		if (i == 0 || this.selectedHistory == i - 1) {
			this.history[i] = index
			this.historyValue[i] = value
			this.selectedHistory = i
		} else {
			this.selectedHistory++
			this.history.splice(this.selectedHistory)
			this.historyValue.splice(this.selectedHistory)
			
			this.history[this.selectedHistory] = index
			this.historyValue[this.selectedHistory] = value
		}
	}

	Prev() {
		if (this.selectedHistory <= 0) return
		this.loading = true
		this.reloading = false
		this.needReload = false
		this.customizing = true
		browser.AddHistory(this.title.innerText, this.site, this.history[this.selectedHistory], this.historyValue[this.selectedHistory])
		browser.SetNeedReload(-2)
		this.selectedHistory--
		browser.Link(this.id, this.history[this.selectedHistory], this.historyValue[this.selectedHistory])
		this.customizing = false
		try { jsonfile.writeFileSync(dirDocument+'/history', { v:db.manager.history, a:db.history}) } catch(err) { console.log(err) }
	}
	
	Next() {
		if (this.selectedHistory >= this.history.length - 1) return
		this.loading = true
		this.reloading = false
		this.needReload = false
		this.customizing = true
		browser.AddHistory(this.title.innerText, this.site, this.history[this.selectedHistory], this.historyValue[this.selectedHistory])
		browser.SetNeedReload(-2)
		this.selectedHistory++
		browser.Link(this.id, this.history[this.selectedHistory], this.historyValue[this.selectedHistory])
		this.customizing = false
		try { jsonfile.writeFileSync(dirDocument+'/history', { v:db.manager.history, a:db.history}) } catch(err) { console.log(err) }
	}

	Reload() {
		if (this.reloading) return
		this.reloading = true
		this.loading = true
		this.needReload = false
		this.customizing = true
		browser.Link(this.id, this.history[this.selectedHistory], this.historyValue[this.selectedHistory])
		this.customizing = false
	}

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

	Error(err) {
		this.Change('Image/alert-24x24.webp', 'Error')
		let save = document.createElement('div')
		save.classList.add('alert')
		save.classList.add('alert-danger')
		save.innerText = err
		this.page.style.backgroundColor = 'var(--primary-bg)'
		this.page.innerHTML = null
		this.page.appendChild(save)
		this.loading = false
		this.needReload = true
		this.reloading = false
	}
}

function GetDragAfterElement(x) {
	let list = [...mb_tabs.querySelectorAll('[ti]:not(.dragging)')]
	return list.reduce((closest, child) => {
		const box = child.getBoundingClientRect()
		const offset = x - box.left - box.width / 2
		if (offset < 0 && offset > closest.offset) return { offset: offset, element: child }
		else return closest
	}, { offset: Number.NEGATIVE_INFINITY }).element
}

class BrowserManager {
	constructor() {
		this.tabs = []
		this.selectedTab = null
		this.selectedTabIndex = null
		this.copied = null;
		this.backward = true
		this.timeout = null
		this.draging = null
		window.addEventListener('resize', () => this.ResizeTabs())
		mb_pages.onscroll = () => this.SetTabScroll()
		mb_tabs.ondragover = e => {
			e.preventDefault()
			if (this.draging == null) return
			const draggable = mb_tabs.querySelector('.dragging')
			const afterElement = GetDragAfterElement(e.clientX)
			const index = this.GetTabIndex(this.draging)
			const tab = this.tabs[index]
			if (afterElement == null) {
				mb_tabs.append(draggable)
				this.tabs.splice(index, 1)
				this.tabs.push(tab)
			} else {
				mb_tabs.insertBefore(draggable, afterElement)
				const afterTabIndex = this.GetTabIndex(Number(afterElement.getAttribute('ti')))
				if (index > afterTabIndex) {
					this.tabs.splice(index, 1)
					this.tabs.splice(afterTabIndex, 0, tab)
				} else {
					this.tabs.splice(afterTabIndex, 0, tab)
					this.tabs.splice(index, 1)
				}
			}
			if (this.tabs[this.selectedTabIndex].id != this.selectedTab) this.selectedTabIndex = this.GetTabIndex(this.selectedTab)
		}
	}

	GetTabIndex(id) {
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == id) return i
		return null
	}

	SetTabScroll() {
		if (this.selectedTabIndex == null) return
		this.tabs[this.selectedTabIndex].scroll = mb_pages.scrollTop
	}

	AddTab(before = null, pid = null) {
		const save = new Date().getTime().toString()
		const id = Number(save.substring(save.length - 8))
		if (before == null) {
			const i = this.tabs.length
			this.tabs[i] = new Tab(id, null, pid)
		} else this.tabs.splice(before, 0, new Tab(id, this.tabs[before].tab, pid))
		this.ResizeTabs()
		return id
	}

	CloseTab(index) {
		clearTimeout(this.timeout)
		try { event.stopPropagation() } catch(err) {}
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == index) {
			this.tabs[i].Close()
			this.AddHistory(this.tabs[i].title.innerText, this.tabs[i].site, this.tabs[i].history[this.tabs[i].selectedHistory], this.tabs[i].historyValue[this.tabs[i].selectedHistory])
			this.tabs.splice(i, 1)

			if (index == this.selectedTab) {
				this.selectedTab = null
				this.selectedTabIndex = null
				if (this.tabs.length > 0) {
					if (i == 0) this.ActivateTab(this.tabs[0].id)
					else if (i == this.tabs.length) this.ActivateTab(this.tabs[i - 1].id)
					else this.ActivateTab(this.tabs[i].id)
				} else {
					mb_jump_page.style.display = 'none'
					mb_search.style.display = 'none'
				}
			}

			this.timeout = setTimeout(() => this.ResizeTabs(), 1000)
			browser.SetNeedReload(-2)
			try { jsonfile.writeFileSync(dirDocument+'/history', { v:db.manager.history, a:db.history}) } catch(err) { console.log(err) }
			return
		}
	}

	ActivateTab(index) {
		if (this.tabs.length == 0) {
			this.selectedTab == null
			this.selectedTabIndex = null
			return
		}
		if (this.selectedTab != null) {
			for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == this.selectedTab) {
				this.tabs[i].tab.removeAttribute('active')
				this.tabs[i].page.style.display = 'none'
				break
			}
		}
		this.selectedTab = null
		this.selectedTabIndex = null
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == index) {
			this.selectedTab = index
			this.selectedTabIndex = i

			if (this.tabs[i].site < 0) mb_search.style.display = 'none'
			else mb_search.style.display = 'block'

			if (!this.tabs[i].loading && this.tabs[i].jumpPage != -1) {
				mbjp.value = this.tabs[i].pageNumber
				mb_jump_page.children[1].innerText = '/ '+this.tabs[i].maxPages
				mb_jump_page.style.display = 'block'
			} else mb_jump_page.style.display = 'none'

			if (this.tabs[i].needReload) this.tabs[i].Reload()

			mbs.value = this.tabs[i].search
			this.tabs[i].tab.setAttribute('active','')
			this.tabs[i].page.style.display = 'block'
			mb_pages.scrollTop = this.tabs[i].scroll
			return
		}
		this.selectedTab = null
		this.selectedTabIndex = null
	}

	CloseOtherTabs(index) {
		clearTimeout(this.timeout)
		for (let i = this.tabs.length - 1; i >= 0; i--) if (this.tabs[i].id != index) {
			this.tabs[i].Close()
			this.AddHistory(this.tabs[i].title.innerText, this.tabs[i].site, this.tabs[i].history[this.tabs[i].selectedHistory], this.tabs[i].historyValue[this.tabs[i].selectedHistory])
			this.tabs.splice(i, 1)
		}
		this.selectedTab = null
		this.selectedTabIndex = null
		this.SetNeedReload(-2)
		this.ActivateTab(index)
		this.ResizeTabs()
		browser.SetNeedReload(-2)
		try { jsonfile.writeFileSync(dirDocument+'/history', { v:db.manager.history, a:db.history }) } catch(err) { console.log(err) }
	}

	CloseAllTabs() {
		for (let i = this.tabs.length - 1; i >= 0; i--) {
			this.AddHistory(this.tabs[i].title.innerText, this.tabs[i].site, this.tabs[i].history[this.tabs[i].selectedHistory], this.tabs[i].historyValue[this.tabs[i].selectedHistory])
			this.tabs[i].Close()
		}
		this.tabs = []
		this.selectedTab = null
		this.selectedTabIndex = null
		this.SetNeedReload(-2)
		try { jsonfile.writeFileSync(dirDocument+'/history', { v:db.manager.history, a:db.history}) } catch(err) { console.log(err) }
	}

	AddHistory(txt, site, val, val2) {
		if (val < 0) return
		if (val != undefined) {
			if (val2 != undefined) db.history.push([txt, site, val, val2])
			else db.history.push([txt, site, val])
		}
	}

	GetTab(index) {
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == index) return this.tabs[i]
		return null
	}

	GetActiveTab() {
		if (this.selectedTabIndex == null) return null
		return this.tabs[this.selectedTabIndex]
	}

	GetActiveSite() {
		if (this.selectedTabIndex == null) return null
		return this.tabs[this.selectedTabIndex].site
	}

	OpenLinkInNewTab(tabId, link) {
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == tabId) {
			const id = this.tabs[i].id
			for (let j = i + 1; j < l; j++) if (this.tabs[j].pid != id) {
				this.Link(this.AddTab(j, id), this.tabs[i].links[link], this.tabs[i].linksValue[link])
				return
			}
			this.Link(this.AddTab(null, id), this.tabs[i].links[link], this.tabs[i].linksValue[link])
			return
		}
	}

	LinkClick(tabId, link) {
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == tabId) {
			this.Link(tabId, this.tabs[i].links[link], this.tabs[i].linksValue[link])
			return
		}
	}

	OpenInNewTab(index, value = null) {
		const id = this.AddTab()
		this.Link(id, index, value)
		this.ActivateTab(id)
	}

	Link(tabId, index, value) {
		switch(index) {
			case -6: LoadByInfo(tabId, value[0], value[1], value[2]); return
			case -5: Post(tabId, value[0], value[1]); return
			case -4: LoadHistory(tabId, value); return
			case -3: LoadCollections(tabId); return
			case -2: LoadSites(tabId); return
			case -1: LoadPage(tabId, value); return
			case 3: sites[value].home(tabId, 1); return
			case 4: Rule34XXXHome(tabId, value[0], value[1]); return
			case 5: Rule34XXXArtists(tabId, value[0], value[1]); return
			case 6: Rule34XXXTags(tabId, value[0], value[1]); return
			case 7: Rule34XXXPools(tabId, value); return
			case 8: Rule34XXXPost(tabId, value); return
			case 9: Rule34XXXPool(tabId, value); return
		}
	}
	
	PrevPage() {
		if (this.tabs[this.selectedTabIndex].jumpPage > -1 && this.tabs[this.selectedTabIndex].pageNumber > 1) {
			mbjp.value = this.tabs[this.selectedTabIndex].pageNumber - 1
			JumpPage()
		}
	}

	NextPage() {
		if (this.tabs[this.selectedTabIndex].jumpPage > -1 && this.tabs[this.selectedTabIndex].pageNumber < this.tabs[this.selectedTabIndex].maxPages) {
			mbjp.value = this.tabs[this.selectedTabIndex].pageNumber + 1
			JumpPage()
		}
	}

	Prev(tabId) {
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == tabId) {
			this.tabs[i].Prev()
			return
		}
	}

	Next(tabId) {
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == tabId) {
			this.tabs[i].Next()
			return
		}
	}

	ReloadTab(tabId) {
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == tabId) {
			this.tabs[i].Reload()
			return
		}
	}

	SetNeedReload(site) {
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].site == site) this.tabs[i].needReload = true
		this.ActivateTab(this.selectedTab)
	}

	ResizeTabs() {
		const count = this.tabs.length
		if (count == 0) return

		if (mb_tabs.clientWidth < (232 * count)) {
			const size = mb_tabs.clientWidth / count
			if (size <= 30) mb_tabs.setAttribute('small','')
			else mb_tabs.removeAttribute('small')
			for (let i = 0; i < count; i++) this.tabs[i].tab.style.width = size+'px'
		} else {
			mb_tabs.removeAttribute('small')
			for (let i = 0; i < count; i++) this.tabs[i].tab.style.width = 232+'px'
		}
	}

	CopyTab(index) {
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == index) {
			this.copied = [
				[...this.tabs[i].history],
				[...this.tabs[i].historyValue],
				this.tabs[i].selectedHistory
			]
			PopAlert(Language('tabcopied'))
			return
		}
	}

	PasteTab() {
		if (this.copied == null) {
			PopAlert(Language('n-tab-copy'), 'warning')
			return
		}
		this.Link(this.AddTab(), this.copied[0][this.copied[2]], this.copied[1][this.copied[2]])
	}

	DuplicateTab(index) {
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == index) {
			this.Link(this.AddTab(), this.tabs[i].history[this.tabs[i].selectedHistory], this.tabs[i].historyValue[this.tabs[i].selectedHistory])
			return
		}
	}

	PinTab(index) {}

	ChangeButtonsToDownloading(site, id, back) {
		if (back) {
			for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].site == site) {
				const elements = document.querySelectorAll(`[pid="${id}"]`)
				for (let j = 0, n = elements.length; j < n; j++) {
					elements[j].removeAttribute('dli')
					elements[j].removeAttribute('dl')
					elements[j].removeAttribute('have')
					if (elements[j].tagName == 'DL') {
						elements[j].setAttribute('onclick', `DownloadClick(${site}, ${id})`)
						elements[j].setAttribute('l', 'dl')
						elements[j].title = ''
						elements[j].innerText = Language('dl')
					} else {
						elements[j].innerHTML = null
						let save = document.createElement('div')
						save.onclick = () => DownloadClick(site, id)
						save.setAttribute('l', 'dl')
						save.innerText = Language('dl')
						elements[j].appendChild(save)
						save = document.createElement('div')
						save.onclick = () => AddToHave(site, id)
						save.setAttribute('l', 'add-to-dls')
						save.innerText = Language('add-to-dls')
						elements[j].appendChild(save)
					}
				}
			}
		} else {
			for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].site == site) {
				const elements = document.querySelectorAll(`[pid="${id}"]`)
				for (let j = 0, n = elements.length; j < n; j++) if (elements[j].tagName == 'DL') {
					elements[j].removeAttribute('onclick')
					elements[j].removeAttribute('l')
					elements[j].removeAttribute('dl')
					elements[j].removeAttribute('have')
					elements[j].setAttribute('dli','')
					elements[j].title = ''
					elements[j].innerHTML = `<img src="${loading_img.src}">`
				} else elements[j].innerHTML = `<img src="${loading_img.src}"> Downloading...`
			}
		}
	}

	ChangeButtonsToDownloaded(site, id, back) {
		if (back) {
			for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].site == site) {
				const elements = document.querySelectorAll(`[pid="${id}"]`)
				for (let j = 0, n = elements.length; j < n; j++) {
					elements[j].removeAttribute('dli')
					elements[j].removeAttribute('dl')
					elements[j].removeAttribute('have')
					if (elements[j].tagName == 'DL') {
						elements[j].setAttribute('onclick', `DownloadClick(${site}, ${id})`)
						elements[j].setAttribute('l', 'dl')
						elements[j].title = ''
						elements[j].innerText = Language('dl')
					} else {
						elements[j].innerHTML = null
						let save = document.createElement('div')
						save.onclick = () => DownloadClick(site, id)
						save.setAttribute('l', 'dl')
						save.innerText = Language('dl')
						elements[j].appendChild(save)
						save = document.createElement('div')
						save.onclick = () => AddToHave(site, id)
						save.setAttribute('l', 'add-to-dls')
						save.innerText = Language('add-to-dls')
						elements[j].appendChild(save)
					}
				}
			}
		} else {
			const not_post = db.post_have[site].indexOf(id) != -1
			for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].site == site) {
				const elements = document.querySelectorAll(`[pid="${id}"]`)
				for (let j = 0, n = elements.length; j < n; j++) {
					elements[j].removeAttribute('dli')
					elements[j].removeAttribute('have')
					elements[j].setAttribute('dl', '')
					if (elements[j].tagName == 'DL') {
						elements[j].removeAttribute('onclick')
						elements[j].setAttribute('l', 'dled')
						elements[j].title = ''
						elements[j].innerText = Language('dled')
					} else {
						elements[j].innerHTML = null
						if (not_post) {
							const save = document.createElement('div')
							save.setAttribute('l', 'dled')
							save.innerText = Language('dled')
							elements[j].appendChild(save)
						} else {
							let save = document.createElement('div')
							save.setAttribute('l', 'delete')
							save.innerText = Language('delete')
							save.onclick = () => ConfirmDeletingPost(site, id, false)
							elements[j].appendChild(save)
							save = document.createElement('div')
							save.setAttribute('l', 'delete-shave')
							save.innerText = Language('delete-shave')
							save.onclick = () => ConfirmDeletingPost(site, id, true)
							elements[j].appendChild(save)
						}
					}
				}
			}
		}
	}

	ChangeButtonsToHave(site, id, back) {
		if (back) {
			for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].site == site) {
				const elements = document.querySelectorAll(`[pid="${id}"]`)
				for (let j = 0, n = elements.length; j < n; j++) {
					elements[j].removeAttribute('dli')
					elements[j].removeAttribute('dl')
					elements[j].removeAttribute('have')
					if (elements[j].tagName == 'DL') {
						elements[j].setAttribute('onclick', `DownloadClick(${site}, ${id})`)
						elements[j].setAttribute('l', 'dl')
						elements[j].title = ''
						elements[j].innerText = Language('dl')
					} else {
						elements[j].innerHTML = null
						let save = document.createElement('div')
						save.onclick = () => DownloadClick(site, id)
						save.setAttribute('l', 'dl')
						save.innerText = Language('dl')
						elements[j].appendChild(save)
						save = document.createElement('div')
						save.onclick = () => AddToHave(site, id)
						save.setAttribute('l', 'add-to-dls')
						save.innerText = Language('add-to-dls')
						elements[j].appendChild(save)
					}
				}
			}
		} else {
			for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].site == site) {
				const elements = document.querySelectorAll(`[pid="${id}"]`)
				for (let j = 0, n = elements.length; j < n; j++) {
					elements[j].removeAttribute('dli')
					elements[j].removeAttribute('dl')
					elements[j].setAttribute('have','')
					if (elements[j].tagName == 'DL') {
						elements[j].setAttribute('onclick', `RemoveFromHave(${site}, ${id})`)
						elements[j].setAttribute('l', 'idl')
						elements[j].setAttribute('lt', 'remove-from-dls')
						elements[j].title = Language('remove-from-dls')
						elements[j].innerText = Language('idl')
					} else {
						elements[j].innerHTML = null
						const save = document.createElement('div')
						save.onclick = () => RemoveFromHave(site, id)
						save.setAttribute('l', 'remove-from-dls')
						save.innerText = Language('remove-from-dls')
						elements[j].appendChild(save)
					}
				}
			}
		}
	}

	AddLinkToBookmarks() {}
}

const browser = new BrowserManager()

mb_search.onsubmit = e => {
	e.preventDefault()
	switch(browser.GetActiveSite()) {
		case 0: Rule34XXXHome(browser.selectedTab, 1, mbs.value); return
		case 1: return
	}
}

function JumpPage() {
	const tab = browser.GetActiveTab()
	let value = Math.min(Math.abs(Number(mbjp.value)), tab.maxPages)
	if (value < 1) value = 1
	switch(tab.site) {
		case -2: LoadHistory(tab.id, value); return
		case -1:
			switch(tab.jumpPage) {
				case 0: LoadPage(tab.id, value); return
				case 1: LoadByInfo(tab.id, value, tab.historyValue[tab.selectedHistory][1], tab.historyValue[tab.selectedHistory][2]); return
			}
		case 0:
			switch(tab.jumpPage) {
				case 0: Rule34XXXHome(tab.id, value, tab.submit_search); return
				case 1: Rule34XXXArtists(tab.id, value, tab.submit_search); return
				case 2: Rule34XXXTags(tab.id, value, tab.submit_search); return
				case 3: Rule34XXXPools(tab.id, value); return
			}
			return
		case 1:
			return
	}
}

mb_jump_page.onsubmit = e => {
	e.preventDefault()
	JumpPage()
}

mbs.oninput = () => {
	if (browser.selectedTabIndex == null) return
	browser.tabs[browser.selectedTabIndex].search = mbs.value
}

window.onmousedown = e => { if (e.which == 2) e.preventDefault() }

function NewTab() {
	const id = browser.AddTab()
	browser.ActivateTab(id)
	LoadPage(id, 1)
}

function ShowStartup(list) {
	const container = document.createElement('div')
	container.id = 'show-startup'
	if (list.length == 0) {
		let save = document.createElement('p')
		save.innerText = Language('cdl_path')
		container.appendChild(save)

		save = document.createElement('div')
		save.classList.add('btn')
		save.classList.add('btn-primary')
		save.innerText = Language('openfolder')
		save.onclick = ChooseDLPath
		container.appendChild(save)
	} else {
		let save
		for (let i = 0, l = list.length; i < l; i++) {
			save = document.createElement('div')
			save.classList.add('alert')
			save.classList.add('alert-danger')
			save.innerText = list[i]
			container.appendChild(save)
		}
		save = document.createElement('p')
		save.innerText = Language('fix-database')
		container.appendChild(save)
		save = document.createElement('p')
		save.style.paddingTop = '0'
		save.innerText = Language('or')
		container.appendChild(save)
		save = document.createElement('div')
		save.classList.add('btn')
		save.classList.add('btn-primary')
		save.innerText = Language('openfolder')
		save.onclick = ChooseDLPath
		container.appendChild(save)
	}
	document.body.appendChild(container)
}

function ChooseDLPath() {
	const directory = remote.dialog.showOpenDialogSync({title:Language('choosedirectory'), properties:['openDirectory']})

	if (UpdateScript.updating || directory == null || directory.length == 0 || directory[0] == null || !existsSync(directory[0])) return

	setting.dl_path = directory[0]
	try {
		jsonfile.writeFileSync(dirDocument+'/setting.json',setting)
		ThisWindow.reload()
	} catch(err) {
		console.error(err)
		error('SavingSettings->'+err)
	}
}

function LoadDatabase() {
	loading.Forward()
	if (typeof setting.dl_path !== 'string' || !existsSync(setting.dl_path)) {
		loading.Close()
		ShowStartup([])
		return
	}
	paths.db = setting.dl_path+'/R34DB/'
	paths.dl = setting.dl_path+'/R34DL/'
	paths.thumb = setting.dl_path+'/R34thumb/'
	paths.tmp = setting.dl_path+'/R34tmp/'

	// Check Folders
	if (!existsSync(paths.db)) try { mkdirSync(paths.db) } catch(err) {
		console.error(err)
		Alert('MakingDatabaseFolder->'+err)
		return
	}

	if (!existsSync(paths.dl)) try { mkdirSync(paths.dl) } catch(err) {
		console.error(err)
		Alert('MakingDownloadFolder->'+err)
		return
	}

	if (!existsSync(paths.thumb)) try { mkdirSync(paths.thumb) } catch(err) {
		console.error(err)
		Alert('MakingThumbFolder->'+err)
		return
	}

	if (!existsSync(paths.tmp)) try { mkdirSync(paths.tmp) } catch(err) {
		console.error(err)
		Alert('MakingTempFolder->'+err)
		return
	}

	// -------------> Load/Create Global Databases
	const db_tmp = {}
	if (existsSync(dirDocument+'/history')) try { db_tmp.history = jsonfile.readFileSync(dirDocument+'/history') } catch(err) {
		db_tmp.history = 'LoadingHistoryDB->'+err
		console.error(err)
	} else try {
		db_tmp.history = { v:db.manager.history, a:[] }
		jsonfile.writeFileSync(dirDocument+'/history', db_tmp.history)
	} catch(err) {
		db_tmp.history = 'CreatingHistoryDB->'+err
		console.log(err)
	}

	// -------------> Load/Create Databases
	// post
	if (existsSync(paths.db+'post')) try { db_tmp.post = jsonfile.readFileSync(paths.db+'post') } catch(err) {
		db_tmp.post = undefined
		console.error(err)
		Alert('LoadingPostDB->'+err)
	} else try {
		post_have = []
		for (let i = 0, l = sites.length; i < l; i++) post_have.push([])
		db_tmp.post = { v:db.manager.post, a:[], h: post_have.slice() }
		delete post_have
		jsonfile.writeFileSync(paths.db+'post', db_tmp.post)
	} catch(err) {
		db_tmp.post = undefined
		console.error(err)
		Alert('CreatingPostDB->'+err)
	}

	// have
	if (existsSync(paths.db+'have')) try { db_tmp.have = jsonfile.readFileSync(paths.db+'have') } catch(err) {
		db_tmp.have = undefined
		console.error(err)
		Alert('LoadingHaveDB->'+err)
	} else try {
		tmp_have = []
		for (let i = 0, l = sites.length; i < l; i++) tmp_have.push([])
		db_tmp.have = { v:db.manager.have, a:tmp_have.slice() }
		delete tmp_have
		jsonfile.writeFileSync(paths.db+'have', db_tmp.have)
	} catch(err) {
		db_tmp.have = undefined
		console.error(err)
		Alert('CreatingHaveDB->'+err)
	}

	// collection
	/*
	if (existsSync(paths.db+'collection')) try { db_tmp.collection = jsonfile.readFileSync(paths.db+'collection') } catch(err) {
		db_tmp.collection = undefined
		console.error(err)
		Alert('LoadingCollectionDB->'+err)
	} else try {
		db_tmp.collection = { v:db.manager.collection, a:[] }
		jsonfile.writeFileSync(paths.db+'collection', db_tmp.collection)
	} catch(err) {
		db_tmp.collection = undefined
		console.error(err)
		Alert('CreatingCollectionDB->'+err)
	}
	*/

	// artist
	if (existsSync(paths.db+'artist')) try { db_tmp.artist = jsonfile.readFileSync(paths.db+'artist') } catch(err) {
		db_tmp.artist = undefined
		console.error(err)
		Alert('LoadingArtistDB->'+err)
	} else try {
		db_tmp.artist = { v:db.manager.artist, a:[], l:[], i:[] }
		jsonfile.writeFileSync(paths.db+'artist', db_tmp.artist)
	} catch(err) {
		db_tmp.artist = undefined
		console.error(err)
		Alert('CreatingArtistDB->'+err)
	}

	// tag
	if (existsSync(paths.db+'tag')) try { db_tmp.tag = jsonfile.readFileSync(paths.db+'tag') } catch(err) {
		db_tmp.tag = undefined
		console.error(err)
		Alert('LoadingTagDB->'+err)
	} else try {
		db_tmp.tag = { v:db.manager.tag, a:[], l:[], i:[] }
		jsonfile.writeFileSync(paths.db+'tag', db_tmp.tag)
	} catch(err) {
		db_tmp.tag = undefined
		console.error(err)
		Alert('CreatingTagDB->'+err)
	}

	// parody
	if (existsSync(paths.db+'parody')) try { db_tmp.parody = jsonfile.readFileSync(paths.db+'parody') } catch(err) {
		db_tmp.parody = undefined
		console.error(err)
		Alert('LoadingParodyDB->'+err)
	} else try {
		db_tmp.parody = { v:db.manager.parody, a:[], l:[], i:[] }
		jsonfile.writeFileSync(paths.db+'parody', db_tmp.parody)
	} catch(err) {
		db_tmp.parody = undefined
		console.error(err)
		Alert('CreatingParodyDB->'+err)
	}

	// character
	if (existsSync(paths.db+'character')) try { db_tmp.character = jsonfile.readFileSync(paths.db+'character') } catch(err) {
		db_tmp.character = undefined
		console.error(err)
		Alert('LoadingCharacterDB->'+err)
	} else try {
		db_tmp.character = { v:db.manager.character, a:[], l:[], i:[] }
		jsonfile.writeFileSync(paths.db+'character', db_tmp.character)
	} catch(err) {
		db_tmp.character = undefined
		console.error(err)
		Alert('CreatingCharacterDB->'+err)
	}

	// meta
	if (existsSync(paths.db+'meta')) try { db_tmp.meta = jsonfile.readFileSync(paths.db+'meta') } catch(err) {
		db_tmp.meta = undefined
		console.error(err)
		Alert('LoadingMetaDB->'+err)
	} else try {
		db_tmp.meta = { v:db.manager.meta, a:[], l:[], i:[] }
		jsonfile.writeFileSync(paths.db+'meta', db_tmp.meta)
	} catch(err) {
		db_tmp.meta = undefined
		console.error(err)
		Alert('CreatingMetaDB->'+err)
	}

	// -------------> Check Databases
	const error_list = []
	// history
	if (typeof db_tmp.history === 'object') {
		if (typeof db_tmp.history.v === 'number') {
			if (db_tmp.history.v > db.manager.history) error_list.push('History Database Version is not supported')
			else {
				if (Array.isArray(db_tmp.history.a)) {
					db.history = db_tmp.history.a.slice()
				} else error_list.push('History Database is Corrupted #Data')
			}
		} else error_list.push('History Database is Corrupted #Version')
	} else error_list.push(db_tmp.history)
	delete db_tmp.history

	// post
	if (typeof db_tmp.post === 'object') {
		if (typeof db_tmp.post.v === 'number') {
			if (db_tmp.post.v > db.manager.post) error_list.push('Post Database Version is not supported')
			else {
				if (Array.isArray(db_tmp.post.a)) {
					if (Array.isArray(db_tmp.post.h)) {
						if (db_tmp.post.h.length < sites.length) for (let i = 0, l = sites.length; i < l; i++) if (!Array.isArray(db_tmp.post.h[i])) db_tmp.post.h[i] = []
						db.post = db_tmp.post.a.slice()
						db.post_have = db_tmp.post.h.slice()
					} else error_list.push('Post Database is Corrupted #Data-1')
				} else error_list.push('Post Database is Corrupted #Data-1')
			}
		} else error_list.push('Post Database is Corrupted #Version')
	} else error_list.push(db_tmp.post)
	delete db_tmp.post

	// have
	if (typeof db_tmp.have === 'object') {
		if (typeof db_tmp.have.v === 'number') {
			if (db_tmp.have.v > db.manager.have) error_list.push('Downloads Database Version is not supported')
			else {
				if (Array.isArray(db_tmp.have.a)) {
					if (db_tmp.have.a.length < sites.length) for (let i = 0, l = sites.length; i < l; i++) if (!Array.isArray(db_tmp.have.a[i])) db_tmp.have.a[i] = []
					db.have = db_tmp.have.a.slice()
				} else error_list.push('Downloads Database is Corrupted #Data')
			}
		} else error_list.push('Downloads Database is Corrupted #Version')
	} else error_list.push(db_tmp.have)
	delete db_tmp.have

	// artist
	if (typeof db_tmp.artist === 'object') {
		if (typeof db_tmp.artist.v === 'number') {
			if (db_tmp.artist.v > db.manager.artist) error_list.push('Artists Database Version is not supported')
			else {
				if (Array.isArray(db_tmp.artist.a)) {
					if (Array.isArray(db_tmp.artist.l)) {
						if (Array.isArray(db_tmp.artist.i)) {
							db.artist = db_tmp.artist.a.slice()
							db.artist_index = db_tmp.artist.i.slice()
							db.artist_link = db_tmp.artist.l.slice()
						} else error_list.push('Artists Database is Corrupted #Data-3')
					} else error_list.push('Artists Database is Corrupted #Data-2')
				} else error_list.push('Artists Database is Corrupted #Data-1')
			}
		} else error_list.push('Artists Database is Corrupted #Version')
	} else error_list.push(db_tmp.artist)
	delete db_tmp.artist

	// tag
	if (typeof db_tmp.tag === 'object') {
		if (typeof db_tmp.tag.v === 'number') {
			if (db_tmp.tag.v > db.manager.tag) error_list.push('Tags Database Version is not supported')
			else {
				if (Array.isArray(db_tmp.tag.a)) {
					if (Array.isArray(db_tmp.tag.l)) {
						if (Array.isArray(db_tmp.tag.i)) {
							db.tag = db_tmp.tag.a.slice()
							db.tag_index = db_tmp.tag.i.slice()
							db.tag_link = db_tmp.tag.l.slice()
						} else error_list.push('Tags Database is Corrupted #Data-3')
					} else error_list.push('Tags Database is Corrupted #Data-2')
				} else error_list.push('Tags Database is Corrupted #Data-1')
			}
		} else error_list.push('Tags Database is Corrupted #Version')
	} else error_list.push(db_tmp.tag)
	delete db_tmp.tag

	// parody
	if (typeof db_tmp.parody === 'object') {
		if (typeof db_tmp.parody.v === 'number') {
			if (db_tmp.parody.v > db.manager.parody) error_list.push('Parodies Database Version is not supported')
			else {
				if (Array.isArray(db_tmp.parody.a)) {
					if (Array.isArray(db_tmp.parody.l)) {
						if (Array.isArray(db_tmp.parody.i)) {
							db.parody = db_tmp.parody.a.slice()
							db.parody_index = db_tmp.parody.i.slice()
							db.parody_link = db_tmp.parody.l.slice()
						} else error_list.push('Parodies Database is Corrupted #Data-3')
					} else error_list.push('Parodies Database is Corrupted #Data-2')
				} else error_list.push('Parodies Database is Corrupted #Data-1')
			}
		} else error_list.push('Parodies Database is Corrupted #Version')
	} else error_list.push(db_tmp.parody)
	delete db_tmp.parody

	// character
	if (typeof db_tmp.character === 'object') {
		if (typeof db_tmp.character.v === 'number') {
			if (db_tmp.character.v > db.manager.character) error_list.push('Characters Database Version is not supported')
			else {
				if (Array.isArray(db_tmp.character.a)) {
					if (Array.isArray(db_tmp.character.l)) {
						if (Array.isArray(db_tmp.character.i)) {
							db.character = db_tmp.character.a.slice()
							db.character_index = db_tmp.character.i.slice()
							db.character_link = db_tmp.character.l.slice()
						} else error_list.push('Characters Database is Corrupted #Data-3')
					} else error_list.push('Characters Database is Corrupted #Data-2')
				} else error_list.push('Characters Database is Corrupted #Data-1')
			}
		} else error_list.push('Characters Database is Corrupted #Version')
	} else error_list.push(db_tmp.character)
	delete db_tmp.character

	// meta
	if (typeof db_tmp.meta === 'object') {
		if (typeof db_tmp.meta.v === 'number') {
			if (db_tmp.meta.v > db.manager.meta) error_list.push('Metas Database Version is not supported')
			else {
				if (Array.isArray(db_tmp.meta.a)) {
					if (Array.isArray(db_tmp.meta.l)) {
						if (Array.isArray(db_tmp.meta.i)) {
							db.meta = db_tmp.meta.a.slice()
							db.meta_index = db_tmp.meta.i.slice()
							db.meta_link = db_tmp.meta.l.slice()
						} else error_list.push('Metas Database is Corrupted #Data-3')
					} else error_list.push('Metas Database is Corrupted #Data-2')
				} else error_list.push('Metas Database is Corrupted #Data-1')
			}
		} else error_list.push('Metas Database is Corrupted #Version')
	} else error_list.push(db_tmp.meta)
	delete db_tmp.meta

	if (error_list.length == 0) {
		if (setting.seen_release != null && setting.seen_release != update_number) OpenReleaseNote()
		else loading.Close()
		CheckScriptUpdate()
		KeyManager.ChangeCategory('default')
		NewTab()
	} else {
		CheckScriptUpdate()
		loading.Close()
		ShowStartup(error_list)
		KeyManager.stop = true
	}
}

function BRPostDL(site, id) {
	const container = document.createElement('dl')
	container.setAttribute('pid', id)
	if (downloader.IsDownloading(site, id)) {
		container.setAttribute('dli','')
		container.innerHTML = `<img src="${loading_img.src}">`
	} else if (IsHave(site, id)) {
		if (IsDownloaded(site, id) != 0) {
			container.setAttribute('dl','')
			container.setAttribute('l', 'dled')
			container.innerText = Language('dled')
		} else {
			container.setAttribute('onclick', `RemoveFromHave(${site}, ${id})`)
			container.setAttribute('have','')
			container.setAttribute('l', 'idl')
			container.setAttribute('lt', 'remove-from-dls')
			container.title = Language('remove-from-dls')
			container.innerText = Language('idl')
		}
	} else {
		container.setAttribute('onclick', `DownloadClick(${site}, ${id})`)
		container.setAttribute('l', 'dl')
		container.innerText = Language('dl')
	}
	container.onmousedown = e => e.stopPropagation()
	return container
}

function BRLink(tabId, link, site, id) {
	const e = window.event, key = e.which
	if (key == 1) browser.LinkClick(tabId, link)
	else if (key == 2) browser.OpenLinkInNewTab(tabId, link)
	else {
		ContextManager.save = [tabId, link, site, id]
		if (downloader.IsDownloading(site, id)) {
			ContextManager.SetActiveItem('br-posts', 2, false)
			ContextManager.SetActiveItem('br-posts', 3, false)
			ContextManager.SetActiveItem('br-posts', 4, false)
			ContextManager.SetActiveItem('br-posts', 5, false)
			ContextManager.SetActiveItem('br-posts', 6, false)
		} else if (IsHave(site, id)) {
			const isdl = IsDownloaded(site, id)
			switch(isdl) {
				case 0:
					ContextManager.SetActiveItem('br-posts', 2, false)
					ContextManager.SetActiveItem('br-posts', 3, true)
					ContextManager.SetActiveItem('br-posts', 4, false)
					ContextManager.SetActiveItem('br-posts', 5, false)
					ContextManager.SetActiveItem('br-posts', 6, false)
					break
				case 1:
					ContextManager.SetActiveItem('br-posts', 2, false)
					ContextManager.SetActiveItem('br-posts', 3, false)
					ContextManager.SetActiveItem('br-posts', 4, false)
					ContextManager.SetActiveItem('br-posts', 5, true)
					ContextManager.SetActiveItem('br-posts', 6, true)
					break
				case 2:
					ContextManager.SetActiveItem('br-posts', 2, false)
					ContextManager.SetActiveItem('br-posts', 3, false)
					ContextManager.SetActiveItem('br-posts', 4, false)
					ContextManager.SetActiveItem('br-posts', 5, false)
					ContextManager.SetActiveItem('br-posts', 6, false)
					break
			}
		} else {
			ContextManager.SetActiveItem('br-posts', 2, true)
			ContextManager.SetActiveItem('br-posts', 3, false)
			ContextManager.SetActiveItem('br-posts', 4, true)
			ContextManager.SetActiveItem('br-posts', 5, false)
			ContextManager.SetActiveItem('br-posts', 6, false)
		}
		ContextManager.ShowMenu('br-posts')
	}
}

function BRPostLinkElement(tabId, link, site, id) {
	const element = document.createElement('div')
	element.onmousedown = () => BRLink(tabId, link, site, id)
	return element
}

function BRDownloadElement(site, id) {
	const container = document.createElement('dlr')
	container.setAttribute('pid', id)
	if (downloader.IsDownloading(site, id)) {
		container.setAttribute('dli','')
		container.innerHTML = `<img src="${loading_img.src}"> Downloading...`
	} else if (IsHave(site, id)) {
		if (IsDownloaded(site, id)) {
			container.setAttribute('dl','')
			if (db.post_have[site].indexOf(id) != -1) {
				const save = document.createElement('div')
				save.setAttribute('l', 'dled')
				save.innerText = Language('dled')
				container.appendChild(save)
			} else {
				let save = document.createElement('div')
				save.setAttribute('l', 'delete')
				save.innerText = Language('delete')
				save.onclick = () => ConfirmDeletingPost(site, id, false)
				container.appendChild(save)
				save = document.createElement('div')
				save.setAttribute('l', 'delete-shave')
				save.innerText = Language('delete-shave')
				save.onclick = () => ConfirmDeletingPost(site, id, true)
				container.appendChild(save)
			}
		} else {
			const save = document.createElement('div')
			save.onclick = () => RemoveFromHave(site, id)
			save.setAttribute('l', 'remove-from-dls')
			save.innerText = Language('remove-from-dls')
			container.appendChild(save)
		}
	} else {
		let save = document.createElement('div')
		save.onclick = () => DownloadClick(site, id)
		save.setAttribute('l', 'dl')
		save.innerText = Language('dl')
		container.appendChild(save)
		save = document.createElement('div')
		save.onclick = () => AddToHave(site, id)
		save.setAttribute('l', 'add-to-dls')
		save.innerText = Language('add-to-dls')
		container.appendChild(save)
	}
	return container
}

function IsFormatSupported(src) {
	src = LastChar('?', LastChar('.', src), true)
	const supported_formats = [
		'jpeg',
		'jpg',
		'png',
		'webp',
		'gif',
		'mp4',
		'webm',
		'avi',
		'mpg',
		'mpeg',
		'ogg',
		'ogv'
	]

	if (supported_formats.indexOf(src.toLowerCase()) >= 0) return true
	return false
}

function IsFormatVideo(str) {
	const supported_formats = [
		'mp4',
		'webm',
		'avi',
		'mpg',
		'mpeg',
		'ogg',
		'ogv'
	]

	if (supported_formats.indexOf(str.toLowerCase()) >= 0) return true
	return false
}

function DownloadClick(site, id) {
	if (isNaN(id)) {
		PopAlert(Language('link-crashed'), 'danger')
		return
	}
	if (IsHave(site, id)) {
		PopAlert(Language('yadtp'), 'danger')
		return
	}
	const dl_index = downloader.Starting(site, id)
	if (dl_index == null) {
		PopAlert(Language('tpid'), 'danger')
		return
	}
	const GetData = (arr) => {
		const data = {}
		if (arr.parody != null) {
			data.parody = []
			for (let i = 0, l = arr.parody.length; i < l; i++) data.parody.push(arr.parody[i][0])
		}
		if (arr.character != null) {
			data.character = []
			for (let i = 0, l = arr.character.length; i < l; i++) data.character.push(arr.character[i][0])
		}
		if (arr.artist != null) {
			data.artist = []
			for (let i = 0, l = arr.artist.length; i < l; i++) data.artist.push(arr.artist[i][0])
		}
		if (arr.tag != null) {
			data.tag = []
			for (let i = 0, l = arr.tag.length; i < l; i++) data.tag.push(arr.tag[i][0])
		}
		if (arr.meta != null) {
			data.meta = []
			for (let i = 0, l = arr.meta.length; i < l; i++) data.meta.push(arr.meta[i][0])
		}
		return data
	}
	switch(site) {
		case 0:
			r34xxx.Post(id, (err, arr) => {
				if (err) {
					console.error(err)
					downloader.StopFromStarting(dl_index)
					PopAlert(Language('cto'), 'danger')
					return
				}
				if (!IsFormatSupported(arr.src)) {
					downloader.StopFromStarting(dl_index)
					PopAlert(Language('fns'), 'danger')
					return
				}
				downloader.Add(dl_index, arr.thumb, arr.url, arr.src, GetData(arr))
			}, true)
			return
		case 1:
			return
	}
}

function NormalLink(tabId, link, notNormal) {
	const e = window.event, key = e.which
	if (key == 1) browser.LinkClick(tabId, link)
	else if (key == 2) browser.OpenLinkInNewTab(tabId, link)
	else {
		ContextManager.save = [tabId, link]
		if (notNormal) ContextManager.ShowMenu('nor-links-book')
		else ContextManager.ShowMenu('nor-links')
	}
}

function NormalLinkElement(name, inner, tabId, link, notNormal = true, lang = false) {
	const element = document.createElement(name)
	if (inner != null) {
		if (lang) {
			element.setAttribute('l', inner)
			element.innerText = Language(inner)
		} else element.innerText = inner
	}
	element.onmousedown = () => NormalLink(tabId, link, notNormal)
	return element
}

function ChangeFilter(backward) {
	browser.backward = backward
	browser.SetNeedReload(-1)
}

function GetMainMenu(tab, page) {
	const container = document.createElement('div')
	container.classList.add('main-page-menu')

	if (page != -1) container.appendChild(NormalLinkElement('div', 'home', tab.id, tab.AddLink(-1, 1), false, true))
	if (page != -2) container.appendChild(NormalLinkElement('div', 'sites', tab.id, tab.AddLink(-2), false, true))
	if (page != -3) container.appendChild(NormalLinkElement('div', 'collections', tab.id, tab.AddLink(-3), false, true))
	if (page != -4) container.appendChild(NormalLinkElement('div', 'history', tab.id, tab.AddLink(-4, 1), false, true))

	return container
}

function PostLink(tabId, link, site, id, sldIndex, pack) {
	const e = window.event, key = e.which
	if (key == 1) browser.LinkClick(tabId, link)
	else if (key == 2) browser.OpenLinkInNewTab(tabId, link)
	else {
		ContextManager.save = [tabId, link, site, id, sldIndex]

		if (pack) {
			ContextManager.SetActiveItem('posts', 3, false)
			ContextManager.SetActiveItem('posts', 4, true)
			ContextManager.SetActiveItem('posts', 5, true)
			ContextManager.SetActiveItem('posts', 6, false)
		} else {
			ContextManager.SetActiveItem('posts', 3, true)
			ContextManager.SetActiveItem('posts', 4, false)
			ContextManager.SetActiveItem('posts', 5, false)
			ContextManager.SetActiveItem('posts', 6, true)
		}

		ContextManager.ShowMenu('posts')
	}
}

function ChangePackOverview(i) {
	if (pack_overview.id != i || pack_overview.element == null) return
	pack_overview.index++
	if (pack_overview.index >= db.post[i][10].length) pack_overview.index = 0
	const src = paths.thumb+db.post[i][2][pack_overview.index]+'.jpg'
	if (existsSync(src)) pack_overview.element.src = src
	else pack_overview.element.src = 'Image/no-img-225x225.webp'
	pack_overview.timer = setTimeout(() => ChangePackOverview(i), 700)
}

function EnablePackOverview(i, who) {
	if (pack_overview.id != i) {
		clearTimeout(pack_overview.timer)
		if (pack_overview.element != null) DisablePackOverview(pack_overview.id, pack_overview.element)
		pack_overview.id = i
		pack_overview.element = who
		pack_overview.index = 0
		pack_overview.timer = setTimeout(() => ChangePackOverview(i), 700)
	} else if (pack_overview.element == null) {
		DisablePackOverview(i, who)
		pack_overview.id = i
		pack_overview.element = who
		pack_overview.index = 0
		pack_overview.timer = setTimeout(() => ChangePackOverview(i), 700)
	}
}

function DisablePackOverview(i, who) {
	if (pack_overview.id == i) {
		pack_overview.id = null
		pack_overview.element = null
		pack_overview.index = null
		clearTimeout(pack_overview.timer)
	}
	const src = paths.thumb+db.post[i][2][0]+'.jpg'
	if (existsSync(src)) who.src = src
	else who.src = 'Image/no-img-225x225.webp'
}

function GetPostElement(tab, i, date = 0) {
	let pack = false
	if (db.post[i][0] == -1) pack = true
	const container = document.createElement('div')
	const len = tab.save.length
	container.onmousedown = () => PostLink(tab.id, tab.AddLink(-5, [db.post[i][0], db.post[i][1]]), db.post[i][0], db.post[i][1], len, pack)
	let save = document.createElement('img')
	save.loading = 'lazy'
	if (pack) {
		tab.save.push(i)
		save.setAttribute('onmouseenter', "EnablePackOverview("+i+", this)")
		save.setAttribute('onmouseout', "DisablePackOverview("+i+", this)")
		const src = paths.thumb+db.post[i][2][0]+'.jpg'
		if (existsSync(src)) save.src = src+'?'+date
		else save.src = 'Image/no-img-225x225.webp'
		container.appendChild(save)
		save = document.createElement('span')
		save.innerHTML = Icon('layer')
		container.appendChild(save)
	} else {
		tab.save.push(i)
		const src = paths.thumb+db.post[i][2]+'.jpg'
		if (existsSync(src)) save.src = src+'?'+date
		else save.src = 'Image/no-img-225x225.webp'
		container.appendChild(save)
	
		if (db.post[i][9] == '0') {
			save = document.createElement('p')
			save.innerHTML = Icon('gif-format')
			container.appendChild(save)
		} else if (IsFormatVideo(db.post[i][3])) {
			save = document.createElement('span')
			save.innerHTML = Icon('play')
			container.appendChild(save)
		}
	}

	return container
}

function GetPaginationList(total_pages, page) {
	let min = 1, max = 1, bdot = false, fdot = false, bfirst = false, ffirst = false, pagination_width = 5
	if (total_pages > pagination_width - 1) {
		if (page == 1) {
			min = 1
			max = pagination_width
		} else {
			if (page < total_pages) {
				if (page == pagination_width || page == pagination_width - 1) min = page - Math.floor(pagination_width / 2) - 1
				else min = page - Math.floor(pagination_width / 2)
				
				if (page == (total_pages - pagination_width) + 1 || page == (total_pages - pagination_width) + 2) max = page + Math.floor(pagination_width / 2) + 1
				else max = page + Math.floor(pagination_width / 2)
			} else {
				min = page - pagination_width + 1
				max = page
			}
		}
	} else {
		min = 1
		max = total_pages
	}
	
	if (min < 1) min = 1
	if (max > total_pages) max = total_pages
	
	if (page > pagination_width - 1 && total_pages > pagination_width) bfirst = true
	if (page > pagination_width && total_pages > pagination_width + 1) bdot = true
	if (page < (total_pages - pagination_width) + 2 && total_pages > pagination_width) ffirst = true
	if (page < (total_pages - pagination_width) + 1 && total_pages > pagination_width + 1) fdot = true
	
	const arr = []
	if (page > 1) arr.push(['Prev', page - 1])
	if (bfirst) arr.push(['1', 1])
	if (bdot) arr.push(['...', null])
	for (let i=min; i <= max;i++) {
		if (i == page) arr.push([`${i}`, null])
		else arr.push([`${i}`, i])
	}
	if (fdot) arr.push(['...', null])
	if (ffirst) arr.push([`${total_pages}`, total_pages])
	if (page < total_pages) arr.push(['Next', page + 1])
	return arr
}

function GetPagination(tab, link, total_pages, page) {
	const pagination = GetPaginationList(total_pages, page)
	const container = document.createElement('div')
	container.classList.add('main-page-pagination')

	for (let i = 0, l = pagination.length; i < l; i++) {
		if (pagination[i][1] != null) container.appendChild(NormalLinkElement('div', pagination[i][0], tab.id, tab.AddLink(link, pagination[i][1])))
		else {
			const btn = document.createElement('div')
			btn.setAttribute('active', '')
			btn.innerText = pagination[i][0]
			container.appendChild(btn)
		}
	}

	return container
}

function GetPaginationForInfo(tab, total_pages, page, type, index) {
	const pagination = GetPaginationList(total_pages, page)
	const container = document.createElement('div')
	container.classList.add('main-page-pagination')

	for (let i = 0, l = pagination.length; i < l; i++) {
		if (pagination[i][1] != null) container.appendChild(NormalLinkElement('div', pagination[i][0], tab.id, tab.AddLink(-6, [pagination[i][1], type, index])))
		else {
			const btn = document.createElement('div')
			btn.setAttribute('active', '')
			btn.innerText = pagination[i][0]
			container.appendChild(btn)
		}
	}

	return container
}

function OpenPostProperties(site, id) {
	KeyManager.stop = true
	const index = GetPost(site, id)
	if (index == null) {
		KeyManager.stop = false
		return
	}
	const container = document.getElementById('post-properties'), panel = container.children[0]
	panel.innerHTML = null
	if (db.post[index][0] == -1) {
		const list = [0]
		let l = db.post[index][10].length, save, save2, save3
		for (let i = 0; i < l; i++) {
			const url = paths.dl+db.post[index][2][i]+'.'+db.post[index][3][i]
			let size
			try { size = statSync(url).size } catch(err) { size = 0 }
			list[0] += size
			const site = db.post[index][10][i]
			list.push([url, FormatBytes(size), 'Image/sites/'+sites[site].url+'-32x32.'+sites[site].icon, db.post[index][3][i]])
		}

		save = document.createElement('span')
		save2 = document.createElement('div')
		save2.innerText = Language('full-size')+':'
		save.appendChild(save2)
		save2 = document.createElement('div')
		save2.innerText = FormatBytes(list[0])
		save.appendChild(save2)
		panel.appendChild(save)

		l++
		for (let i = 1; i < l; i++) {
			const si = i
			const row = document.createElement('span')
			let column = document.createElement('div')
			const img = document.createElement('img')
			img.src = list[i][2]
			img.title = Language('open-site')
			img.onclick = () => {
				container.style.display = 'none'
				panel.innerHTML = null
				KeyManager.stop = false
				browser.OpenInNewTab(3, db.post[index][10][si - 1])
			}
			column.appendChild(img)
			row.appendChild(column)
			column = document.createElement('div')
			column.innerText = list[i][1]+' - '+list[i][3].toUpperCase()
			row.appendChild(column)
			column = document.createElement('div')
			column.classList.add('btn')
			column.classList.add('btn-primary')
			column.innerText = Language('openfile')
			column.onclick = () => downloader.OpenURL(list[si][0])
			row.appendChild(column)
			panel.appendChild(row)

			if (existsSync(list[i][0])) {
				if (IsFormatVideo(list[i][3])) {
					const vid = document.createElement('video')
					vid.onloadedmetadata = () => {
						const get_element = panel.children[si].children[1]
						get_element.innerText += ' - '+vid.videoWidth+'x'+vid.videoHeight
						get_element.title = vid.videoWidth * vid.videoHeight+' Pixles'
					}
					vid.src = list[i][0]
				} else {
					const img = new Image()
					img.onload = () => {
						const get_element = panel.children[si].children[1]
						get_element.innerText += ' - '+img.naturalWidth+'x'+img.naturalHeight
						get_element.title = img.naturalWidth * img.naturalHeight+' Pixles'
					}
					img.src = list[i][0]
				}
			}
		}

		save = document.createElement('div')
		save.classList.add('btn')
		save.classList.add('btn-danger')
		save.innerText = Language('close')
		save.onclick = () => {
			container.style.display = 'none'
			panel.innerHTML = null
			KeyManager.stop = false
		}
		panel.appendChild(save)
	} else {
		const url = paths.dl+db.post[index][2]+'.'+db.post[index][3]
		let size = 0
		try { size = statSync(url).size } catch(err) { size = 0 }

		let save = document.createElement('span')
		let save2 = document.createElement('div')
		save2.innerText = Language('size')+':'
		save.appendChild(save2)
		save2 = document.createElement('div')
		save2.innerText = FormatBytes(size)
		save.appendChild(save2)
		panel.appendChild(save)

		save = document.createElement('span')
		save2 = document.createElement('div')
		save2.innerText = Language('format')+':'
		save.appendChild(save2)
		save2 = document.createElement('div')
		save2.innerText = db.post[index][3].toUpperCase()
		save.appendChild(save2)
		panel.appendChild(save)

		if (existsSync(url)) {
			save = document.createElement('span')
			save2 = document.createElement('div')
			save2.innerText = Language('resolution')+':'
			save.appendChild(save2)
			const res = document.createElement('div')
			save.appendChild(res)
			if (IsFormatVideo(db.post[index][3])) {
				const vid = document.createElement('video')
				vid.onloadedmetadata = () => {
					res.innerText = vid.videoWidth+'x'+vid.videoHeight
					res.title = vid.videoWidth * vid.videoHeight+' Pixels'
				}
				vid.src = url
			} else {
				const img = new Image()
				img.onload = () => {
					res.innerText = img.naturalWidth+'x'+img.naturalHeight
					res.title = img.naturalWidth * img.naturalHeight+' Pixels'
				}
				img.src = url
			}
			panel.appendChild(save)
		}

		save = document.createElement('span')
		save2 = document.createElement('div')
		save2.innerText = Language('site')+':'
		save.appendChild(save2)
		save2 = document.createElement('div')
		save2.innerText = sites[db.post[index][0]].name
		const save3 = document.createElement('img')
		save3.classList.add('ml-2')
		save3.src = 'Image/sites/'+sites[db.post[index][0]].url+'-32x32.'+sites[db.post[index][0]].icon
		save3.title = Language('open-site')
		save3.onclick = () => {
			container.style.display = 'none'
			panel.innerHTML = null
			KeyManager.stop = false
			browser.OpenInNewTab(3, db.post[index][0])
		}
		save2.appendChild(save3)
		save.appendChild(save2)
		panel.appendChild(save)

		save = document.createElement('div')
		save.classList.add('btn')
		save.classList.add('btn-primary')
		save.innerText = Language('openfile')
		save.onclick = () => downloader.OpenURL(url)
		panel.appendChild(save)

		save = document.createElement('div')
		save.classList.add('btn')
		save.classList.add('btn-danger')
		save.innerText = Language('close')
		save.onclick = () => {
			container.style.display = 'none'
			panel.innerHTML = null
			KeyManager.stop = false
		}
		panel.appendChild(save)
	}
	container.style.display = 'flex'
}

function LoadPage(tabId, page = 1) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(-1, 0)
	tab.AddHistory(-1, page)
	const container = document.createElement('div')
	container.classList.add('main-page')
	container.appendChild(GetMainMenu(tab, -1))

	let save = document.createElement('div')
	save.classList.add('main-page-filter')
	let save2 = document.createElement('div')
	save2.innerHTML = Icon('new-to-old')
	if (browser.backward) save2.setAttribute('active','')
	else save2.onclick = () => ChangeFilter(true)
	save.appendChild(save2)
	save2 = document.createElement('div')
	save2.innerHTML = Icon('old-to-new')
	if (!browser.backward) save2.setAttribute('active','')
	else save2.onclick = () => ChangeFilter(false)
	save.appendChild(save2)
	container.appendChild(save)

	const post_cont = db.post.length
	const date = new Date().getTime()
	const total_pages = Math.ceil(post_cont / setting.pic_per_page)
	if (page > total_pages) page = total_pages

	if (total_pages > 0) {
		save = document.createElement('div')
		save.classList.add('main-page-posts')

		let min = 0, max
		tab.save = []
		if (browser.backward) {
			if (post_cont < setting.pic_per_page) max = post_cont
			else {
				const use_page = page - 1
				max = use_page * setting.pic_per_page
				max = post_cont - max
				min = max - setting.pic_per_page
				if (min < 0) min = 0
			}
			for (let i = max - 1; i >= min; i--) save.appendChild(GetPostElement(tab, i, date))
		} else {
			if (post_cont < setting.pic_per_page) max = post_cont
			else {
				min = (setting.pic_per_page * page) - setting.pic_per_page
				max = min + setting.pic_per_page
				if (max > post_cont) max = post_cont
			}
			for (let i = min; i < max; i++) save.appendChild(GetPostElement(tab, i, date))
		}
		container.appendChild(save)
		container.appendChild(GetPagination(tab, -1, total_pages, page))
	} else {
		page = 1
		save = document.createElement('div')
		save.classList.add('alert')
		save.classList.add('alert-danger')
		save.setAttribute('l', 'nopost')
		save.innerText = Language('nopost')
		container.appendChild(save)
	}

	save = document.createElement('div')
	save.classList.add('post-counter')
	save.innerText = post_cont
	container.appendChild(save)

	tab.Load(token, container, 'Page '+page, null, page, total_pages)
}

function Post(tabId, site, id) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading()
	tab.AddHistory(-5, [site, id])
	const container = document.createElement('div')
	container.classList.add('main-page')

	for (let i = 0, l = db.post.length; i < l; i++) if (db.post[i][1] == id && db.post[i][0] == site) {
		let save, title = ''
		if (db.post[i][0] == -1) {
			tab.save = [[], [], []]
			const data = {parody:[], character:[], artist:[], tag:[], meta:[]}
			for (let j = 0, n = db.post[i][10].length; j < n; j++) {
				const url = paths.dl+db.post[i][2][j]+'.'+db.post[i][3][j]
				tab.save[0].push(url)
				tab.save[1].push(paths.thumb+db.post[i][2][j]+'.jpg')
				if (existsSync(url)) {
					const sj = j
					if (IsFormatVideo(db.post[i][3][j])) {
						tab.save[2].push(1)
						save = document.createElement('video')
						save.classList.add('post-img')
						save.loop = true
						save.muted = false
						save.autoplay = false
						save.controls = true
						save.setAttribute('controlsList', 'nodownload')
						save.volume = 1 / 100 * setting.default_volume
						save.src = url
						save.onclick = () => {
							const load_save = browser.tabs[browser.GetTabIndex(tabId)].save
							OpenSlider(load_save[0], sj, true, load_save[1], load_save[2])
						}
						container.appendChild(save)
					} else {
						if (db.post[i][9][j] == '0') tab.save[2].push(0)
						else tab.save[2].push(-1)
						save = document.createElement('img')
						save.classList.add('post-img')
						save.loading = 'lazy'
						save.src = url
						save.onclick = () => {
							const load_save = browser.tabs[browser.GetTabIndex(tabId)].save
							OpenSlider(load_save[0], sj, true, load_save[1], load_save[2])
						}
						container.appendChild(save)
					}
				} else {
					tab.save[2].push(-1)
					save = document.createElement('img')
					save.classList.add('post-img')
					save.src = 'Image/no-img-225x225.webp'
					container.appendChild(save)
				}

				if (db.post[i][4][j].length != 0) data.parody = data.parody.concat(db.post[i][4][j])
				if (db.post[i][5][j].length != 0) data.character = data.character.concat(db.post[i][5][j])
				if (db.post[i][6][j].length != 0) data.artist = data.artist.concat(db.post[i][6][j])
				if (db.post[i][7][j].length != 0) data.tag = data.tag.concat(db.post[i][7][j])
				if (db.post[i][8][j].length != 0) data.meta = data.meta.concat(db.post[i][8][j])
			}
			data.parody = NoLoopArray(data.parody)
			data.character = NoLoopArray(data.character)
			data.artist = NoLoopArray(data.artist)
			data.tag = NoLoopArray(data.tag)
			data.meta = NoLoopArray(data.meta)

			// parody = 0
			if (data.parody.length > 0) {
				save = document.createElement('div')
				save.classList.add('post-tags')
				save.innerText = 'Parody:'
				for (let j = 0, n = data.parody.length; j < n; j++) {
					const index = data.parody[j]
					title += db.parody[index]+', '
					save.appendChild(NormalLinkElement('div', db.parody[index], tabId, tab.AddLink(-6, [1, 0, index])))
				}
				container.appendChild(save)
			}

			// character = 1
			if (data.character.length > 0) {
				save = document.createElement('div')
				save.classList.add('post-tags')
				save.innerText = 'Character:'
				for (let j = 0, n = data.character.length; j < n; j++) {
					const index = data.character[j]
					title += db.character[index]+', '
					save.appendChild(NormalLinkElement('div', db.character[index], tabId, tab.AddLink(-6, [1, 1, index])))
				}
				container.appendChild(save)
			}

			// artist = 2
			if (data.artist.length > 0) {
				save = document.createElement('div')
				save.classList.add('post-tags')
				save.innerText = 'Artists:'
				for (let j = 0, n = data.artist.length; j < n; j++) {
					const index = data.artist[j]
					title += db.artist[index]+', '
					save.appendChild(NormalLinkElement('div', db.artist[index], tabId, tab.AddLink(-6, [1, 2, index])))
				}
				container.appendChild(save)
			}

			// tag = 3
			if (data.tag.length > 0) {
				save = document.createElement('div')
				save.classList.add('post-tags')
				save.innerText = 'Tag:'
				for (let j = 0, n = data.tag.length; j < n; j++) {
					const index = data.tag[j]
					title += db.tag[index]+', '
					save.appendChild(NormalLinkElement('div', db.tag[index], tabId, tab.AddLink(-6, [1, 3, index])))
				}
				container.appendChild(save)
			}

			// meta = 4
			if (data.meta.length > 0) {
				save = document.createElement('div')
				save.classList.add('post-tags')
				save.innerText = 'Meta:'
				for (let j = 0, n = data.meta.length; j < n; j++) {
					const index = data.meta[j]
					title += db.meta[index]+', '
					save.appendChild(NormalLinkElement('div', db.meta[index], tabId, tab.AddLink(-6, [1, 4, index])))
				}
				container.appendChild(save)
			}
		} else {
			const url = paths.dl+db.post[i][2]+'.'+db.post[i][3]
			if (existsSync(url)) {
				if (IsFormatVideo(db.post[i][3])) {
					save = document.createElement('video')
					save.classList.add('post-img')
					save.loop = true
					save.muted = false
					save.autoplay = false
					save.controls = true
					save.setAttribute('controlsList', 'nodownload')
					save.volume = 1 / 100 * setting.default_volume
					save.src = url
					save.setAttribute('onmousedown', `OpenSlider([${i}], 0)`)
					container.appendChild(save)
				} else {
					save = document.createElement('img')
					save.classList.add('post-img')
					save.loading = 'lazy'
					save.src = url
					save.setAttribute('onclick', `OpenSlider([${i}], 0)`)
					container.appendChild(save)
				}
			} else {
				save = document.createElement('img')
				save.classList.add('post-img')
				save.src = 'Image/no-img-225x225.webp'
				container.appendChild(save)
			}

			// parody = 0
			if (db.post[i][4].length != 0) {
				save = document.createElement('div')
				save.classList.add('post-tags')
				save.innerText = 'Parody:'
				for (let j = 0, n = db.post[i][4].length; j < n; j++) {
					const index = db.post[i][4][j]
					title += db.parody[index]+', '
					save.appendChild(NormalLinkElement('div', db.parody[index], tabId, tab.AddLink(-6, [1, 0, index])))
				}
				container.appendChild(save)
			}

			// character = 1
			if (db.post[i][5].length != 0) {
				save = document.createElement('div')
				save.classList.add('post-tags')
				save.innerText = 'Character:'
				for (let j = 0, n = db.post[i][5].length; j < n; j++) {
					const index = db.post[i][5][j]
					title += db.character[index]+', '
					save.appendChild(NormalLinkElement('div', db.character[index], tabId, tab.AddLink(-6, [1, 1, index])))
				}
				container.appendChild(save)
			}

			// artist = 2
			if (db.post[i][6].length != 0) {
				save = document.createElement('div')
				save.classList.add('post-tags')
				save.innerText = 'Artists:'
				for (let j = 0, n = db.post[i][6].length; j < n; j++) {
					const index = db.post[i][6][j]
					title += db.artist[index]+', '
					save.appendChild(NormalLinkElement('div', db.artist[index], tabId, tab.AddLink(-6, [1, 2, index])))
				}
				container.appendChild(save)
			}

			// tag = 3
			if (db.post[i][7].length != 0) {
				save = document.createElement('div')
				save.classList.add('post-tags')
				save.innerText = 'Tag:'
				for (let j = 0, n = db.post[i][7].length; j < n; j++) {
					const index = db.post[i][7][j]
					title += db.tag[index]+', '
					save.appendChild(NormalLinkElement('div', db.tag[index], tabId, tab.AddLink(-6, [1, 3, index])))
				}
				container.appendChild(save)
			}

			// meta = 4
			if (db.post[i][8].length != 0) {
				save = document.createElement('div')
				save.classList.add('post-tags')
				save.innerText = 'Meta:'
				for (let j = 0, n = db.post[i][8].length; j < n; j++) {
					const index = db.post[i][8][j]
					title += db.meta[index]+', '
					save.appendChild(NormalLinkElement('div', db.meta[index], tabId, tab.AddLink(-6, [1, 4, index])))
				}
				container.appendChild(save)
			}
		}

		container.appendChild(document.createElement('br'))
		container.appendChild(document.createElement('br'))
		
		tab.Load(token, container, title)
		return
	}
	tab.Error(Language('pnf'))
}

function LoadSites(tabId) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading()
	tab.AddHistory(-2)
	const container = document.createElement('div')
	container.classList.add('main-page')
	container.appendChild(GetMainMenu(tab, -2))

	let save = document.createElement('div')
	save.classList.add('main-page-sites')
	for (let i = 0, l = sites.length; i < l; i++) {
		const save2 = NormalLinkElement('div', null, tabId, tab.AddLink(3, i), false, true)
		let save3 = document.createElement('div')
		let save4 = document.createElement('img')
		save4.src = 'Image/sites/'+sites[i].url+'-32x32.'+sites[i].icon
		save4.title = sites[i].url
		save3.appendChild(save4)
		save2.appendChild(save3)
		save4 = document.createElement('p')
		save4.innerText = sites[i].name
		save2.appendChild(save4)
		save3 = document.createElement('div')
		for (let j = 0, n = sites[i].tags.length; j < n; j++){
			save4 = document.createElement('div')
			save4.innerText = sites[i].tags[j]
			save3.appendChild(save4)
		}
		save2.appendChild(save3)
		save.appendChild(save2)
	}
	container.appendChild(save)
	tab.Load(token, container, 'Sites')
}

function LoadCollections(tabId) {}

function LoadHistory(tabId, page) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(-2, 0)
	tab.AddHistory(-4, page)
	const container = document.createElement('div')
	container.classList.add('main-page')
	container.appendChild(GetMainMenu(tab, -4))
	let save

	if (db.history.length == 0) {
		save = document.createElement('div')
		save.classList.add('alert')
		save.classList.add('alert-danger')
		save.setAttribute('l', 'nohistory')
		save.innerText = Language('nohistory')
		container.appendChild(save)
		tab.Load(token, container, 'History - Page 1', null, 1, 1)
	} else {
		const count = db.history.length
		const total_pages = Math.ceil(count / 20)

		save = document.createElement('div')
		save.classList.add('btn')
		save.classList.add('btn-danger')
		save.classList.add('ml-5')
		save.classList.add('mt-3')
		save.setAttribute('l', 'cl-history')
		save.innerText = Language('cl-history')
		save.onclick = AskForClearHistory
		container.appendChild(save)

		let min = 0, max
		if (count < 20) max = count
		else {
			const use_page = page - 1
			max = use_page * 20
			max = count - max
			min = max - 20
			if (min < 0) min = 0
		}
		save = document.createElement('div')
		save.classList.add('history')
		let save2, save3

		for (let i = max - 1; i >= min; i--) {
			save2 = document.createElement('div')
			save2.setAttribute('i', i)

			save3 = document.createElement('img')
			save3.setAttribute('lt', 'open-site')
			save3.title = Language('open-site')
			save3.src = 'Image/sites/'+sites[db.history[i][1]].url+'-32x32.'+sites[db.history[i][1]].icon
			save3.onclick = e => {
				const parent = e.target.parentElement
				if (parent.hasAttribute('i')) {
					const ii = Number(parent.getAttribute('i'))
					browser.OpenInNewTab(3, db.history[ii][1])
				}
			}
			save2.appendChild(save3)

			save3 = document.createElement('p')
			save3.innerText = db.history[i][0]
			save3.title = db.history[i][0]
			save3.onclick = e => {
				const parent = e.target.parentElement
				if (parent.hasAttribute('i')) {
					const ii = Number(parent.getAttribute('i'))
					browser.OpenInNewTab(db.history[ii][2], db.history[ii][3])
					db.history.splice(ii, 1)
					browser.SetNeedReload(-2)
					try { jsonfile.writeFileSync(dirDocument+'/history', { v:db.manager.history, a:db.history }) } catch(err) { console.log(err) }
				}
			}
			save2.appendChild(save3)

			save3 = document.createElement('div')
			save3.innerText = '...'
			save3.onclick = e => {
				e.preventDefault()
				e.stopImmediatePropagation()
				const parent = e.target.parentElement
				if (parent.hasAttribute('i')) {
					const ii = Number(parent.getAttribute('i'))
					ContextManager.ShowMenu('history', ii)
				}
			}
			save2.appendChild(save3)
			save.appendChild(save2)
		}
		container.appendChild(save)
		container.appendChild(GetPagination(tab, -4, total_pages, page))

		save = document.createElement('div')
		save.classList.add('post-counter')
		save.innerText = count
		container.appendChild(save)

		tab.Load(token, container, 'History - Page '+page, null, page, total_pages)
	}
}

function OpenLastHistory() {
	if (db.history.length == 0) return
	const i = db.history.length - 1
	browser.OpenInNewTab(db.history[i][2], db.history[i][3])
	db.history.splice(i, 1)
	browser.SetNeedReload(-2)
	try { jsonfile.writeFileSync(dirDocument+'/history', { v:db.manager.history, a: db.history }) } catch(err) { console.log(err) }
}

function LoadByInfo(tabId, page, type, index) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(-1, 1)
	tab.AddHistory(-6, [page, type, index])
	let loads = [], title
	switch(type) {
		case 0: // parody
			if (typeof db.parody[index] !== 'string') {
				tab.Error(Language('no-result'))
				return
			}
			for (let i = 0, l = db.post.length; i < l; i++) if (db.post[i][0] == -1) {
				for (let j = 0, n = db.post[i][4].length; j < n; j++) if (db.post[i][4][j].indexOf(index) != -1) {
					loads.push(i)
					break
				}
			} else if (db.post[i][4].indexOf(index) != -1) loads.push(i)
			title = 'Parody '+db.parody[index]
			break
		case 1: // character
			if (typeof db.character[index] !== 'string') {
				tab.Error(Language('no-result'))
				return
			}
			for (let i = 0, l = db.post.length; i < l; i++) if (db.post[i][0] == -1) {
				for (let j = 0, n = db.post[i][5].length; j < n; j++) if (db.post[i][5][j].indexOf(index) != -1) {
					loads.push(i)
					break
				}
			} else if (db.post[i][5].indexOf(index) != -1) loads.push(i)
			title = 'Character '+db.character[index]
			break
		case 2: // artist
			if (typeof db.artist[index] !== 'string') {
				tab.Error(Language('no-result'))
				return
			}
			for (let i = 0, l = db.post.length; i < l; i++) if (db.post[i][0] == -1) {
				for (let j = 0, n = db.post[i][6].length; j < n; j++) if (db.post[i][6][j].indexOf(index) != -1) {
					loads.push(i)
					break
				}
			} else if (db.post[i][6].indexOf(index) != -1) loads.push(i)
			title = 'Artist '+db.artist[index]
			break
		case 3: // tag
			if (typeof db.tag[index] !== 'string') {
				tab.Error(Language('no-result'))
				return
			}
			for (let i = 0, l = db.post.length; i < l; i++) if (db.post[i][0] == -1) {
				for (let j = 0, n = db.post[i][7].length; j < n; j++) if (db.post[i][7][j].indexOf(index) != -1) {
					loads.push(i)
					break
				}
			} else if (db.post[i][7].indexOf(index) != -1) loads.push(i)
			title = 'Tag '+db.tag[index]
			break
		case 4: // meta
			if (typeof db.meta[index] !== 'string') {
				tab.Error(Language('no-result'))
				return
			}
			for (let i = 0, l = db.post.length; i < l; i++) if (db.post[i][0] == -1) {
				for (let j = 0, n = db.post[i][8].length; j < n; j++) if (db.post[i][8][j].indexOf(index) != -1) {
					loads.push(i)
					break
				}
			} else if (db.post[i][8].indexOf(index) != -1) loads.push(i)
			title = 'Meta '+db.meta[index]
			break
	}

	const container = document.createElement('div')
	container.classList.add('main-page')
	container.appendChild(GetMainMenu(tab, -1))

	let save = document.createElement('div')
	save.classList.add('main-page-filter')
	let save2 = document.createElement('div')
	save2.innerHTML = Icon('new-to-old')
	if (browser.backward) save2.setAttribute('active','')
	else save2.onclick = () => ChangeFilter(true)
	save.appendChild(save2)
	save2 = document.createElement('div')
	save2.innerHTML = Icon('old-to-new')
	if (!browser.backward) save2.setAttribute('active','')
	else save2.onclick = () => ChangeFilter(false)
	save.appendChild(save2)
	container.appendChild(save)

	const post_cont = loads.length
	const date = new Date().getTime()
	const total_pages = Math.ceil(post_cont / setting.pic_per_page)
	if (page > total_pages) page = total_pages

	if (total_pages > 0) {
		save = document.createElement('div')
		save.classList.add('main-page-posts')

		let min = 0, max
		tab.save = []
		if (browser.backward) {
			if (post_cont < setting.pic_per_page) max = post_cont
			else {
				const use_page = page - 1
				max = use_page * setting.pic_per_page
				max = post_cont - max
				min = max - setting.pic_per_page
				if (min < 0) min = 0
			}
			for (let i = max - 1; i >= min; i--) save.appendChild(GetPostElement(tab, loads[i], date))
		} else {
			if (post_cont < setting.pic_per_page) max = post_cont
			else {
				min = (setting.pic_per_page * page) - setting.pic_per_page
				max = min + setting.pic_per_page
				if (max > post_cont) max = post_cont
			}
			for (let i = min; i < max; i++) save.appendChild(GetPostElement(tab, loads[i], date))
		}
		container.appendChild(save)
		container.appendChild(GetPaginationForInfo(tab, total_pages, page, type, index))
	} else {
		page = 1
		save = document.createElement('div')
		save.classList.add('alert')
		save.classList.add('alert-danger')
		save.setAttribute('l', 'nopost')
		save.innerText = Language('nopost')
		container.appendChild(save)
	}

	save = document.createElement('div')
	save.classList.add('post-counter')
	save.innerText = post_cont
	container.appendChild(save)

	tab.Load(token, container, title+' - '+page, null, page, total_pages)
}

function OpenBookmarks() {
	PopAlert(Language('coming-soon'), 'warning')
}