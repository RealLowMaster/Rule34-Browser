const r34xxx = new rule34xxx()

function Rule34XXXMenu(tab) {
	let save = document.createElement('div')
	save.classList.add('rule34-xxx-menu')
	save.appendChild(NormalLinkElement('div', 'Posts', tab.id, tab.AddLink(4, [1,null]), false))
	save.appendChild(NormalLinkElement('div', 'Artists', tab.id, tab.AddLink(5, 1), false))
	save.appendChild(NormalLinkElement('div', 'Tags', tab.id, tab.AddLink(6, 1), false))
	save.appendChild(NormalLinkElement('div', 'Pools', tab.id, tab.AddLink(7, 1), false))
	save.appendChild(NormalLinkElement('div', 'Stats', tab.id, tab.AddLink(8), false))
	return save
}

function Rule34XXXGetTags(tab, arr) {
	const container = document.createElement('div')
	container.classList.add('rule34-xxx-tags')
	let save
	if (arr.parody != undefined) {
		save = document.createElement('p')
		save.innerText = 'Copyright'
		container.appendChild(save)
		for (let i = 0, l = arr.parody.length; i < l; i++) {
			const row = document.createElement('div')
			row.appendChild(NormalLinkElement('span', arr.parody[i][0], tab.id, tab.AddLink(4, [1, arr.parody[i][0].replace(/ /g, '_')])))
			save = document.createElement('span')
			save.innerText = arr.parody[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	if (arr.character != undefined) {
		save = document.createElement('p')
		save.innerText = 'Character'
		container.appendChild(save)
		for (let i = 0, l = arr.character.length; i < l; i++) {
			const row = document.createElement('div')
			row.appendChild(NormalLinkElement('span', arr.character[i][0], tab.id, tab.AddLink(4, [1, arr.character[i][0].replace(/ /g, '_')])))
			save = document.createElement('span')
			save.innerText = arr.character[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	if (arr.artist != undefined) {
		save = document.createElement('p')
		save.innerText = 'Artist'
		container.appendChild(save)
		for (let i = 0, l = arr.artist.length; i < l; i++) {
			const row = document.createElement('div')
			row.appendChild(NormalLinkElement('span', arr.artist[i][0], tab.id, tab.AddLink(4, [1, arr.artist[i][0].replace(/ /g, '_')])))
			save = document.createElement('span')
			save.innerText = arr.artist[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	if (arr.tag != undefined) {
		save = document.createElement('p')
		save.innerText = 'General'
		container.appendChild(save)
		for (let i = 0, l = arr.tag.length; i < l; i++) {
			const row = document.createElement('div')
			row.appendChild(NormalLinkElement('span', arr.tag[i][0], tab.id, tab.AddLink(4, [1, arr.tag[i][0].replace(/ /g, '_')])))
			save = document.createElement('span')
			save.innerText = arr.tag[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	if (arr.meta != undefined) {
		save = document.createElement('p')
		save.innerText = 'Meta'
		container.appendChild(save)
		for (let i = 0, l = arr.meta.length; i < l; i++) {
			const row = document.createElement('div')
			row.appendChild(NormalLinkElement('span', arr.meta[i][0], tab.id, tab.AddLink(4, [1, arr.meta[i][0].replace(/ /g, '_')])))
			save = document.createElement('span')
			save.innerText = arr.meta[i][1]
			row.appendChild(save)
			container.appendChild(row)
		}
	}
	return container
}

function Rule34XXXHome(tabId, page = 1, search = null) {
	const tab = browser.GetTab(tabId)
	const token = tab.Loading(0)
	tab.AddHistory(4, [page, search])


	r34xxx.Page(page, search, (err, arr) => {
		if (err) {
			console.error(err)
			return
		}
		const container = document.createElement('div')
		container.classList.add('rule34-xxx-page')
		container.appendChild(Rule34XXXMenu(tab))

		let save = document.createElement('p')
		save.classList.add('rule34-xxx-title')
		save.innerText = 'Page '+page
		container.appendChild(save)

		const sides = document.createElement('div')
		sides.classList.add('rule34-xxx-sides')

		let side = document.createElement('div')
		side.appendChild(Rule34XXXGetTags(tab, arr))
		sides.appendChild(side)

		side = document.createElement('div')
		sides.appendChild(side)


		container.appendChild(sides)
		tab.Load(token, container, 'Page '+page, 'var(--r34x-primary-bg)')
	})
}

function Rule34XXXArtists(tabId, page) {}
function Rule34XXXTags(tabId, page) {}
function Rule34XXXPools(tabId, page) {}
function Rule34XXXStats(tabId) {}