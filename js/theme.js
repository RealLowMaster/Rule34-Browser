let tmp_theme_structures, tmp_theme_values, tmp_themes, tmp_selected_theme = null, tmp_selected_theme_structure = null, tmp_theme_editing

function OpenThemeManager() {
	KeyManager.ChangeCategory(null)
	document.getElementById('theme-manager').style.display = 'grid'
	tmp_theme_values = theme_values.slice()
	tmp_theme_structures = theme_structures.slice()
	tmp_themes = themes.slice()
	document.getElementById('theme-structure-panel').style.display = 'none'
	LoadThemeStructures()
	LoadTheme()
}

function CloseThemeManager(save) {
	document.getElementById('theme-manager').style.display = 'none'
	document.getElementById('theme-container').innerHTML = null
	if (save) {
		let database = 'const theme_values=['
		for (let i = 0, l = tmp_theme_values.length; i < l; i++) {
			database += '['
			for (let j = 0, l = tmp_theme_structures.length; j < l; j++) database += '"'+tmp_theme_values[i][j].replace(/"/g, "'")+'",'
			database += '],'
		}
		database += '],theme_structures=['

		for (let i = 0, l = tmp_theme_structures.length; i < l; i++) database += '"'+tmp_theme_structures[i]+'",'
		database += '],themes=['

		for (let i = 0, l = tmp_themes.length; i < l; i++) database += '"'+tmp_themes[i]+'",'
		database += ']'

		try {
			writeFileSync('./js/theme-database.js', database)
			remote.getCurrentWebContents().reload()
		} catch(err) {
			console.error(err)
			Alert('SavingData->'+err)
		}
	} else {
		tmp_theme_values = null
		tmp_theme_structures = null
		tmp_themes = null
		tmp_selected_theme = null
		tmp_selected_theme_structure = null
		tmp_theme_editing = null
		document.getElementById('theme-container').innerHTML = null
		document.getElementById('theme-structures').innerHTML = null
	}
}

document.getElementById('theme-add-panel').children[0].addEventListener('submit', e => {e.preventDefault(); AddTheme()})

function LoadTheme() {
	if (tmp_themes.length > 0) {
		let html = ''
		for (let i = 0, l = tmp_themes.length; i < l; i++) html += `<div onclick="SelectTheme(${i})">${tmp_themes[i]}</div>`
		document.getElementById('theme-container').innerHTML = html
		SelectTheme(0)
	} else document.getElementById('theme-container').innerHTML = null
}

function LoadThemeStructures() {
	tmp_selected_theme_structure = null
	if (tmp_theme_structures.length > 0) {
		let html = ''
		for (let i = 0, l = tmp_theme_structures.length; i < l; i++) html += `<div onclick="SelectThemeStructure(${i})"><p>${tmp_theme_structures[i]}</p><div><input type="text" oninput="tmp_theme_values[tmp_selected_theme][${i}] = this.value"></div></div>`
		document.getElementById('theme-structures').innerHTML = html
	} else document.getElementById('theme-structures').innerHTML = null
}

function OpenAddNewTheme() {
	tapb.innerText = 'Add'
	tmp_theme_editing = false
	document.getElementById('theme-add-panel').style.display = 'flex'
	tapn.focus()
}

function AddTheme() {
	let name = tapn.value || null
	if (name == null || name.replace(/ /g,'').length == 0) {
		PopAlert('Name Cannot be Empty.', 'danger')
		return
	}
	name = name.replace(/"/g, "'")
	if (tmp_theme_editing) {
		if (tmp_themes[tmp_selected_theme] != name) {
			if (tmp_themes.indexOf(name) >= 0) {
				PopAlert('Theme already Exists.', 'danger')
				return
			}
			tmp_themes[tmp_selected_theme] = name
		}
		document.getElementById('theme-container').children[tmp_selected_theme].innerText = name
	} else {
		if (tmp_themes.indexOf(name) >= 0) {
			PopAlert('Theme already Exists.', 'danger')
			return
		}
		const i = tmp_themes.length
		tmp_themes[i] = name
		tmp_theme_values[i] = []
		for (let j = 0, l = tmp_theme_structures.length; j < l; j++) tmp_theme_values[i][j] = ''
		document.getElementById('theme-container').innerHTML += `<div onclick="SelectTheme(${i})">${name}</div>`
	}
	CloseAddTheme()
}

function CloseAddTheme() {
	document.getElementById('theme-add-panel').style.display = 'none'
	tapn.value = null
}

function OpenEditTheme() {
	if (tmp_selected_theme == null) {
		PopAlert('No Theme Has been Selected.', 'danger')
		return
	}
	tapb.innerText = 'Save'
	tapn.value = tmp_themes[tmp_selected_theme]
	tmp_theme_editing = true
	document.getElementById('theme-add-panel').style.display = 'flex'
	tapn.focus()
}

function RemoveSelectedTheme() {
	if (tmp_selected_theme == null) {
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
	tmp_themestmp_themes.splice(tmp_selected_theme, 1)
	tmp_theme_values.splice(tmp_selected_theme, 1)
	try { document.getElementById('theme-container').children[tmp_selected_theme].remove() } catch(err) {
		Alert('Delete Element->'+err)
		console.error(err)
	}
	document.getElementById('theme-structure-panel').style.display = 'none'
	LoadTheme()
}

function SelectTheme(index) {
	tmp_selected_theme = index
	const children = document.getElementById('theme-container').children
	for (let i = 0, l = children.length; i < l; i++) children[i].removeAttribute('active')
	children[index].setAttribute('active','')
	document.getElementById('theme-structure-panel').style.display = 'block'
	LoadThemeStrucValues(index)
}

function SelectThemeStructure(index) {
	tmp_selected_theme_structure = index
	const children = document.getElementById('theme-structures').children
	for (let i = 0, l = children.length; i < l; i++) children[i].removeAttribute('active')
	children[index].setAttribute('active','')
}

document.getElementById('theme-add-structure').children[0].addEventListener('submit', e => {e.preventDefault();AddThemeStructure()})

function AddThemeStructure() {
	let name = tasn.value || null
	if (name == null || name.replace(/ /g, '').length == 0) {
		PopAlert('Name Cannot be Empty.', 'danger')
		return
	}
	name = name.replace(/\s\s+/g, '-').replace(/ /g, '-').replace(/'/g, '').replace(/"/g, '').toLowerCase()
	if (tmp_theme_editing) {
		if (tmp_theme_structures[tmp_selected_theme_structure] != name) {
			if (tmp_theme_structures.indexOf(name) >= 0) {
				PopAlert('Structure already exists.', 'danger')
				tasn.value = name
				return
			}
			tmp_theme_structures[tmp_selected_theme_structure] = name
		}
		document.getElementById('theme-structures').children[tmp_selected_theme_structure].children[0].innerText = name
	} else {
		if (tmp_theme_structures.indexOf(name) >= 0) {
			PopAlert('Structure already exists.', 'danger')
			tasn.value = name
			return
		}
		const i = tmp_theme_structures.length
		tmp_theme_structures[i] = name
		for (let j = 0, l = tmp_theme_values.length; j < l; j++) tmp_theme_values[j][i] = ''
		document.getElementById('theme-structures').innerHTML += `<div onclick="SelectThemeStructure(${i})"><p>${name}</p><div><input type="text" oninput="tmp_theme_values[tmp_selected_theme][${i}] = this.value"></div></div>`
	}
	SelectTheme(tmp_selected_theme)
	CloseAddThemeStructure()
}

function OpenAddThemeStructure() {
	tasb.innerText = 'Add'
	tmp_theme_editing = false
	document.getElementById('theme-add-structure').style.display = 'flex'
	tasn.focus()
}

function OpenEditThemeStructure() {
	if (tmp_selected_theme_structure == null) {
		PopAlert('No Structure Has been Selected.', 'danger')
		return
	}
	tasn.value = tmp_theme_structures[tmp_selected_theme_structure]
	tasb.innerText = 'Save'
	tmp_theme_editing = true
	document.getElementById('theme-add-structure').style.display = 'flex'
	tasn.focus()
}

function CloseAddThemeStructure() {
	document.getElementById('theme-add-structure').style.display = 'none'
	tasn.value = null
}

function RemoveSelectedThemeStructure() {
	if (tmp_selected_theme_structure == null) {
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
	tmp_theme_structures.splice(tmp_selected_theme_structure, 1)
	for (let i = 0, l = tmp_theme_values.length; i < l; i++) try { tmp_theme_values[i].splice(tmp_selected_theme_structure, 1) } catch(err) { console.error(i, err); }
	try { document.getElementById('theme-structures').children[tmp_selected_theme_structure].remove() } catch(err) {
		Alert('Delete Element->'+err)
		console.error(err)
	}
	tmp_selected_theme_structure = null
	LoadThemeStructures()
	LoadThemeStrucValues(tmp_selected_theme)
}

function LoadThemeStrucValues(index) {
	const children = document.getElementById('theme-structures').children
	for (let i = 0, l = children.length; i < l; i++) children[i].children[1].children[0].value = tmp_theme_values[index][i]
}