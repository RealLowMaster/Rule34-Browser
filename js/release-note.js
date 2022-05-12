const release_manager = {
	open: false,
	main: null,
	version: null,
	news: null,
	bugs: null,
	improvements: null,
	plans: null
}

function OpenReleaseNotesMaker() {
	if (release_manager.open) return
	release_manager.open = true
	KeyManager.stop = true
	release_manager.main = document.createElement('div')
	release_manager.main.id = 'release-maker'

	let save = document.createElement('h1')
	save.innerText = 'Release Notes'
	release_manager.main.appendChild(save)
	release_manager.version = document.createElement('input')
	release_manager.version.type = 'text'
	release_manager.version.setAttribute('placeholder', 'Version...')
	release_manager.main.appendChild(release_manager.version)

	save = document.createElement('h1')
	save.innerText = '🔥 New Features'
	release_manager.main.appendChild(save)
	save = document.createElement('div')
	release_manager.news = document.createElement('div')
	save.appendChild(release_manager.news)
	let save2 = document.createElement('div')
	save2.innerText = '+'
	save2.setAttribute('onclick', 'AddToList(this)')
	save.appendChild(save2)
	release_manager.main.appendChild(save)

	save = document.createElement('h1')
	save.innerText = '🔧 Bug Fixes'
	release_manager.main.appendChild(save)
	save = document.createElement('div')
	release_manager.bugs = document.createElement('div')
	save.appendChild(release_manager.bugs)
	save2 = document.createElement('div')
	save2.innerText = '+'
	save2.setAttribute('onclick', 'AddToList(this)')
	save.appendChild(save2)
	release_manager.main.appendChild(save)

	save = document.createElement('h1')
	save.innerText = '🌟 Improvements'
	release_manager.main.appendChild(save)
	save = document.createElement('div')
	release_manager.improvements = document.createElement('div')
	save.appendChild(release_manager.improvements)
	save2 = document.createElement('div')
	save2.innerText = '+'
	save2.setAttribute('onclick', 'AddToList(this)')
	save.appendChild(save2)
	release_manager.main.appendChild(save)

	save = document.createElement('h1')
	save.innerText = '🚢 Plans'
	release_manager.main.appendChild(save)
	save = document.createElement('div')
	release_manager.plans = document.createElement('div')
	save.appendChild(release_manager.plans)
	save2 = document.createElement('div')
	save2.innerText = '+'
	save2.setAttribute('onclick', 'AddToList(this)')
	save.appendChild(save2)
	release_manager.main.appendChild(save)

	save = document.createElement('br')
	release_manager.main.appendChild(save)
	save = document.createElement('br')
	release_manager.main.appendChild(save)

	save = document.createElement('button')
	save.classList.add('btn')
	save.classList.add('btn-primary')
	save.innerText = 'Save'
	save.onclick = () => CloseReleaseNotesMaker(true)
	release_manager.main.appendChild(save)
	save = document.createElement('button')
	save.classList.add('btn')
	save.classList.add('btn-danger')
	save.innerText = 'Cancel'
	save.onclick = () => CloseReleaseNotesMaker(false)
	release_manager.main.appendChild(save)

	document.getElementById('window-body').appendChild(release_manager.main)
}

function CloseReleaseNotesMaker(save) {
	if (save) {
		loading.Show(1, 'Saving...')
		const save = {
			version:'',
			new: null,
			bug: null,
			improvement: null,
			plan: null
		}
		save.version = release_manager.version.value
		let children = release_manager.news.children
		if (children.length > 0) {
			save.new = []
			for (let i = 0, l = children.length; i < l; i++) {
				const input = children[i].children[0]
				if (input.value.replace(/ /g,'').length > 0) save.new.push(input.value)
			}
		}
		children = release_manager.bugs.children
		if (children.length > 0) {
			save.bug = []
			for (let i = 0, l = children.length; i < l; i++) {
				const input = children[i].children[0]
				if (input.value.replace(/ /g,'').length > 0) save.bug.push(input.value)
			}
		}
		children = release_manager.improvements.children
		if (children.length > 0) {
			save.improvement = []
			for (let i = 0, l = children.length; i < l; i++) {
				const input = children[i].children[0]
				if (input.value.replace(/ /g,'').length > 0) save.improvement.push(input.value)
			}
		}
		children = release_manager.plans.children
		if (children.length > 0) {
			save.plan = []
			for (let i = 0, l = children.length; i < l; i++) {
				const input = children[i].children[0]
				if (input.value.replace(/ /g,'').length > 0) save.plan.push(input.value)
			}
		}
		try {
			jsonfile.writeFileSync('rn.json', save)
			remote.getCurrentWebContents().reload()
		} catch(err) {
			console.error(err)
			Alert('SavingData->'+err)
		}
	} else {
		release_manager.news = null
		release_manager.bugs = null
		release_manager.improvements = null
		release_manager.plans = null
		try { release_manager.main.remove() } catch(err) { console.error(err) }
		release_manager.main = null
		release_manager.open = false
		KeyManager.stop = false
	}
}

function AddToList(who) {
	let save = document.createElement('div')
	let save2 = document.createElement('input')
	save2.type = 'text'
	save.appendChild(save2)
	save2 = document.createElement('div')
	save2.title = 'Remove'
	save2.innerText = '-'
	save2.setAttribute('onclick', 'RemoveFromList(this)')
	save.appendChild(save2)
	who.parentElement.children[0].appendChild(save)
}

function RemoveFromList(who) { who.parentElement.remove() }