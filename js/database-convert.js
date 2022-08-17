function Post0To1(data) {
	const new_data = { v:db.manager.collection, a:[], h:[], i:[] }
	try {
		const l = data.a.length
		if (l > 0) for (let i = 0; i < l; i++) {
			if (data.a[i][0] == -1) new_data.i.push(data.a[i][1])
			else new_data.i.push(Number(data.a[i][1].toString()+data.a[i][0]))
		}
		new_data.a = data.a.splice(0)
		new_data.h = data.h.splice(0)
	} catch(err) {
		console.error(err)
		Alert(err)
	}
	return new_data
}

function Collection0To1(data) {
	const new_data = { v:db.manager.collection, a:[] }
	try {
		const l = data.a.length
		if (l > 0) for (let i = 0; i < l; i++) {
			new_data.a[i] = [data.a[i][0], []]
			const n = data.a[i][1].length
			if (n > 0) for (let j = 0; j < n; j++) if (db.post[data.a[i][1][j]] != null) new_data.a[i][1].push(db.post_id[data.a[i][1][j]])
		}
	} catch(err) {
		console.error(err)
		Alert(err)
	}
	return new_data
}