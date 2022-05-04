const pack = {
	open: false,
	edit: false,
	container: document.getElementById('packing-container'),
	listSite: [],
	listId: []
}

function GetDragAfterPack(y) {
	let list = [...pack.container.querySelectorAll('div:not(.dragging)')]
	return list.reduce((closest, child) => {
		const box = child.getBoundingClientRect()
		const offset = y - box.top - box.height / 2
		if (offset < 0 && offset > closest.offset) return { offset: offset, element: child }
		else return closest
	}, { offset: Number.NEGATIVE_INFINITY }).element
}

pack.container.ondragover = e => {
	e.preventDefault()
	const draggable = pack.container.querySelector('.dragging')
	if (draggable == null) return
	const afterElement = GetDragAfterPack(e.clientY)
	if (afterElement == null) pack.container.append(draggable)
	else pack.container.insertBefore(draggable, afterElement)
}

function OpenPacking(site, id) {
	if (site == -1) return
	const index = GetPost(site, id)
	if (index == null) return
	if (!pack.open) {
		pack.open = true
		document.getElementById('packing').style.display = 'block'
		document.getElementById('main-browser').setAttribute('p', '')
	}
	for (let i = 0, l = pack.listSite.length; i < l; i++) if (pack.listId[i] == id && pack.listSite[i] == site) {
		PopAlert(Language('al-in-pack'), 'danger')
		return
	}
	const li = pack.listSite.length
	pack.listSite[li] = site
	pack.listId[li] = id
	const element = document.createElement('div')
	element.draggable = true
	element.ondragstart = e => e.target.classList.add('dragging')
	element.ondragend = e => e.target.classList.remove('dragging')
	element.setAttribute('s', site)
	element.setAttribute('i', id)
	const img = document.createElement('img')
	let src = paths.thumb+db.post[index][2]+'.jpg'
	if (!existsSync(src)) src = 'Image/no-img-225x225.webp'
	img.src = src+'?'+new Date().getTime()
	element.appendChild(img)
	pack.container.appendChild(element)
}

function Pack() {
	KeyManager.stop = true
	loading.Show(1, Language('packing')+'...')
	const idList = [], children = pack.container.children, cl = children.length
	if (cl <= 1) {
		PopAlert(Language('more-for-pack'), 'danger')
		loading.Close()
		KeyManager.stop = false
		return
	}
	for (let i = 0; i < cl; i++) {
		const site = Number(children[i].getAttribute('s')), id = Number(children[i].getAttribute('i'))
		const found = GetPost(site, id)
		if (found != null) idList.push(found)
	}

	const save = [-1, new Date().getTime(), [], [], null]
	save[4] = db.post[idList[0]][2]
	for (let i = 0, l = idList.length; i < l; i++) {
		save[2].push(db.post[idList[i]][0])
		save[3].push(db.post[idList[i]][1])
		db.post[idList[i]][10] = "0"
	}
	db.post.push(save)
	browser.SetNeedReload(-1)
	
	ClosePacking()
	loading.Close()
	KeyManager.stop = false
	// try { jsonfile.writeFileSync(paths.db+'post', {a:db.post}) } catch(err) { console.error(err) }
	PopAlert(Language('pack-end'))
}

function UnPack(id) {
	KeyManager.stop = true
	loading.Show(1, Language('unpacking')+'...')
	const index = GetPost(-1, id)
	if (index == null) {
		loading.Close()
		KeyManager.stop = false
		return
	}
	const data = db.post[index].slice()
	db.post.splice(index, 1)

	for (let i = 0, l = data[2].length; i < l; i++) {
		const pid = GetPost(data[2][i], data[3][i])
		if (pid != null) db.post[pid][10] = null
	}

	loading.Close()
	KeyManager.stop = false
	browser.SetNeedReload(-1)
	// try { jsonfile.writeFileSync(paths.db+'post', {a:db.post}) } catch(err) { console.error(err) }
	PopAlert(Language('unpack-end'))
}

function EditPack(site, id) {
	if (pack.open) {
		PopAlert(Language('pack-is-open'), 'warning')
		return
	}
	pack.open = true
	pack.edit = true
	pack.listSite = []
	pack.listId = []
	if (!pack.open) {
		pack.open = true
		document.getElementById('packing').style.display = 'block'
		document.getElementById('main-browser').setAttribute('p', '')
	}
}

function ClosePacking() {
	pack.listSite = []
	pack.listId = []
	pack.open = false
	pack.edit = false
	document.getElementById('packing').style.display = 'none'
	document.getElementById('main-browser').removeAttribute('p')
	pack.container.innerHTML = null
}