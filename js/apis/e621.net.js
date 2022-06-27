class e621net {
	constructor() {
		this.baseURL = 'https://e621.net/'
		this.maxPage = 750
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
					save2 = save[i].getAttribute('data-flags')
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

			// Tag
			try {
				save = html.getElementById('tag-box').children[1].children
				if (save.length == 0) save = null
			} catch(err) {
				console.error(err)
				save = null
			}
			if (save != null) {
				arr.tag = []

				for (let i = 0, l = save.length; i < l; i++) {
					save2 = save[i].children
					arr.tag.push([
						save2[save2.length-2].innerText,
						save2[save2.length-1].innerText
					])
				}
			}

			callback(null, arr)
		}).catch(err => {
			console.error(err)
			if (err == 'TypeError: Failed to fetch') err = Language('connection-timeout')
			callback(err, null)
		})
	}

	Post(id, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		const url = this.baseURL+'posts/'+id

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
			let arr = {url:url,size:'',id:id,thumb:'',format:''}, save

			arr.title = html.title
			// Source
			save = html.getElementById('image') || null
			if (save != null) {
				arr.src = html.getElementById('image-resize-link').href
				arr.srcresize = save.src
				arr.video = save.tagName == 'VIDEO'
			} else {
				callback(Language('err404'), null)
				return
			}

			// States
			try {
				save = html.getElementById('post-information').children[1].children
				arr.size = save[5].innerText.replace(/ /g, '').replace('Size:', '')
				arr.format = LastChar('.', arr.src)
			} catch(err) { console.error(err) }

			// Thumb
			try { arr.thumb = arr.srcresize.replace('/sample/', '/preview/') } catch(err) { console.error(err) }

			// Tags
			try {
				save = html.getElementById('tag-list').children
				if (save.length == 0) save = null
			} catch(err) {
				console.error(err)
				save = null
			}
			if (save != null) {
				const data = [
					[], // 0 Artist
					[], // 1 Copyright
					[], // 2 Character
					[], // 3 Species
					[], // 4 General
					[], // 5 Meta
				]
				let index = 0, save2, save3
				for (let i = 0, l = save.length; i < l; i++) {
					if (save[i].tagName == 'H2') {
						switch(save[i].innerText) {
							case 'Artists': index = 0; break
							case 'Copyrights': index = 1; break
							case 'Characters': index = 2; break
							case 'Species': index = 3; break
							case 'General': index = 4; break
							case 'Meta': index = 5; break
						}
					} else {
						save2 = save[i].children
						if (save2.length == 0) continue
						for (let j = 0, n = save2.length; j < n; j++) {
							save3 = save2[j].children
							data[index].push([
								save3[1].innerText,
								save3[2].innerText
							])
						}
					}
				}
				
				if (data[0].length != 0) arr.artist = data[0]
				if (data[1].length != 0) arr.parody = data[1]
				if (data[2].length != 0) arr.character = data[2]
				if (data[3].length != 0) arr.species = data[3]
				if (data[4].length != 0) arr.tag = data[4]
				if (data[5].length != 0) arr.meta = data[5]
			}
			
			callback(null, arr)
		}).catch(err => {
			console.error(err)
			if (err == 'TypeError: Failed to fetch') err = Language('connection-timeout')
			callback(err, null)
		})
	}
}