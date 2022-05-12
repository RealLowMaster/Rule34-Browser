const theme_manager = {
	open: false,
	main: null,
	theme_container: null,
	theme_add: null,
	structure_container: null,
	structure_add: null,
	structure_panel: null,

	theme_value: null,
	theme_structure: null,
	themes: null,
	theme_options: null,

	selected: null,
	selected_structure: null,
	editing: null
}

function OpenThemeManager() {
	if (theme_manager.open) return
	theme_manager.open = true
	KeyManager.stop = true
	theme_manager.theme_value = theme_values.slice()
	theme_manager.theme_structure = theme_structures.slice()
	theme_manager.themes = themes.slice()

	theme_manager.main = document.createElement('div')
	theme_manager.main.classList.add('mg-manager')

	let save = document.createElement('div')
	theme_manager.theme_add = document.createElement('div')
	theme_manager.theme_add.classList.add('mg-add-panel')
	let save2 = document.createElement('form')
	save2.onsubmit = e => {
		e.preventDefault()
		AddTheme()
	}
	let save3 = document.createElement('label')
	save3.setAttribute('for', 'tapn')
	save3.innerText = 'Name:'
	save2.appendChild(save3)
	save3 = document.createElement('input')
	save3.type = 'text'
	save3.id = 'tapn'
	save3.setAttribute('placeholder', 'Name...')
	save2.appendChild(save3)
	save3 = document.createElement('br')
	save2.appendChild(save3)
	save3 = document.createElement('button')
	save3.classList.add('btn')
	save3.classList.add('btn-primary')
	save3.type = 'submit'
	save3.id = 'tapb'
	save3.innerText = 'Add'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.classList.add('btn')
	save3.classList.add('btn-danger')
	save3.onclick = () => CloseAddTheme()
	save3.innerText = 'Cancel'
	save2.appendChild(save3)
	theme_manager.theme_add.appendChild(save2)
	save.appendChild(theme_manager.theme_add)

	theme_manager.structure_add = document.createElement('div')
	theme_manager.structure_add.classList.add('mg-add-struct')
	save2 = document.createElement('form')
	save2.onsubmit = e => {
		e.preventDefault()
		AddThemeStructure()
	}
	save3 = document.createElement('label')
	save3.setAttribute('for', 'tasn')
	save3.innerText = 'Name:'
	save2.appendChild(save3)
	save3 = document.createElement('input')
	save3.type = 'text'
	save3.id = 'tasn'
	save3.setAttribute('placeholder', 'Name...')
	save2.appendChild(save3)
	save3 = document.createElement('br')
	save2.appendChild(save3)
	save3 = document.createElement('button')
	save3.classList.add('btn')
	save3.classList.add('btn-primary')
	save3.type = 'submit'
	save3.id = 'tasb'
	save3.innerText = 'Add'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.classList.add('btn')
	save3.classList.add('btn-danger')
	save3.onclick = () => CloseAddThemeStructure()
	save3.innerText = 'Cancel'
	save2.appendChild(save3)
	theme_manager.structure_add.appendChild(save2)
	save.appendChild(theme_manager.structure_add)

	theme_manager.structure_panel = document.createElement('div')
	theme_manager.structure_panel.classList.add('mg-struct-panel')
	save2 = document.createElement('div')
	save3 = document.createElement('div')
	save3.title = 'Add New Structure'
	save3.onclick = () => OpenAddThemeStructure()
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:0.875em"><path fill="currentColor" d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.title = 'Edit Structure Settings'
	save3.onclick = () => OpenEditThemeStructure()
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style="width:1.125em"><path fill="currentColor" d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path></svg>'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.title = 'Remove Selected Structure'
	save3.onclick = () => RemoveSelectedThemeStructure()
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:0.875em"><path fill="currentColor" d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path></svg>'
	save2.appendChild(save3)
	theme_manager.structure_panel.appendChild(save2)
	theme_manager.structure_container = document.createElement('div')
	theme_manager.structure_container.classList.add('mg-structs')
	theme_manager.structure_panel.appendChild(theme_manager.structure_container)
	save.appendChild(theme_manager.structure_panel)
	theme_manager.main.appendChild(save)

	save = document.createElement('div')
	save2 = document.createElement('div')
	save3 = document.createElement('div')
	save3.title = 'Add New Theme'
	save3.onclick = () => OpenAddNewTheme()
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:0.875em"><path fill="currentColor" d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.title = 'Edit Theme Settings'
	save3.onclick = () => OpenEditTheme()
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style="width:1.125em"><path fill="currentColor" d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path></svg>'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.title = 'Remove Selected Theme'
	save3.onclick = () => RemoveSelectedTheme()
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:0.875em"><path fill="currentColor" d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path></svg>'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.title = 'Save Theme & Reload App'
	save3.onclick = () => CloseThemeManager(true)
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:0.875em"><path fill="currentColor" d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"></path></svg>'
	save2.appendChild(save3)
	save3 = document.createElement('div')
	save3.title = 'Undo Everything & Close Theme Manager'
	save3.onclick = () => CloseThemeManager(false)
	save3.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:1em"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"></path></svg>'
	save2.appendChild(save3)
	save.appendChild(save2)
	theme_manager.theme_container = document.createElement('div')
	theme_manager.theme_container.classList.add('mg-container')
	save.appendChild(theme_manager.theme_container)
	theme_manager.main.appendChild(save)
	document.getElementById('window-body').appendChild(theme_manager.main)
	theme_manager.structure_panel.style.display = 'none'
	LoadThemeStructures()
	LoadTheme()
}

