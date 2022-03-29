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

function AddPost(site, id, save, format, data) {
	console.log('Post Added')
}