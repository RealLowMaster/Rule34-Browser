let temp_icons = null, isAddingIcon = null

function OpenIconManager() {
	if (icons == null) temp_icons = {}
	else temp_icons = icons
	isAddingIcon = false
	KeyManager.ChangeCategory('icon-manager')
	IconManagerLoadIcons()
	document.getElementById('icon-manager').style.display = 'block'
}

function IconManagerLoadIcons() {
	let html = ''
	for (let i in temp_icons) html += `<div id="tmp_${i}"><svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${temp_icons[i][0]} ${temp_icons[i][1]}"><path fill="currentColor" d="${temp_icons[i][2]}"></path></svg><p>${i}</p><div onclick="AskForRemoveIcon('${i}')">x</div></div>`
	document.getElementById('icon-manager-container').innerHTML = html
}

function AskForRemoveIcon(name) {
	Confirm('Are you Sure about Deleting this Icon ?', [
		{
			text: 'Yes',
			class: 'btn btn-danger',
			click: `RemoveIcon('${name}')`
		},
		{ text: 'No' }
	])
}

function RemoveIcon(name) {
	if (temp_icons.hasOwnProperty(name)) delete temp_icons[name]
	const element = document.getElementById('tmp_'+name) || null
	if (element != null) element.remove()
}

function CloseIconManager() {
	temp_icons = null
	isAddingIcon = null
	KeyManager.BackwardCategory()
	document.getElementById('icon-manager-container').innerHTML = null
	document.getElementById('icon-manager').style.display = 'none'
}

function SaveIconManager() {
	if (temp_icons == null) return
	KeyManager.ChangeCategory(null)

	let arr = []
	for (let i in temp_icons) arr.push(i)
	arr.sort()

	const saving_icons = {}
	for (let i = 0; i < arr.length; i++) saving_icons[arr[i]] = temp_icons[arr[i]]

	let content = 'const icons = {'
	for (let i in saving_icons) content += `'${i}': [${saving_icons[i][0]},${saving_icons[i][1]},'${saving_icons[i][2]}'],`
	content += '}'

	try {
		writeFileSync('js/icons-database.js', content)
		remote.getCurrentWebContents().reload()
	} catch(err) {
		Alert('SavingThemeData->Err: '+err)
		console.error(err)
	}
}

function OpenAddIcon() {
	if (isAddingIcon) { ToggleConvertIcon(); return }
	isAddingIcon = true
	document.getElementById('icon-manager-add-name').value = null
	document.getElementById('icon-manager-add-width').value = 512
	document.getElementById('icon-manager-add-height').value = 512
	document.getElementById('icon-manager-add-code').value = null
	document.getElementById('icon-manager-add-svg').style.display = 'none'
	document.getElementById('icon-manager-add-svg-code').value = null
	document.getElementById('icon-manager-add').style.display = 'flex'
}

function CloseAddIcon() {
	document.getElementById('icon-manager-add').style.display = 'none'
	isAddingIcon = false
}

