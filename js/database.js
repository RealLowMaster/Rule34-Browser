// Check
function IsHave(site, id) {
	const i = db.have[site].indexOf(id)
	if (i < 0) return false
	return true
}

function IsDownloaded(site, id) {
	for (let i = 0, l = db.post.length; i < l; i++) if (db.post[i][1] == id && db.post[i][0] == site) return 1
	if (db.post_have[site].indexOf(id) >= 0) return 2
	return 0
}

function AddToHave(site, id) {
	const i = db.have[site].indexOf(id)
	if (i < 0) {
		db.have[site].push(id)
		browser.ChangeButtonsToHave(site, id)
		try {
			jsonfile.writeFileSync(paths.db+'have', {a:db.have})
			PopAlert(Language('pa-to-dls'))
		} catch(err) {
			console.error(err)
			error('SavingDonwloadsDB->'+err)
		}
	} else PopAlert(Language('pa-in-dls'), 'warning')
}

function RemoveFromHave(site, id) {
	const i = db.have[site].indexOf(id)
	if (i >= 0) {
		db.have[site].splice(i, 1)
		browser.ChangeButtonsToHave(site, id, true)
		try {
			jsonfile.writeFileSync(paths.db+'have', {a:db.have})
			PopAlert(Language('pr-f-dls'))
		} catch(err) {
			console.error(err)
			error('SavingDonwloadsDB->'+err)
		}
	} else PopAlert(Language('pwn-in-dls'), 'warning')
}

// Parody
function GetParodyIndex(list) {
	const arr = []
	let save = false
	for (let i = 0, l = list.length; i < l; i++) {
		let index = db.parody.indexOf(list[i].toLowerCase())
		if (index >= 0) {
			const link_index = db.parody_index.indexOf(index)
			if (link_index >= 0) index = db.parody_link[link_index]
			arr.push(index)
		} else {
			index = db.parody.length
			db.parody[index] = list[i].toLowerCase()
			arr.push(index)
			save = true
		}
	}
	if (save) try { jsonfile.writeFileSync(paths.db+'parody', {a:db.parody,l:db.parody_link,i:db.parody_index}) } catch(err) { console.error(err) }
	return NoLoopArray(arr)
}

function LinkParody(name1, name2) {
	name1 = name1.toLowerCase()
	name2 = name2.toLowerCase()
	let i1 = db.parody.indexOf(name1)
	let i2 = db.parody.indexOf(name2)
	if (i1 < 0) {
		i1 = db.parody.length
		db.parody[i1] = name1
	}
	if (i2 < 0) {
		i2 = db.parody.length
		db.parody[i2] = name2
	}

	let ii1 = db.parody_index.indexOf(i1)
	if (ii1 >= 0) db.parody_link[ii1] = i2
	else {
		ii1 = db.parody_index.length
		db.parody_index[ii1] = i1
		db.parody_link[ii1] = i2
	}

	try { jsonfile.writeFileSync(paths.db+'parody', {a:db.parody,l:db.parody_link,i:db.parody_index}) } catch(err) { console.error(err) }

	PopAlert('Linked: '+name1+' To '+name2)
}

// Character
function GetCharacterIndex(list) {
	const arr = []
	let save = false
	for (let i = 0, l = list.length; i < l; i++) {
		let index = db.character.indexOf(list[i].toLowerCase())
		if (index >= 0) {
			const link_index = db.character_index.indexOf(index)
			if (link_index >= 0) index = db.character_link[link_index]
			arr.push(index)
		} else {
			index = db.character.length
			db.character[index] = list[i].toLowerCase()
			arr.push(index)
			save = true
		}
	}
	if (save) try { jsonfile.writeFileSync(paths.db+'character', {a:db.character,l:db.character_link,i:db.character_index}) } catch(err) { console.error(err) }
	return NoLoopArray(arr)
}

function LinkCharacter(name1, name2) {
	name1 = name1.toLowerCase()
	name2 = name2.toLowerCase()
	let i1 = db.character.indexOf(name1)
	let i2 = db.character.indexOf(name2)
	if (i1 < 0) {
		i1 = db.character.length
		db.character[i1] = name1
	}
	if (i2 < 0) {
		i2 = db.character.length
		db.character[i2] = name2
	}

	let ii1 = db.character_index.indexOf(i1)
	if (ii1 >= 0) db.character_link[ii1] = i2
	else {
		ii1 = db.character_index.length
		db.character_index[ii1] = i1
		db.character_link[ii1] = i2
	}

	try { jsonfile.writeFileSync(paths.db+'character', {a:db.character,l:db.character_link,i:db.character_index}) } catch(err) { console.error(err) }

	PopAlert('Linked: '+name1+' To '+name2)
}

