const pack = {
	open: false,
	edit: false,
	data: [],
	container: document.getElementById('packing-container'),
	listSite: [],
	listId: [],
	listBack: [[],[]]
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
		mb_pages.setAttribute('p', '')
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
	element.oncontextmenu = () => ContextManager.ShowMenu('pack', [site, id])
	element.setAttribute('s', site)
	element.setAttribute('i', id)
	const img = document.createElement('img')
	let src = paths.thumb+db.post[index][2]+'.jpg'
	if (!existsSync(src)) src = 'Image/no-img-225x225.webp'
	img.src = src+'?'+new Date().getTime()
	element.appendChild(img)
	pack.container.appendChild(element)
}

function IsInPack(site, id, index = false) {
	if (index) {
		if (!pack.open) return -1
		for (let i = 0, l = pack.listSite.length; i < l; i++) if (pack.listId[i] == id && pack.listSite[i] == site) return i
		return -1
	} else {
		if (!pack.open) return false
		for (let i = 0, l = pack.listSite.length; i < l; i++) if (pack.listId[i] == id && pack.listSite[i] == site) return true
		return false
	}
}

function IsItPack(id) {
	if (pack.edit && pack.data[1] == id) return true
	return false
}

function RemoveFromPack(site, id) {
	const index = IsInPack(site, id, true)
	if (index == -1) return
	const children = pack.container.children
	for (let i = 0, l = children.length; i < l; i++) if (children[i].getAttribute('i') == id && children[i].getAttribute('s') == site) {
		children[i].remove()
		pack.listSite.splice(index, 1)
		pack.listId.splice(index, 1)
		if (site == -1) {
			let exists = false, sid = id
			site = pack.data[10][id], id = pack.data[11][id]
			for (let j = 0, n = pack.listBack[0].length; j < n; j++) if (pack.listBack[1][i] == id && pack.listBack[0][i] == site) exists = true
			if (!exists) {
				pack.listBack[0].push(site)
				pack.listBack[1].push(id)
			}
			db.post.push([
				site,
				id,
				pack.data[2][sid],
				pack.data[3][sid],
				pack.data[4][sid],
				pack.data[5][sid],
				pack.data[6][sid],
				pack.data[7][sid],
				pack.data[8][sid],
				pack.data[9][sid]
			])
			browser.SetNeedReload(-1)
			try { jsonfile.writeFileSync(paths.db+'post', {a:db.post, h:db.post_have}) } catch(err) { console.error(err) }
		}
		return
	}
}

function Pack() {
	KeyManager.stop = true
	loading.Show(1, Language('packing')+'...')
	const idList = [], siteList = [], children = pack.container.children, cl = children.length
	if (cl <= 1) {
		PopAlert(Language('more-for-pack'), 'danger')
		loading.Close()
		KeyManager.stop = false
		return
	}
	for (let i = 0; i < cl; i++) {
		const site = Number(children[i].getAttribute('s')), id = Number(children[i].getAttribute('i'))
		if (site != -1) {
			const found = GetPost(site, id)
			if (found != null) {
				siteList.push(site)
				idList.push(found)
			}
		} else {
			siteList.push(-1)
			idList.push(id)
		}
	}
	const save = [-1, new Date().getTime(), [], [], [], [], [], [], [], [], [], []]
	for (let i = 0, l = idList.length; i < l; i++) {
		if (siteList[i] != -1) {
			save[2].push(db.post[idList[i]][2])
			save[3].push(db.post[idList[i]][3])
			save[4].push(db.post[idList[i]][4])
			save[5].push(db.post[idList[i]][5])
			save[6].push(db.post[idList[i]][6])
			save[7].push(db.post[idList[i]][7])
			save[8].push(db.post[idList[i]][8])
			save[9].push(db.post[idList[i]][9] || null)
			save[10].push(db.post[idList[i]][0])
			save[11].push(db.post[idList[i]][1])
		} else {
			save[2].push(pack.data[2][idList[i]])
			save[3].push(pack.data[3][idList[i]])
			save[4].push(pack.data[4][idList[i]])
			save[5].push(pack.data[5][idList[i]])
			save[6].push(pack.data[6][idList[i]])
			save[7].push(pack.data[7][idList[i]])
			save[8].push(pack.data[8][idList[i]])
			save[9].push(pack.data[9][idList[i]])
			save[10].push(pack.data[10][idList[i]])
			save[11].push(pack.data[11][idList[i]])
		}
	}

	// Sorting Ids Lower -> Higher
	let done = false
	while (!done) {
		done = true
		for (let i = 1, l = idList.length; i < l; i += 1) {
			if (idList[i - 1] > idList[i]) {
				done = false
				let tmp = idList[i - 1], tmp2 = siteList[i - 1]
				siteList[i - 1] = siteList[i]
				idList[i - 1] = idList[i]
				siteList[i] = tmp2
				idList[i] = tmp
			}
		}
	}
	
	for (let i = siteList.length - 1; i >= 0; i--) {
		if (siteList[i] != -1) {
			db.post_have[siteList[i]].push(db.post[idList[i]][1])
			db.post.splice(idList[i], 1)
		}
	}
	if (pack.edit) {
		const packIndex = GetPost(-1, pack.data[1])
		if (packIndex == null) {
			PopAlert('nopostfound', 'danger')
			loading.Close()
			KeyManager.stop = false
			ClosePacking()
			return
		}
		db.post[packIndex] = save
	}
	else db.post.push(save)
	browser.SetNeedReload(-1)
	pack.listBack = [[],[]]
	ClosePacking()
	loading.Close()
	KeyManager.stop = false
	try { jsonfile.writeFileSync(paths.db+'post', {a:db.post, h:db.post_have}) } catch(err) { console.error(err) }
	PopAlert(Language('pack-end'))
}

