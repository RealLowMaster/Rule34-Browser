class GelBooru {
	constructor() {
		this.baseURL = 'https://gelbooru.com/'
		this.maxPage = 477
	}

	#GetPagination(html, cpage) {
		let save
		try {
			save = html.getElementById('paginator').children
		} catch(err) {
			console.error(err)
			save = null
		}

		const arr = [0, []]
		if (save != null) {
			if (cpage >= this.maxPage) {
				cpage = this.maxPage
				arr[0] = cpage
				arr[1] = GetPaginationList(cpage, cpage)
				return arr
			} else {
				const l = save.length
				if (l > 1) {
					if (save[l-1].tagName == 'B') arr[0] = cpage
					else arr[0] = Number(LastChar('=', save[l-1].href)) / 42 + 1
					if (arr[0] > this.maxPage) arr[0] = this.maxPage
					arr[1] = GetPaginationList(arr[0], cpage)
				} else {
					arr[0] = cpage
					arr[1] = GetPaginationList(cpage, cpage)
				}
				return arr
			}
		} else {
			arr[0] = 1
			arr[1] = GetPaginationList(1, 1)
		}
		return arr
	}
	
	Page(page, search, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		if (search == null) search = 'all'
		else search = ToURL(search)
		page--
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
			let arr = { maxPages: null }, save, save2

			// Posts
			arr.posts = []
			try {
				save = html.getElementsByClassName('thumbnail-container')[0].children
				if (save.length == 0) save = null
			} catch(err) {
				console.error(err)
				save = null
			}

			if (save != null) {
				for (let i = 0, l = save.length; i < l; i++) {
					save2 = save[i].children[0]
					arr.posts.push({
						id: Number(save2.id.replace('p', '')),
						thumb: save2.children[0].src,
						video: save2.children[0].className == 'webm'
					})
				}
			} else throw Language('npost')

			// Pagination
			save = this.#GetPagination(html, page + 1)
			arr.pagination = save
			arr.maxPages = save[0]
			arr.pagination = save[1]

			// Tag
			try {
				save = html.getElementById('tag-list').children
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

			let arr = {url:url,size:'',id:id,thumb:'',format:''}, save, save2

			const t = document.createElement('div')
			t.click()

			arr.title = html.title
			// Source
			save = html.getElementById('image') || null
			if (save != null) {
				arr.srcresize = save.src
				arr.video = false

				save2 = html.body.getElementsByTagName('script')
				for (let i = 0, l = save2.length; i < l; i++) {
					if (save2[i].type == 'text/javascript') {
						let save3 = [save2[i].innerText]
						save3[1] = save3[0].indexOf('resizeTransition')
						if (save3[1] != -1) {
							save3[0] = save3[0].slice(save3[1])
							save3[0] = save3[0].slice(save3[0].indexOf("image.attr('src','") + 18)
							arr.src = save3[0].slice(0, save3[0].indexOf("'"))
						}
					}
				}
				if (arr.src == null) arr.src = arr.srcresize
			} else {
				save = html.getElementById('gelcomVideoPlayer') || null
				if (save != null) {
					arr.video = true
					arr.srcresize = null
					save2 = save.children
					for (let i = 0, l = save2.length; i < l; i++) {
						if (save2[i].type == 'video/webm') {
							arr.srcresize = save2[i].src
							break
						}
					}
					if (arr.srcresize == null) arr.srcresize = save2[0].src
					arr.src = arr.srcresize
				} else {
					callback(Language('err404'), null)
					return
				}
			}

			callback(null, arr)
			return

			// States
			try {
				arr.format = LastChar('.', arr.src)
				save = html.getElementById('post-information').children[1].children
				
				save2 = save[5].innerText.replace(/ /g, '').replace(/\t/g, '').replace(/\n/g, '').toLowerCase()
				if (save2.indexOf('size') == 0) arr.size = save2.replace('size:', '')
				else if (save[6] != undefined) {
					save2 = save[6].innerText.replace(/ /g, '').replace(/\t/g, '').replace(/\n/g, '').toLowerCase()
					if (save2.indexOf('size') == 0) arr.size = save2.replace('size:', '')
				}
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
				let index = 0, save3
				for (let i = 0, l = save.length; i < l; i++) {
					if (save[i].tagName == 'SPAN') {
						switch(save[i].innerText) {
							case 'Artist': index = 0; break
							case 'Copyright': index = 1; break
							case 'Character': index = 2; break
							case 'Tag': index = 3; break
							case 'Metadata': index = 4; break
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
				if (data[3].length != 0) arr.tag = data[3]
				if (data[4].length != 0) arr.meta = data[4]
			}
			
			callback(null, arr)
		}).catch(err => {
			console.error(err)
			if (err == 'TypeError: Failed to fetch') err = Language('connection-timeout')
			callback(err, null)
		})
	}
}