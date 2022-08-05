function Icon(name, element = false) {
	name = name || null
	if (name == null) return null
	name = name.replace(/\s\s+/g, '-').replace(/ /g, '-').replace(/'/g, '').replace(/"/g, '').replace(/\\/g, '').toLowerCase()
	if (icons.hasOwnProperty(name) == false) return null
	if (element) {
		element = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		element.ariaHidden = true
		element.setAttribute('focusable', false)
		element.setAttribute('role', 'img')
		element.viewBox.baseVal.width = icons[name][0]
		element.viewBox.baseVal.height = icons[name][1]
		element.style.width = icons[name][0] / icons[name][1] * 16 * 0.0625+'em'
		const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		p.setAttribute('fill', 'currentColor')
		p.setAttribute('d', icons[name][2])
		element.appendChild(p)
		return element
	} else {
		return `<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icons[name][0]} ${icons[name][1]}" style="width:${icons[name][0] / icons[name][1] * 16 * 0.0625}em"><path fill="currentColor" d="${icons[name][2]}"></path></svg>`
	}
}

function ApplyIcons() {
	const tags = document.querySelectorAll('[ic]')

	for (let i = 0; i < tags.length; i++) {
		let n = tags[i].getAttribute('ic') || null
		if (n == null) continue
		n = n.replace(/\s\s+/g, '-').replace(/ /g, '-').replace(/'/g, '').replace(/"/g, '').replace(/\\/g, '').toLowerCase()
		if (!icons.hasOwnProperty(n)) continue
		let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.ariaHidden = true
		svg.setAttribute('focusable', false)
		svg.setAttribute('role', 'img')
		svg.setAttribute('viewBox', '0 0 '+icons[n][0]+' '+icons[n][1])
		svg.innerHTML = `<path fill="currentColor" d="${icons[n][2]}"></path>`
		svg.style.width = (icons[n][0] / icons[n][1] * 16 * 0.0625) + "em"

		tags[i].parentElement.insertBefore(svg, tags[i])
		tags[i].remove()
	}
}

function ApplyTheme(index) {
	const style = document.documentElement.style
	for (let i = 0, l = theme_structures.length; i < l; i++) style.setProperty('--'+theme_structures[i], theme_values[index][i])
}

function ApplyLanguage(index) {
	const dr = document.querySelectorAll('[dr]')
	const dro = document.querySelectorAll('[dro]')
	if (language_options[index][0]) {
		document.documentElement.style.setProperty('--dir', 'rtl')
		document.documentElement.style.setProperty('--align', 'right')
		document.documentElement.style.setProperty('--diro', 'ltr')
		document.documentElement.style.setProperty('--aligno', 'left')
		for (let i = 0, l = dr.length; i < l; i++) dr[i].setAttribute('rtl','')
		for (let i = 0, l = dro.length; i < l; i++) dro[i].removeAttribute('rtl')
	} else {
		document.documentElement.style.setProperty('--dir', 'ltr')
		document.documentElement.style.setProperty('--align', 'left')
		document.documentElement.style.setProperty('--diro', 'rtl')
		document.documentElement.style.setProperty('--aligno', 'right')
		for (let i = 0, l = dr.length; i < l; i++) dr[i].removeAttribute('rtl')
		for (let i = 0, l = dro.length; i < l; i++) dro[i].setAttribute('rtl','')
	}

	let t_text = [...document.querySelectorAll('[l]')]
	let t_title = [...document.querySelectorAll('[lt]')]
	let t_placeholder = [...document.querySelectorAll('[lp]')]

	while (t_text.length > 0) {
		const val = t_text[0].getAttribute('l').replace(/\s\s+/g, '-').replace(/ /g, '-').toLowerCase()
		for (let i = 0, l = language_structures.length; i < l; i++) if (language_structures[i] == val) {
			t_text[0].innerText = language_values[index][i]
			break
		}
		t_text.shift()
	}

	while (t_title.length > 0) {
		const val = t_title[0].getAttribute('lt').replace(/\s\s+/g, '-').replace(/ /g, '-').toLowerCase()
		for (let i = 0, l = language_structures.length; i < l; i++) if (language_structures[i] == val) {
			t_title[0].setAttribute('title', language_values[index][i])
			break
		}
		t_title.shift()
	}

	while (t_placeholder.length > 0) {
		const val = t_placeholder[0].getAttribute('lp').replace(/\s\s+/g, '-').replace(/ /g, '-').toLowerCase()
		for (let i = 0, l = language_structures.length; i < l; i++) if (language_structures[i] == val) {
			t_placeholder[0].setAttribute('placeholder', language_values[index][i])
			break
		}
		t_placeholder.shift()
	}
}

function Language(word) {
	if (typeof word !== 'string' || word.replace(/ /g, '').length == 0) throw "Word Should Be an String!"
	word = word.replace(/\s\s+/g, '-').replace(/ /g, '-').replace(/'/g, '').replace(/"/g, '').toLowerCase()
	for (let i = 0, l = language_structures.length; i < l; i++) if (language_structures[i] == word) {
		return language_values[setting.language][i]
	}
	return null
}

const release_notes = {
	open: false,
	main: null,
}

function OpenReleaseNote() {
	if (release_notes.open || !existsSync(__dirname+'/rn.json')) return
	loading.Show(1, '...')
	KeyManager.stop = true
	let data = null
	try {
		data = jsonfile.readFileSync(__dirname+'/rn.json')
	} catch(err) {
		console.error(err)
		data = null
	}

	if (data == null) {
		KeyManager.stop = false
		loading.Close()
		PopAlert(Language('release-not-load'), 'danger')
	}
	
	release_notes.main = document.createElement('div')
	release_notes.main.id = 'release-notes'
	let save = document.createElement('h1'), save2, save3
	save.innerText = 'Release Notes '+data.version
	release_notes.main.appendChild(save)
	
	save = document.createElement('h2')
	save.innerText = "🚀 What's New"
	release_notes.main.appendChild(save)
	
	if (data.new != null) {
		save = document.createElement('h3')
		save.innerText = '🔥 New Features'
		release_notes.main.appendChild(save)
		save = document.createElement('ul')
		for (let i = 0, l = data.new.length; i < l; i++) {
			save2 = document.createElement('li')
			save3 = document.createElement('span')
			save3.innerText = data.new[i]
			save2.appendChild(save3)
			save.appendChild(save2)
		}
		release_notes.main.appendChild(save)
	}

	if (data.bug != null) {
		save = document.createElement('h3')
		save.innerText = '🔧 Bug Fixes'
		release_notes.main.appendChild(save)
		save = document.createElement('ul')
		for (let i = 0, l = data.bug.length; i < l; i++) {
			save2 = document.createElement('li')
			save3 = document.createElement('span')
			save3.innerText = data.bug[i]
			save2.appendChild(save3)
			save.appendChild(save2)
		}
		release_notes.main.appendChild(save)
	}

	if (data.improvement != null) {
		save = document.createElement('h3')
		save.innerText = '🌟 Improvements'
		release_notes.main.appendChild(save)
		save = document.createElement('ul')
		for (let i = 0, l = data.improvement.length; i < l; i++) {
			save2 = document.createElement('li')
			save3 = document.createElement('span')
			save3.innerText = data.improvement[i]
			save2.appendChild(save3)
			save.appendChild(save2)
		}
		release_notes.main.appendChild(save)
	}

	if (data.plan != null) {
		save = document.createElement('h3')
		save.innerText = '🚢 Plans'
		release_notes.main.appendChild(save)
		save = document.createElement('ul')
		for (let i = 0, l = data.plan.length; i < l; i++) {
			save2 = document.createElement('li')
			save3 = document.createElement('span')
			save3.innerText = data.plan[i]
			save2.appendChild(save3)
			save.appendChild(save2)
		}
		release_notes.main.appendChild(save)
	}

	save = document.createElement('div')
	if (setting.seen_release === update_number) {
		save2 = document.createElement('div')
		save2.innerText = Language('close')
		save2.onclick = () => CloseReleaseNote(false)
		save.appendChild(save2)
	} else {
		save2 = document.createElement('div')
		save2.innerText = Language('show-this-later')
		save2.onclick = () => CloseReleaseNote(false)
		save.appendChild(save2)
		save2 = document.createElement('div')
		save2.innerText = Language('i-undrestand')
		save2.onclick = () => CloseReleaseNote(true)
		save.appendChild(save2)
	}
	release_notes.main.appendChild(save)

	document.getElementById('window-body').appendChild(release_notes.main)
	loading.Close()
}

function CloseReleaseNote(save) {
	if (save) {
		setting.seen_release = update_number
		try { jsonfile.writeFileSync(dirDocument+'/setting.json',setting) } catch(err) { console.error(err) }
	}
	try { release_notes.main.remove() } catch(err) { console.error(err) }
	release_notes.main = null
	release_notes.open = false
	KeyManager.stop = false
}