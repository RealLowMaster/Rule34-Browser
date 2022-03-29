class rule34xxx {
	constructor() {
		this.baseURL = 'https://rule34.xxx/'
		this.maxPage = 4762
	}

	#ToURL(txt) {
		return new String(txt).replace(/%/g, '%25')
			.replace(/'/g, '%27')
			.replace(/\(/g, '%28')
			.replace(/\)/g, '%29')
			.replace(/\?/g, '%3f')
			.replace(/&/g, '%26')
			.replace(/\//g, '%2f')
			.replace(/\\/g, '%5c')
			.replace(/#/g, '%23')
			.replace(/\*/g, '%2a')
			.replace(/!/g, '%21')
			.replace(/@/g, '%40')
			.replace(/\$/g, '%24')
			.replace(/\^/g, '%5e')
			.replace(/=/g, '%3d')
			.replace(/\+/g, '%2b')
			.replace(/ /g, '+')
			.replace(/{/g, '%7b')
			.replace(/}/g, '%7d')
			.replace(/\[/g, '%5b')
			.replace(/]/g, '%5d')
			.replace(/:/g, '%3a')
			.replace(/;/g, '%3b')
			.replace(/`/g, '%60')
			.replace(/,/g, '%2c')
			.replace(/\|/g, '%7c')
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

		if (data[0].length > 0) arr.parody = data[0]
		if (data[1].length > 0) arr.character = data[1]
		if (data[2].length > 0) arr.artist = data[2]
		if (data[3].length > 0) arr.tag = data[3]
		if (data[4].length > 0) arr.meta = data[4]

		return arr
	}

	Page(page, search, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		page--
		if (search == null) search = 'all'
		else search = this.#ToURL(search)
		const url = this.baseURL+'index.php?page=post&s=list&tags='+search+'&pid='+(page * 42)

		if (!window.navigator.onLine) { callback(Language('no-internet'), null); return }
		fetch(url).then(response => {
			if (response.status != 200) {
				const i = status.indexOf(response.status)
				if (i > -1) throw statusMsg[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			html = new DOMParser().parseFromString(html, 'text/html')
			let arr = { maxPages: null }, save

			// Posts
			arr.posts = []
			try {
				save = html.getElementById('post-list').getElementsByClassName('image-list')[0].children
				if (save.length == 0) save = null
			} catch(err) {
				console.error(err)
				save = null
			}
			if (save != null) {
				for (let i = 0, l = save.length; i < l; i++) {
					const img = save[i].children[0].children[0]
					arr.posts.push({
						id: Number(save[i].id.replace('s', '')),
						thumb: img.src,
						video: img.getAttribute('style') == null ? false : true
					})
				}
			} else {
				callback(null, arr)
				return
			}

			// Pagination
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

			arr.maxPages = null
			if (save != null) {
				arr.pagination = []
				
				for (let i = 0, l = save.length; i < l; i++) {
					if (save[i].tagName == 'A') arr.pagination.push([Number(LastChar('=', save[i].href)) / 42 + 1, save[i].innerText])
					else if (save[i].tagName == 'B') arr.pagination.push([null, save[i].innerText])
				}
				save = save[save.length - 3]
				if (save.tagName == 'B') arr.maxPages = Number(save.innerHTML)
				else if (save.tagName == 'A') {
					let num = Number(LastChar('=', save.href))
					if (isNaN(num)) arr.maxPages = null
					else {
						num = num / 42 + 1
						arr.maxPages = num > this.maxPage ? this.maxPage : num
					}
				}
			}

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
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	Post(id, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		const url = this.baseURL+'index.php?page=post&s=view&id='+id

		if (!window.navigator.onLine) { callback(Language('no-internet'), null); return }
		fetch(url).then(response => {
			if (response.status != 200) {
				const i = status.indexOf(response.status)
				if (i > -1) throw statusMsg[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(htm => {
			const html = new DOMParser().parseFromString(htm, 'text/html')
			let arr = {url:url}, save

			save = html.getElementById('image') || null
			if (save == null) {
				save = html.getElementById('gelcomVideoPlayer') || null
				if (save != null) {
					arr.src = save.children[0].src
					arr.srcresize = arr.src
					arr.video = true
				} else {
					callback(statusMsg[status.indexOf(404)], null)
					return
				}
			} else {
				arr.srcresize = save.src
				save = html.getElementsByClassName('link-list')[0].children[1].children
				for (let i = 0, l = save.length; i < l; i++) if (save[i].children[0].innerText.replace(/\n/g, '') == 'Original image') {
					arr.src = save[i].children[0].href
					break
				}
				arr.video = false
			}
			let last
			if (arr.video) last = LastChar('/', arr.src)
			else last = LastChar('_', arr.srcresize)

			// Thumb
			arr.thumb = this.baseURL+'thumbnails/'+LastChar('/', LastChar('/', arr.srcresize, true))+'/thumbnail_'+LastChar('.', last, true)+'.jpg?'+LastChar('?', last)

			// Made => https://rule34.xxx/thumbnails/5121/thumbnail_https://us.rule34.xxx//images/5121/1f7aefd17a68f290b4c21f3f37758230.jpg?5871972
			// Real => https://us.rule34.xxx/thumbnails/5121/thumbnail_1f7aefd17a68f290b4c21f3f37758230.jpg?5871972
			// Imag => https://us.rule34.xxx//images/5121/1f7aefd17a68f290b4c21f3f37758230.jpeg?5871972
			// id   => 5871972

			// Tags
			try {
				save = html.getElementById('tag-sidebar').children
				if (save.length == 0) save = null
			} catch(err) {
				console.error(err)
				save = null
			}
			if (save != null) arr = this.#GetTags(save, arr)
			
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	save(id, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		const url = this.baseURL+'index.php?page=post&s=view&id='+id

		if (!window.navigator.onLine) { callback(Language('no-internet'), null); return }
		fetch(url).then(response => {
			if (response.status != 200) {
				const i = status.indexOf(response.status)
				if (i > -1) throw statusMsg[index]
				else throw "Error::Code::"+response.status
			}
			
			return response.text()
		}).then(htm => {
			const html = new DOMParser().parseFromString(htm, 'text/html')
			let arr = {}, save
			

		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}
}