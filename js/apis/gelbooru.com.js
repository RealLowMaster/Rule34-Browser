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
			let arr = { maxPages: null }, save, save2, save3

			// Posts
			arr.posts = []
			try {
				save = html.getElementsByClassName('thumbnail-container')[0].getElementsByClassName('thumbnail-preview')
				if (save.length == 0) save = null
			} catch(err) {
				console.error(err)
				save = null
			}

			if (save != null) {
				console.log(save)
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
			try { save = html.getElementById('tag-list') } catch(err) {
				console.error(err)
				save = null
			}
			if (save != null) {
				// Artist
				save2 = save.getElementsByClassName('tag-type-artist')
				if (save2.length > 0) {
					arr.artist = []
					for (let i = 0, l = save2.length; i < l; i++) {
						save3 = save2[i].children
						arr.artist.push([save3[save3.length-2].innerText, save3[save3.length-1].innerText])
					}
				}

				// Character
				save2 = save.getElementsByClassName('tag-type-character')
				if (save2.length > 0) {
					arr.character = []
					for (let i = 0, l = save2.length; i < l; i++) {
						save3 = save2[i].children
						arr.character.push([save3[save3.length-2].innerText, save3[save3.length-1].innerText])
					}
				}

				// Copyright
				save2 = save.getElementsByClassName('tag-type-copyright')
				if (save2.length > 0) {
					arr.parody = []
					for (let i = 0, l = save2.length; i < l; i++) {
						save3 = save2[i].children
						arr.parody.push([save3[save3.length-2].innerText, save3[save3.length-1].innerText])
					}
				}

				// Meta
				save2 = save.getElementsByClassName('tag-type-metadata')
				if (save2.length > 0) {
					arr.meta = []
					for (let i = 0, l = save2.length; i < l; i++) {
						save3 = save2[i].children
						arr.meta.push([save3[save3.length-2].innerText, save3[save3.length-1].innerText])
					}
				}

				// Tag
				save2 = save.getElementsByClassName('tag-type-general')
				if (save2.length > 0) {
					arr.tag = []
					for (let i = 0, l = save2.length; i < l; i++) {
						save3 = save2[i].children
						arr.tag.push([save3[save3.length-2].innerText, save3[save3.length-1].innerText])
					}
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

			let arr = {url:url,size:'',id:id,thumb:'',format:''}, save, save2, save3, statindex = 3

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
			arr.format = LastChar('.', arr.src)

			// Tags
			try {
				save = html.getElementById('tag-list')
				if (save.length == 0) save = null
			} catch(err) {
				console.error(err)
				save = null
			}
			if (save != null) {
				// Artist
				save2 = save.getElementsByClassName('tag-type-artist')
				if (save2.length > 0) {
					arr.artist = []
					statindex++
					for (let i = 0, l = save2.length; i < l; i++) {
						statindex++
						save3 = save2[i].children
						arr.artist.push([save3[save3.length-2].innerText, save3[save3.length-1].innerText])
					}
				}

				// Character
				save2 = save.getElementsByClassName('tag-type-character')
				if (save2.length > 0) {
					arr.character = []
					statindex++
					for (let i = 0, l = save2.length; i < l; i++) {
						statindex++
						save3 = save2[i].children
						arr.character.push([save3[save3.length-2].innerText, save3[save3.length-1].innerText])
					}
				}

				// Copyright
				save2 = save.getElementsByClassName('tag-type-copyright')
				if (save2.length > 0) {
					arr.parody = []
					statindex++
					for (let i = 0, l = save2.length; i < l; i++) {
						statindex++
						save3 = save2[i].children
						arr.parody.push([save3[save3.length-2].innerText, save3[save3.length-1].innerText])
					}
				}

				// Meta
				save2 = save.getElementsByClassName('tag-type-metadata')
				if (save2.length > 0) {
					arr.meta = []
					statindex++
					for (let i = 0, l = save2.length; i < l; i++) {
						statindex++
						save3 = save2[i].children
						arr.meta.push([save3[save3.length-2].innerText, save3[save3.length-1].innerText])
					}
				}

				// Tag
				save2 = save.getElementsByClassName('tag-type-general')
				if (save2.length > 0) {
					arr.tag = []
					statindex++
					for (let i = 0, l = save2.length; i < l; i++) {
						statindex++
						save3 = save2[i].children
						arr.tag.push([save3[save3.length-2].innerText, save3[save3.length-1].innerText])
					}
				}

				save = save.children
				for (let i = statindex, l = statindex + 7; i < l; i++) {
					if (save[i] == undefined) continue
					save2 = save[i].innerText.replace(/\n/g, '').replace(/ /g, '').replace(/\t/g, '').toLowerCase()
					if (save2.indexOf('size') == 0) {
						arr.size = save2.replace('size:', '')
						break
					}
				}
			}

			// Thumb
			if (arr.video) try { arr.thumb = LastChar('/', arr.srcresize, true).replace('/images/', '/thumbnails/')+'/thumbnail_'+LastChar('/', LastChar('.', arr.srcresize, true))+'.jpg' } catch(err) { console.error(err) } else try { arr.thumb = arr.srcresize.replace('/samples/', '/thumbnails/').replace('/sample_', '/thumbnail_') } catch(err) { console.error(err) }

			// More Like This
			try { save = html.getElementsByClassName('mainBodyPadding')[0].children } catch(err) {
				console.error(err)
				save = null
			}
			if (save != null && save.length != 0) {
				for (let i = 3, l = save.length; i < l; i++) {
					if (save[i].tagName == 'DIV' && save[i-1].tagName == 'BR' && save[i+1].tagName == 'BR') {
						save = save[i].getElementsByTagName('a')
						break
					}
				}
				if (save.length != 0) {
					arr.likethis = []
					for (let i = 0, l = save.length; i < l; i++) {
						arr.likethis.push({
							id: Number(LastChar('=', save[i].href)),
							thumb: save[i].children[0].src,
							video: false
						})
					}
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