function CloseThemeManager(save) {
	theme_manager.main.style.display = 'none'
	theme_manager.theme_container.innerHTML = null
	if (save) {
		let database = 'const theme_values=['
		for (let i = 0, l = theme_manager.theme_value.length; i < l; i++) {
			database += '['
			for (let j = 0, l = theme_manager.theme_structure.length; j < l; j++) database += '"'+theme_manager.theme_value[i][j].replace(/"/g, "'")+'",'
			database += '],'
		}
		database += '],theme_structures=['

		for (let i = 0, l = theme_manager.theme_structure.length; i < l; i++) database += '"'+theme_manager.theme_structure[i]+'",'
		database += '],themes=['

		for (let i = 0, l = theme_manager.themes.length; i < l; i++) database += '"'+theme_manager.themes[i]+'",'
		database += ']'

		try {
			writeFileSync('./js/theme-database.js', database)
			remote.getCurrentWebContents().reload()
		} catch(err) {
			console.error(err)
			Alert('SavingData->'+err)
		}
	} else {
		theme_manager.theme_value = null
		theme_manager.theme_structure = null
		theme_manager.themes = null
		theme_manager.selected = null
		theme_manager.selected_structure = null
		theme_manager.editing = null

		theme_manager.theme_container = null
		theme_manager.theme_add = null
		theme_manager.structure_container = null
		theme_manager.structure_add = null
		theme_manager.structure_panel = null
		try { theme_manager.main.remove() } catch(err) { console.error(err) }
		theme_manager.main = null
		theme_manager.open = false
		KeyManager.stop = false
	}
}

function LoadTheme() {
	if (theme_manager.themes.length > 0) {
		let html = ''
		for (let i = 0, l = theme_manager.themes.length; i < l; i++) html += `<div onclick="SelectTheme(${i})">${theme_manager.themes[i]}</div>`
		theme_manager.theme_container.innerHTML = html
		SelectTheme(0)
	} else theme_manager.theme_container.innerHTML = null
}

function LoadThemeStructures() {
	theme_manager.selected_structure = null
	if (theme_manager.theme_structure.length > 0) {
		let html = ''
		for (let i = 0, l = theme_manager.theme_structure.length; i < l; i++) html += `<div onclick="SelectThemeStructure(${i})"><p>${theme_manager.theme_structure[i]}</p><div><input type="text" oninput="theme_manager.theme_value[theme_manager.selected][${i}] = this.value"></div></div>`
		theme_manager.structure_container.innerHTML = html
	} else theme_manager.structure_container.innerHTML = null
}

function OpenAddNewTheme() {
	tapb.innerText = 'Add'
	theme_manager.editing = false
	theme_manager.theme_add.style.display = 'flex'
	tapn.focus()
}

function AddTheme() {
	let name = tapn.value || null
	if (name == null || name.replace(/ /g,'').length == 0) {
		PopAlert('Name Cannot be Empty.', 'danger')
		return
	}
	name = name.replace(/"/g, "'")
	if (theme_manager.editing) {
		if (theme_manager.themes[theme_manager.selected] != name) {
			if (theme_manager.themes.indexOf(name) >= 0) {
				PopAlert('Theme already Exists.', 'danger')
				return
			}
			theme_manager.themes[theme_manager.selected] = name
		}
		theme_manager.theme_container.children[theme_manager.selected].innerText = name
	} else {
		if (theme_manager.themes.indexOf(name) >= 0) {
			PopAlert('Theme already Exists.', 'danger')
			return
		}
		const i = theme_manager.themes.length
		theme_manager.themes[i] = name
		theme_manager.theme_value[i] = []
		for (let j = 0, l = theme_manager.theme_structure.length; j < l; j++) theme_manager.theme_value[i][j] = ''
		theme_manager.theme_container.innerHTML += `<div onclick="SelectTheme(${i})">${name}</div>`
	}
	CloseAddTheme()
}

function CloseAddTheme() {
	theme_manager.theme_add.style.display = 'none'
	tapn.value = null
}

function OpenEditTheme() {
	if (theme_manager.selected == null) {
		PopAlert('No Theme Has been Selected.', 'danger')
		return
	}
	tapb.innerText = 'Save'
	tapn.value = theme_manager.themes[theme_manager.selected]
	theme_manager.editing = true
	theme_manager.theme_add.style.display = 'flex'
	tapn.focus()
}

function RemoveSelectedTheme() {
	if (theme_manager.selected == null) {
		PopAlert('No Theme Has been Selected.', 'danger')
		return
	}
	Confirm('Are you Sure You wanna Delete this Theme?', [
		{
			text: 'Yes',
			class: 'btn btn-danger',
			click: 'RemoveTheme()'
		},
		{text: 'No'}
	])
}

function RemoveTheme() {
	theme_manager.themes.splice(theme_manager.selected, 1)
	theme_manager.theme_value.splice(theme_manager.selected, 1)
	try { theme_manager.theme_container.children[theme_manager.selected].remove() } catch(err) {
		Alert('Delete Element->'+err)
		console.error(err)
	}
	theme_manager.structure_panel.style.display = 'none'
	LoadTheme()
}

function SelectTheme(index) {
	theme_manager.selected = index
	const children = theme_manager.theme_container.children
	for (let i = 0, l = children.length; i < l; i++) children[i].removeAttribute('active')
	children[index].setAttribute('active','')
	theme_manager.structure_panel.style.display = 'block'
	LoadThemeStrucValues(index)
}

function SelectThemeStructure(index) {
	theme_manager.selected_structure = index
	const children = theme_manager.structure_container.children
	for (let i = 0, l = children.length; i < l; i++) children[i].removeAttribute('active')
	children[index].setAttribute('active','')
}

function AddThemeStructure() {
	let name = tasn.value || null
	if (name == null || name.replace(/ /g, '').length == 0) {
		PopAlert('Name Cannot be Empty.', 'danger')
		return
	}
	name = name.replace(/\s\s+/g, '-').replace(/ /g, '-').replace(/'/g, '').replace(/"/g, '').toLowerCase()
	if (theme_manager.editing) {
		if (theme_manager.theme_structure[theme_manager.selected_structure] != name) {
			if (theme_manager.theme_structure.indexOf(name) >= 0) {
				PopAlert('Structure already exists.', 'danger')
				tasn.value = name
				return
			}
			theme_manager.theme_structure[theme_manager.selected_structure] = name
		}
		theme_manager.structure_container.children[theme_manager.selected_structure].children[0].innerText = name
	} else {
		if (theme_manager.theme_structure.indexOf(name) >= 0) {
			PopAlert('Structure already exists.', 'danger')
			tasn.value = name
			return
		}
		const i = theme_manager.theme_structure.length
		theme_manager.theme_structure[i] = name
		for (let j = 0, l = theme_manager.theme_value.length; j < l; j++) theme_manager.theme_value[j][i] = ''
		theme_manager.structure_container.innerHTML += `<div onclick="SelectThemeStructure(${i})"><p>${name}</p><div><input type="text" oninput="theme_manager.theme_value[theme_manager.selected][${i}] = this.value"></div></div>`
	}
	SelectTheme(theme_manager.selected)
	CloseAddThemeStructure()
}

function OpenAddThemeStructure() {
	tasb.innerText = 'Add'
	theme_manager.editing = false
	theme_manager.structure_add.style.display = 'flex'
	tasn.focus()
}

function OpenEditThemeStructure() {
	if (theme_manager.selected_structure == null) {
		PopAlert('No Structure Has been Selected.', 'danger')
		return
	}
	tasn.value = theme_manager.theme_structure[theme_manager.selected_structure]
	tasb.innerText = 'Save'
	theme_manager.editing = true
	theme_manager.structure_add.style.display = 'flex'
	tasn.focus()
}

function CloseAddThemeStructure() {
	theme_manager.structure_add.style.display = 'none'
	tasn.value = null
}

function RemoveSelectedThemeStructure() {
	if (theme_manager.selected_structure == null) {
		PopAlert('No Structure Has been Selected.', 'danger')
		return
	}
	Confirm('Are you Sure You wanna Delete this Structure?', [
		{
			text: 'Yes',
			class: 'btn btn-danger',
			click: 'RemoveThemeStructure()'
		},
		{text: 'No'}
	])
}

function RemoveThemeStructure() {
	theme_manager.theme_structure.splice(theme_manager.selected_structure, 1)
	for (let i = 0, l = theme_manager.theme_value.length; i < l; i++) try { theme_manager.theme_value[i].splice(theme_manager.selected_structure, 1) } catch(err) { console.error(i, err); }
	try { theme_manager.structure_container.children[theme_manager.selected_structure].remove() } catch(err) {
		Alert('Delete Element->'+err)
		console.error(err)
	}
	theme_manager.selected_structure = null
	LoadThemeStructures()
	LoadThemeStrucValues(theme_manager.selected)
}

function LoadThemeStrucValues(index) {
	const children = theme_manager.structure_container.children
	for (let i = 0, l = children.length; i < l; i++) children[i].children[1].children[0].value = theme_manager.theme_value[index][i]
}