class rule34xyz {
	constructor() {
		this.baseURL = 'https://rule34.xyz/'
	}

	Page(page, search, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		const url = this.baseURL+'page/'+page

		if (!window.navigator.onLine) { callback(Language('no-internet'), null); return }
		fetch(url).then(response => {
			if (response.status != 200) {
				const i = status.indexOf(response.status)
				if (i > -1) throw Language('err'+response.status)
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(htm => {
			const html = new DOMParser().parseFromString(htm, 'text/html')
			let arr = { maxPages: null }, save, save2

			// Posts
			arr.posts = []

			save = html.getElementsByClassName('box-grid')[0].children
			for (let i = 0, l = save.length; i < l; i++) {
				save2 = save[i].children[0].children[0].children
				arr.posts.push({
					thumb: this.baseURL+save2[save2.length - 1].children[0].children[0].getAttribute('srcset')
					// thumb: save[i].children[0].children[0].children[2].children[0].children[0].getAttribute('srcset')
				})
			}

			console.log(arr.posts)
			
		}).catch(err => {
			console.error(err)
			if (err == 'TypeError: Failed to fetch') err = Language('connection-timeout')
			callback(err, null)
		})
	}

	Post(id, callback) {
		if (typeof callback !== 'function') throw "Callback should be Function."
		const url = this.baseURL+'post/'+id

		if (!window.navigator.onLine) { callback(Language('no-internet'), null); return }
		fetch(url).then(response => {
			if (response.status != 200) {
				const i = status.indexOf(response.status)
				if (i > -1) throw Language('err'+response.status)
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(htm => {
			const html = new DOMParser().parseFromString(htm, 'text/html')
			let arr = { url:url, thumb:'', src:null }, save, save2

			arr.title = html.title
			// Source
			save = html.getElementsByTagName('app-tag-set')[0].children[0].children[0].children
			console.log(save.length)
			save2 = save[save.length - 1]
			save2.click()
			save = html.getElementsByTagName('app-tag-set')[0].children[0].children[0].children
			console.log(save.length)

			// console.log(html.getElementsByTagName('app-tag-set')[0])
			
		}).catch(err => {
			console.error(err)
			if (err == 'TypeError: Failed to fetch') err = Language('connection-timeout')
			callback(err, null)
		})
	}
}

function test() {
	const api = new rule34xyz()
	api.Post(3438439, (err, result) => {
		console.error(err)
		console.log(result)
	})
}