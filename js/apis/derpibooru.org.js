class DerpiBooruorg {
	constructor() {
		this.baseURL = 'https://www.derpibooru.org/'
	}

	#GetPagination(html, page, index) {
		let save
		try {
			save = html.getElementsByClassName('pagination hide-mobile-t')[0].children
		} catch(err) {
			console.error(err)
			save = null
		}

		const arr = [0, []]
		if (save != null && save.length > 0) {

			switch(index) {
				case 0:
					if (save[save.length-1].tagName == 'A') arr[0] = Number(LastChar('=', save[save.length-1].href))
					else arr[0] = page
					break
				case 1:
					if (save[save.length-1].tagName == 'A') arr[0] = Number(FirstChar('&', FirstChar('=', save[save.length-1].href), true))
					else arr[0] = page
					break
			}

			arr[1] = GetPaginationList(arr[0], page)
		} else {
			arr[0] = page
			arr[1] = GetPaginationList(page, page)
		}

		return arr
	}

	Page(page, search, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		let url, pindex = 0
		if (search == null) url = this.baseURL+'images?page='+page
		else {
			url = this.baseURL+'search?page='+page+'&sd=desc&sf=first_seen_at&q='+ToURL(search)
			pindex = 1
		}

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
				save = html.getElementById('imagelist-container').getElementsByClassName('media-box')
			} catch(err) {
				console.error(err)
				save = null
			}
			if (save != null && save.length > 0) {
				for (let i = 0, l = save.length; i < l; i++) {
					save2 = save[i].getElementsByTagName('img')[0]
					if (save2.src != '') save2 = save2.src
					else save2 = 'https://derpicdn.net/media/2012/09/11/19_58_52_556_suggestive.png'
					arr.posts.push({
						id: Number(save[i].getAttribute('data-image-id')),
						thumb: save2
					})
				}
			} else throw Language('npost')

			// Pagination
			save = this.#GetPagination(html, page, pindex)
			arr.pagination = save
			arr.maxPages = save[0]
			arr.pagination = save[1]

			callback(null, arr)
		}).catch(err => {
			console.error(err)
			if (err == 'TypeError: Failed to fetch') err = Language('connection-timeout')
			callback(err, null)
		})
	}

	Post(id, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		const url = this.baseURL+'images/'+id

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
			let arr = {url:url,size:'',id:id,thumb:'',format:''}, save, save2, save3, save4

			arr.title = html.title
			// Source

			arr.src = null
			try {
				save = html.getElementsByClassName('stretched-mobile-links')
				save = save[save.length-1].children
				arr.src = save[save.length-1].href
			} catch(err) {
				console.error(err)
				callback(Language('err404'), null)
				return
			}

			if (arr.src == null) {
				callback(Language('err404'), null)
				return
			}

			arr.srcresize = arr.src.replace('/download/', '/')
			save = LastChar('.', arr.srcresize)
			arr.srcresize = LastChar('.', arr.srcresize, true)

			arr.thumb = arr.srcresize+'/thumb.'+save
			switch(setting.derpibooru_org_resized_size) {
				case 0: arr.srcresize += '/small.'+save; break
				case 1: arr.srcresize += '/medium.'+save; break
				case 2: arr.srcresize += '/large.'+save; break
			}

			// States
			try {
				arr.format = LastChar('.', arr.src)
				arr.size = html.getElementsByClassName('image-size')[0].innerText
			} catch(err) { console.error(err) }

			try {
				save = html.getElementsByClassName('tag-list')[0]
			} catch(err) {
				console.error(err)
				save = null
			}

			if (save != null) {
				// artist
				save2 = save.querySelectorAll('[data-tag-category="origin"]')
				if (save2.length > 0) {
					arr.artist = []
					for (let i = 0, l = save2.length; i < l; i++) {
						save3 = save2[i].children
						save4 = save3[0].children
						arr.artist.push([
							save4[save4.length-1].innerText,
							save3[save3.length-1].innerText
						])
					}
				}

				// characters
				save2 = save.querySelectorAll('[data-tag-category="character"]')
				if (save2.length > 0) {
					arr.character = []
					for (let i = 0, l = save2.length; i < l; i++) {
						save3 = save2[i].children
						save4 = save3[0].children
						arr.character.push([
							save4[save4.length-1].innerText,
							save3[save3.length-1].innerText
						])
					}
				}

				// specie
				save2 = save.querySelectorAll('[data-tag-category="species"]')
				if (save2.length > 0) {
					arr.specie = []
					for (let i = 0, l = save2.length; i < l; i++) {
						save3 = save2[i].children
						save4 = save3[0].children
						arr.specie.push([
							save4[save4.length-1].innerText,
							save3[save3.length-1].innerText
						])
					}
				}

				// tag
				save2 = save.querySelectorAll('[data-tag-category=""]')
				if (save2.length > 0) {
					arr.tag = []
					for (let i = 0, l = save2.length; i < l; i++) {
						save3 = save2[i].children
						save4 = save3[0].children
						arr.tag.push([
							save4[save4.length-1].innerText,
							save3[save3.length-1].innerText
						])
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