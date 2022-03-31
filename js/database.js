// Check
function IsHave(site, id) {
	const i = db.have[site].indexOf(id)
	if (i < 0) return false
	return true
}

function IsDownloaded(site, id) {
	for (let i = 0, l = db.post.length; i < l; i++) if (db.post[i][1] == id && db.post[i][0] == site) return true
	return false
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
	return arr
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
	return arr
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
	return arr
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
	return arr
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
	return arr
}

// Post
function AddPost(site, id, imgId, format, data) {
	const arr = [site, id, imgId, format, null, null, null, null, null]
	if (data.parody != null) arr[4] = GetParodyIndex(data.parody)
	if (data.character != null) arr[5] = GetCharacterIndex(data.character)
	if (data.artist != null) arr[6] = GetArtistIndex(data.artist)
	if (data.tag != null) arr[7] = GetTagIndex(data.tag)
	if (data.meta != null) arr[8] = GetMetaIndex(data.meta)
	db.post.push(arr)
	db.have[site].push(id)
	browser.SetNeedReload(-1)
	try { jsonfile.writeFileSync(paths.db+'post', {a:db.post}) } catch(err) { console.error(err) }
	try { jsonfile.writeFileSync(paths.db+'have', {a:db.have}) } catch(err) { console.error(err) }
}