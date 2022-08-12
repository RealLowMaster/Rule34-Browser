const derpibooru = new DerpiBooruorg()

function DerpiBooruMenu(tab) {
	let save = document.createElement('div')
	save.classList.add('derpb-menu')
    const img = document.createElement('img')
    img.src = 'Image/sites/derpibooru.org-32x32.webp'
    save.appendChild(img)
	save.appendChild(NormalLinkElement('div', 'Random', tab.id, tab.AddLink(17), false))
	save.appendChild(NormalLinkElement('div', 'Tags', tab.id, tab.AddLink(16, [1, null]), false))
	return save
}

function DerpiBooruGetPosts(tab, arr) {
	const container = document.createElement('div')
	container.classList.add('derpb-posts')
	arr = arr.posts
	for (let i = 0, l = arr.length; i < l; i++) {
		const post = BRPostLinkElement(tab.id, tab.AddLink(15, arr[i].id), 3, arr[i].id)
		if (arr[i].video) post.setAttribute('v', '')
		post.appendChild(BRPostDL(3, arr[i].id))
		const img = document.createElement('img')
		img.src = arr[i].thumb
		img.loading = 'lazy'
		post.appendChild(img)
		container.appendChild(post)
	}
	return container
}

function DerpiBooruGetPagination(tab, arr, linkId) {
	const container = document.createElement('div')
	container.classList.add('derpb-pagination')
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

function DerpiBooruHome(tabId, page = 1, search = null) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(3, 0)
	tab.AddHistory(14, [page, search])
	tab.search = search
	if (browser.selectedTab == tab.id) mbs.value = search
	tab.submit_search = search
	

	derpibooru.Page(page, search, (err, arr) => {
		if (err) {
			tab.Error(token, err)
			return
		}
		const container = document.createElement('div')
		container.classList.add('derpb-page')
		container.appendChild(DerpiBooruMenu(tab))

		let save = document.createElement('p')
		save.classList.add('derpb-title')
		save.innerText = (search != null ? search : '')+' Page '+page
		container.appendChild(save)

		const sides = document.createElement('div')
		sides.classList.add('derpb-sides')

		let side = document.createElement('div')
		sides.appendChild(side)

		side = document.createElement('div')
		side.appendChild(DerpiBooruGetPosts(tab, arr))
		for (let i = 0, l = arr.pagination.length; i < l; i++) arr.pagination[i][1] = [arr.pagination[i][1], search]
		side.appendChild(DerpiBooruGetPagination(tab, arr, 14))
		sides.appendChild(side)

		container.appendChild(sides)
		tab.Load(token, container, (search != null ? search : '')+' Page '+page, 'var(--derpb-primary-bg)', page, arr.maxPages)
	})
}

function DerpiBooruPost(tabId, id) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(3)
	tab.AddHistory(15, id)

	derpibooru.Post(id, (err, arr) => {
		if (err) {
			tab.Error(token, err)
			return
		}
		const container = document.createElement('div')
		container.classList.add('derpb-page')
		container.appendChild(DerpiBooruMenu(tab))

		const sides = document.createElement('div')
		sides.classList.add('derpb-sides')
		let side = document.createElement('div')
		side.appendChild(DerpiBooruGetTags(tab, arr))
		let save = document.createElement('div')
		save.classList.add('derpb-tags')
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
			vid.classList.add('derpb-image')
			vid.volume = 1 / 100 * setting.default_volume
			vid.onclick = () => OpenSlider([LastChar('?', src, true)], 0, true)
			vid.src = src
			side.appendChild(vid)
		} else {
			const img = document.createElement('img')
			img.classList.add('derpb-image')
			img.loading = 'lazy'
			if (setting.r34_xxx_original_size) img.src = src
			else img.src = arr.srcresize
			img.onclick = () => OpenSlider([LastChar('?', src, true)], 0, true)
			side.appendChild(img)
		}
		side.appendChild(BRDownloadElement(3, id))
		sides.appendChild(side)
		container.appendChild(sides)
		tab.Load(token, container, arr.title, 'var(--derpb-primary-bg)')
	})
}

function DerpiBooruTags(tabId, page = 1, search = null) {}

function DerpiBooruRandom(tabId) {}