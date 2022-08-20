const gelbooru = new GelBooru()

function GelBooruMenu(tab, i) {
	const container = document.createElement('div')
	container.classList.add('gelbooru-menu')
	let save = document.createElement('img')
	save.src = 'Image/gelbooru-logo.svg'
	container.appendChild(save)
	container.appendChild(NormalLinkElement('div', 'Posts', tab.id, tab.AddLink(12, [1,null]), false))
	save = document.createElement('div')
	save.innerText = 'Tags'
	save.onmousedown = () => PopAlert(Language('coming-soon'))
	container.appendChild(save)
	save = document.createElement('div')
	save.innerText = 'Pools'
	save.onmousedown = () => PopAlert(Language('coming-soon'))
	container.appendChild(save)
	// container.appendChild(NormalLinkElement('div', 'Tags', tab.id, tab.AddLink(6, 1), false))
	// container.appendChild(NormalLinkElement('div', 'Pools', tab.id, tab.AddLink(7, 1), false))
	container.children[i+1].setAttribute('active', '')
	return container
}

function GelBooruGetTags(tab, arr) {
	const container = document.createElement('div')
	container.classList.add('gelbooru-tags')
	let save, save2
	if (arr.artist != undefined) {
		save = document.createElement('p')
		save.innerText = 'Artist'
		container.appendChild(save)
		for (let i = 0, l = arr.artist.length; i < l; i++) {
			const row = document.createElement('div')
			save2 = NormalLinkElement('span', arr.artist[i][0], tab.id, tab.AddLink(12, [1, arr.artist[i][0].replace(/ /g, '_')]))
			save2.setAttribute('t', 0)
			row.appendChild(save2)
			save = document.createElement('span')
			save.innerText = arr.artist[i][1]
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
			save2 = NormalLinkElement('span', arr.character[i][0], tab.id, tab.AddLink(12, [1, arr.character[i][0].replace(/ /g, '_')]))
			save2.setAttribute('t', 1)
			row.appendChild(save2)
			save = document.createElement('span')
			save.innerText = arr.character[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	if (arr.parody != undefined) {
		save = document.createElement('p')
		save.innerText = 'Copyright'
		container.appendChild(save)
		for (let i = 0, l = arr.parody.length; i < l; i++) {
			const row = document.createElement('div')
			save2 = NormalLinkElement('span', arr.parody[i][0], tab.id, tab.AddLink(12, [1, arr.parody[i][0].replace(/ /g, '_')]))
			save2.setAttribute('t', 2)
			row.appendChild(save2)
			save = document.createElement('span')
			save.innerText = arr.parody[i][1]
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
			save2 = NormalLinkElement('span', arr.meta[i][0], tab.id, tab.AddLink(12, [1, arr.meta[i][0].replace(/ /g, '_')]))
			save2.setAttribute('t', 3)
			row.appendChild(save2)
			save = document.createElement('span')
			save.innerText = arr.meta[i][1]
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
			save2 = NormalLinkElement('span', arr.tag[i][0], tab.id, tab.AddLink(12, [1, arr.tag[i][0].replace(/ /g, '_')]))
			save2.setAttribute('t', 4)
			row.appendChild(save2)
			save = document.createElement('span')
			save.innerText = arr.tag[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	return container
}

function GelBooruGetPosts(tab, arr) {
	const container = document.createElement('div')
	container.classList.add('gelbooru-posts')
	arr = arr.posts
	for (let i = 0, l = arr.length; i < l; i++) {
		const post = BRPostLinkElement(tab.id, tab.AddLink(13, arr[i].id), 2, arr[i].id)
		if (arr[i].video) post.setAttribute('v', '')
		post.appendChild(BRPostDL(2, arr[i].id))
		const img = document.createElement('img')
		img.src = arr[i].thumb
		img.loading = 'lazy'
		post.appendChild(img)
		container.appendChild(post)
	}
	return container
}

function GelBooruGetPagination(tab, arr, linkId) {
	const container = document.createElement('div')
	container.classList.add('gelbooru-pagination')
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

function GelBooruHome(tabId, page = 1, search = null) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(2, 0)
	tab.AddHistory(12, [page, search])
	tab.search = search
	if (browser.selectedTab == tab.id) mbs.value = search
	tab.submit_search = search

	gelbooru.Page(page, search, (err, arr) => {
		if (err) {
			tab.Error(token, err)
			return
		}
		const container = document.createElement('div')
		container.classList.add('gelbooru-page')
		container.appendChild(GelBooruMenu(tab, 0))

		let save = document.createElement('p')
		save.classList.add('gelbooru-title')
		save.innerText = (search != null ? search : '')+' Page '+page
		container.appendChild(save)

		const sides = document.createElement('div')
		sides.classList.add('gelbooru-sides')

		let side = document.createElement('div')
		side.appendChild(GelBooruGetTags(tab, arr))
		sides.appendChild(side)

		side = document.createElement('div')
		side.appendChild(GelBooruGetPosts(tab, arr))
		for (let i = 0, l = arr.pagination.length; i < l; i++) arr.pagination[i][1] = [arr.pagination[i][1], search]
		side.appendChild(GelBooruGetPagination(tab, arr, 12))
		sides.appendChild(side)

		container.appendChild(sides)
		tab.Load(token, container, (search != null ? search : '')+' Page '+page, 'var(--gelb-primary-bg)', page, arr.maxPages)
	})
}

function GelBooruPost(tabId, id) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(2)
	tab.AddHistory(13, id)

	gelbooru.Post(id, (err, arr) => {
		if (err) {
			tab.Error(token, err)
			return
		}
		const container = document.createElement('div')
		container.classList.add('gelbooru-page')
		container.appendChild(GelBooruMenu(tab, 0))

		const sides = document.createElement('div')
		sides.classList.add('gelbooru-sides')
		let side = document.createElement('div')
		side.appendChild(GelBooruGetTags(tab, arr))
		let save = document.createElement('div')
		save.classList.add('gelbooru-tags')
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
			vid.classList.add('gelbooru-image')
			vid.volume = 1 / 100 * setting.default_volume
			vid.onclick = () => OpenSlider([src], 0, true)
			vid.src = src
			side.appendChild(vid)
		} else {
			const img = document.createElement('img')
			img.classList.add('gelbooru-image')
			img.loading = 'lazy'
			if (setting.gelbooru_com_orginal_size) img.src = src
			else img.src = arr.srcresize
			img.onclick = () => OpenSlider([src], 0, true)
			side.appendChild(img)
		}
		side.appendChild(BRDownloadElement(2, id))
		sides.appendChild(side)
		container.appendChild(sides)
		tab.Load(token, container, arr.title, 'var(--gelb-primary-bg)')
	})
}