function IsHave(site, id) {
	for (let i = 0, l = db.have_ids.length; i < l; i++) if (db.have_ids[i] == id && db.have_site[i] == site) return true
	return false
}

function IsDownloaded(site, id) {
	for (let i = 0, l = db.post.length; i < l; i++) if (db.post[i][1] == id && db.post[i][0] == site) return true
	return false
}