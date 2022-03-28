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
		this.#file = fs.createWriteStream(this.#savepath)
		this.#stream = request(this.#url, { followRedirect:true, followAllRedirects:true })
		this.#stream.pipe(this.#file)
		this.#stream.on('error', err => {
			this.#file.close()
			try { fs.unlinkSync(this.#savepath) } catch(e) {}
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
		try {
			fs.unlinkSync(this.#savepath)
		} catch(err) { console.error('StopingDownload->'+err) }
	}
}

class DownloadManager {
	constructor() {
		this.ids = []
		this.dls = []
		this.dl_order = []

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
		this.ids[i] = `${new Date().getTime()}-${Math.floor(Math.random() * 999)}`
		this.dls[i] = {
			site: site,
			id: id
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
	
	Add(i, thumb, list, data) {
		i = this.ids.indexOf(i)
		if (i < 0) return
		this.dls[i].dl_list = list
		this.dls[i].data = data
		
		const container = document.createElement('div')

	}

	Download(index) {
		index = this.ids.indexOf(index)
		if (index < 0) return
	}

	TogglePause(i) {}

	PauseAll() {}

	ResumeAll() {}

	Cancel(i) {}

	CancelAll() {}

	OpenPanel() {}

	ClosePanel() {}
}

const downloader = new DownloadManager()