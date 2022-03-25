const defaultSetting = {
	theme: 0,
	language: 0,
	animations: true,
	not: true,
	not_sound: true,
	dl_path: null,
	full_screen: false,
	developer_mode: false
}

// [ 'setting name', 'translate name', 'translate tip' || null ]
const sto_checkbox = [
	['animations', 'animations', 'animationstip'],
	['not', 'notifications', 'nottip'],
	['not_sound', 'notsound', 'notsoundtip'],
	['full_screen', 'fullscreen', 'fullscreentip'],
	['developer_mode', 'devmode', 'devmodetip']
]

// [ 'setting name', 'translate name', [index = 0 => value 1, index = 1 => value 2, etc ...] ]
const sto_radio = [
	['theme', 'theme', ['dark', 'light']],
	['language', 'language', ['english', 'persian']]
]

// [ 'setting name', 'translate name', min, max ]
const sto_range = []

// [ 'setting name', isFolder, 'title' || null ]
const sto_dialog = [
	['dl_path', true, 'dl_path']
]

// [ 'setting name', 'translate name'. [ 'translate name', 'translate name', etc... ] ]
const sto_select = []

let setting
function LoadSettings() {
	if (existsSync(dirDocument+'/setting.json')) setting = jsonfile.readFileSync(dirDocument+'/setting.json').a
	else {
		setting = defaultSetting
		jsonfile.writeFileSync(dirDocument+'/setting.json',{a:setting})
	}

	if (setting == null) {
		console.error(setting)
		console.error('Could not cache settings')
		setting = defaultSetting
		jsonfile.writeFileSync(dirDocument+'/setting.json',{a:setting})
	}

	for (let i = 0; i < sto_checkbox.length; i++) {
		if (typeof setting[sto_checkbox[i][0]] != 'boolean') setting[sto_checkbox[i][0]] = defaultSetting[sto_checkbox[i][0]]

		const sto_id = 'sto_'+sto_checkbox[i][0]
		const working_element = document.getElementById(sto_id) || null
		if (working_element == null) continue
		working_element.setAttribute('class', 'sto-checkbox')
		working_element.removeAttribute('id')

		let html = `<div><label for="${sto_id}" l="${sto_checkbox[i][1]}"></label><input type="checkbox" id="${sto_id}"></div>`
		if (sto_checkbox[i][2] != null) html += `<p l="${sto_checkbox[i][2]}"></p>`
		working_element.innerHTML = html
	}

	for (let i = 0; i < sto_radio.length; i++) {
		if (typeof setting[sto_radio[i][0]] != 'number') setting[sto_radio[i][0]] = defaultSetting[sto_radio[i][0]]
		else if (setting[sto_radio[i][0]] < 0) setting[sto_radio[i][0]] = 0
		else if (setting[sto_radio[i][0]] >= sto_radio[i][2].length) setting[sto_radio[i][0]] = sto_radio[i][2].length - 1

		const working_element = document.getElementById('sto_'+sto_radio[i][0]) || null
		if (working_element == null) continue
		working_element.setAttribute('class', 'sto-radio')

		let html = `<p l="${sto_radio[i][1]}"></p>`
		for (let j = 0; j < sto_radio[i][2].length; j++) html += `<div onclick="RadioRow(this)" value="${j}" l="${sto_radio[i][2][j]}"></div>`
		working_element.innerHTML = html
	}

	for (let i = 0; i < sto_range.length; i++) {
		if (typeof setting[sto_range[i][0]] != 'number') setting[sto_range[i][0]] = defaultSetting[sto_range[i][0]]
		else if (setting[sto_range[i][0]] < sto_range[i][2]) setting[sto_range[i][0]] = sto_range[i][2]
		else if (setting[sto_range[i][0]] > sto_range[i][3]) setting[sto_range[i][0]] = sto_range[i][3]

		const sto_id = 'sto_'+sto_range[i][0]
		const working_element = document.getElementById(sto_id) || null
		if (working_element == null) continue
		working_element.setAttribute('class', 'sto-range')
		working_element.removeAttribute('id')
		const value = setting[sto_range[i][0]], min = sto_range[i][2], max = sto_range[i][3]
		working_element.innerHTML = `<p l="${sto_range[i][1]}"></p><input type="range" min="${min}" max="${max}" value="${value}" oninput="OnRangeInput(this)" id="${sto_id}"><div style="left:${((value - min) * 100) / (max - min)}%"><div></div><div>${value}</div></div>`
	}

	for (let i = 0; i < sto_dialog.length; i++) {
		if (typeof setting[sto_dialog[i][0]] != 'string') setting[sto_dialog[i][0]] = defaultSetting[sto_dialog[i][0]]

		const sto_id = 'sto_'+sto_dialog[i][0]
		const working_element = document.getElementById(sto_id) || null
		if (working_element == null) continue
		working_element.setAttribute('class', 'sto-dialog')
		working_element.removeAttribute('id')
		let html = '<button type="button" class="btn btn-primary" onclick="OpenUploadFile(this, '
		if (sto_dialog[i][1]) html += 'true)" l="openfolder">'
		else html += 'false)" l="openfile">'
		html += `</button><p id="${sto_id}" title="${setting[sto_dialog[i][0]]}">${setting[sto_dialog[i][0]]}</p>`
		working_element.innerHTML = html
	}

	ChangeScreenMode(setting.full_screen, false)

	// Place For Custom Statments

	window.addEventListener('keydown', e => {
		if (e.ctrlKey && e.shiftKey && e.which == 73 && setting.developer_mode == true) remote.getCurrentWebContents().toggleDevTools()
	})

	document.getElementById('setting-tabs').getElementsByTagName('button')[0].click()
	ApplySetting()
	ApplyTheme(setting.theme)
	if (setting.animations) document.body.classList.remove('no-animation')
	else document.body.classList.add('no-animation')
}

function OpenSettings() {
	document.getElementById('setting-window').style.display = 'flex'
	KeyManager.ChangeCategory('setting')
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
	const slider = who.parentElement.children[2], value = who.value, min = who.min
	slider.style.left = ((value - min) * 100) / (who.max - min) + '%'
	slider.children[1].innerText = value
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

	try { jsonfile.writeFileSync(dirDocument+'/setting.json',{a:setting}) } catch(err) {
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
		if (setting.theme != prev_setting.theme) ApplyTheme(setting.theme)
		if (setting.language != prev_setting.language) ApplyLanguage(setting.language)
		if (setting.full_screen != prev_setting.full_screen) ChangeScreenMode(setting.full_screen, false)
	}
}