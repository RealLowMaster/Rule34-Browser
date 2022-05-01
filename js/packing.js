const pack = {
	open: false,
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
	const index = GetPost(site, id, true)
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

function Pack() {}

function UnPack(site, id) {}

function ClosePacking() {
	pack.listSite = []
	pack.listId = []
	pack.open = false
	document.getElementById('packing').style.display = 'none'
	document.getElementById('main-browser').removeAttribute('p')
	pack.container.innerHTML = null
}