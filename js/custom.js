const sharp = require('sharp')
// sharp('Image/sites/rule34.xyz-72x72.png').resize(24, 24).png({ quality: 100 }).toFile('Image/sites/img.png')

const loading_img = new Image()
loading_img.src = 'Image/loading.gif'

const mb_pages = document.getElementById('mb-pages')
const mb_search = document.getElementById('mb-search')
const mb_jump_page = document.getElementById('mb-jump-page')

const status = [403, 404, 500, 503]
const statusMsg = [
	"You don't have the permission to View this Page.",
	"Page Not Found.",
	"Internal Server Error.",
	"Server is unavailable at this Time."
]

const sites = [
	{
		name: 'Rule34.xxx',
		url: 'rule34.xxx',
		icon: 'png',
		tags: ['All'],
		home: Rule34XXXHome
	},
	{
		name: 'Rule34.xyz',
		url: 'rule34.xyz',
		icon: 'png',
		tags: ['All'],
		home: Rule34XYZHome
	}
]

const db = {
	post: [],
	have_ids: [],
	have_site: [],
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
		this.id = index
		this.history = []
		this.historyValue = []
		this.selectedHistory = -1
		this.customizing = false
		this.scroll = 0
		this.search = ''
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
		mb_pages.appendChild(this.page)
	}

	Loading(site = -1, jumpPage = -1) {
		this.loading = true
		this.needReload = false
		this.scroll = 0
		this.site = site
		this.jumpPage = jumpPage
		this.links = []
		this.linksValue = []
		if (browser.selectedTab == this.id) {
			mb_pages.scrollTop = 0
			if (this.site == -1) mb_search.style.display = 'none'
			else mb_search.style.display = 'block'
			mb_jump_page.style.display = 'none'
		}
		this.Change(loading_img.src, 'Loading...')
		this.page.style.backgroundColor = 'var(--primary-bg)'
		this.page.innerHTML = '<div class="br-loading"><p>Loading...</p><img src="'+loading_img.src+'"></div>'
		this.token = new Date().getTime()
		return this.token
	}

	Load(token, html, txt, bg = null) {
		if (token != this.token) return
		this.needReload = false
		this.page.innerHTML = null
		this.page.appendChild(html)
		this.loading = false
		this.reloading = false
		let icon
		if (this.site == -1) icon = 'Image/favicon-32x32.png'
		else icon = 'Image/sites/'+sites[this.site].url+'-32x32.'+sites[this.site].icon
		this.Change(icon, txt)
		if (bg == null) this.page.style.backgroundColor = 'var(--primary-bg)'
		else this.page.style.backgroundColor = bg

		if (browser.selectedTab == this.id) {
			mb_pages.scrollTop = 0
			if (this.jumpPage != -1) {
				mbjp.value = this.tabs[i].pageNumber
				mb_jump_page.children[1].innerText = '/ '+this.tabs[i].maxPages
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
		this.selectedHistory--
		browser.Link(this.id, this.history[this.selectedHistory], this.historyValue[this.selectedHistory])
		this.customizing = false
	}
	
	Next() {
		if (this.selectedHistory >= this.history.length - 1) return
		this.loading = true
		this.reloading = false
		this.needReload = false
		this.customizing = true
		this.selectedHistory++
		browser.Link(this.id, this.history[this.selectedHistory], this.historyValue[this.selectedHistory])
		this.customizing = false
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
		this.Change('Image/alert-24x24.png', 'Error')
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

class BrowserManager {
	constructor() {
		this.tabs = []
		this.selectedTab = null
		this.selectedTabIndex = null
		this.copied = null;
		this.backward = false
		this.timeout = null
		window.addEventListener('resize', () => this.ResizeTabs())
		mb_pages.onscroll = () => this.SetTabScroll()
	}

	SetTabScroll() {
		if (this.selectedTabIndex == null) return
		this.tabs[this.selectedTabIndex].scroll = mb_pages.scrollTop
	}

	AddTab() {
		const i = this.tabs.length
		const save = new Date().getTime().toString()
		const id = Number(save.substring(save.length - 8))
		this.tabs[i] = new Tab(id)
		this.ResizeTabs()
		return id
	}

	CloseTab(index) {
		clearTimeout(this.timeout)
		try { event.stopPropagation() } catch(err) {}
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == index) {
			this.tabs[i].Close()
			this.tabs.splice(i, 1)

			if (index == this.selectedTab) {
				if (this.tabs.length > 0) {
					if (i == 0) this.ActivateTab(this.tabs[0].id)
					else if (i == this.tabs.length) this.ActivateTab(this.tabs[i-1].id)
					else this.ActivateTab(this.tabs[i].id)
				} else this.selectedTab = null
			}

			this.timeout = setTimeout(() => this.ResizeTabs(), 1000)
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

			if (this.tabs[i].site == -1) mb_search.style.display = 'none'
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
			this.tabs.splice(i, 1)
		} else this.ActivateTab(this.tabs[i].id)
		this.ResizeTabs()
	}

	CloseAllTabs() {
		for (let i = this.tabs.length - 1; i >= 0; i--) this.tabs[i].Close()
		this.tabs = []
	}

	GetTab(index) {
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == index) return this.tabs[i]
		return null
	}

	OpenLinkInNewTab(tabId, link) {
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == tabId) {
			this.Link(this.AddTab(), this.tabs[i].links[link], this.tabs[i].linksValue[link])
			return
		}
	}

	LinkClick(tabId, link) {
		for (let i = 0, l = this.tabs.length; i < l; i++) if (this.tabs[i].id == tabId) {
			this.Link(tabId, this.tabs[i].links[link], this.tabs[i].linksValue[link])
			return
		}
	}

	Link(tabId, index, value) {
		switch(index) {
			case 0:
				LoadPage(tabId, value)
				return
			case 1:
				LoadSites(tabId)
				return
			case 2:
				LoadCollections(tabId)
				return
			case 3:
				sites[value].home(tabId, 1)
				return
			case 4:
				Rule34XXXHome(tabId, value[0], value[1])
				return
			case 5:
				Rule34XXXArtists(tabId, value)
				return
			case 6:
				Rule34XXXTags(tabId, value)
				return
			case 7:
				Rule34XXXPools(tabId, value)
				return
			case 8:
				Rule34XXXStats(tabId)
				return
			case 9:
				Rule34XXXPost(tabId, value)
				return
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
		const mb_tabs = document.getElementById('mb-tabs')

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

	AddLinkToBookmarks() {}
}

const browser = new BrowserManager()

mb_search.onsubmit = e => {
	e.preventDefault()
}

mb_jump_page.onsubmit = e => {
	e.preventDefault()
}

mbs.onfocus = () => KeyManager.stop = true
mbs.addEventListener('focusout', () => {
	KeyManager.stop = false
})

mbjp.onfocus = () => KeyManager.stop = true
mbjp.addEventListener('focusout', () => {
	KeyManager.stop = false
})

function NewTab() {
	const id = browser.AddTab()
	browser.ActivateTab(id)
	LoadPage(id, 1)
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

	// have
	if (!existsSync(paths.db+'have')) try { jsonfile.writeFileSync(paths.db+'have', {i:[],s:[]}) } catch(err) {
		console.error(err)
		error('CreatingHaveDB->'+err)
	} else try {
		const save = jsonfile.readFileSync(paths.db+'have')
		db.have_ids = save.i
		db.have_site = save.s
	} catch(err) {
		db.have_ids = []
		db.have_site = []
		console.error(err)
		error('LoadingHaveDB->'+err)
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
	NewTab()
}

function BRLink(tabId, link, site, id) {
	const e = window.event, key = e.which
	e.preventDefault()
	if (key == 1) browser.LinkClick(tabId, link)
	else if (key == 2) browser.OpenLinkInNewTab(tabId, link)
	else {
		ContextManager.save = [tabId, link, site, id]
		ContextManager.ShowMenu('br-posts')
	}
}

function BRPostLinkElement(tabId, link, site, id) {
	const element = document.createElement('div')
	element.onmousedown = () => BRLink(tabId, link, site, id)
	return element
}

function AddToDownloads(site, id) {}
function RemoveFromDownloads(site, id) {}
function DownloadClick(site, id) {}

function NormalLink(tabId, link, notNormal) {
	const e = window.event, key = e.which
	e.preventDefault()
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

function GetPagination(total_pages, page) {
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

function LoadPage(tabId, page = 1) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading()
	tab.AddHistory(0, page)
	const container = document.createElement('div')
	container.classList.add('main-page')
	let save = document.createElement('div')
	save.classList.add('main-page-menu')
	save.appendChild(NormalLinkElement('div', 'sites', tabId, tab.AddLink(1), false, true))
	save.appendChild(NormalLinkElement('div', 'collections', tabId, tab.AddLink(2), false, true))
	container.appendChild(save)

	save = document.createElement('div')
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

	const total_pages = Math.ceil(db.post.length / setting.pic_per_page)
	if (page > total_pages) page = total_pages

	if (total_pages > 0) {

	} else {
		page = 1
		save = document.createElement('div')
		save.classList.add('alert')
		save.classList.add('alert-danger')
		save.setAttribute('l', 'nopost')
		save.innerText = Language('nopost')
		container.appendChild(save)
	}

	tab.Load(token, container, 'Page '+page)
}

function LoadSites(tabId) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading()
	tab.AddHistory(1)
	const container = document.createElement('div')
	container.classList.add('main-page')
	let save = document.createElement('div')
	save.classList.add('main-page-menu')
	save.appendChild(NormalLinkElement('div', 'home', tabId, tab.AddLink(0), false, true))
	save.appendChild(NormalLinkElement('div', 'collections', tabId, tab.AddLink(2), false, true))
	container.appendChild(save)

	save = document.createElement('div')
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

function OpenHistory() {}

function OpenDownloads() {}

function OpenBookmarks() {}

function test() {
	const rule = new rule34xxx()

	rule.Page(1, (err, result) => { console.log(err, result) })

	// 5859610 => pic | 5859608 => vid
	// rule.Post(5859610, (err, result) => { console.log(err, result) })
}