const lang_manager = {
	open: false,
	main: null,
	language_container: null,
	language_add: null,
	structure_container: null,
	structure_add: null,
	structure_panel: null,

	language_value: null,
	language_structure: null,
	languages: null,
	language_options: null,

	selected: null,
	selected_structure: null,
	editing: null
}

function OpenLanguageManager() {
	if (lang_manager.open) return
	lang_manager.open = true
	KeyManager.stop = true
	lang_manager.language_value = language_values.slice()
	lang_manager.language_structure = language_structures.slice()
	lang_manager.languages = languages.slice()
	lang_manager.language_options = language_options.slice()

	lang_manager.main = document.createElement('div')
	lang_manager.main.classList.add('mg-manager')
	let save = document.createElement('div')
	lang_manager.language_add = document.createElement('div')
	lang_manager.language_add.classList.add('mg-add-panel')
	let save2 = document.createElement('form')
	save2.onsubmit = e => {
		e.preventDefault()
		AddLanguage()
	}
	let save3 = document.createElement('label')
	save3.setAttribute('for', 'lapn')
	save3.innerText = 'Name:'
	save2.appendChild(save3)
	save3 = document.createElement('input')
	save3.type = 'text'
	save3.id = 'lapn'
	save3.setAttribute('placeholder', 'Name...')
	save2.appendChild(save3)
	save3 = document.createElement('label')
	save3.setAttribute('for', 'lapr')
	save3.innerText = 'Right To Left:'
	save2.appendChild(save3)
	save3 = document.createElement('select')
	save3.id = 'lapr'
	let save4 = document.createElement('option')
	save4.value = 0
	save4.innerText = 'False'
	save3.appendChild(save4)
	save4 = document.createElement('option')
	save4.value = 1
	save4.innerText = 'True'
	save3.appendChild(save4)
	save2.appendChild(save3)
	save3 = document.createElement('br')
	save2.appendChild(save3)
	save3 = document.createElement('button')
	save3.classList.add('btn')
	save3.classList.add('btn-primary')
	save3.type = 'submit'
	save3.id = 'lapb'
	save3.innerText = 'Add'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.classList.add('btn')
	save3.classList.add('btn-danger')
	save3.onclick = () => CloseAddLanguage()
	save3.innerText = 'Cancel'
	save2.appendChild(save3)
	lang_manager.language_add.appendChild(save2)
	save.appendChild(lang_manager.language_add)

	lang_manager.structure_add = document.createElement('div')
	lang_manager.structure_add.classList.add('mg-add-struct')
	save2 = document.createElement('form')
	save2.onsubmit = e => {
		e.preventDefault()
		AddLangStructure()
	}
	save3 = document.createElement('label')
	save3.setAttribute('for', 'lasn')
	save3.innerText = 'Name:'
	save2.appendChild(save3)
	save3 = document.createElement('input')
	save3.type = 'text'
	save3.id = 'lasn'
	save3.setAttribute('placeholder', 'Name...')
	save2.appendChild(save3)
	save3 = document.createElement('br')
	save2.appendChild(save3)
	save3 = document.createElement('button')
	save3.classList.add('btn')
	save3.classList.add('btn-primary')
	save3.type = 'submit'
	save3.id = 'lasb'
	save3.innerText = 'Add'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.classList.add('btn')
	save3.classList.add('btn-danger')
	save3.onclick = () => CloseAddLangStructure()
	save3.innerText = 'Cancel'
	save2.appendChild(save3)
	lang_manager.structure_add.appendChild(save2)
	save.appendChild(lang_manager.structure_add)

	lang_manager.structure_panel = document.createElement('div')
	lang_manager.structure_panel.classList.add('mg-struct-panel')
	save2 = document.createElement('div')
	save3 = document.createElement('div')
	save3.title = 'Add New Structure'
	save3.onclick = () => OpenAddLangStructure()
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:0.875em"><path fill="currentColor" d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.title = 'Edit Structure Settings'
	save3.onclick = () => OpenEditLangStructure()
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style="width:1.125em"><path fill="currentColor" d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path></svg>'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.title = 'Remove Selected Structure'
	save3.onclick = () => RemoveSelectedLangStructure()
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:0.875em"><path fill="currentColor" d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path></svg>'
	save2.appendChild(save3)
	lang_manager.structure_panel.appendChild(save2)
	lang_manager.structure_container = document.createElement('div')
	lang_manager.structure_container.classList.add('mg-structs')
	lang_manager.structure_panel.appendChild(lang_manager.structure_container)
	save.appendChild(lang_manager.structure_panel)
	lang_manager.main.appendChild(save)

	save = document.createElement('div')
	save2 = document.createElement('div')
	save3 = document.createElement('div')
	save3.title = 'Add New Language'
	save3.onclick = () => OpenAddNewLanguage()
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:0.875em"><path fill="currentColor" d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.title = 'Edit Language Settings'
	save3.onclick = () => OpenEditLanguage()
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style="width:1.125em"><path fill="currentColor" d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path></svg>'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.title = 'Remove Selected Language'
	save3.onclick = () => RemoveSelectedLanguage()
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:0.875em"><path fill="currentColor" d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path></svg>'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.title = 'Save Languages & Reload App'
	save3.onclick = () => CloseLanguageManager(true)
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:0.875em"><path fill="currentColor" d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"></path></svg>'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.title = 'Undo Everything & Close Language Manager'
	save3.onclick = () => CloseLanguageManager(false)
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:1em"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"></path></svg>'
	save2.appendChild(save3)
	save.appendChild(save2)
	lang_manager.language_container = document.createElement('div')
	lang_manager.language_container.classList.add('mg-container')
	save.appendChild(lang_manager.language_container)
	lang_manager.main.appendChild(save)
	document.getElementById('window-body').appendChild(lang_manager.main)
	lang_manager.structure_panel.style.display = 'none'
	LoadLanguageStructures()
	LoadLanguages()
}