function AddIcon() {
	if (!isAddingIcon) return
	let name = document.getElementById('icon-manager-add-name').value || null
	if (name == null || name.replace(/ /g, '').length == 0) { PopAlert('Fill name', 'danger'); return }
	name = name.replace(/\s\s+/g, '-').replace(/ /g, '-').replace(/'/g, '').replace(/"/g, '').replace(/\\/g, '').toLowerCase()
	let width = document.getElementById('icon-manager-add-width').value || null
	if (width == null || width == 0) { PopAlert('Fill Width', 'danger'); return }
	width = Number(width)
	let height = document.getElementById('icon-manager-add-height').value || null
	if (height == null || height == 0) { PopAlert('Fill Height', 'danger'); return }
	height = Number(height)
	const code = document.getElementById('icon-manager-add-code').value || null
	if (code == null || code.replace(/ /g, '').length == 0) { PopAlert('Fill code', 'danger'); return }

	if (temp_icons.hasOwnProperty(name)) { PopAlert('Icon with this name Already Exist!', 'danger'); return }

	temp_icons[name] = [width, height, code]
	
	const element = document.createElement('div')
	element.id =  'tmp_'+name
	element.innerHTML = `<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path fill="currentColor" d="${code}"></path></svg><p>${name}</p><div onclick="AskForRemoveIcon('${name}')">x</div>`

	document.getElementById('icon-manager-container').appendChild(element)
	document.getElementById('icon-manager-add').style.display = 'none'
	isAddingIcon = false
}

function ToggleConvertIcon() {
	const element = document.getElementById('icon-manager-add-svg')
	if (element.style.display == 'none') element.style.display = 'block'
	else element.style.display = 'none'
}

function OpenSVGIcon() {
	const choosedFile = remote.dialog.showOpenDialogSync({title:'Choose File', properties:['openFile'], filters:[
		{name:'SVG File', extensions:['svg']}
	]})
	
	if (choosedFile == undefined || choosedFile.length == 0 || !existsSync(choosedFile[0])) return
	const code = readFileSync(choosedFile[0], {encoding:'utf-8'})
	const doc = new DOMParser().parseFromString(code, 'text/html') || null
	if (doc == null) { PopAlert('Connot Find SVG Tag', 'danger'); return }
	const temp = doc.body.getElementsByTagName('svg')
	if (temp.length == 0) { PopAlert('Cannot Find SVG Tag', 'danger'); return }
	const svg = temp[0]
	if (!svg.hasAttribute('data-icon')) svg.setAttribute('data-icon', choosedFile[0].replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, ''))

	document.getElementById('icon-manager-add-svg-code').value = svg.outerHTML
	ConvertSVGTagToAttribute()
}

function ConvertSVGTagToAttribute() {
	const code = document.getElementById('icon-manager-add-svg-code').value || null
	if (code == null || code.replace(/ /g, '').length == 0) { PopAlert('Fill SVG Tag', 'danger'); return }
	const doc = new DOMParser().parseFromString(code, 'text/html')
	if (doc == undefined) { PopAlert('Cannot Find SVG Tag', 'danger'); return }
	const temp = doc.body.getElementsByTagName('svg')
	if (temp.length == 0) { PopAlert('Cannot Find SVG Tag', 'danger'); return }
	const svg = temp[0]

	if (svg.hasAttribute('data-icon')) document.getElementById('icon-manager-add-name').value = svg.getAttribute('data-icon')

	let width = svg.viewBox.baseVal.width
	let height = svg.viewBox.baseVal.height
	if (width == 0) width = 512
	if (height == 0) height = 512
	document.getElementById('icon-manager-add-width').value = width
	document.getElementById('icon-manager-add-height').value = height

	const path = svg.getElementsByTagName('path')[0] || null
	if (path != null && path.hasAttribute('d')) document.getElementById('icon-manager-add-code').value = path.getAttribute('d')

	document.getElementById('icon-manager-add-svg').style.display = 'none'
}

function ChooseGroupOfIcons(addon_name) {
	addon_name = addon_name || null
	if (addon_name == null) addon_name = ''
	const choosedFile = remote.dialog.showOpenDialogSync({title:'Choose Files', properties:['openFile','multiSelections'], filters:[
		{name:'SVG File', extensions:['svg']}
	]})
	if (choosedFile == undefined) return

	let html = ''
	for (let i = 0; i < choosedFile.length; i++) {
		let name = choosedFile[i].replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, '')+addon_name
		if (temp_icons.hasOwnProperty(name)) continue
		let code = readFileSync(choosedFile[i], {encoding:'utf-8'})
		let doc = new DOMParser().parseFromString(code, 'text/html') || null
		if (doc == null) continue
		let svg = doc.body.getElementsByTagName('svg') || null
		if (svg == null || svg.length == 0) continue
		svg = svg[0]
		let path = svg.getElementsByTagName('path')[0] || null
		if (path == null || !path.hasAttribute('d')) continue
		path = path.getAttribute('d')
		let width = svg.viewBox.baseVal.width
		let height = svg.viewBox.baseVal.height
		if (width == 0) width = 512
		if (height == 0) height = 512
		temp_icons[name] = [width, height, path]

		html += `<div id="tmp_${name}"><svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path fill="currentColor" d="${path}"></path></svg><p>${name}</p><div onclick="AskForRemoveIcon('${name}')">x</div></div>`
	}

	document.getElementById('icon-manager-container').innerHTML += html
}