// Artist
function GetArtistIndex(list) {
	const arr = []
	let save = false
	for (let i = 0, l = list.length; i < l; i++) {
		let index = db.artist.indexOf(list[i].toLowerCase())
		if (index >= 0) {
			const link_index = db.artist_index.indexOf(index)
			if (link_index >= 0) index = db.artist_link[link_index]
			arr.push(index)
		} else {
			index = db.artist.length
			db.artist[index] = list[i].toLowerCase()
			arr.push(index)
			save = true
		}
	}
	if (save) try { jsonfile.writeFileSync(paths.db+'artist', {a:db.artist,l:db.artist_link,i:db.artist_index}) } catch(err) { console.error(err) }
	return NoLoopArray(arr)
}

function LinkArtist(name1, name2) {
	name1 = name1.toLowerCase()
	name2 = name2.toLowerCase()
	let i1 = db.artist.indexOf(name1)
	let i2 = db.artist.indexOf(name2)
	if (i1 < 0) {
		i1 = db.artist.length
		db.artist[i1] = name1
	}
	if (i2 < 0) {
		i2 = db.artist.length
		db.artist[i2] = name2
	}

	let ii1 = db.artist_index.indexOf(i1)
	if (ii1 >= 0) db.artist_link[ii1] = i2
	else {
		ii1 = db.artist_index.length
		db.artist_index[ii1] = i1
		db.artist_link[ii1] = i2
	}

	try { jsonfile.writeFileSync(paths.db+'artist', {a:db.artist,l:db.artist_link,i:db.artist_index}) } catch(err) { console.error(err) }

	PopAlert('Linked: '+name1+' To '+name2)
}

// Tag
function GetTagIndex(list) {
	const arr = []
	let save = false
	for (let i = 0, l = list.length; i < l; i++) {
		let index = db.tag.indexOf(list[i].toLowerCase())
		if (index >= 0) {
			const link_index = db.tag_index.indexOf(index)
			if (link_index >= 0) index = db.tag_link[link_index]
			arr.push(index)
		} else {
			index = db.tag.length
			db.tag[index] = list[i].toLowerCase()
			arr.push(index)
			save = true
		}
	}
	if (save) try { jsonfile.writeFileSync(paths.db+'tag', {a:db.tag,l:db.tag_link,i:db.tag_index}) } catch(err) { console.error(err) }
	return NoLoopArray(arr)
}

function LinkTag(name1, name2) {
	name1 = name1.toLowerCase()
	name2 = name2.toLowerCase()
	let i1 = db.tag.indexOf(name1)
	let i2 = db.tag.indexOf(name2)
	if (i1 < 0) {
		i1 = db.tag.length
		db.tag[i1] = name1
	}
	if (i2 < 0) {
		i2 = db.tag.length
		db.tag[i2] = name2
	}

	let ii1 = db.tag_index.indexOf(i1)
	if (ii1 >= 0) db.tag_link[ii1] = i2
	else {
		ii1 = db.tag_index.length
		db.tag_index[ii1] = i1
		db.tag_link[ii1] = i2
	}

	try { jsonfile.writeFileSync(paths.db+'tag', {a:db.tag,l:db.tag_link,i:db.tag_index}) } catch(err) { console.error(err) }

	PopAlert('Linked: '+name1+' To '+name2)
}

// Meta
function GetMetaIndex(list) {
	const arr = []
	let save = false
	for (let i = 0, l = list.length; i < l; i++) {
		let index = db.meta.indexOf(list[i].toLowerCase())
		if (index >= 0) {
			const link_index = db.meta_index.indexOf(index)
			if (link_index >= 0) index = db.meta_link[link_index]
			arr.push(index)
		} else {
			index = db.meta.length
			db.meta[index] = list[i].toLowerCase()
			arr.push(index)
			save = true
		}
	}
	if (save) try { jsonfile.writeFileSync(paths.db+'meta', {a:db.meta,l:db.meta_link,i:db.meta_index}) } catch(err) { console.error(err) }
	return NoLoopArray(arr)
}

function LinkMeta(name1, name2) {
	name1 = name1.toLowerCase()
	name2 = name2.toLowerCase()
	let i1 = db.meta.indexOf(name1)
	let i2 = db.meta.indexOf(name2)
	if (i1 < 0) {
		i1 = db.meta.length
		db.meta[i1] = name1
	}
	if (i2 < 0) {
		i2 = db.meta.length
		db.meta[i2] = name2
	}

	let ii1 = db.meta_index.indexOf(i1)
	if (ii1 >= 0) db.meta_link[ii1] = i2
	else {
		ii1 = db.meta_index.length
		db.meta_index[ii1] = i1
		db.meta_link[ii1] = i2
	}

	try { jsonfile.writeFileSync(paths.db+'meta', {a:db.meta,l:db.meta_link,i:db.meta_index}) } catch(err) { console.error(err) }

	PopAlert('Linked: '+name1+' To '+name2)
}

