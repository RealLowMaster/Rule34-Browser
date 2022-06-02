const defaultSetting = {
	r34_xxx_original_size: false,
	// Default
	theme: 0,
	language: 0,
	animations: true,
	not: true,
	not_sound: true,
	pic_per_page: 30,
	dl_path: null,
	dl_limit: 5,
	default_volume: 100,
	maximum_pixel: 2,
	seen_release: update_number - 1,
	full_screen: true,
	developer_mode: false
}

// [ 'setting name', 'translate name', 'translate tip' || null ]
const sto_checkbox = [
	['r34_xxx_original_size', 'originalsize', 'originalsizetip'],
	['animations', 'animations', 'animationstip'],
	['not', 'notifications', 'nottip'],
	['not_sound', 'notsound', 'notsoundtip'],
	['full_screen', 'fullscreen', 'fullscreentip'],
	['developer_mode', 'devmode', 'devmodetip']
]

// [ 'setting name', 'translate name', [index = 0 => value 1, index = 1 => value 2, etc ...] ]
const sto_radio = [
	['theme', 'theme', ['dark', 'light']],
	['language', 'language', ['english', 'persian']],
	['maximum_pixel', 'maximumpixel', ['mpvlow', 'mplow', 'mpmid', 'mphigh', 'mpvhigh']]
]

// [ 'setting name', 'translate name', min, max, 'translate tip' || null ]
const sto_range = [
	['seen_release', null, -1, update_number],
	['pic_per_page', 'picperpage', 1, 120],
	['default_volume', 'defaultvolume', 0, 100],
	['dl_limit', 'dllimit', 1, 20, 'dllimittip'],
	['pixel_limit', 'pixellimit', 1000, 18200, 'pixellimittip']
]

// [ 'setting name', isFolder, 'title' || null ]
const sto_dialog = [
	['dl_path', true, 'dl_path']
]

// [ 'setting name', 'translate name'. [ 'translate name', 'translate name', etc... ] ]
const sto_select = []

