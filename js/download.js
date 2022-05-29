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
		this.maximum_pixel = 0
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
		browser.ChangeButtonsToDownloading(site, id, false)
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
		this.dls[i].animated = false
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
		const dl_container = document.getElementById('dl-container')
		const dl_childs = dl_container.children
		if (dl_childs.length > 0) try { dl_container.insertBefore(this.dls[i].container, dl_childs[0]) } catch(err) { dl_container.appendChild(this.dls[i].container) }
		else dl_container.appendChild(this.dls[i].container)
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
		AddPost(data.site, data.id, data.save, data.format, data.data, data.animated || null)
		browser.ChangeButtonsToDownloaded(data.site, data.id, false)

		if (this.dls.length > 0) return
		PopAlert(Language('adl-finish'), 'warning')
	}

	Download(index) {
		const sindex = index
		const dl_index = this.ids.indexOf(sindex)
		if (dl_index < 0) return
		const order = this.dl_order.indexOf(sindex)
		if (setting.dl_limit <= order) {
			setTimeout(() => this.Download(sindex), 1000)
			return
		}
		this.dls[dl_index].dl = new Download(this.dls[dl_index].url, paths.tmp+this.dls[dl_index].save+'.'+this.dls[dl_index].format)
		this.dls[dl_index].dl.OnError(err => {
			console.error(err)
			this.SendToAddPost(sindex)
		})

		this.dls[dl_index].dl.OnComplete(filename => {
			const i = this.ids.indexOf(sindex)
			if (i < 0) {
				try { unlinkSync(filename) } catch(e) {}
				return
			}
			this.AfterDownload(sindex, filename)
		})

		this.dls[dl_index].dl.OnResponse(resp => {
			const i = this.ids.indexOf(sindex)
			if (i < 0) return
			const bytes = parseInt(resp.headers['content-length'])
			this.dls[i].total_size = FormatBytes(bytes)
			this.dls[i].percent = 100 / bytes
			this.dls[i].span.innerText = '0 / '+this.dls[i].total_size
		})
		
		this.dls[dl_index].dl.OnData(data => {
			const i = this.ids.indexOf(sindex)
			if (i < 0) return
			this.dls[i].dl_size += data
			this.dls[i].procress.style.width = this.dls[i].percent * this.dls[i].dl_size+'%'
			this.dls[i].span.innerText = FormatBytes(this.dls[i].dl_size)+' / '+this.dls[i].total_size
		})

		this.dls[dl_index].dl.Start()
	}

	AfterDownload(index, path) {
		let i = this.ids.indexOf(index)
		if (i < 0) return
		this.dls[i].dl = null
		const order = this.dl_order.indexOf(index)
		if (order >= 0) this.dl_order.splice(order, 1)
		this.dls[i].btn1.style.display = 'none'
		this.dls[i].btn2.remove()
		this.dls[i].span.innerText = Language('optimizing')+'...'
		let save_path = paths.dl+this.dls[i].save+'.'
		if (this.dls[i].format == 'jpeg') this.dls[i].format = 'jpg'

		this.Optimize(path, save_path, index, this.dls[i].save, true)
	}

	GetResizeAspect(width, height, max_pixels) {
		const pixels = width * height
		if (pixels <= max_pixels) return {}
		const ratio = width / height
		const scale = Math.sqrt(pixels / max_pixels)
		const final_height = Math.floor(height / scale)
		const final_width = Math.floor(ratio * height / scale)
		return { width:final_width, height:final_height }
	}

	Optimize(path, save_path, index, save, dl) {
		let format = LastChar('.', path), i
		if (dl) {
			i = this.ids.indexOf(index)
			if (i < 0) return
		}
		if (format == 'jpeg') format = 'jpg'

		const finished = () => {
			if (dl) this.SendToAddPost(index)
			else {
				try { jsonfile.writeFileSync(paths.db+'post', { v:db.manager.post, a:db.post, h:db.post_have }) } catch(err) { console.error(err) }
				loading.Forward()
				loading.Close()
				KeyManager.stop = false
				PopAlert(Language('redl-finish'))
				browser.SetNeedReload(-1)
			}
		}

		const videoThumb = () => {
			save_path += format
			if (dl) {
				i = this.ids.indexOf(index)
				if (i < 0) return
				this.dls[i].span.innerText = 'Thumbnailing...'
			} else {
				db.post[index][3] = format
				if (db.post[index][9] != null) db.post[index][9] = null
			}
			const name = LastChar('.', LastChar('/', path), true)
			const vid = new ffmpeg(path).takeScreenshots({
				count: 1,
				timemarks: [0],
				filename: name
			}, paths.tmp, err => console.error(err))
			vid.on('error', err => {
				console.log(err)
				try { unlinkSync(paths.tmp+name+'.png') } catch(err) {}
				finished()
			})
			vid.on('end', () => {
				try { renameSync(path, save_path) } catch(err) { console.error(err) }
				sharp(paths.tmp+name+'.png', { limitInputPixels: false }).resize(225, 225).jpeg({ mozjpeg: true }).toFile(paths.thumb+name+'.jpg').then(() => {
					try { unlinkSync(paths.tmp+name+'.png') } catch(err) {}
					if (dl) {
						i = this.ids.indexOf(index)
						if (i >= 0) try { this.dls[i].span.innerText = FormatBytes(statSync(save_path).size) } catch(err) {
							this.dls[i].span.setAttribute('l', 'finish')
							this.dls[i].span.innerText = Language('finish')
						}
					}
					finished()
				}).catch(err => {
					console.error(err)
					try { unlinkSync(paths.tmp+name+'.png') } catch(err) {}
					if (dl) {
						i = this.ids.indexOf(index)
						if (i >= 0) try { this.dls[i].span.innerText = FormatBytes(statSync(save_path).size) } catch(err) {
							this.dls[i].span.setAttribute('l', 'finish')
							this.dls[i].span.innerText = Language('finish')
						}
					}
					finished()
				})
			})
		}

		const loaded_img = new Image()
		let sharp_resize
		switch(format) {
			case 'jpg':
				save_path += 'jpg'
				if (!dl) {
					db.post[index][3] = 'jpg'
					if (db.post[index][9] != null) db.post[index][9] = null
				}
				loaded_img.onload = () => {
					sharp_resize = this.GetResizeAspect(loaded_img.naturalWidth, loaded_img.naturalHeight, this.maximum_pixel)
					sharp(path, { limitInputPixels: false }).resize(sharp_resize).jpeg({ mozjpeg: true }).toFile(save_path).then(() => {
						if (dl) {
							i = this.ids.indexOf(index)
							if (i < 0) return
						}
						const opt_size = statSync(save_path).size
						let dl_size
						if (dl) dl_size = this.dls[i].dl_size
						else dl_size = statSync(path).size
						if (dl_size < opt_size) {
							try {
								unlinkSync(save_path)
								renameSync(path, save_path)
							} catch(err) { console.error(err) }
							if (dl) this.dls[i].span.innerText = FormatBytes(dl_size)
							else loading.Change(null, FormatBytes(dl_size))
						} else {
							try { unlinkSync(path) } catch(err) {}
							if (dl) this.dls[i].span.innerText = FormatBytes(dl_size)+' To '+FormatBytes(opt_size)
							else loading.Change(null, FormatBytes(dl_size)+' To '+FormatBytes(opt_size))
						}
						sharp(save_path, { limitInputPixels: false }).resize(225, 225).jpeg({ mozjpeg: true }).toFile(paths.thumb+save+'.jpg').then(() => finished()).catch(err => {
							console.error(err)
							finished()
						})
					}).catch(err => {
						console.error(err)
						try { unlinkSync(path) } catch(err) {}
						if (dl) {
							i = this.ids.indexOf(index)
							if (i >= 0) {
								this.dls[i].span.setAttribute('l', 'finish')
								this.dls[i].span.innerText = Language('finish')
							}
						}
						finished()
					})
				}
				loaded_img.onerror = err => {
					console.error(err)
					try { unlinkSync(path) } catch(err) {}
					if (dl) {
						i = this.ids.indexOf(index)
						if (i >= 0) {
							this.dls[i].span.setAttribute('l', 'finish')
							this.dls[i].span.innerText = Language('finish')
						}
					}
					finished()
				}
				loaded_img.src = path
				return
			case 'png':
				if (!dl && db.post[index][9] != null) db.post[index][9] = null
				loaded_img.onload = () => {
					sharp_resize = this.GetResizeAspect(loaded_img.naturalWidth, loaded_img.naturalHeight, this.maximum_pixel)
					sharp(path, { limitInputPixels: false }).resize(sharp_resize).webp({ quality: 100 }).toFile(save_path+'webp').then(() => {
						if (dl) {
							i = this.ids.indexOf(index)
							if (i < 0) return
						}
						const opt_size = statSync(save_path+'webp').size
						let dl_size
						if (dl) dl_size = this.dls[i].dl_size
						else dl_size = statSync(path).size
						if (dl_size < opt_size) {
							try {
								unlinkSync(save_path+'webp')
								renameSync(path, save_path+'png')
							} catch(err) { console.error(err) }
							if (dl) this.dls[i].span.innerText = FormatBytes(dl_size)
							else {
								format = 'png'
								db.post[index][3] = 'png'
								loading.Change(null, FormatBytes(dl_size))
							}
						} else {
							try { unlinkSync(path) } catch(err) {}
							format = 'webp'
							if (dl) {
								this.dls[i].format = 'webp'
								this.dls[i].span.innerText = FormatBytes(dl_size)+' To '+FormatBytes(opt_size)
							} else {
								db.post[index][3] = 'webp'
								loading.Change(null, FormatBytes(dl_size)+' To '+FormatBytes(opt_size))
							}
						}
						sharp(save_path+format, { limitInputPixels: false }).resize(225, 225).jpeg({ mozjpeg: true }).toFile(paths.thumb+save+'.jpg').then(() => finished()).catch(err => {
							console.error(err)
							finished()
						})
					}).catch(err => {
						console.error(err)
						try { unlinkSync(path) } catch(err) {}
						if (dl) {
							i = this.ids.indexOf(index)
							if (i >= 0) {
								this.dls[i].span.setAttribute('l', 'finish')
								this.dls[i].span.innerText = Language('finish')
							}
						}
						finished()
					})
				}
				loaded_img.onerror = err => {
					console.error(err)
					try { unlinkSync(path) } catch(err) {}
					if (dl) {
						i = this.ids.indexOf(index)
						if (i >= 0) {
							this.dls[i].span.setAttribute('l', 'finish')
							this.dls[i].span.innerText = Language('finish')
						}
					}
					finished()
				}
				loaded_img.src = path
				return
			case 'webp':
				save_path += 'webp'
				if (!dl) {
					db.post[index][3] = 'webp'
					if (db.post[index][9] != null) db.post[index][9] = null
				}
				loaded_img.onload = () => {
					sharp_resize = this.GetResizeAspect(loaded_img.naturalWidth, loaded_img.naturalHeight, this.maximum_pixel)
					sharp(path, { limitInputPixels: false }).resize(sharp_resize).webp({ quality: 100 }).toFile(save_path).then(() => {
						if (dl) {
							i = this.ids.indexOf(index)
							if (i < 0) return
						}
						const opt_size = statSync(save_path).size
						let dl_size
						if (dl) dl_size = this.dls[i].dl_size
						else dl_size = statSync(path).size
						if (dl_size < opt_size) {
							try {
								unlinkSync(save_path)
								renameSync(path, save_path)
							} catch(err) { console.error(err) }
							if (dl) this.dls[i].span.innerText = FormatBytes(dl_size)
							else loading.Change(null, FormatBytes(dl_size))
						} else {
							try { unlinkSync(path) } catch(err) {}
							if (dl) this.dls[i].span.innerText = FormatBytes(dl_size)+' To '+FormatBytes(opt_size)
							else loading.Change(null, FormatBytes(dl_size)+' To '+FormatBytes(opt_size))
						}
						sharp(save_path, { limitInputPixels: false }).resize(225, 225).jpeg({ mozjpeg: true }).toFile(paths.thumb+save+'.jpg').then(() => finished()).catch(err => {
							console.error(err)
							finished()
						})
					}).catch(err => {
						console.error(err)
						try { unlinkSync(path) } catch(err) {}
						if (dl) {
							i = this.ids.indexOf(index)
							if (i >= 0) {
								this.dls[i].span.setAttribute('l', 'finish')
								this.dls[i].span.innerText = Language('finish')
							}
						}
						finished()
					})
				}
				loaded_img.onerror = err => {
					console.error(err)
					try { unlinkSync(path) } catch(err) {}
					if (dl) {
						i = this.ids.indexOf(index)
						if (i >= 0) {
							this.dls[i].span.setAttribute('l', 'finish')
							this.dls[i].span.innerText = Language('finish')
						}
					}
					finished()
				}
				loaded_img.src = path
				return
			case 'gif':
				if (dl) this.dls[i].animated = true
				else db.post[index][9] = '0'
				loaded_img.onload = () => {
					sharp_resize = this.GetResizeAspect(loaded_img.naturalWidth, loaded_img.naturalHeight, this.maximum_pixel)
					sharp(path, { limitInputPixels: false, animated: true }).resize(sharp_resize).webp().toFile(save_path+'webp').then(() => {
						if (dl) {
							i = this.ids.indexOf(index)
							if (i < 0) return
						}
						const opt_size = statSync(save_path+'webp').size
						let dl_size
						if (dl) dl_size = this.dls[i].dl_size
						else dl_size = statSync(path).size
						if (dl_size < opt_size) {
							try {
								unlinkSync(save_path+'webp')
								renameSync(path, save_path+'gif')
							} catch(err) { console.error(err) }
							if (dl) this.dls[i].span.innerText = FormatBytes(dl_size)
							else {
								db.post[index][3] = 'gif'
								loading.Change(null, FormatBytes(dl_size))
							}
						} else {
							try { unlinkSync(path) } catch(err) {}
							format = 'webp'
							if (dl) {
								this.dls[i].format = 'webp'
								this.dls[i].span.innerText = FormatBytes(dl_size)+' To '+FormatBytes(opt_size)
							} else {
								db.post[index][3] = 'webp'
								loading.Change(null, FormatBytes(dl_size)+' To '+FormatBytes(opt_size))
							}
						}
						sharp(save_path+format, { limitInputPixels: false }).resize(225, 225).jpeg({ mozjpeg: true }).toFile(paths.thumb+save+'.jpg').then(() => finished()).catch(err => {
							console.error(err)
							finished()
						})
					}).catch(err => {
						console.error(err)
						try { unlinkSync(path) } catch(err) {}
						if (dl) {
							i = this.ids.indexOf(index)
							if (i >= 0) {
								this.dls[i].span.setAttribute('l', 'finish')
								this.dls[i].span.innerText = Language('finish')
							}
						}
						finished()
					})
				}
				loaded_img.onerror = err => {
					console.error(err)
					try { unlinkSync(path) } catch(err) {}
					if (dl) {
						i = this.ids.indexOf(index)
						if (i >= 0) {
							this.dls[i].span.setAttribute('l', 'finish')
							this.dls[i].span.innerText = Language('finish')
						}
					}
					finished()
				}
				loaded_img.src = path
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

	ReDownload(src, i) {
		let total_size = 0, dl_size = 0
		const tmp = paths.tmp+db.post[i][2]+'.'+LastChar('?', LastChar('.', src), true)

		loading.Forward('Getting Response...')
		const dl = new Download(src, tmp)

		dl.OnError(err => {
			console.error(err)
			loading.Close()
			KeyManager.stop = false
			PopAlert(Language('dlc'), 'danger')
		})

		dl.OnComplete(filename => {
			this.Optimize(filename, paths.dl+db.post[i][2]+'.', i, db.post[i][2], false)
		})

		dl.OnResponse(resp => {
			const bytes = parseInt(resp.headers['content-length'])
			total_size = FormatBytes(bytes)
			loading.Forward('0 / '+total_size)
		})
		
		dl.OnData(data => {
			dl_size += data
			loading.Change(null, FormatBytes(dl_size)+' / '+total_size)
		})

		dl.Start()
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

	CancelAll(callback) {
		for (let i = 0, l = this.dls.length; i < l; i++) {
			try {
				if (this.dls[i].dl != null) this.dls[i].dl.Stop()
				const site = this.dls[i].site, id = this.dls[i].id
				const order = this.dl_order.indexOf(this.ids[i])
				if (order >= 0) this.dl_order.splice(order, 1)
				this.dls[i].container.remove()
				this.ids.splice(i, 1)
				this.dls.splice(i, 1)
				browser.ChangeButtonsToDownloading(site, id, true)
			} catch(err) {}
		}
		if (typeof callback == 'function') callback()
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