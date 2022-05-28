let UpdateScript = {
    checked: false,
    timer: null,
	updating: false
}

function CheckScriptUpdate() {
	clearTimeout(UpdateScript.timer)
	if (window.navigator.onLine) {
		fetch('https://api.npoint.io/bbd08230ff7db7e634de', { method: "GET" }).then(res => {
			if (!res.ok) {
				console.error('GetUpdate->'+res.status)
				UpdateScript.timer = setTimeout(CheckScriptUpdate, 4000)
				return
			}
			return res.json()
		}).then(json => {
			if (json.app_version > app_version) {
				UpdateScript.checked = true
				Alert(Language('new-version-available'))
			} else if (json.update_number > update_number) Update(json)
			else {
				UpdateScript.checked = true
				PopAlert(Language('app-up-to-date'))
			}
		}).catch(err => {
			console.error(err)
			UpdateScript.timer = setTimeout(CheckScriptUpdate, 4000)
		})
	} else UpdateScript.timer = setTimeout(CheckScriptUpdate, 4000)
}

function Update(json) {
	UpdateScript.updating = true
	loading.Show(2, Language('updating')+'...')
	downloader.CancelAll(() => {
		const dl = new Download(json.script_url, paths.tmp+'update.zip')
		const info = {
			total: 0,
			total_string: '',
			dl: 0
		}

		dl.OnError(err => {
			console.error(err)
			loading.Close()
			UpdateScript.updating = false
			Alert(Language('update-err'))
		})

		dl.OnResponse(res => {
			info.total = parseInt(res.headers['content-length'])
			info.total_string = FormatBytes(info.total)
			loading.Show(info.total, '0 / '+info.total_string)
		})

		dl.OnData(data => {
			info.dl += data
			loading.Change(info.dl, FormatBytes(info.dl)+' / '+info.total_string)
		})

		dl.OnComplete(filename => {
			const StreamZip = require('node-stream-zip'), path = require('path')
			loading.Show(1, Language('extract-update')+'...')
			const zip = new StreamZip.async({ file: filename })

			zip.on('error', err => {
				console.error(err)
				loading.Close()
				UpdateScript.updating = false
				Alert(Language('ext-update-err')+' -> '+err)
			})

			zip.entries().then(async entries => {
				for (const entry of Object.values(entries)) {
					if (entry.isDirectory) continue
					const pathname = path.resolve(__dirname, entry.name)
		
					try {
						mkdirSync(
							path.dirname(pathname),
							{ recursive: true }
						)
						await zip.extract(entry.name, pathname)
					} catch(err) { console.error(err) }
				}

				try { zip.close() } catch(err) { console.error(err) }
				try { unlinkSync(filename) } catch(err) { console.error(err) }

				loading.Forward(Language('update-completed'))
				UpdateScript.updating = false
				setTimeout(() => {
					try {
						remote.app.relaunch()
						remote.app.exit(0)
					} catch(err) {
						console.error(err)
						loading.Change(1, Language('update-relaunch-err')+'...')
						setTimeout(() => {
							ThisWindow.removeAllListeners()
							remote.app.quit()
						}, 1500)
					}
				}, 3000)
			}).catch(err => {
				console.error(err)
				loading.Close()
				UpdateScript.updating = false
				Alert(Language('update-corrupt'))
			})
		})
		dl.Start()
	})
}