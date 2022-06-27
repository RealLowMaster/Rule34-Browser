class e621net {
	constructor() {
		this.baseURL = 'https://e621.net/'
		this.maxPage = 750
	}

	#GetTags(html, arr, p = 0) {
		const data = [
			[], // 0 Copyright
			[], // 1 Character
			[], // 2 Artist
			[], // 3 General
			[], // 4 Meta
		]
		let index = 0
		for (let i = 0, l = html.length; i < l; i++) {
			if (html[i].hasAttribute('class')) {
				const save = html[i].children
				let value = save[0+p].innerText.replace(/\n/g, '')
				if (value[value.length-1] == ' ') value = LastChar(' ', value, true)
				data[index].push([value, Number(save[1+p].innerText)])
			} else {
				const save = html[i].innerText
				if (save == "Copyright") index = 0
				else if (save == "Character") index = 1
				else if (save == "Artist") index = 2
				else if (save == "General") index = 3
				else if (save == "Meta") index = 4
			}
		}
		

		if (data[0].length > 0) {
			for (let i = 0, l = data[0].length; i < l; i++) data[0][i][0] = data[0][i][0].replace(' (series)', '')
			arr.parody = data[0]
		}
		if (data[1].length > 0) arr.character = data[1]
		if (data[2].length > 0) arr.artist = data[2]
		if (data[3].length > 0) arr.tag = data[3]
		if (data[4].length > 0) arr.meta = data[4]

		return arr
	}

	#GetPagination(html, cpage) {
		let save
		try {
			save = html.getElementsByClassName('paginator')[0].children[0].children
		} catch(err) {
			console.error(err)
			save = null
		}

		const arr = [0, []]
		if (save != null) {
			if (cpage >= this.maxPage) {
				cpage = this.maxPage
				arr[0] = cpage
				return
			} else {
				const l = save.length
				if (l > 1) {
					let save2 = [0, 0]
					switch (save[l-1].className) {
						case 'arrow': save2[0] = Number(LastChar("=", LastChar("&", save[l-1].children[0].href, true))); break
						case 'numbered-page': save2[0] = Number(save[l-1].children[0].innerText); break
						case 'current-page': save2[0] = Number(save[l-1].children[0].innerText); break
					}
					switch (save[l-2].className) {
						case 'numbered-page': save2[1] = Number(save[l-2].children[0].innerText); break
						case 'current-page': save2[1] = Number(save[l-2].children[0].innerText); break
						case 'arrow': save2[1] = Number(LastChar("=", LastChar("&", save[l-2].children[0].href, true))); break
					}

					if (save2[0] >= save2[1]) arr[0] = save2[0]
					else arr[0] = save2[1]
				} else if (l == 1) {
					switch (save[0].className) {
						case 'current-page': arr[0] = save2[1] = Number(save[0].children[0].innerText); break
						case 'arrow': arr[0] = Number(LastChar("=", LastChar("&", save[0].children[0].href, true))); break
						case 'numbered-page': arr[0] = Number(save[0].children[0].innerText); break
					}
				} else arr[0] = cpage
			}
			if (arr[0] < 1) arr[0] = 1
			arr[1] = GetPaginationList(arr[0], cpage)
		} else arr[0] = 1

		return arr
	}

	Page(page, search, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		if (search == null) search = ''
		else search = ToURL(search)
		const url = this.baseURL+'posts?page='+page+'&tags='+search

		if (!window.navigator.onLine) { callback(Language('no-internet'), null); return }
		fetch(url).then(response => {
			if (response.status != 200) {
				const i = status.indexOf(response.status)
				if (i > -1) throw Language('err'+response.status)
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			html = new DOMParser().parseFromString(html, 'text/html')
			let arr = { maxPages: null }, save, save2

			// Posts
			arr.posts = []
			try {
				save = html.getElementById('posts-container').children
				if (save.length == 0) save = null
			} catch(err) {
				console.error(err)
				save = null
			}
			if (save != null) {
				for (let i = 0, l = save.length; i < l; i++) {
					const t = document.createElement('div')
					let save2 = save[i].getAttribute('data-flags')
					if (save2 == 'pending') save2 = 0
					else if (save2 == '') save2 = null
					else if (save2 == 'pending flagged') save2 = 1
					arr.posts.push({
						id: Number(save[i].id.replace('post_', '')),
						thumb: save[i].children[0].children[0].children[0].getAttribute('srcset'),
						flag: save2,
						format: save[i].getAttribute('data-file-ext') 
					})
				}
			} else throw Language('npost')

			// Pagination
			save = this.#GetPagination(html, page)
			arr.pagination = save
			arr.maxPages = save[0]
			arr.pagination = save[1]

			callback(null, arr)
			return

			// Tags
			try {
				save = html.getElementById('tag-sidebar').children
				if (save.length == 0) save = null
			} catch(err) {
				console.error(err)
				save = null
			}
			if (save != null) arr = this.#GetTags(save, arr, 2)

			callback(null, arr)
		}).catch(err => {
			console.error(err)
			if (err == 'TypeError: Failed to fetch') err = Language('connection-timeout')
			callback(err, null)
		})
	}
}