const { post } = require("request")

// Collections
function LoadCollections(tabId) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(-4)
	tab.AddHistory(-9)
	const container = document.createElement('div')
	container.classList.add('main-page')
	container.appendChild(GetMainMenu(tab, 3))
	
	let save = document.createElement('div')
	save.style.width = '100%'
	save.style.margin = '15px 0'
	save.style.padding = '0 15px'
	save.style.textAlign = 'right'
	let save2 = document.createElement('div')
	save2.classList.add('btn')
	save2.classList.add('btn-primary')
	save2.innerText = Language('add-collection')
	save2.onclick = () => OpenAddCollection()
	save.appendChild(save2)
	container.appendChild(save)

	let l = db.collection.length
	if (l != 0) {
		save = document.createElement('div')
		save.classList.add('collection-container')
		let save3, save4
		for (let i = 0; i < l; i++) {
			save2 = document.createElement('div')
			const si = i, link = tab.AddLink(-10, [i, 1])
			save2.onmousedown = e => {
				const key = e.which
				if (key == 1) browser.LinkClick(tabId, link)
				else if (key == 2) browser.OpenLinkInNewTab(tabId, link)
				else {
					ContextManager.save = [tabId, link, si]
					ContextManager.ShowMenu('collection')
				}
			}
		
			// Images
			save3 = document.createElement('div')
			const n = db.collection[i][1].length, imgs = [
				document.createElement('img'),
				document.createElement('img'),
				document.createElement('img')
			]
			let counter = 0
			for (let j = counter; j < n; j++) {
				counter++
				const post = GetPost(db.collection[i][1][j], false)
				const url = paths.thumb+(post[0] == -1 ? post[2][0] : post[2])+'.jpg'
				if (existsSync(url)) {
					imgs[0].src = url
					break
				}
			}
			if (imgs[0].src == '') {
				imgs[0].src = 'Image/no-img-225x225.webp'
				imgs[1].src = 'Image/no-img-225x225.webp'
				imgs[2].src = 'Image/no-img-225x225.webp'
			} else {
				for (let j = counter; j < n; j++) {
					counter++
					const post = GetPost(db.collection[i][1][j], false)
					const url = paths.thumb+(post[0] == -1 ? post[2][0] : post[2])+'.jpg'
					if (existsSync(url)) {
						imgs[1].src = url
						break
					}
				}
				if (imgs[1].src == '') {
					imgs[1].src = 'Image/no-img-225x225.webp'
					imgs[2].src = 'Image/no-img-225x225.webp'
				} else {
					for (let j = counter; j < n; j++) {
						counter++
						const post = GetPost(db.collection[i][1][j], false)
						const url = paths.thumb+(post[0] == -1 ? post[2][0] : post[2])+'.jpg'
						if (existsSync(url)) {
							imgs[2].src = url
							break
						}
					}
					if (imgs[2].src == '') imgs[2].src = 'Image/no-img-225x225.webp'
				}
			}
			save3.appendChild(imgs[2])
			save3.appendChild(imgs[1])
			save3.appendChild(imgs[0])
			save2.appendChild(save3)

			// Text
			save3 = document.createElement('div')
			save3.innerText = db.collection[i][0]
			save4 = document.createElement('div')
			save4.innerText = n
			save3.appendChild(save4)
			save2.appendChild(save3)
			save.appendChild(save2)
		}
		container.appendChild(save)
	} else {
		save = document.createElement('div')
		save.classList.add('alert')
		save.classList.add('alert-danger')
		save.innerText = Language('no-collection')
		container.appendChild(save)
	}

	tab.Load(token, container, 'Collections')
}

function LoadCollection(tabId, index = null, page = 1) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(-5, index)
	tab.AddHistory(-10, [index, page])
	if (db.collection[index] == undefined) tab.Error(token, Language('pnf'))
	const container = document.createElement('div')
	container.classList.add('main-page')
	container.appendChild(GetMainMenu(tab, 0))

	let save = document.createElement('div')
	save.classList.add('main-page-title')
	save.innerText = 'Collection > '
	let save2 = document.createElement('span')
	save2.innerText = db.collection[index][0]
	save.appendChild(save2)
	save.innerHTML += ' > Page '+page
	container.appendChild(save)

	save = document.createElement('div')
	save.classList.add('main-page-filter')
	save2 = document.createElement('div')
	save2.innerHTML = Icon('new-to-old')
	if (browser.backward) save2.setAttribute('active','')
	else save2.onclick = () => ChangeFilter(true)
	save.appendChild(save2)
	save2 = document.createElement('div')
	save2.innerHTML = Icon('old-to-new')
	if (!browser.backward) save2.setAttribute('active','')
	else save2.onclick = () => ChangeFilter(false)
	save.appendChild(save2)
	container.appendChild(save)

	const post_cont = db.collection[index][1].length
	const date = new Date().getTime()
	const total_pages = Math.ceil(post_cont / setting.pic_per_page)
	if (page > total_pages) page = total_pages

	if (total_pages > 0) {
		save = document.createElement('div')
		save.classList.add('main-page-posts')

		let min = 0, max
		tab.save = []
		if (browser.backward) {
			if (post_cont < setting.pic_per_page) max = post_cont
			else {
				const use_page = page - 1
				max = use_page * setting.pic_per_page
				max = post_cont - max
				min = max - setting.pic_per_page
				if (min < 0) min = 0
			}
			for (let i = max - 1; i >= min; i--) save.appendChild(GetPostElement(tab, db.collection[index][1][i], date, true))
		} else {
			if (post_cont < setting.pic_per_page) max = post_cont
			else {
				min = (setting.pic_per_page * page) - setting.pic_per_page
				max = min + setting.pic_per_page
				if (max > post_cont) max = post_cont
			}
			for (let i = min; i < max; i++) save.appendChild(GetPostElement(tab, db.collection[index][1][i], date, true))
		}
		container.appendChild(save)
		const pagination = GetPaginationList(total_pages, page)
		save = document.createElement('div')
		save.classList.add('main-page-pagination')
		for (let i = 0, l = pagination.length; i < l; i++) {
			if (pagination[i][1] != null) save.appendChild(NormalLinkElement('div', pagination[i][0], tabId, tab.AddLink(-10, [index, pagination[i][1]])))
			else {
				const btn = document.createElement('div')
				btn.setAttribute('active', '')
				btn.innerText = pagination[i][0]
				save.appendChild(btn)
			}
		}
		container.appendChild(save)
	} else {
		page = 1
		save = document.createElement('div')
		save.classList.add('alert')
		save.classList.add('alert-danger')
		save.setAttribute('l', 'nopost')
		save.innerText = Language('nopost')
		container.appendChild(save)
	}

	save = document.createElement('div')
	save.classList.add('post-counter')
	save.innerText = post_cont
	container.appendChild(save)

	tab.Load(token, container, db.collection[index][0]+' '+page, null, page, total_pages)
}