// Post
function GetPost(site, id, index = true) {
	for (let i = 0, l = db.post.length; i < l; i++) if (db.post[i][1] == id && db.post[i][0] == site) {
		if (index) return i
		else return db.post[i]
	}
	return null
}

function AddPost(site, id, imgId, format, data, animated = null) {
	const arr = [site, id, imgId, format, null, null, null, null, null]
	if (animated === true) arr[9] = '0'
	if (data.parody != null) arr[4] = GetParodyIndex(data.parody)
	if (data.character != null) arr[5] = GetCharacterIndex(data.character)
	if (data.artist != null) arr[6] = GetArtistIndex(data.artist)
	if (data.tag != null) arr[7] = GetTagIndex(data.tag)
	if (data.meta != null) arr[8] = GetMetaIndex(data.meta)
	db.post.push(arr)
	db.have[site].push(id)
	browser.SetNeedReload(-1)
	try { jsonfile.writeFileSync(paths.db+'post', {a:db.post, h:db.post_have}) } catch(err) { console.error(err) }
	try { jsonfile.writeFileSync(paths.db+'have', {a:db.have}) } catch(err) { console.error(err) }
}

function ConfirmDeletingPost(site, id, keep) {
	if (keep) Confirm(Language('are-ysadpk'), [
		{
			text: Language('delete'),
			class: 'btn btn-danger',
			click: `DeletePost(${site},${id},true)`
		},
		{text: Language('cancel')}
	])
	else Confirm(Language('are-ysadp'), [
		{
			text: Language('delete'),
			class: 'btn btn-danger',
			click: `DeletePost(${site},${id},false)`
		},
		{text: Language('cancel')}
	])
}

function DeletePost(site, id, keep) {
	if (IsInPack(site, id)) {
		PopAlert(Language('cdelete-in-pack'), 'danger')
		return
	}
	KeyManager.stop = true
	loading.Show(1, 'Deleting...')
	for (let i = 0, l = db.post.length; i < l; i++) if (db.post[i][1] == id && db.post[i][0] == site) {
		try { unlinkSync(paths.thumb+db.post[i][2]+'.jpg') } catch(err) {}
		try { unlinkSync(paths.dl+db.post[i][2]+'.'+db.post[i][3]) } catch(err) {}
		db.post.splice(i, 1)
		try { jsonfile.writeFileSync(paths.db+'post', {a:db.post, h:db.post_have}) } catch(err) { console.error(err) }
		if (!keep) {
			const haveIndex = db.have[site].indexOf(id)
			if (haveIndex >= 0) db.have[site].splice(haveIndex, 1)
			try { jsonfile.writeFileSync(paths.db+'have', {a:db.have}) } catch(err) { console.error(err) }
			browser.ChangeButtonsToHave(site, id)
		} else browser.ChangeButtonsToHave(site, id, false)
		
		KeyManager.stop = false
		PopAlert(Language('pd'))
		loading.Forward()
		loading.Close()
		browser.SetNeedReload(-1)
		return
	}
	KeyManager.stop = false
	PopAlert(Language('pnf'), 'danger')
	loading.Forward()
	loading.Close()
}

function ReDownloadPost(site, id) {
	KeyManager.stop = true
	loading.Show(4, 'Finding Post...')
	for (let i = 0, l = db.post.length; i < l; i++) if (db.post[i][1] == id && db.post[i][0] == site) {
		try { unlinkSync(paths.thumb+db.post[i][2]+'.jpg') } catch(err) {}
		try { unlinkSync(paths.dl+db.post[i][2]+'.'+db.post[i][3]) } catch(err) {}

		loading.Forward('Connecting To Page...')
		switch(site) {
			case 0: r34xxx.Post(id, (err, arr) => {
				if (err) {
					loading.Close()
					KeyManager.stop = false
					return
				}
				downloader.ReDownload(arr.src, i)
			}); return
		}
	}
	loading.Forward()
	loading.Close()
	KeyManager.stop = false
	PopAlert(Language('pnf'), 'danger')
}

// History
function DeleteHistory(i) {
	if (db.history[i] != null) {
		db.history.splice(i, 1)
		browser.SetNeedReload(-2)
		try { jsonfile.writeFileSync(dirDocument+'/history', {a:db.history}) } catch(err) { console.log(err) }
	}
}

function AskForClearHistory() {
	Confirm(Language('ask-for-cl-history'), [
		{
			text: Language('yes'),
			class: 'btn btn-danger',
			click: 'ClearHistory()'
		},
		{ text: Language('no') }
	])
}

function ClearHistory() {
	db.history = []
	try { jsonfile.writeFileSync(dirDocument+'/history', {a:[]}) } catch(err) { console.log(err) }
	browser.SetNeedReload(-2)
	PopAlert(Language('all-history-deleted'))
}