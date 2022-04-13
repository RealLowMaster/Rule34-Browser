let tmp_language_value, tmp_language_structure, tmp_languages, tmp_language_options, tmp_selected_language = null, tmp_selected_lang_structure = null, tmp_language_editing
function OpenLanguageManager() {
	KeyManager.ChangeCategory(null)
	document.getElementById('language-manager').style.display = 'grid'
	tmp_language_value = language_values.slice()
	tmp_language_structure = language_structures.slice()
	tmp_languages = languages.slice()
	tmp_language_options = language_options.slice()
	document.getElementById('language-structure-panel').style.display = 'none'
	LoadLanguageStructures()
	LoadLanguages()
}

function CloseLanguageManager(save) {
	document.getElementById('language-manager').style.display = 'none'
	document.getElementById('language-container').innerHTML = null
	if (save) {
		let database = 'const language_values=['
		for (let i = 0, l = tmp_language_value.length; i < l; i++) {
			database += '['
			for (let j = 0, l = tmp_language_structure.length; j < l; j++) database += '"'+tmp_language_value[i][j].replace(/"/g, "'")+'",'
			database += '],'
		}
		database += '],language_structures=['

		for (let i = 0, l = tmp_language_structure.length; i < l; i++) database += '"'+tmp_language_structure[i]+'",'
		database += '],languages=['

		for (let i = 0, l = tmp_languages.length; i < l; i++) database += '"'+tmp_languages[i]+'",'
		database += '],language_options=['

		for (let i = 0, l = tmp_language_options.length; i < l; i++) {
			database += '['+tmp_language_options[i][0]+','+tmp_language_options[i][1]+'],'
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
		tmp_language_value = null
		tmp_language_structure = null
		tmp_languages = null
		tmp_language_options = null
		tmp_selected_language = null
		tmp_selected_lang_structure = null
		tmp_language_editing = null
		document.getElementById('language-container').innerHTML = null
		document.getElementById('language-structures').innerHTML = null
	}
}

document.getElementById('language-add-panel').children[0].addEventListener('submit', e => {e.preventDefault(); AddLanguage()})

function LoadLanguages() {
	if (tmp_languages.length > 0) {
		let html = ''
		for (let i = 0, l = tmp_languages.length; i < l; i++) html += `<div onclick="SelectLanguage(${i})">${tmp_languages[i]}</div>`
		document.getElementById('language-container').innerHTML = html
		SelectLanguage(0)
	} else document.getElementById('language-container').innerHTML = null
}

function LoadLanguageStructures() {
	tmp_selected_lang_structure = null
	if (tmp_language_structure.length > 0) {
		let html = ''
		for (let i = 0, l = tmp_language_structure.length; i < l; i++) html += `<div onclick="SelectLangStructure(${i})"><p>${tmp_language_structure[i]}</p><div><input type="text" oninput="tmp_language_value[tmp_selected_language][${i}] = this.value"></div></div>`
		document.getElementById('language-structures').innerHTML = html
	} else document.getElementById('language-structures').innerHTML = null
}

function OpenAddNewLanguage() {
	lapb.innerText = 'Add'
	tmp_language_editing = false
	document.getElementById('language-add-panel').style.display = 'flex'
	lapn.focus()
}

function AddLanguage() {
	let name = lapn.value || null
	if (name == null || name.replace(/ /g,'').length == 0) {
		PopAlert('Name Cannot be Empty.', 'danger')
		return
	}
	name = name.replace(/"/g, "'")
	if (tmp_language_editing) {
		if (tmp_languages[tmp_selected_language] != name) {
			if (tmp_languages.indexOf(name) >= 0) {
				PopAlert('Language already Exists.', 'danger')
				return
			}
			tmp_languages[tmp_selected_language] = name
		}
		tmp_language_options[tmp_selected_language][0] = lapr.value == 0 ? false : true
		document.getElementById('language-container').children[tmp_selected_language].innerText = name
	} else {
		if (tmp_languages.indexOf(name) >= 0) {
			PopAlert('Language already Exists.', 'danger')
			return
		}
		const i = tmp_languages.length
		tmp_languages[i] = name
		tmp_language_options[i] = [lapr.value == 0 ? false : true, null]
		tmp_language_value[i] = []
		for (let j = 0, l = tmp_language_structure.length; j < l; j++) tmp_language_value[i][j] = ''
		document.getElementById('language-container').innerHTML += `<div onclick="SelectLanguage(${i})">${name}</div>`
	}
	CloseAddLanguage()
}

function CloseAddLanguage() {
	document.getElementById('language-add-panel').style.display = 'none'
	lapn.value = null
	lapr.value = 0
}

function OpenEditLanguage() {
	if (tmp_selected_language == null) {
		PopAlert('No Language Has been Selected.', 'danger')
		return
	}
	lapb.innerText = 'Save'
	lapn.value = tmp_languages[tmp_selected_language]
	lapr.value = tmp_language_options[tmp_selected_language][0] ? 1 : 0
	tmp_language_editing = true
	document.getElementById('language-add-panel').style.display = 'flex'
	lapn.focus()
}

function RemoveSelectedLanguage() {
	if (tmp_selected_language == null) {
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
	tmp_languages.splice(tmp_selected_language, 1)
	tmp_language_options.splice(tmp_selected_language, 1)
	tmp_language_value.splice(tmp_selected_language, 1)
	try { document.getElementById('language-container').children[tmp_selected_language].remove() } catch(err) {
		Alert('Delete Element->'+err)
		console.error(err)
	}
	document.getElementById('language-structure-panel').style.display = 'none'
	LoadLanguages()
}

function SelectLanguage(index) {
	tmp_selected_language = index
	const children = document.getElementById('language-container').children
	for (let i = 0, l = children.length; i < l; i++) children[i].removeAttribute('active')
	children[index].setAttribute('active','')
	document.getElementById('language-structure-panel').style.display = 'block'
	LoadLangStrucValues(index)
}

function SelectLangStructure(index) {
	tmp_selected_lang_structure = index
	const children = document.getElementById('language-structures').children
	for (let i = 0, l = children.length; i < l; i++) children[i].removeAttribute('active')
	children[index].setAttribute('active','')
}

document.getElementById('language-add-structure').children[0].addEventListener('submit', e => {e.preventDefault();AddLangStructure()})

function AddLangStructure() {
	let name = lasn.value || null
	if (name == null || name.replace(/ /g, '').length == 0) {
		PopAlert('Name Cannot be Empty.', 'danger')
		return
	}
	name = name.replace(/\s\s+/g, '-').replace(/ /g, '-').replace(/'/g, '').replace(/"/g, '').toLowerCase()
	if (tmp_language_editing) {
		if (tmp_language_structure[tmp_selected_lang_structure] != name) {
			if (tmp_language_structure.indexOf(name) >= 0) {
				PopAlert('Structure already exists.', 'danger')
				lasn.value = name
				return
			}
			tmp_language_structure[tmp_selected_lang_structure] = name
		}
		document.getElementById('language-structures').children[tmp_selected_lang_structure].children[0].innerText = name
	} else {
		if (tmp_language_structure.indexOf(name) >= 0) {
			PopAlert('Structure already exists.', 'danger')
			lasn.value = name
			return
		}
		const i = tmp_language_structure.length
		tmp_language_structure[i] = name
		for (let j = 0, l = tmp_language_value.length; j < l; j++) tmp_language_value[j][i] = ''
		document.getElementById('language-structures').innerHTML += `<div onclick="SelectLangStructure(${i})"><p>${name}</p><div><input type="text" oninput="tmp_language_value[tmp_selected_language][${i}] = this.value"></div></div>`
	}
	SelectLanguage(tmp_selected_language)
	CloseAddLangStructure()
}

function OpenAddLangStructure() {
	lasb.innerText = 'Add'
	tmp_language_editing = false
	document.getElementById('language-add-structure').style.display = 'flex'
	lasn.focus()
}

function OpenEditLangStructure() {
	if (tmp_selected_lang_structure == null) {
		PopAlert('No Structure Has been Selected.', 'danger')
		return
	}
	lasn.value = tmp_language_structure[tmp_selected_lang_structure]
	lasb.innerText = 'Save'
	tmp_language_editing = true
	document.getElementById('language-add-structure').style.display = 'flex'
	lasn.focus()
}

function CloseAddLangStructure() {
	document.getElementById('language-add-structure').style.display = 'none'
	lasn.value = null
}

function RemoveSelectedLangStructure() {
	if (tmp_selected_lang_structure == null) {
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
	tmp_language_structure.splice(tmp_selected_lang_structure, 1)
	for (let i = 0, l = tmp_language_value.length; i < l; i++) try { tmp_language_value[i].splice(tmp_selected_lang_structure, 1) } catch(err) { console.error(i, err); }
	try { document.getElementById('language-structures').children[tmp_selected_lang_structure].remove() } catch(err) {
		Alert('Delete Element->'+err)
		console.error(err)
	}
	tmp_selected_lang_structure = null
	LoadLanguageStructures()
	LoadLangStrucValues(tmp_selected_language)
}

function LoadLangStrucValues(index) {
	const children = document.getElementById('language-structures').children
	for (let i = 0, l = children.length; i < l; i++) children[i].children[1].children[0].value = tmp_language_value[index][i]
}