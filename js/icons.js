const icon_manager = {
	open: false,
	icons: null,
	adding: null,

	main: null,
	container: null,
	form: null,
	svg_add: null
}

function OpenIconManager() {
	if (icon_manager.open) return
	icon_manager.open = true
	if (icons == null) icon_manager.icons = {}
	else icon_manager.icons = icons
	icon_manager.adding = false

	icon_manager.main = document.createElement('div')
	icon_manager.main.id = 'icon-manager'

	let save = document.createElement('div')
	save.classList.add('mb-4')
	let save2 = document.createElement('div')
	save2.classList.add('btn')
	save2.classList.add('btn-primary')
	save2.title = 'Add Icon | Ctrl+Z'
	save2.onclick = () => OpenAddIcon()
	save2.innerText = 'Add'
	save.appendChild(save2)
	save2 = document.createElement('div')
	save2.classList.add('btn')
	save2.classList.add('btn-danger')
	save2.classList.add('ml-5')
	save2.title = 'Close Manager Undo everything | Esc'
	save2.onclick = () => CloseIconManager()
	save2.innerText = 'Close Manager'
	save.appendChild(save2)
	save2 = document.createElement('div')
	save2.classList.add('btn')
	save2.classList.add('btn-success')
	save2.title = 'Save Changes and Reload App | Ctrl+S'
	save2.onclick = () => SaveIconManager()
	save2.innerText = 'Save Icons'
	save.appendChild(save2)
	icon_manager.main.appendChild(save)

	icon_manager.container = document.createElement('div')
	icon_manager.container.id = 'icon-manager-container'
	icon_manager.main.appendChild(icon_manager.container)

	icon_manager.form = document.createElement('div')
	icon_manager.form.id = 'icon-manager-add'
	save = document.createElement('div')
	icon_manager.form.appendChild(save)
	save = document.createElement('div')
	save2 = document.createElement('button')
	save2.type = 'button'
	save2.classList.add('btn')
	save2.classList.add('btn-primary')
	save2.title = 'Ctrl+Z'
	save2.onclick = () => ToggleConvertIcon()
	save2.innerText = 'SVG'
	save.appendChild(save2)

	save2 = document.createElement('br')
	save.appendChild(save2)
	save2 = document.createElement('br')
	save.appendChild(save2)

	save2 = document.createElement('p')
	save2.innerText = 'Name:'
	save.appendChild(save2)
	save2 = document.createElement('input')
	save2.type = 'text'
	save2.setAttribute('placeholder', 'Name...')
	save2.id = 'iman'
	save.appendChild(save2)

	save2 = document.createElement('p')
	save2.innerText = 'Viewport Width:'
	save.appendChild(save2)
	save2 = document.createElement('input')
	save2.type = 'number'
	save2.setAttribute('placeholder', 'Width...')
	save2.id = 'imaw'
	save.appendChild(save2)

	save2 = document.createElement('p')
	save2.innerText = 'Viewport Height:'
	save.appendChild(save2)
	save2 = document.createElement('input')
	save2.type = 'number'
	save2.setAttribute('placeholder', 'Height...')
	save2.id = 'imah'
	save.appendChild(save2)

	save2 = document.createElement('p')
	save2.innerText = 'Code:'
	save.appendChild(save2)
	save2 = document.createElement('textarea')
	save2.setAttribute('placeholder', 'Code...')
	save2.rows = 8
	save2.id = 'imac'
	save.appendChild(save2)

	save2 = document.createElement('button')
	save2.type = 'button'
	save2.classList.add('btn')
	save2.classList.add('btn-primary')
	save2.onclick = () => AddIcon()
	save2.innerText = 'Add'
	save.appendChild(save2)
	save2 = document.createElement('button')
	save2.type = 'button'
	save2.classList.add('btn')
	save2.classList.add('btn-danger')
	save2.onclick = () => CloseAddIcon()
	save2.innerText = 'Cancel'
	save.appendChild(save2)

	icon_manager.svg_add = document.createElement('div')
	icon_manager.svg_add.id = 'icon-manager-add-svg'
	save2 = document.createElement('textarea')
	save2.rows = 20
	save2.setAttribute('placeholder', 'SVG Tag...')
	save2.id = 'imasc'
	icon_manager.svg_add.appendChild(save2)
	save2 = document.createElement('button')
	save2.type = 'button'
	save2.classList.add('btn')
	save2.classList.add('btn-primary')
	save2.onclick = () => OpenSVGIcon()
	save2.innerText = 'Open'
	icon_manager.svg_add.appendChild(save2)

	save2 = document.createElement('br')
	icon_manager.svg_add.appendChild(save2)
	save2 = document.createElement('br')
	icon_manager.svg_add.appendChild(save2)
	
	save2 = document.createElement('button')
	save2.type = 'button'
	save2.classList.add('btn')
	save2.classList.add('btn-primary')
	save2.onclick = () => ConvertSVGTagToAttribute()
	save2.innerText = 'Make'
	icon_manager.svg_add.appendChild(save2)
	
	save2 = document.createElement('button')
	save2.type = 'button'
	save2.classList.add('btn')
	save2.classList.add('btn-danger')
	save2.onclick = () => ToggleConvertIcon()
	save2.innerText = 'Cancel'
	icon_manager.svg_add.appendChild(save2)
	save.appendChild(icon_manager.svg_add)
	icon_manager.form.appendChild(save)
	icon_manager.main.appendChild(icon_manager.form)
	document.getElementById('window-body').appendChild(icon_manager.main)
	KeyManager.ChangeCategory('icon-manager')
	IconManagerLoadIcons()
}