function CloseLanguageManager(save) {
	lang_manager.main.style.display = 'none'
	lang_manager.language_container.innerHTML = null
	if (save) {
		loading.Show(1, 'Saving...')
		let database = 'const language_values=['
		for (let i = 0, l = lang_manager.language_value.length; i < l; i++) {
			database += '['
			for (let j = 0, l = lang_manager.language_structure.length; j < l; j++) database += '"'+lang_manager.language_value[i][j].replace(/"/g, "'")+'",'
			database += '],'
		}
		database += '],language_structures=['

		for (let i = 0, l = lang_manager.language_structure.length; i < l; i++) database += '"'+lang_manager.language_structure[i]+'",'
		database += '],languages=['

		for (let i = 0, l = lang_manager.languages.length; i < l; i++) database += '"'+lang_manager.languages[i]+'",'
		database += '],language_options=['

		for (let i = 0, l = lang_manager.language_options.length; i < l; i++) {
			database += '['+lang_manager.language_options[i][0]+','+lang_manager.language_options[i][1]+'],'
		}
		database += ']'

		try {
			writeFileSync('./js/language-database.js', database)
			remote.getCurrentWebContents().reload()
		} catch(err) {
			console.error(err)
			Alert('SavingData->'+err)
		}
	} else {
		lang_manager.language_value = null
		lang_manager.language_structure = null
		lang_manager.languages = null
		lang_manager.language_options = null
		lang_manager.selected = null
		lang_manager.selected_structure = null
		lang_manager.editing = null

		lang_manager.language_container = null
		lang_manager.language_add = null
		lang_manager.structure_container = null
		lang_manager.structure_add = null
		lang_manager.structure_panel = null
		try { lang_manager.main.remove() } catch(err) { console.error(err) }
		lang_manager.main = null
		lang_manager.open = false
		KeyManager.stop = false
	}
}

function LoadLanguages() {
	if (lang_manager.languages.length > 0) {
		let html = ''
		for (let i = 0, l = lang_manager.languages.length; i < l; i++) html += `<div onclick="SelectLanguage(${i})">${lang_manager.languages[i]}</div>`
		lang_manager.language_container.innerHTML = html
		SelectLanguage(0)
	} else lang_manager.language_container.innerHTML = null
}

function LoadLanguageStructures() {
	lang_manager.selected_structure = null
	if (lang_manager.language_structure.length > 0) {
		let html = ''
		for (let i = 0, l = lang_manager.language_structure.length; i < l; i++) html += `<div onclick="SelectLangStructure(${i})"><p>${lang_manager.language_structure[i]}</p><div><input type="text" oninput="lang_manager.language_value[lang_manager.selected][${i}] = this.value"></div></div>`
		lang_manager.structure_container.innerHTML = html
	} else lang_manager.structure_container.innerHTML = null
}

function OpenAddNewLanguage() {
	lapb.innerText = 'Add'
	lang_manager.editing = false
	lang_manager.language_add.style.display = 'flex'
	lapn.focus()
}

function AddLanguage() {
	let name = lapn.value || null
	if (name == null || name.replace(/ /g,'').length == 0) {
		PopAlert('Name Cannot be Empty.', 'danger')
		return
	}
	name = name.replace(/"/g, "'")
	if (lang_manager.editing) {
		if (lang_manager.languages[lang_manager.selected] != name) {
			if (lang_manager.languages.indexOf(name) >= 0) {
				PopAlert('Language already Exists.', 'danger')
				return
			}
			lang_manager.languages[lang_manager.selected] = name
		}
		lang_manager.language_options[lang_manager.selected][0] = lapr.value == 0 ? false : true
		lang_manager.language_container.children[lang_manager.selected].innerText = name
	} else {
		if (lang_manager.languages.indexOf(name) >= 0) {
			PopAlert('Language already Exists.', 'danger')
			return
		}
		const i = lang_manager.languages.length
		lang_manager.languages[i] = name
		lang_manager.language_options[i] = [lapr.value == 0 ? false : true, null]
		lang_manager.language_value[i] = []
		for (let j = 0, l = lang_manager.language_structure.length; j < l; j++) lang_manager.language_value[i][j] = ''
		lang_manager.language_container.innerHTML += `<div onclick="SelectLanguage(${i})">${name}</div>`
	}
	CloseAddLanguage()
}

function CloseAddLanguage() {
	lang_manager.language_add.style.display = 'none'
	lapn.value = null
	lapr.value = 0
}

function OpenEditLanguage() {
	if (lang_manager.selected == null) {
		PopAlert('No Language Has been Selected.', 'danger')
		return
	}
	lapb.innerText = 'Save'
	lapn.value = lang_manager.languages[lang_manager.selected]
	lapr.value = lang_manager.language_options[lang_manager.selected][0] ? 1 : 0
	lang_manager.editing = true
	lang_manager.language_add.style.display = 'flex'
	lapn.focus()
}

function RemoveSelectedLanguage() {
	if (lang_manager.selected == null) {
		PopAlert('No Language Has been Selected.', 'danger')
		return
	}
	Confirm('Are you Sure You wanna Delete this Language?', [
		{
			text: 'Yes',
			class: 'btn btn-danger',
			click: 'RemoveLanguage()'
		},
		{text: 'No'}
	])
}

function RemoveLanguage() {
	lang_manager.languages.splice(lang_manager.selected, 1)
	lang_manager.language_options.splice(lang_manager.selected, 1)
	lang_manager.language_value.splice(lang_manager.selected, 1)
	try { lang_manager.language_container.children[lang_manager.selected].remove() } catch(err) {
		Alert('Delete Element->'+err)
		console.error(err)
	}
	lang_manager.structure_panel.style.display = 'none'
	LoadLanguages()
}

function SelectLanguage(index) {
	lang_manager.selected = index
	const children = lang_manager.language_container.children
	for (let i = 0, l = children.length; i < l; i++) children[i].removeAttribute('active')
	children[index].setAttribute('active','')
	lang_manager.structure_panel.style.display = 'block'
	LoadLangStrucValues(index)
}

function SelectLangStructure(index) {
	lang_manager.selected_structure = index
	const children = lang_manager.structure_container.children
	for (let i = 0, l = children.length; i < l; i++) children[i].removeAttribute('active')
	children[index].setAttribute('active','')
}

function AddLangStructure() {
	let name = lasn.value || null
	if (name == null || name.replace(/ /g, '').length == 0) {
		PopAlert('Name Cannot be Empty.', 'danger')
		return
	}
	name = name.replace(/\s\s+/g, '-').replace(/ /g, '-').replace(/'/g, '').replace(/"/g, '').toLowerCase()
	if (lang_manager.editing) {
		if (lang_manager.language_structure[lang_manager.selected_structure] != name) {
			if (lang_manager.language_structure.indexOf(name) >= 0) {
				PopAlert('Structure already exists.', 'danger')
				lasn.value = name
				return
			}
			lang_manager.language_structure[lang_manager.selected_structure] = name
		}
		lang_manager.structure_container.children[lang_manager.selected_structure].children[0].innerText = name
	} else {
		if (lang_manager.language_structure.indexOf(name) >= 0) {
			PopAlert('Structure already exists.', 'danger')
			lasn.value = name
			return
		}
		const i = lang_manager.language_structure.length
		lang_manager.language_structure[i] = name
		for (let j = 0, l = lang_manager.language_value.length; j < l; j++) lang_manager.language_value[j][i] = ''
		lang_manager.structure_container.innerHTML += `<div onclick="SelectLangStructure(${i})"><p>${name}</p><div><input type="text" oninput="lang_manager.language_value[lang_manager.selected][${i}] = this.value"></div></div>`
	}
	SelectLanguage(lang_manager.selected)
	CloseAddLangStructure()
}

function OpenAddLangStructure() {
	lasb.innerText = 'Add'
	lang_manager.editing = false
	lang_manager.structure_add.style.display = 'flex'
	lasn.focus()
}

function OpenEditLangStructure() {
	if (lang_manager.selected_structure == null) {
		PopAlert('No Structure Has been Selected.', 'danger')
		return
	}
	lasn.value = lang_manager.language_structure[lang_manager.selected_structure]
	lasb.innerText = 'Save'
	lang_manager.editing = true
	lang_manager.structure_add.style.display = 'flex'
	lasn.focus()
}

function CloseAddLangStructure() {
	lang_manager.structure_add.style.display = 'none'
	lasn.value = null
}

function RemoveSelectedLangStructure() {
	if (lang_manager.selected_structure == null) {
		PopAlert('No Structure Has been Selected.', 'danger')
		return
	}
	Confirm('Are you Sure You wanna Delete this Structure?', [
		{
			text: 'Yes',
			class: 'btn btn-danger',
			click: 'RemoveLangStructure()'
		},
		{text: 'No'}
	])
}

function RemoveLangStructure() {
	lang_manager.language_structure.splice(lang_manager.selected_structure, 1)
	for (let i = 0, l = lang_manager.language_value.length; i < l; i++) try { lang_manager.language_value[i].splice(lang_manager.selected_structure, 1) } catch(err) { console.error(i, err); }
	try { lang_manager.structure_container.children[lang_manager.selected_structure].remove() } catch(err) {
		Alert('Delete Element->'+err)
		console.error(err)
	}
	lang_manager.selected_structure = null
	LoadLanguageStructures()
	LoadLangStrucValues(lang_manager.selected)
}

function LoadLangStrucValues(index) {
	const children = lang_manager.structure_container.children
	for (let i = 0, l = children.length; i < l; i++) children[i].children[1].children[0].value = lang_manager.language_value[index][i]
}