let setting
function LoadSettings() {
	if (existsSync(dirDocument+'/setting.json')) try { setting = jsonfile.readFileSync(dirDocument+'/setting.json') } catch(err) {
		console.error(err)
		setting = defaultSetting
		try { jsonfile.writeFileSync(dirDocument+'/setting.json',setting) } catch(err) { console.error(err) }
	} else {
		setting = defaultSetting
		try { jsonfile.writeFileSync(dirDocument+'/setting.json',setting) } catch(err) { console.error(err) }
	}

	if (setting == null || typeof setting !== 'object') {
		console.error(setting)
		console.error('Could not cache settings')
		setting = defaultSetting
		try { jsonfile.writeFileSync(dirDocument+'/setting.json',setting) } catch(err) { console.error(err) }
	}

	let changed = false, save, save2, save3
	for (let i = 0; i < sto_checkbox.length; i++) {
		if (typeof setting[sto_checkbox[i][0]] != 'boolean') {
			setting[sto_checkbox[i][0]] = defaultSetting[sto_checkbox[i][0]]
			changed = true
		}

		const sto_id = 'sto_'+sto_checkbox[i][0]
		const working_element = document.getElementById(sto_id) || null
		if (working_element == null) continue
		working_element.setAttribute('class', 'sto-checkbox')
		working_element.removeAttribute('id')

		save = document.createElement('div')
		save2 = document.createElement('label')
		save2.setAttribute('for', sto_id)
		save2.setAttribute('l', sto_checkbox[i][1])
		save.appendChild(save2)
		save2 = document.createElement('input')
		save2.type = 'checkbox'
		save2.id = sto_id
		save.appendChild(save2)
		working_element.appendChild(save)
		if (sto_checkbox[i][2] != null) {
			save = document.createElement('p')
			save.setAttribute('l', sto_checkbox[i][2])
			working_element.appendChild(save)
		}
	}

	for (let i = 0; i < sto_radio.length; i++) {
		if (typeof setting[sto_radio[i][0]] != 'number') {
			setting[sto_radio[i][0]] = defaultSetting[sto_radio[i][0]]
			changed = true
		} else if (setting[sto_radio[i][0]] < 0) {
			setting[sto_radio[i][0]] = 0
			changed = true
		} else if (setting[sto_radio[i][0]] >= sto_radio[i][2].length) {
			setting[sto_radio[i][0]] = sto_radio[i][2].length - 1
			changed = true
		}

		const working_element = document.getElementById('sto_'+sto_radio[i][0]) || null
		if (working_element == null) continue
		working_element.setAttribute('class', 'sto-radio')

		save = document.createElement('p')
		save.setAttribute('l', sto_radio[i][1])
		working_element.appendChild(save)
		for (let j = 0; j < sto_radio[i][2].length; j++) {
			save = document.createElement('div')
			save.setAttribute('l', sto_radio[i][2][j])
			save.setAttribute('onclick', 'RadioRow(this)')
			save.setAttribute('value', j)
			working_element.appendChild(save)
		}
	}

	for (let i = 0; i < sto_range.length; i++) {
		if (typeof setting[sto_range[i][0]] != 'number') {
			setting[sto_range[i][0]] = defaultSetting[sto_range[i][0]]
			changed = true
		} else if (setting[sto_range[i][0]] < sto_range[i][2]) {
			setting[sto_range[i][0]] = sto_range[i][2]
			changed = true
		} else if (setting[sto_range[i][0]] > sto_range[i][3]) {
			setting[sto_range[i][0]] = sto_range[i][3]
			changed = true
		}

		const sto_id = 'sto_'+sto_range[i][0]
		const working_element = document.getElementById(sto_id) || null
		if (working_element == null) continue
		working_element.setAttribute('class', 'sto-range')
		working_element.removeAttribute('id')
		const value = setting[sto_range[i][0]], min = sto_range[i][2], max = sto_range[i][3]

		save = document.createElement('h6')
		save.setAttribute('l', sto_range[i][1])
		working_element.appendChild(save)
		save = document.createElement('div')
		save2 = document.createElement('input')
		save2.type = 'range'
		save2.min = min
		save2.max = max
		save2.value = value
		save2.setAttribute('oninput', 'OnRangeInput(this)')
		save2.id = sto_id
		save.appendChild(save2)
		save2 = document.createElement('div')
		save2.style.left = ((value - min) * 100) / (max - min)+'%'
		save3 = document.createElement('div')
		save2.appendChild(save3)
		save3 = document.createElement('input')
		save3.type = 'number'
		save3.min = min
		save3.max = max
		save3.value = value
		save3.setAttribute('onfocusout', 'OnRangeChanged(this)')
		save2.appendChild(save3)
		save.appendChild(save2)
		save2 = document.createElement('span')
		save.appendChild(save2)
		working_element.appendChild(save)
		if (sto_range[i][4] != null) {
			save = document.createElement('p')
			save.setAttribute('l', sto_range[i][4])
			working_element.appendChild(save)
		}
	}

	for (let i = 0; i < sto_dialog.length; i++) {
		if (typeof setting[sto_dialog[i][0]] != 'string') {
			setting[sto_dialog[i][0]] = defaultSetting[sto_dialog[i][0]]
			changed = true
		}

		const sto_id = 'sto_'+sto_dialog[i][0]
		const working_element = document.getElementById(sto_id) || null
		if (working_element == null) continue
		working_element.setAttribute('class', 'sto-dialog')
		working_element.removeAttribute('id')

		save = document.createElement('button')
		save.type = 'button'
		save.classList.add('btn')
		save.classList.add('btn-primary')
		if (sto_dialog[i][1]) {
			save.setAttribute('onclick', 'OpenUploadFile(this,true)')
			save.setAttribute('l', 'openfolder')
		} else {
			save.setAttribute('onclick', 'OpenUploadFile(this,false)')
			save.setAttribute('l', 'openfile')
		}
		working_element.appendChild(save)
		save = document.createElement('p')
		save.id = sto_id
		save.title = setting[sto_dialog[i][0]]
		save.innerText = setting[sto_dialog[i][0]]
		working_element.appendChild(save)
	}

	ChangeScreenMode(setting.full_screen, false)
	SettingCustomeCheck()

	window.addEventListener('keydown', e => {
		if (e.ctrlKey && e.shiftKey && e.which == 73 && setting.developer_mode == true) remote.getCurrentWebContents().toggleDevTools()
	})

	document.getElementById('setting-tabs').getElementsByTagName('button')[0].click()
	ApplySetting()
	ApplyTheme(setting.theme)
	if (setting.animations) document.body.classList.remove('no-animation')
	else document.body.classList.add('no-animation')

	if (!existsSync(__dirname+'/rn.json')) {
		document.getElementById('stt-release').style.display = 'none'
		setting.seen_release = null
	}

	if (changed) try { jsonfile.writeFileSync(dirDocument+'/setting.json',setting) } catch(err) { console.error(err) }
}

