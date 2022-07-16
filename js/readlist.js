let isReads = false

function OpenReads() {
	if (mb_pages.hasAttribute('p')) ClosePacking()
	isReads = true
	document.getElementById('readlist').style.display = 'block'
	mb_pages.setAttribute('p', '')

	const reads = document.getElementById('reads')
	reads.innerHTML = null
	let save, save2
	for (let i = db.reads.length - 1; i >= 0; i--) {
		save = document.createElement('div')
		save.setAttribute('i', i)
		save2 = document.createElement('img')
		save2.src = 'Image/sites/'+sites[db.reads[i][1]].url+'-32x32.'+sites[db.reads[i][1]].icon
		save.appendChild(save2)
		save2 = document.createElement('p')
		save2.innerText = db.reads[i][0]
		save2.title = db.reads[i][0]
		save2.onclick = e => {
			const parent = e.target.parentElement
			if (parent.hasAttribute('i')) {
				const ii = Number(parent.getAttribute('i'))
				browser.OpenInNewTab(db.reads[ii][2], db.reads[ii][3])
			}
		}
		save.appendChild(save2)
		save2 = document.createElement('div')
		save2.innerText = '⨯'
		save2.setAttribute('onclick', 'RemoveRead(this.parentElement)')
		save.appendChild(save2)
		reads.appendChild(save)
	}
}

function CloseReads() {
	isReads = false
	document.getElementById('reads').innerHTML = null
	document.getElementById('readlist').style.display = 'none'
	mb_pages.removeAttribute('p')
}

function RemoveRead(who) {
	const i = Number(who.getAttribute('i'))
	who.remove()
	db.reads.splice(i, 1)
	try { jsonfile.writeFileSync(dirDocument+'/reads', { v:db.manager.reads, a:db.reads }) } catch(err) { console.log(err) }
	const reads = document.getElementById('reads')
	reads.innerHTML = null
	let save, save2
	for (let i = db.reads.length - 1; i >= 0; i--) {
		save = document.createElement('div')
		save.setAttribute('i', i)
		save2 = document.createElement('img')
		save2.src = 'Image/sites/'+sites[db.reads[i][1]].url+'-32x32.'+sites[db.reads[i][1]].icon
		save.appendChild(save2)
		save2 = document.createElement('p')
		save2.innerText = db.reads[i][0]
		save2.title = db.reads[i][0]
		save2.onclick = e => {
			const parent = e.target.parentElement
			if (parent.hasAttribute('i')) {
				const ii = Number(parent.getAttribute('i'))
				browser.OpenInNewTab(db.reads[ii][2], db.reads[ii][3])
			}
		}
		save.appendChild(save2)
		save2 = document.createElement('div')
		save2.innerText = '⨯'
		save2.setAttribute('onclick', 'RemoveRead(this.parentElement)')
		save.appendChild(save2)
		reads.appendChild(save)
	}
}

function AddThisTabToReads(id) {
	const tab = browser.GetTab(id)
	if (tab == null || tab.site < 0) {
		PopAlert(Language('cannotaddread'), 'danger')
		return
	}
	if (tab.history[tab.selectedHistory] != undefined) {
		const i = db.reads.length
		if (tab.historyValue[tab.selectedHistory] != undefined) db.reads.push([tab.title.innerText, tab.site, tab.history[tab.selectedHistory], tab.historyValue[tab.selectedHistory]])
		else db.reads.push([tab.title.innerText, tab.site, tab.history[tab.selectedHistory]])

		const save = document.createElement('div')
		save.setAttribute('i', i)
		let save2 = document.createElement('img')
		save2.src = 'Image/sites/'+sites[db.reads[i][1]].url+'-32x32.'+sites[db.reads[i][1]].icon
		save.appendChild(save2)
		save2 = document.createElement('p')
		save2.innerText = db.reads[i][0]
		save2.title = db.reads[i][0]
		save2.onclick = e => {
			const parent = e.target.parentElement
			if (parent.hasAttribute('i')) {
				const ii = Number(parent.getAttribute('i'))
				browser.OpenInNewTab(db.reads[ii][2], db.reads[ii][3])
			}
		}
		save.appendChild(save2)
		save2 = document.createElement('div')
		save2.innerText = '⨯'
		save2.setAttribute('onclick', 'RemoveRead(this.parentElement)')
		save.appendChild(save2)
		if (isReads) {
			const reads = document.getElementById('reads')
			const children = reads.children
			if (children.length > 0) try { reads.insertBefore(save, children[0]) } catch(err) { reads.appendChild(save) }
			else reads.appendChild(save)
		}
		try { jsonfile.writeFileSync(dirDocument+'/reads', { v:db.manager.reads, a:db.reads }) } catch(err) { console.log(err) }
		PopAlert(Language('addedtoreads'))
	}
}