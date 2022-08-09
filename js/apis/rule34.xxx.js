class rule34xxx {
	constructor() {
		this.baseURL = 'https://rule34.xxx/'
		this.maxPage = 4762
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
		

		if (data[0].length != 0) arr.parody = data[0]
		if (data[1].length != 0) arr.character = data[1]
		if (data[2].length != 0) arr.artist = data[2]
		if (data[3].length != 0) arr.tag = data[3]
		if (data[4].length != 0) arr.meta = data[4]

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
		page--
		if (search == null) search = 'all'
		else search = ToURL(search)
		const url = this.baseURL+'index.php?page=post&s=list&tags='+search+'&pid='+(page * 42)

		if (!window.navigator.onLine) { callback(Language('no-internet'), null); return }
		fetch(url).then(response => {
			if (!response.ok) {
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
				save = html.getElementById('post-list').getElementsByClassName('image-list')[0].children
			} catch(err) {
				console.error(err)
				save = null
			}
			if (save != null && save.length > 0) {
				for (let i = 0, l = save.length; i < l; i++) {
					const img = save[i].children[0].children[0]
					arr.posts.push({
						id: Number(save[i].id.replace('s', '')),
						thumb: img.src,
						video: img.getAttribute('style') == null ? false : true
					})
				}
			} else throw Language('npost')

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

	Post(id, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		const url = this.baseURL+'index.php?page=post&s=view&id='+id

		if (!window.navigator.onLine) { callback(Language('no-internet'), null); return }
		fetch(url).then(response => {
			if (!response.ok) {
				const i = status.indexOf(response.status)
				if (i > -1) throw Language('err'+response.status)
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			html = new DOMParser().parseFromString(html, 'text/html')
			let arr = {url:url,size:'',id:'',thumb:'',format:''}, save

			arr.title = html.title
			save = html.getElementById('image') || null
			// Source
			if (save == null) {
				save = html.getElementById('gelcomVideoPlayer') || null
				if (save != null) {
					arr.src = save.children[0].src
					arr.srcresize = arr.src
					arr.video = true
				} else {
					callback(Language('err404'), null)
					return
				}
			} else {
				arr.srcresize = save.src
				save = html.getElementsByClassName('link-list')[0].children[1].children
				for (let i = 0, l = save.length; i < l; i++) if (save[i].children[0].innerText.replace(/\n/g, '').replace(/ /g, '').toLowerCase() == 'originalimage') {
					arr.src = save[i].children[0].href
					break
				}
				arr.video = false
			}

			// States
			try {
				arr.format = LastChar('?', LastChar('.', arr.src), true)
				save = html.getElementById('stats').children[1].children
				arr.id = save[0].innerText.replace(/ /g, '').replace(/\n/g, '').toLowerCase().replace('id:', '')
				arr.size = save[2].innerText.replace(/ /g, '').replace(/\n/g, '').toLowerCase().replace('size:', '')
			} catch(err) { console.error(err) }

			// Thumb
			try {
				arr.thumb = this.baseURL+'thumbnails/'+LastChar('/', LastChar('/', arr.srcresize.replace(/\/\//g, '/'), true))+'/thumbnail_'+LastChar('.', LastChar('/', arr.srcresize).replace(/sample_/g, ''), true)+'.jpg?'+id
			} catch(err) { console.error(err) }

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
			console.error(err)
			if (err == 'TypeError: Failed to fetch') err = Language('connection-timeout')
			callback(err, null)
		})
	}

	Artists(page, search, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		page--
		const url = this.baseURL+'index.php?page=artist&s=list&search='+(search == null ? '' : ToURL(search))+'&pid='+(page * 25)

		if (!window.navigator.onLine) { callback(Language('no-internet'), null); return }
		fetch(url).then(response => {
			if (!response.ok) {
				const i = status.indexOf(response.status)
				if (i > -1) throw Language('err'+response.status)
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			html = new DOMParser().parseFromString(html, 'text/html')
			let arr = {}, save
			arr.title = 'Artists > '+(search == null ? '' : search+' > ')+'Page '+(page + 1)

			// List
			try {
				save = html.getElementsByClassName('highlightable')[0] || null
				save = save.children[0].children
				if (save.length == 0) save = null
			} catch(err) {
				console.error(err)
				save = null
			}
			if (save != null) {
				arr.list = []
				let save2
				for (let i = 1, l = save.length; i < l; i++) {
					save2 = save[i].children
					arr.list.push([
						save2[1].children[0].innerText,
						save2[2].innerText,
						save2[0].children[0].innerText.replace(/ /g, '') != 'P' ? false : true
					])
				}
			} else arr.list = null

			// Pagination
			save = this.#GetPagination(html, 25, false)
			arr.maxPages = save[0]
			arr.pagination = save[1]
			
			callback(null, arr)
		}).catch(err => {
			console.error(err)
			if (err == 'TypeError: Failed to fetch') err = Language('connection-timeout')
			callback(err, null)
		})
	}

	Tags(page, search, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		page--
		const url = this.baseURL+'index.php?page=tags&s=list&pid='+(page * 50)+(search == null ? '' : '&sort=asc&order_by=tag&tags='+ToURL(search))

		if (!window.navigator.onLine) { callback(Language('no-internet'), null); return }
		fetch(url).then(response => {
			if (!response.ok) {
				const i = status.indexOf(response.status)
				if (i > -1) throw Language('err'+response.status)
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			html = new DOMParser().parseFromString(html, 'text/html')
			let arr = {}, save
			arr.title = 'Tags > '+(search == null ? '' : search+' > ')+'Page '+(page + 1)

			// List
			try {
				save = html.getElementsByClassName('highlightable')[0].children[0].children
				if (save.length == 0) save = null
			} catch(err) {
				console.error(err)
				save = null
			}
			if (save != null) {
				arr.list = []
				let save2
				for (let i = 1, l = save.length; i < l; i++) {
					save2 = save[i].children
					arr.list.push([
						save2[0].innerText,
						save2[1].innerText.replace(/ /g, ''),
						save2[2].innerText.replace(' (edit)', '')
					])
				}
			} else arr.list = null

			// Pagination
			save = this.#GetPagination(html, 50, false)
			arr.maxPages = save[0]
			arr.pagination = save[1]
			
			callback(null, arr)
		}).catch(err => {
			console.error(err)
			if (err == 'TypeError: Failed to fetch') err = Language('connection-timeout')
			callback(err, null)
		})
	}

	Pools(page, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		page--
		const url = this.baseURL+'index.php?page=pool&s=list&pid='+(page * 25)

		if (!window.navigator.onLine) { callback(Language('no-internet'), null); return }
		fetch(url).then(response => {
			if (!response.ok) {
				const i = status.indexOf(response.status)
				if (i > -1) throw Language('err'+response.status)
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			html = new DOMParser().parseFromString(html, 'text/html')
			let arr = {}, save
			arr.title = 'Pools > Page '+(page + 1)

			// List
			try {
				save = html.getElementsByClassName('highlightable')[0].children[1].children
				if (save.length == 0) save = null
			} catch(err) {
				console.error(err)
				save = null
			}
			if (save != null) {
				arr.list = []
				let save2, save3
				for (let i = 0, l = save.length; i < l; i++) {
					save2 = save[i].children
					save3 = save2[0].children[0]
					arr.list.push([
						save3.innerText,
						Number(LastChar('=', save3.href)),
						save2[1].children[0].innerText,
						save2[2].innerText,
						save2[3].innerText
					])
				}
			} else arr.list = null

			// Pagination
			save = this.#GetPagination(html, 25, false)
			arr.maxPages = save[0]
			arr.pagination = save[1]
			
			callback(null, arr)
		}).catch(err => {
			console.error(err)
			if (err == 'TypeError: Failed to fetch') err = Language('connection-timeout')
			callback(err, null)
		})
	}

	Pool(id, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		const url = this.baseURL+'index.php?page=pool&s=show&id='+id

		if (!window.navigator.onLine) { callback(Language('no-internet'), null); return }
		fetch(url).then(response => {
			if (!response.ok) {
				const i = status.indexOf(response.status)
				if (i > -1) throw Language('err'+response.status)
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			html = new DOMParser().parseFromString(html, 'text/html')
			let arr = {}, save
			save = html.getElementById('pool-show').children
			arr.title = save[0].innerText.replace('Pool: ', '')
			arr.sub_title = save[1].innerText

			try {
				save = html.getElementsByClassName('thumb')
				if (save.length == 0) save = null
			} catch(err) {
				console.error(err)
				save = null
			}
			arr.posts = []
			if (save != null) {
				for (let i = 0, l = save.length; i < l; i++) {
					const img = save[i].children[0].children[0]
					arr.posts.push({
						id: Number(save[i].id.replace('p', '')),
						thumb: img.src,
						video: img.getAttribute('style') == null ? false : true
					})
				}
			}
			
			callback(null, arr)
		}).catch(err => {
			console.error(err)
			if (err == 'TypeError: Failed to fetch') err = Language('connection-timeout')
			callback(err, null)
		})
	}
}