function IconManagerLoadIcons() {
	let html = ''
	for (let i in icon_manager.icons) html += `<div id="tmp_${i}"><svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon_manager.icons[i][0]} ${icon_manager.icons[i][1]}"><path fill="currentColor" d="${icon_manager.icons[i][2]}"></path></svg><p>${i}</p><div onclick="AskForRemoveIcon('${i}')">x</div></div>`
	icon_manager.container.innerHTML = html
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
	if (icon_manager.icons.hasOwnProperty(name)) delete icon_manager.icons[name]
	const element = document.getElementById('tmp_'+name) || null
	if (element != null) element.remove()
}

function CloseIconManager() {
	icon_manager.icons = null
	icon_manager.adding = null
	icon_manager.container = null
	icon_manager.form = null
	try { icon_manager.main.remove() } catch(err) { console.error(err) }
	icon_manager.main = null
	icon_manager.open = false
	KeyManager.BackwardCategory()
}

function SaveIconManager() {
	if (icon_manager.icons == null) return
	KeyManager.stop = true
	loading.Show(1, 'Saving...')

	let arr = []
	for (let i in icon_manager.icons) arr.push(i)
	arr.sort()

	const saving_icons = {}
	for (let i = 0; i < arr.length; i++) saving_icons[arr[i]] = icon_manager.icons[arr[i]]

	let content = 'const icons = {'
	for (let i in saving_icons) content += `'${i}': [${saving_icons[i][0]},${saving_icons[i][1]},'${saving_icons[i][2]}'],`
	content += '}'

	try {
		writeFileSync('js/icons-database.js', content)
		remote.getCurrentWebContents().reload()
	} catch(err) {
		console.error(err)
		loading.Close()
		Alert('SavingThemeData->Err: '+err)
	}
}

function OpenAddIcon() {
	if (icon_manager.adding) { ToggleConvertIcon(); return }
	icon_manager.adding = true
	iman.value = null
	imaw.value = 512
	imah.value = 512
	imac.value = null
	icon_manager.svg_add.style.display = 'none'
	imasc.value = null
	icon_manager.form.style.display = 'flex'
}

function CloseAddIcon() {
	icon_manager.form.style.display = 'none'
	icon_manager.adding = false
}

function AddIcon() {
	if (!icon_manager.adding) return
	let name = iman.value || null
	if (name == null || name.replace(/ /g, '').length == 0) { PopAlert('Fill name', 'danger'); return }
	name = name.replace(/\s\s+/g, '-').replace(/ /g, '-').replace(/'/g, '').replace(/"/g, '').replace(/\\/g, '').toLowerCase()
	let width = imaw.value || null
	if (width == null || width == 0) { PopAlert('Fill Width', 'danger'); return }
	width = Number(width)
	let height = imah.value || null
	if (height == null || height == 0) { PopAlert('Fill Height', 'danger'); return }
	height = Number(height)
	const code = imac.value || null
	if (code == null || code.replace(/ /g, '').length == 0) { PopAlert('Fill code', 'danger'); return }

	if (icon_manager.icons.hasOwnProperty(name)) { PopAlert('Icon with this name Already Exist!', 'danger'); return }

	icon_manager.icons[name] = [width, height, code]
	
	const element = document.createElement('div')
	element.id =  'tmp_'+name
	element.innerHTML = `<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path fill="currentColor" d="${code}"></path></svg><p>${name}</p><div onclick="AskForRemoveIcon('${name}')">x</div>`

	icon_manager.container.appendChild(element)
	icon_manager.form.style.display = 'none'
	icon_manager.adding = false
}

function ToggleConvertIcon() {
	const element = icon_manager.svg_add
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

	imasc.value = svg.outerHTML
	ConvertSVGTagToAttribute()
}

function ConvertSVGTagToAttribute() {
	const code = imasc.value || null
	if (code == null || code.replace(/ /g, '').length == 0) { PopAlert('Fill SVG Tag', 'danger'); return }
	const doc = new DOMParser().parseFromString(code, 'text/html')
	if (doc == undefined) { PopAlert('Cannot Find SVG Tag', 'danger'); return }
	const temp = doc.body.getElementsByTagName('svg')
	if (temp.length == 0) { PopAlert('Cannot Find SVG Tag', 'danger'); return }
	const svg = temp[0]

	if (svg.hasAttribute('data-icon')) iman.value = svg.getAttribute('data-icon')

	let width = svg.viewBox.baseVal.width
	let height = svg.viewBox.baseVal.height
	if (width == 0) width = 512
	if (height == 0) height = 512
	imaw.value = width
	imah.value = height

	const path = svg.getElementsByTagName('path')[0] || null
	if (path != null && path.hasAttribute('d')) imac.value = path.getAttribute('d')

	icon_manager.svg_add.style.display = 'none'
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
		if (icon_manager.icons.hasOwnProperty(name)) continue
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
		icon_manager.icons[name] = [width, height, path]

		html += `<div id="tmp_${name}"><svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path fill="currentColor" d="${path}"></path></svg><p>${name}</p><div onclick="AskForRemoveIcon('${name}')">x</div></div>`
	}

	icon_manager.container.innerHTML += html
}