const collection = {
	post: null
}

function OpenAddPostCollection(id) {
	if (id == null) return
	KeyManager.stop = true
	KeyManager.ChangeCategory('collection')
	document.getElementById('addpostcol').style.display = 'flex'
	const container = document.getElementById('addpostcolc')
	collection.post = id

	let save, save2
	for (let i = 0, l = db.collection.length; i < l; i++) {
		save = document.createElement('div')
		save2 = document.createElement('p')
		save2.innerText = db.collection[i][0]
		save2.title = db.collection[i][0]
		save.appendChild(save2)

		save2 = document.createElement('div')
		save2.classList.add('btn')
		if (db.collection[i][1].indexOf(id) != -1) {
			save2.classList.add('btn-danger')
			save2.innerText = Language('remove')
			save2.setAttribute('onclick', 'AddPostCollection(this, '+i+', true)')
		} else {
			save2.classList.add('btn-primary')
			save2.innerText = Language('add')
			save2.setAttribute('onclick', 'AddPostCollection(this, '+i+', false)')
		}
		save.appendChild(save2)

		container.appendChild(save)
	}
	KeyManager.stop = false
}

function AddPostCollection(who, index, remove) {
	if (remove) {
		who.setAttribute('class', 'btn btn-primary')
		who.setAttribute('onclick', 'AddPostCollection(this, '+index+', false)')
		who.innerText = Language('add')
		db.collection[index][1].splice(db.collection[index][1].indexOf(collection.post), 1)
	} else {
		who.setAttribute('class', 'btn btn-danger')
		who.setAttribute('onclick', 'AddPostCollection(this, '+index+', true)')
		who.innerText = Language('remove')
		db.collection[index][1].push(collection.post)
	}
	try { jsonfile.writeFileSync(paths.db+'collection', { v:db.manager.collection, a:db.collection }) } catch(err) { console.error(err) }
	browser.SetNeedReload(-4)
	browser.SetNeedReload(-5)
}

function CloseAddPostCollection() {
	KeyManager.stop = true
	document.getElementById('addpostcolc').innerHTML = null
	document.getElementById('addpostcol').style.display = 'none'
	KeyManager.BackwardCategory()
	KeyManager.stop = false
}

function OpenAddCollection(rename = null) {
	KeyManager.stop = true
	if (rename != null) {
		if (db.collection[rename] == undefined) {
			PopAlert(Language('col-nfound'), 'danger')
			return
		}
		addcoli.value = db.collection[rename][0]
		document.getElementById('addcolb').setAttribute('onclick', 'AddCollection('+rename+')')
	} else document.getElementById('addcolb').setAttribute('onclick', 'AddCollection()')
	addcol.onsubmit = e => {
		e.preventDefault()
		AddCollection(rename)
	}
	addcol.style.display = 'flex'
	addcoli.focus()
}

function AddCollection(rename = null) {
	let val = addcoli.value.replace(/\s\s+/g, ' ')
	if (val[0] == ' ') val = val.slice(1)
	if (val.replace(/ /g, '').length == 0) {
		PopAlert(Language('fill-name'), 'danger')
		return
	}

	for (let i = 0, l = db.collection.length; i < l; i++) {
		if (db.collection[i][0] == val && i != rename) {
			PopAlert(Language('col-w-name-exist'), 'danger')
			return
		}
	}
	if (rename == null) {
		db.collection.push([val, []])
		PopAlert(Language('collection-added'))
	} else {
		db.collection[rename][0] = val
		PopAlert(Language('col-renamed'))
	}
	try { jsonfile.writeFileSync(paths.db+'collection', { v:db.manager.collection, a:db.collection }) } catch(err) { console.error(err) }
	addcol.style.display = 'none'
	addcoli.value = null
	KeyManager.stop = false
	browser.SetNeedReload(-4)
}

function CloseAddCollection() {
	addcol.style.display = 'none'
	KeyManager.stop = false
	addcoli.value = null
}

function AskDeleteCollection(index) {
	Confirm(Language('are-ysdc'), [
		{
			text: Language('delete'),
			class: 'btn btn-danger',
			click: `DeleteCollection(${index})`
		},
		{text: Language('cancel')}
	])
}

function DeleteCollection(index) {
	if (db.collection[index] == undefined) return
	db.collection.splice(index, 1)
	try { jsonfile.writeFileSync(paths.db+'collection', { v:db.manager.collection, a:db.collection }) } catch(err) { console.error(err) }
	browser.SetNeedReload(-4)
	browser.SetNeedReload(-1)
}