function SettingCustomeCheck() {
	switch(setting.maximum_pixel) {
		case 0: downloader.maximum_pixel = 1000000; break
		case 1: downloader.maximum_pixel = 9000000; break
		case 2: downloader.maximum_pixel = 36000000; break
		case 3: downloader.maximum_pixel = 144000000; break
		case 4: downloader.maximum_pixel = 225000000; break
	}
}

function OpenSettings() {
	KeyManager.ChangeCategory('setting')
	document.getElementById('setting-window').style.display = 'flex'
	const session = remote.getCurrentWebContents().session
	const cacheSize = document.getElementById('clear-cache-size')
	cacheSize.innerText = ''
	
	const syncing = async() => {
		const size = await session.getCacheSize()
		if (typeof size == 'number') cacheSize.innerText = FormatBytes(size)
	}

	syncing()
}

async function ClearCaches() {
	KeyManager.stop = true
	loading.Show(1, Language('wait')+'...')
	const cacheSize = document.getElementById('clear-cache-size')
	const session = remote.getCurrentWebContents().session
	try { await session.clearCache() } catch(err) { console.error(err) }
	const size = await session.getCacheSize()
	if (typeof size == 'number') cacheSize.innerText = FormatBytes(size)
	else cacheSize.innerText = FormatBytes(0)
	loading.Close()
	KeyManager.stop = false
}

function CloseSetting() {
	KeyManager.BackwardCategory()
	document.getElementById('setting-window').style.display = 'none'
	ApplySetting()
}

function OpenSettingTab(who, tabId) {
	let children = document.getElementById('setting-tabs').children[0].children
	for (let i = 0; i < children.length; i++) children[i].removeAttribute('active')
	who.setAttribute('active', null)
	chilren = document.getElementById('setting-body').children[0].children
	for (let i = 0; i < chilren.length; i++) chilren[i].style.display = 'none'
	document.getElementById(tabId).style.display = 'block'
}

// Radio Row
function RadioRowSelect(id, value) {
	const parent = document.getElementById(id)
	parent.setAttribute('value', value)
	const children = parent.children
	for (let i = 0; i < children.length; i++) {
		children[i].removeAttribute('active')
		if (children[i].getAttribute('value') == value) children[i].setAttribute('active', true)
	}
}

function RadioRow(who) {
	const parent = who.parentElement
	parent.setAttribute('value', who.getAttribute('value'))
	const children = parent.children
	for (let i = 0; i < children.length; i++) children[i].removeAttribute('active')
	who.setAttribute('active', true)
}

// Range
function OnRangeInput(who) {
	const children = who.parentElement.children
	const slider = children[1], value = who.value, min = Number(who.min), percent = ((value - min) * 100) / (Number(who.max) - min) + '%'
	slider.style.left = percent
	slider.children[1].value = value
	children[2].style.width = percent
}

function OnRangeChanged(who) {
	const min = Number(who.min), max = Number(who.max)
	let val = Number(who.value)
	if (val > max) val = max
	else if (val < min) val = min
	const range = who.parentElement.parentElement.children[0]
	range.value = val
	OnRangeInput(range)
}

// Upload File
function OpenUploadFile(who, isFolder, title, callback) {
	who = who || null
	if (title == undefined) {
		if (isFolder) title = Language('choosedirectory')
		else title = Language('choosefile')
	}
	callback = callback || null
	let properties
	if (isFolder) properties = ['openDirectory']
	else properties = ['openFile']
	const choosedDirectory = remote.dialog.showOpenDialogSync({title:title, properties:properties})

	if (choosedDirectory == undefined) {
		if (callback != null) callback('Canceled', null)
	} else {
		if (!existsSync(choosedDirectory[0])) return
		if (who != null) {
			const text = who.parentElement.children[1]
			text.innerText = choosedDirectory[0]
			text.title = choosedDirectory[0]
		}
		if (callback != null) callback(null, choosedDirectory[0])
	}
}

