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

	#GetPagination(html, perPage = 42, limit = true) {
		let save
		try {
			save = html.getElementById('paginator').children[0]
			if (save.classList.contains('pagination')) {
				save = save.children
				if (save.length < 2) save = null
			} else save = null
		} catch(err) {
			console.error(err)
			save = null
		}

		const arr = [0, []]
		if (save != null) {
			for (let i = 0, l = save.length; i < l; i++) {
				if (save[i].tagName == 'A') arr[1].push([Number(LastChar('=', save[i].href)) / perPage + 1, save[i].innerText])
				else if (save[i].tagName == 'B') arr[1].push([null, save[i].innerText])
			}
			for (let i = save.length - 1; i >= 0; i--) {
				if (save[i].tagName == 'B') {
					arr[0] = Number(save[i].innerHTML)
					break
				}
				if (save[i].tagName == 'A') {
					let num = Number(LastChar('=', save[i].href))
					if (isNaN(num)) arr[0] = 1
					else {
						num = num / perPage + 1
						if (limit) arr[0] = num > this.maxPage ? this.maxPage : num
						else arr[0] = num
					}
					break
				}
			}
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
			let arr = { maxPages: null }, save

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
					arr.posts.push({
						id: Number(save[i].id.replace('post_', '')),
						thumb: save[i].children[0].children[0].children[0].getAttribute('srcset'),
						video: (save[i].classList.contains('post-status-pending') || save[i].classList.contains('post-status-flagged')) && !save[i].classList.contains('mod-queue-preview')
					})
				}
			} else throw Language('npost')

			callback(null, arr)
			return

			// Pagination
			save = this.#GetPagination(html)
			arr.maxPages = save[0]
			arr.pagination = save[1]

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