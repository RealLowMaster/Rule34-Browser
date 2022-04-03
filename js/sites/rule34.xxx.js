const r34xxx = new rule34xxx()

function Rule34XXXMenu(tab) {
	let save = document.createElement('div')
	save.classList.add('rule34-xxx-menu')
	save.appendChild(NormalLinkElement('div', 'Posts', tab.id, tab.AddLink(4, [1,null]), false))
	save.appendChild(NormalLinkElement('div', 'Artists', tab.id, tab.AddLink(5, [1, null]), false))
	save.appendChild(NormalLinkElement('div', 'Tags', tab.id, tab.AddLink(6, 1), false))
	save.appendChild(NormalLinkElement('div', 'Pools', tab.id, tab.AddLink(7, 1), false))
	save.appendChild(NormalLinkElement('div', 'Stats', tab.id, tab.AddLink(8), false))
	return save
}

function Rule34XXXGetTags(tab, arr) {
	const container = document.createElement('div')
	container.classList.add('rule34-xxx-tags')
	let save
	if (arr.parody != undefined) {
		save = document.createElement('p')
		save.innerText = 'Copyright'
		container.appendChild(save)
		for (let i = 0, l = arr.parody.length; i < l; i++) {
			const row = document.createElement('div')
			row.appendChild(NormalLinkElement('span', arr.parody[i][0], tab.id, tab.AddLink(4, [1, arr.parody[i][0].replace(/ /g, '_')])))
			save = document.createElement('span')
			save.innerText = arr.parody[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	if (arr.character != undefined) {
		save = document.createElement('p')
		save.innerText = 'Character'
		container.appendChild(save)
		for (let i = 0, l = arr.character.length; i < l; i++) {
			const row = document.createElement('div')
			row.appendChild(NormalLinkElement('span', arr.character[i][0], tab.id, tab.AddLink(4, [1, arr.character[i][0].replace(/ /g, '_')])))
			save = document.createElement('span')
			save.innerText = arr.character[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	if (arr.artist != undefined) {
		save = document.createElement('p')
		save.innerText = 'Artist'
		container.appendChild(save)
		for (let i = 0, l = arr.artist.length; i < l; i++) {
			const row = document.createElement('div')
			row.appendChild(NormalLinkElement('span', arr.artist[i][0], tab.id, tab.AddLink(4, [1, arr.artist[i][0].replace(/ /g, '_')])))
			save = document.createElement('span')
			save.innerText = arr.artist[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	if (arr.tag != undefined) {
		save = document.createElement('p')
		save.innerText = 'General'
		container.appendChild(save)
		for (let i = 0, l = arr.tag.length; i < l; i++) {
			const row = document.createElement('div')
			row.appendChild(NormalLinkElement('span', arr.tag[i][0], tab.id, tab.AddLink(4, [1, arr.tag[i][0].replace(/ /g, '_')])))
			save = document.createElement('span')
			save.innerText = arr.tag[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	if (arr.meta != undefined) {
		save = document.createElement('p')
		save.innerText = 'Meta'
		container.appendChild(save)
		for (let i = 0, l = arr.meta.length; i < l; i++) {
			const row = document.createElement('div')
			row.appendChild(NormalLinkElement('span', arr.meta[i][0], tab.id, tab.AddLink(4, [1, arr.meta[i][0].replace(/ /g, '_')])))
			save = document.createElement('span')
			save.innerText = arr.meta[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	return container
}

function Rule34XXXGetPosts(tab, arr) {
	const container = document.createElement('div')
	container.classList.add('rule34-xxx-posts')
	arr = arr.posts
	for (let i = 0, l = arr.length; i < l; i++) {
		const post = BRPostLinkElement(tab.id, tab.AddLink(9, arr[i].id), 0, arr[i].id)
		if (arr[i].video) post.setAttribute('v', '')
		post.appendChild(BRPostDL(0, arr[i].id))
		const img = document.createElement('img')
		img.src = arr[i].thumb
		img.loading = 'lazy'
		post.appendChild(img)
		container.appendChild(post)
	}
	return container
}

function Rule34XXXGetPagination(tab, arr, linkId) {
	const container = document.createElement('div')
	container.classList.add('rule34-xxx-pagination')
	arr = arr.pagination
	for (let i = 0, l = arr.length; i < l; i++) {
		if (arr[i][0][0] != null) container.appendChild(NormalLinkElement('div', arr[i][1], tab.id, tab.AddLink(linkId, arr[i][0]), false))
		else {
			const save = document.createElement('span')
			save.innerText = arr[i][1]
			container.appendChild(save)
		}
	}
	return container
}

function Rule34XXXHome(tabId, page = 1, search = null) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(0, 0)
	tab.AddHistory(4, [page, search])
	tab.search = search
	if (browser.selectedTab == tab.id) mbs.value = search
	tab.submit_search = search
	

	r34xxx.Page(page, search, (err, arr) => {
		if (err) {
			tab.Error(err)
			return
		}
		const container = document.createElement('div')
		container.classList.add('rule34-xxx-page')
		container.appendChild(Rule34XXXMenu(tab))

		let save = document.createElement('p')
		save.classList.add('rule34-xxx-title')
		save.innerText = (search != null ? search : '')+' Page '+page
		container.appendChild(save)

		const sides = document.createElement('div')
		sides.classList.add('rule34-xxx-sides')

		let side = document.createElement('div')
		side.appendChild(Rule34XXXGetTags(tab, arr))
		sides.appendChild(side)

		side = document.createElement('div')
		side.appendChild(Rule34XXXGetPosts(tab, arr))
		for (let i = 0, l = arr.pagination.length; i < l; i++) arr.pagination[i][0] = [arr.pagination[i][0], search]
		side.appendChild(Rule34XXXGetPagination(tab, arr, 4))
		sides.appendChild(side)

		container.appendChild(sides)
		tab.Load(token, container, (search != null ? search : '')+' Page '+page, 'var(--r34x-primary-bg)', page, arr.maxPages)
	})
}

function Rule34XXXPost(tabId, id) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(0)
	tab.AddHistory(9, id)

	r34xxx.Post(id, (err, arr) => {
		if (err) {
			tab.Error(err)
			return
		}
		const container = document.createElement('div')
		container.classList.add('rule34-xxx-page')
		container.appendChild(Rule34XXXMenu(tab))

		const sides = document.createElement('div')
		sides.classList.add('rule34-xxx-sides')
		let side = document.createElement('div')
		side.appendChild(Rule34XXXGetTags(tab, arr))
		sides.appendChild(side)
		side = document.createElement('div')
		if (arr.video) {
			const vid = document.createElement('video')
			vid.loop = true
			vid.muted = false
			vid.autoplay = false
			vid.controls = true
			vid.setAttribute('controlsList', 'nodownload')
			vid.classList.add('rule34-xxx-image')
			vid.src = arr.src
			side.appendChild(vid)
		} else {
			const img = document.createElement('img')
			img.classList.add('rule34-xxx-image')
			img.loading = 'lazy'
			if (setting.r34_xxx_original_size) img.src = arr.src
			else img.src = arr.srcresize
			side.appendChild(img)
		}
		side.appendChild(BRDownloadElement(0, id))
		sides.appendChild(side)
		container.appendChild(sides)
		tab.Load(token, container, arr.title, 'var(--r34x-primary-bg)')
	})
}

function Rule34XXXArtists(tabId, page = 1, search = null) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(0, 1)
	tab.submit_search = search
	tab.AddHistory(5, [page, search])

	r34xxx.Artists(page, search, (err, arr) => {
		if (err) {
			tab.Error(err)
			return
		}
		const container = document.createElement('div')
		container.classList.add('rule34-xxx-page')
		container.appendChild(Rule34XXXMenu(tab))

		let save = document.createElement('p'), save2, save3, save4
		save.classList.add('rule34-xxx-title')
		save.innerText = arr.title
		container.appendChild(save)

		save = document.createElement('form')
		save.classList.add('rule34-xxx-search')
		const form_id = 'ras-'+token
		save.onsubmit = e => {
			e.preventDefault()
			Rule34XXXArtists(tabId, 1, document.getElementById(form_id).value || null)
		}
		save2 = document.createElement('input')
		save2.type = 'text'
		save2.id = form_id
		save2.setAttribute('lp', 'search')
		save2.placeholder = Language('search')
		if (search != null) save2.value = search
		save.appendChild(save2)
		container.appendChild(save)

		save = document.createElement('div')
		save.classList.add('rule34-xxx-table')
		save2 = document.createElement('div')
		save2.innerHTML = '<div></div><div>Name</div><div>Updated By</div>'
		save.appendChild(save2)
		for (let i = 0, l = arr.list.length; i < l; i++) {
			save2 = document.createElement('div')
			save3 = document.createElement('div')
			save2.appendChild(save3)
			save3 = document.createElement('div')
			if (arr.list[i][2]) save3.appendChild(NormalLinkElement('p', arr.list[i][0], tabId, tab.AddLink(4, [1, arr.list[i][0]])))
			else save3.innerText = arr.list[i][0]
			save2.appendChild(save3)
			save3 = document.createElement('div')
			save3.innerText = arr.list[i][1]
			save2.appendChild(save3)
			save.appendChild(save2)
		}
		container.appendChild(save)
		for (let i = 0, l = arr.pagination.length; i < l; i++) arr.pagination[i][0] = [arr.pagination[i][0], search]
		container.appendChild(Rule34XXXGetPagination(tab, arr, 5))

		tab.Load(token, container, arr.title, 'var(--r34x-primary-bg)', page, arr.maxPages)
	})
}

function Rule34XXXTags(tabId, page) {}
function Rule34XXXPools(tabId, page) {}
function Rule34XXXStats(tabId) {}