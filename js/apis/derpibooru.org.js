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
			let arr = {url:url,size:'',id:id,thumb:'',format:''}, save, save2

			arr.title = html.title
			// Source

			arr.src = null
			try {
				save = html.getElementsByClassName('stretched-mobile-links')
				console.log(save)
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

			try {
				save = html.getElementsByClassName('image-scaled')
				console.log(save)
				arr.srcresize = save[0].src
			} catch(err) {
				console.error(err)
				callback(Language('err404'), null)
				return
			}

			

			

			callback(null, arr)
			return

			// States
			try {
				arr.format = LastChar('.', arr.src)
				arr.size = html.getElementsByClassName('image-size')[0].innerText
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
				if (data[3].length != 0) arr.specie = data[3]
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