function AskForUnPack(id) {
	Confirm(Language('ask-to-unpack'), [
		{
			text: Language('yes'),
			btn: 'btn btn-primary',
			click: () => UnPack(id)
		},
		{ text: Language('no'), class: 'btn btn-danger' }
	])
}

function UnPack(id) {
	KeyManager.stop = true
	loading.Show(1, Language('unpacking')+'...')
	if (IsItPack(id)) {
		KeyManager.stop = false
		loading.Close()
		PopAlert(Language('cunpack-in-edit'), 'danger')
		return
	}
	const index = GetPost(-1, id)
	if (index == null) {
		loading.Close()
		KeyManager.stop = false
		return
	}
	const data = db.post[index].slice()
	db.post.splice(index, 1)

	for (let i = 0, l = data[10].length; i < l; i++) {
		const hindex = db.post_have[data[10][i]].indexOf(data[11][i])
		if (hindex >= 0) db.post_have[data[10][i]].splice(hindex, 1)
		db.post.push([
			data[10][i],
			data[11][i],
			data[2][i],
			data[3][i],
			data[4][i],
			data[5][i],
			data[6][i],
			data[7][i],
			data[8][i],
			data[9][i]
		])
	}

	loading.Close()
	KeyManager.stop = false
	browser.SetNeedReload(-1)
	try { jsonfile.writeFileSync(paths.db+'post', {a:db.post, h:db.post_have}) } catch(err) { console.error(err) }
	PopAlert(Language('unpack-end'))
}

function EditPack(id) {
	if (pack.open) {
		PopAlert(Language('pack-is-open'), 'warning')
		return
	}
	pack.open = true
	pack.edit = true
	pack.listSite = []
	pack.listId = []
	pack.listBack = [[],[]]
	document.getElementById('packing').style.display = 'block'
	mb_pages.setAttribute('p', '')
	const index = GetPost(-1, id)
	if (index == null) {
		ClosePacking()
		PopAlert(Language('nopostfound'), 'danger')
		return
	}
	pack.data = db.post[index].slice()

	for (let i = 0, l = pack.data[10].length; i < l; i++) {
		const li = pack.listSite.length
		pack.listSite[li] = -1
		pack.listId[li] = i
		const element = document.createElement('div')
		element.draggable = true
		element.ondragstart = e => e.target.classList.add('dragging')
		element.ondragend = e => e.target.classList.remove('dragging')
		element.oncontextmenu = () => ContextManager.ShowMenu('pack', [-1, i])
		element.setAttribute('s', -1)
		element.setAttribute('i', i)
		const img = document.createElement('img')
		let src = paths.thumb+pack.data[2][i]+'.jpg'
		if (!existsSync(src)) src = 'Image/no-img-225x225.webp'
		img.src = src+'?'+new Date().getTime()
		element.appendChild(img)
		pack.container.appendChild(element)
	}
}

function ClosePacking() {
	if (pack.listBack[0].length > 0) {
		const siteList = pack.listBack[0], idList = pack.listBack[1]
		let done = false
		while (!done) {
			done = true
			for (let i = 1, l = idList.length; i < l; i += 1) {
				if (idList[i - 1] > idList[i]) {
					done = false
					let tmp = idList[i - 1], tmp2 = siteList[i - 1]
					siteList[i - 1] = siteList[i]
					idList[i - 1] = idList[i]
					siteList[i] = tmp2
					idList[i] = tmp
				}
			}
		}

		let changed = false
		for (let i = siteList.length - 1; i >= 0; i--) {
			const index = GetPost(siteList[i], idList[i])
			if (index != null) {
				db.post.splice(index, 1)
				changed = true
			}
		}
		if (changed) {
			try { jsonfile.writeFileSync(paths.db+'post', {a:db.post, h:db.post_have}) } catch(err) { console.error(err) }
			browser.SetNeedReload(-1)
		}
	}
	pack.listSite = []
	pack.listId = []
	pack.listBack = [[],[]]
	pack.data = []
	pack.open = false
	pack.edit = false
	document.getElementById('packing').style.display = 'none'
	mb_pages.removeAttribute('p')
	pack.container.innerHTML = null
}