// Save & Apply Settings
function SaveSetting() {
	const prev_setting = {}
	for (let i = 0; i < sto_checkbox.length; i++) {
		prev_setting[sto_checkbox[i][0]] = setting[sto_checkbox[i][0]]
		const element = document.getElementById('sto_'+sto_checkbox[i][0]) || null
		if (element == null) continue
		setting[sto_checkbox[i][0]] = element.checked
	}

	for (let i = 0; i < sto_radio.length; i++) {
		prev_setting[sto_radio[i][0]] = setting[sto_radio[i][0]]
		const element = document.getElementById('sto_'+sto_radio[i][0]) || null
		if (element == null) continue
		setting[sto_radio[i][0]] = Number(element.getAttribute('value'))
	}

	for (let i = 0; i < sto_range.length; i++) {
		prev_setting[sto_range[i][0]] = setting[sto_range[i][0]]
		const element = document.getElementById('sto_'+sto_range[i][0]) || null
		if (element == null) continue
		setting[sto_range[i][0]] = Number(element.value)
	}

	for (let i = 0; i < sto_dialog.length; i++) {
		prev_setting[sto_dialog[i][0]] = setting[sto_dialog[i][0]]
		const element = document.getElementById('sto_'+sto_dialog[i][0]) || null
		if (element == null) continue
		setting[sto_dialog[i][0]] = element.title
	}

	try { jsonfile.writeFileSync(dirDocument+'/setting.json', setting) } catch(err) {
		console.error(err)
		PopAlert('SavingSetting->'+err, 'danger')
	}
	KeyManager.BackwardCategory()
	document.getElementById('setting-window').style.display = 'none'
	ApplySetting(prev_setting)
}

function ApplySetting(prev_setting = null) {
	for (let i = 0; i < sto_checkbox.length; i++) {
		const element = document.getElementById('sto_'+sto_checkbox[i][0]) || null
		if (element == null) continue
		element.checked = setting[sto_checkbox[i][0]]
	}

	for (let i = 0; i < sto_radio.length; i++) {
		const element = document.getElementById('sto_'+sto_radio[i][0]) || null
		if (element == null) continue
		RadioRowSelect('sto_'+sto_radio[i][0], setting[sto_radio[i][0]])
	}

	for (let i = 0; i < sto_range.length; i++) {
		const element = document.getElementById('sto_'+sto_range[i][0]) || null
		if (element == null) continue
		OnRangeInput(element)
	}

	for (let i = 0; i < sto_dialog.length; i++) {
		const element = document.getElementById('sto_'+sto_dialog[i][0]) || null
		if (element == null) continue
		element.innerText = setting[sto_dialog[i][0]]
		element.title = setting[sto_dialog[i][0]]
	}

	// If prev_setting != null => That mean we are Saving Setting (Apply Function Run in CloseSetting() Too)
	if (prev_setting != null) {
		if (setting.animations != prev_setting.animations) {
			if (setting.animations) document.body.classList.remove('no-animation')
			else document.body.classList.add('no-animation')
		}
		if (setting.maximum_pixel != prev_setting.maximum_pixel) switch(setting.maximum_pixel) {
			case 0: downloader.maximum_pixel = 1000000; break
			case 1: downloader.maximum_pixel = 9000000; break
			case 2: downloader.maximum_pixel = 36000000; break
			case 3: downloader.maximum_pixel = 144000000; break
			case 4: downloader.maximum_pixel = 225000000; break
		}
		if (setting.pic_per_page != prev_setting.pic_per_page) browser.SetNeedReload(-1)
		if (setting.theme != prev_setting.theme) ApplyTheme(setting.theme)
		if (setting.language != prev_setting.language) ApplyLanguage(setting.language)
		if (setting.full_screen != prev_setting.full_screen) ChangeScreenMode(setting.full_screen, false)
		if (setting.dl_path != prev_setting.dl_path) PopAlert(Language('restart-for-apply-setting'), 'warning')
	}
}