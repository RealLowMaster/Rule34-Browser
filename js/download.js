class Download {
	#url
	#savepath
	#file
	#stream
	#onerror
	#oncomplete
	#ondata
	#onresponse

	constructor(url, savepath) {
		this.#url = url
		this.#savepath = savepath
		this.#file = null
		this.#stream = null
		this.#onerror = null
		this.#oncomplete = null
		this.#ondata = null
		this.#onresponse = null
	}

	OnError(callback) {
		if (typeof callback != 'function') return
		this.#onerror = callback
	}

	OnComplete(callback) {
		if (typeof callback != 'function') return
		this.#oncomplete = callback
	}

	OnResponse(callback) {
		if (typeof callback != 'function') return
		this.#onresponse = callback
	}

	OnData(callback) {
		if (typeof callback != 'function') return
		this.#ondata = callback
	}

	Start() {
		this.#file = createWriteStream(this.#savepath)
		this.#stream = request(this.#url, { followRedirect:true, followAllRedirects:true })
		this.#stream.pipe(this.#file)
		this.#stream.on('error', err => {
			this.#file.close()
			try { unlinkSync(this.#savepath) } catch(e) {}
			if (this.#onerror != null) this.#onerror(err)
		})
		this.#stream.on('response', resp => {
			if (this.#onresponse != null) this.#onresponse(resp)
		})
		this.#stream.on('complete', () => {
			this.#file.close()
			if (this.#oncomplete != null) this.#oncomplete(this.#savepath)
		})
		this.#stream.on('data', data => {
			if (this.#ondata != null) this.#ondata(data.length)
		})
	}

	Pause() {
		this.#stream.pause()
	}

	Play() {
		this.#stream.resume()
	}

	Stop() {
		this.#stream.destroy()
		this.#file.close()
		try { unlinkSync(this.#savepath) } catch(err) { console.error('StopingDownload->'+err) }
	}
}

class DownloadManager {
	constructor() {
		this.ids = []
		this.dls = []
		this.dl_order = []
		this.dled = []
		this.dledIds = []
	}

	HasDownload() {
		if (this.dls.length > 0) return true
		return false
	}

	IsDownloading(site, id) {
		for (let i = 0, l = this.dls.length; i < l; i++) if (this.dls[i].site == site && this.dls[i].id == id) return true
		return false
	}

	Starting(site, id) {
		if (this.IsDownloading(site, id)) return null
		const i = this.ids.length
		const date = new Date().getTime()
		this.ids[i] = `${date}-${Math.floor(Math.random() * 999)}`
		this.dls[i] = {
			site: site,
			id: id,
			save: Number(`${date}${Math.floor(Math.random() * 9)}`)
		}
		browser.ChangeButtonsToDownloading(site, id)
		return this.ids[i]
	}

	StopFromStarting(i) {
		i = this.ids.indexOf(i)
		if (i < 0) return
		browser.ChangeButtonsToDownloading(this.dls[i].site, this.dls[i].id, true)
		this.ids.splice(i, 1)
		this.dls.splice(i, 1)
	}
	
	Add(index, thumb, page_url, dl_url, data) {
		let i = this.ids.indexOf(index)
		if (i < 0) return
		this.dls[i].url = dl_url
		this.dls[i].data = data
		this.dls[i].pause = false
		this.dls[i].format = LastChar('?', LastChar('.', dl_url), true)
		this.dls[i].dl_size = 0
		this.dls[i].total_size = 0
		this.dls[i].percent = 0
		this.dls[i].container = document.createElement('div')

		let save = document.createElement('div')
		let save2 = document.createElement('img')
		save2.src = thumb
		save.appendChild(save2)
		save2 = document.createElement('img')
		save2.src = `Image/sites/${sites[this.dls[i].site].url}-32x32.${sites[this.dls[i].site].icon}`
		save.appendChild(save2)
		this.dls[i].container.appendChild(save)

		save = document.createElement('div')
		save2 = document.createElement('p')
		save2.innerText = page_url
		save2.onclick = () => downloader.OpenURL(page_url)
		save.appendChild(save2)
		this.dls[i].span = document.createElement('span')
		this.dls[i].span.innerText = 'Downloading'
		save.appendChild(this.dls[i].span)
		save2 = document.createElement('div')
		this.dls[i].procress = document.createElement('div')
		save2.appendChild(this.dls[i].procress)
		save.appendChild(save2)
		save2 = document.createElement('div')
		this.dls[i].btn1 = document.createElement('div')
		this.dls[i].btn1.classList.add('btn')
		this.dls[i].btn1.classList.add('btn-primary')
		this.dls[i].btn1.setAttribute('l', 'pause')
		this.dls[i].btn1.innerText = Language('pause')
		this.dls[i].btn1.onclick = () => downloader.TogglePause(index)
		save2.appendChild(this.dls[i].btn1)
		this.dls[i].btn2 = document.createElement('div')
		this.dls[i].btn2.classList.add('btn')
		this.dls[i].btn2.classList.add('btn-danger')
		this.dls[i].btn2.setAttribute('l', 'cancel')
		this.dls[i].btn2.innerText = Language('cancel')
		this.dls[i].btn2.onclick = () => downloader.Cancel(index)
		save2.appendChild(this.dls[i].btn2)
		save.appendChild(save2)
		this.dls[i].container.appendChild(save)
		document.getElementById('dl-container').appendChild(this.dls[i].container)
		PopAlert(Language('dls'))
		this.dl_order.push(index)
		this.Download(index)
	}

	SendToAddPost(index) {
		const i = this.ids.indexOf(index)
		if (i < 0) return
		const data = this.dls[i]
		data.container.setAttribute('d','')
		const dled_i = this.dled.length
		this.dled[dled_i] = data.container
		this.dledIds[dled_i] = index
		const btn = document.createElement('div')
		btn.classList.add('btn')
		btn.classList.add('btn-primary')
		btn.onclick = () => downloader.Remove(index)
		btn.setAttribute('l', 'remove')
		btn.innerText = Language('remove')
		data.btn1.parentElement.appendChild(btn)
		data.btn1.remove()
		this.dls.splice(i, 1)
		this.ids.splice(i, 1)
		AddPost(data.site, data.id, data.save, data.format, data.data)
		browser.ChangeButtonsToDownloaded(data.site, data.id)
	}

	Download(index) {
		const dl_index = this.ids.indexOf(index)
		if (dl_index < 0) return
		const order = this.dl_order.indexOf(index)
		if (setting.dl_limit > 0 && setting.dl_limit <= order) {
			setTimeout(() => this.Download(index), 900)
			return
		}
		this.dls[dl_index].dl = new Download(this.dls[dl_index].url, paths.tmp+this.dls[dl_index].save+'.'+this.dls[dl_index].format)
		this.dls[dl_index].dl.OnError(err => {
			console.error(err)
			this.SendToAddPost(index)
		})

		this.dls[dl_index].dl.OnComplete(filename => {
			const i = this.ids.indexOf(index)
			if (i < 0) {
				try { unlinkSync(filename) } catch(e) {}
				return
			}
			this.Optimize(index, filename)
		})

		this.dls[dl_index].dl.OnResponse(resp => {
			const i = this.ids.indexOf(index)
			if (i < 0) return
			const bytes = parseInt(resp.headers['content-length'])
			this.dls[i].total_size = FormatBytes(bytes)
			this.dls[i].percent = 100 / bytes
			this.dls[i].span.innerText = '0 / '+this.dls[i].total_size
		})
		
		this.dls[dl_index].dl.OnData(data => {
			const i = this.ids.indexOf(index)
			if (i < 0) return
			this.dls[i].dl_size += data
			this.dls[i].procress.style.width = this.dls[i].percent * this.dls[i].dl_size+'%'
			this.dls[i].span.innerText = FormatBytes(this.dls[i].dl_size)+' / '+this.dls[i].total_size
		})

		this.dls[dl_index].dl.Start()
	}

	Optimize(index, path) {
		let i = this.ids.indexOf(index)
		if (i < 0) return
		this.dls[i].dl = null
		const order = this.dl_order.indexOf(index)
		if (order >= 0) this.dl_order.splice(order, 1)
		this.dls[i].btn1.style.display = 'none'
		this.dls[i].btn2.remove()
		this.dls[i].span.innerText = Language('optimizing')+'...'
		const save_path = paths.dl+this.dls[i].save+'.'+this.dls[i].format
		if (this.dls[i].format == 'jpeg') this.dls[i].format = 'jpg'

		const videoThumb = async () => {
			this.dls[i].span.innerText = 'Thumbnailing...'
			const name = LastChar('.', LastChar('/', path), true)
			const vid = await new ffmpeg(path).takeScreenshots({
				count: 1,
				timemarks: [0],
				filename: name
			}, paths.tmp, err => console.error(err))
			vid.on('error', err => {
				console.log(err)
				try { unlinkSync(paths.tmp+name+'.png') } catch(err) {}
				this.SendToAddPost(index)
			})
			vid.on('end', () => {
				try { renameSync(path, save_path) } catch(err) { console.error(err) }
				sharp(paths.tmp+name+'.png').resize(200, 200).jpeg({ mozjpeg: true }).toFile(paths.thumb+name+'.jpg').then(() => {
					try { unlinkSync(paths.tmp+name+'.png') } catch(err) {}
					try { this.dls[i].span.innerText = FormatBytes(statSync(save_path).size) } catch(err) {
						this.dls[i].span.setAttribute('l', 'finish')
						this.dls[i].span.innerText = Language('finish')
					}
					this.SendToAddPost(index)
				}).catch(err => {
					console.error(err)
					try { unlinkSync(paths.tmp+name+'.png') } catch(err) {}
					try { this.dls[i].span.innerText = FormatBytes(statSync(save_path).size) } catch(err) {
						this.dls[i].span.setAttribute('l', 'finish')
						this.dls[i].span.innerText = Language('finish')
					}
					this.SendToAddPost(index)
				})
			})
		}

		switch(this.dls[i].format) {
			case 'jpg':
				sharp(path).jpeg({ mozjpeg: true }).toFile(save_path).then(() => {
					const opt_size = statSync(save_path).size
					if (this.dls[i].dl_size < opt_size) {
						try {
							unlinkSync(save_path)
							renameSync(path, save_path)
						} catch(err) { console.error(err) }
						this.dls[i].span.innerText = FormatBytes(this.dls[i].dl_size)
					} else this.dls[i].span.innerText = FormatBytes(this.dls[i].dl_size)+' To '+FormatBytes(opt_size)
					sharp(save_path).resize(200, 200).jpeg({ mozjpeg: true }).toFile(paths.thumb+this.dls[i].save+'.jpg').then(() => this.SendToAddPost(index)).catch(err => {
						console.error(err)
						this.SendToAddPost(index)
					})
				}).catch(err => {
					console.error(err)
					try { unlinkSync(path) } catch(err) {}
					this.SendToAddPost(index)
				})
				return
			case 'png':
				sharp(path).png({ quality: 100 }).toFile(save_path).then(() => {
					const opt_size = statSync(save_path).size
					if (this.dls[i].dl_size < opt_size) {
						try {
							unlinkSync(save_path)
							renameSync(path, save_path)
						} catch(err) { console.error(err) }
						this.dls[i].span.innerText = FormatBytes(this.dls[i].dl_size)
					} else this.dls[i].span.innerText = FormatBytes(this.dls[i].dl_size)+' To '+FormatBytes(opt_size)
					sharp(save_path).resize(200, 200).jpeg({ mozjpeg: true }).toFile(paths.thumb+this.dls[i].save+'.jpg').then(() => this.SendToAddPost(index)).catch(err => {
						console.error(err)
						this.SendToAddPost(index)
					})
				}).catch(err => {
					console.error(err)
					try { unlinkSync(path) } catch(err) {}
					this.SendToAddPost(index)
				})
				return
			case 'webp':
				sharp(path).webp().toFile(save_path).then(() => {
					const opt_size = statSync(save_path).size
					if (this.dls[i].dl_size < opt_size) {
						try {
							unlinkSync(save_path)
							renameSync(path, save_path)
						} catch(err) { console.error(err) }
						this.dls[i].span.innerText = FormatBytes(this.dls[i].dl_size)
					} else this.dls[i].span.innerText = FormatBytes(this.dls[i].dl_size)+' To '+FormatBytes(opt_size)
					sharp(save_path).resize(200, 200).jpeg({ mozjpeg: true }).toFile(paths.thumb+this.dls[i].save+'.jpg').then(() => this.SendToAddPost(index)).catch(err => {
						console.error(err)
						this.SendToAddPost(index)
					})
				}).catch(err => {
					console.error(err)
					try { unlinkSync(path) } catch(err) {}
					this.SendToAddPost(index)
				})
				return
			case 'gif':
				try {
					renameSync(path, save_path)
					sharp(save_path).resize(200, 200).jpeg({ mozjpeg: true }).toFile(paths.thumb+this.dls[i].save+'.jpg').then(() => this.SendToAddPost(index)).catch(err => {
						console.error(err)
						this.SendToAddPost(index)
					})
				} catch(err) {
					console.error(err)
					this.SendToAddPost()
				}
				return
			case 'mp4': videoThumb(); return
			case 'webm': videoThumb(); return
			case 'avi': videoThumb(); return
			case 'mpg': videoThumb(); return
			case 'mpeg': videoThumb(); return
			case 'ogg': videoThumb(); return
			case 'ogv': videoThumb(); return
		}
	}

	OpenURL(url) {
		try { remote.shell.openExternal(url) } catch(err) {
			console.error(err)
			error('OpenURL->'+err)
		}
	}

	TogglePause(i) {
		i = this.ids.indexOf(i)
		if (i < 0) return
		this.dls[i].pause = !this.dls[i].pause
		if (this.dls[i].pause) {
			if (this.dls[i].dl != null) this.dls[i].dl.Pause()
			this.dls[i].btn1.setAttribute('class', 'btn btn-success')
			this.dls[i].btn1.setAttribute('l', 'resume')
			this.dls[i].btn1.innerText = Language('resume')
		} else {
			if (this.dls[i].dl != null) this.dls[i].dl.Play()
			this.dls[i].btn1.setAttribute('class', 'btn btn-primary')
			this.dls[i].btn1.setAttribute('l', 'pause')
			this.dls[i].btn1.innerText = Language('pause')
		}
	}

	PauseAll() {
		if (this.dls.length == 0) return
		for (let i = 0, l = this.dls.length; i < l; i++) if (this.dls[i].pause === false && this.dls[i].dl != null) {
			this.dls[i].pause = true
			this.dls[i].dl.Pause()
			this.dls[i].btn1.setAttribute('class', 'btn btn-success')
			this.dls[i].btn1.setAttribute('l', 'resume')
			this.dls[i].btn1.innerText = Language('resume')
		}
	}

	ResumeAll() {
		if (this.dls.length == 0) return
		for (let i = 0, l = this.dls.length; i < l; i++) if (this.dls[i].pause === true && this.dls[i].dl != null) {
			this.dls[i].pause = false
			this.dls[i].dl.Play()
			this.dls[i].btn1.setAttribute('class', 'btn btn-primary')
			this.dls[i].btn1.setAttribute('l', 'pause')
			this.dls[i].btn1.innerText = Language('pause')
		}
	}

	Cancel(index) {
		const i = this.ids.indexOf(index)
		if (i < 0) return
		if (this.dls[i].dl != null) this.dls[i].dl.Stop()
		const site = this.dls[i].site, id = this.dls[i].id
		this.dls[i].container.remove()
		this.ids.splice(i, 1)
		this.dls.splice(i, 1)
		const order = this.dl_order.indexOf(index)
		if (order >= 0) this.dl_order.splice(order, 1)
		browser.ChangeButtonsToDownloading(site, id, true)
	}

	CancelAll() {
		for (let i = 0, l = this.dls.length; i < l; i++) {
			if (this.dls[i].dl != null) this.dls[i].dl.Stop()
			const site = this.dls[i].site, id = this.dls[i].id
			const order = this.dl_order.indexOf(this.ids[i])
			if (order >= 0) this.dl_order.splice(order, 1)
			this.dls[i].container.remove()
			this.ids.splice(i, 1)
			this.dls.splice(i, 1)
			browser.ChangeButtonsToDownloading(site, id, true)
		}
	}

	OpenPanel() {
		KeyManager.ChangeCategory('downloads')
		document.getElementById('dl-window').style.display = 'flex'
	}

	ClosePanel() {
		document.getElementById('dl-window').style.display = 'none'
		KeyManager.BackwardCategory()
	}

	Remove(i) {
		i = this.dledIds.indexOf(i)
		if (i < 0) return
		this.dled[i].remove()
		this.dled.splice(i, 1)
		this.dledIds.splice(i, 1)
	}

	Clear() {
		for (let i = 0, l = this.dledIds.length; i < l; i++) this.dled[i].remove()
		this.dled = []
		this.dledIds = []
	}
}

const downloader = new DownloadManager()