const e621 = new e621net()

function E621XXXGetTags(tab, arr) {
	const container = document.createElement('div')
	container.classList.add('e621-xxx-tags')
	let save
	if (arr.parody != undefined) {
		save = document.createElement('p')
		save.innerText = 'Copyright'
		container.appendChild(save)
		for (let i = 0, l = arr.parody.length; i < l; i++) {
			const row = document.createElement('div')
			row.appendChild(NormalLinkElement('span', arr.parody[i][0], tab.id, tab.AddLink(10, [1, arr.parody[i][0].replace(/ /g, '_')])))
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
			row.appendChild(NormalLinkElement('span', arr.character[i][0], tab.id, tab.AddLink(10, [1, arr.character[i][0].replace(/ /g, '_')])))
			save = document.createElement('span')
			save.innerText = arr.character[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	if (arr.specie != undefined) {
		save = document.createElement('p')
		save.innerText = 'Species'
		container.appendChild(save)
		for (let i = 0, l = arr.specie.length; i < l; i++) {
			const row = document.createElement('div')
			row.appendChild(NormalLinkElement('span', arr.specie[i][0], tab.id, tab.AddLink(10, [1, arr.specie[i][0].replace(/ /g, '_')])))
			save = document.createElement('span')
			save.innerText = arr.specie[i][1]
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
			row.appendChild(NormalLinkElement('span', arr.artist[i][0], tab.id, tab.AddLink(10, [1, arr.artist[i][0].replace(/ /g, '_')])))
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
			row.appendChild(NormalLinkElement('span', arr.tag[i][0], tab.id, tab.AddLink(10, [1, arr.tag[i][0].replace(/ /g, '_')])))
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
			row.appendChild(NormalLinkElement('span', arr.meta[i][0], tab.id, tab.AddLink(10, [1, arr.meta[i][0].replace(/ /g, '_')])))
			save = document.createElement('span')
			save.innerText = arr.meta[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	return container
}

function E621XXXGetPosts(tab, arr) {
	const container = document.createElement('div')
	container.classList.add('e621-xxx-posts')
	arr = arr.posts
	for (let i = 0, l = arr.length; i < l; i++) {
		const post = BRPostLinkElement(tab.id, tab.AddLink(11, arr[i].id), 1, arr[i].id)
		if (arr[i].video) post.setAttribute('v', '')
		post.appendChild(BRPostDL(1, arr[i].id))
		const img = document.createElement('img')
		img.src = arr[i].thumb
		img.loading = 'lazy'
		post.appendChild(img)
		container.appendChild(post)
	}
	return container
}

function E621XXXGetPagination(tab, arr, linkId) {
	const container = document.createElement('div')
	container.classList.add('e621-xxx-pagination')
	arr = arr.pagination
	for (let i = 0, l = arr.length; i < l; i++) {
		if (arr[i][1] == null) {
			const save = document.createElement('span')
			save.innerText = arr[i][0]
			container.appendChild(save)
		} else if (typeof arr[i][1] === 'object') {
			if (arr[i][1][0] != null) container.appendChild(NormalLinkElement('div', arr[i][0], tab.id, tab.AddLink(linkId, arr[i][1]), false))
			else {
				const save = document.createElement('span')
				save.innerText = arr[i][0]
				container.appendChild(save)
			}
		} else container.appendChild(NormalLinkElement('div', arr[i][0], tab.id, tab.AddLink(linkId, arr[i][1]), false))
	}
	return container
}

function E621Home(tabId, page = 1, search = null) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(1, 0)
	tab.AddHistory(10, [page, search])
	tab.search = search
	if (browser.selectedTab == tab.id) mbs.value = search
	tab.submit_search = search
	
	e621.Page(page, search, (err, arr) => {
		if (err) {
			tab.Error(token, err)
			return
		}
		const container = document.createElement('div')
		container.classList.add('e621-xxx-page')
		// container.appendChild(Rule34XXXMenu(tab))

		let save = document.createElement('p')
		save.classList.add('e621-xxx-title')
		save.innerText = (search != null ? search : '')+' Page '+page
		container.appendChild(save)

		const sides = document.createElement('div')
		sides.classList.add('e621-xxx-sides')

		let side = document.createElement('div')
		side.appendChild(E621XXXGetTags(tab, arr))
		sides.appendChild(side)

		side = document.createElement('div')
		side.appendChild(E621XXXGetPosts(tab, arr))
		for (let i = 0, l = arr.pagination.length; i < l; i++) arr.pagination[i][1] = [arr.pagination[i][1], search]
		side.appendChild(E621XXXGetPagination(tab, arr, 10))
		sides.appendChild(side)

		container.appendChild(sides)
		tab.Load(token, container, (search != null ? search : '')+' Page '+page, 'var(--e621-secondary-bg)', page, arr.maxPages)
	})
}

function E621XXXPost(tabId, id) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(1)
	tab.AddHistory(11, id)
	
	e621.Post(id, (err, arr) => {
		if (err) {
			tab.Error(token, err)
			return
		}
		const container = document.createElement('div')
		container.classList.add('e621-xxx-page')
		// container.appendChild(Rule34XXXMenu(tab))

		const sides = document.createElement('div')
		sides.classList.add('e621-xxx-sides')

		let side = document.createElement('div')
		side.appendChild(E621XXXGetTags(tab, arr))
		let save = document.createElement('div')
		save.classList.add('e621-xxx-tags')
		save.classList.add('pt-1')
		let save2 = document.createElement('p')
		save2.innerText = 'States'
		save.appendChild(save2)
		save2 = document.createElement('div')
		save2.innerText = 'Id: '+arr.id
		save.appendChild(save2)
		save2 = document.createElement('div')
		save2.innerText = 'Size: '+arr.size
		save.appendChild(save2)
		save2 = document.createElement('div')
		save2.innerText = 'Format: '+arr.format
		save.appendChild(save2)
		side.appendChild(save)
		sides.appendChild(side)

		side = document.createElement('div')
		const src = arr.src
		if (arr.video) {
			const vid = document.createElement('video')
			vid.loop = true
			vid.muted = false
			vid.autoplay = false
			vid.controls = true
			vid.setAttribute('controlsList', 'nodownload')
			vid.classList.add('rule34-xxx-image')
			vid.volume = 1 / 100 * setting.default_volume
			vid.onclick = () => OpenSlider([LastChar('?', src, true)], 0, true)
			vid.src = src
			side.appendChild(vid)
		} else {
			const img = document.createElement('img')
			img.classList.add('rule34-xxx-image')
			img.loading = 'lazy'
			if (setting.e621_net_orginal_size) img.src = src
			else img.src = arr.srcresize
			img.onclick = () => OpenSlider([LastChar('?', src, true)], 0, true)
			side.appendChild(img)
		}
		side.appendChild(BRDownloadElement(1, id))
		sides.appendChild(side)
		container.appendChild(sides)
		tab.Load(token, container, arr.title, 'var(--e621-secondary-bg)')
	})
}