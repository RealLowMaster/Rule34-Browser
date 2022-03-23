function Icon(name) {
	name = name || null
	if (name == null) return null
	name = name.replace(/\s\s+/g, '-').replace(/ /g, '-').replace(/'/g, '').replace(/"/g, '').replace(/\\/g, '').toLowerCase()
	if (icons.hasOwnProperty(name) == false) return null
	let html = `<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icons[name][0]} ${icons[name][1]}" style="width:${icons[name][0] / icons[name][1] * 16 * 0.0625}em"><path fill="currentColor" d="${icons[name][2]}"></path></svg>`
	return html
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
		document.documentElement.style.setProperty('--diro', 'ltr')
		for (let i = 0, l = dr.length; i < l; i++) dr[i].setAttribute('rtl','')
		for (let i = 0, l = dro.length; i < l; i++) dro[i].removeAttribute('rtl')
	} else {
		document.documentElement.style.setProperty('--dir', 'ltr')
		document.documentElement.style.setProperty('--diro', 'rtl')
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