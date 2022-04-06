function Alert(txt, click) {
	KeyManager.stop = true
	const err = txt.toString().replace(/\n/g, '<br>').replace(/\>/g, '"').replace(/\</g, '"')
	const element = document.createElement('div')
	element.classList.add('action-alert')

	const container = document.createElement('div')
	let save = document.createElement('p')
	save.innerHTML = err
	container.appendChild(save)

	save = document.createElement('div')
	save.classList.add('btn')
	save.classList.add('btn-danger')
	save.innerText = 'Okay'
	if (typeof click === 'string') save.setAttribute('onclick', click+';this.parentElement.parentElement.remove();KeyManager.stop=false')
	else if (typeof click === 'function') {
		save.addEventListener('click', click)
		save.setAttribute('onclick', 'this.parentElement.parentElement.remove();KeyManager.stop=false')
	} else save.setAttribute('onclick', 'this.parentElement.parentElement.remove();KeyManager.stop=false')
	container.appendChild(save)
	element.appendChild(container)
	document.body.appendChild(element)
}

function Confirm(txt, buttons) {
	KeyManager.stop = true
	const err = txt.toString().replace(/\n/g, '<br>').replace(/\>/g, '"').replace(/\</g, '"')
	buttons = buttons || null
	if (buttons == null) throw "Cannot Set Buttons To Null"
	if (typeof buttons[0] !== 'object') throw "Please Set Value For Buttons"
	const element = document.createElement('div')
	element.classList.add('action-alert')
	const container = document.createElement('div')
	container.style.textAlign = 'center'
	let save = document.createElement('p')
	save.innerHTML = err
	container.appendChild(save)

	for (let i = 0, l = buttons.length; i < l; i++) {
		let text = buttons[i].text || 'Ok'
		let classes = buttons[i].class || 'btn btn-primary'
		save = document.createElement('div')
		save.setAttribute('class', classes)
		save.innerText = text
		if (typeof buttons[i].click === 'string') save.setAttribute('onclick', buttons[i].click+';this.parentElement.parentElement.remove();KeyManager.stop=false')
		else if (typeof buttons[i].click === 'function') {
			save.addEventListener('click', () => { buttons[i].click() })
			save.setAttribute('onclick', 'this.parentElement.parentElement.remove();KeyManager.stop=false')
		} else save.setAttribute('onclick', 'this.parentElement.parentElement.remove();KeyManager.stop=false')
		container.appendChild(save)
	}
	element.appendChild(container)
	document.body.appendChild(element)
}

function PopAlertFrame(who) {
	setTimeout(() => {
		const bottom = Number(who.style.bottom.replace('px', ''))
		who.style.bottom = (bottom+45)+'px'
	}, 10)
}

function PopAlert(txt, style) {
	txt = txt || null
	if (txt == null) return
	style = style || 'success'
	const alertElement = document.createElement('div')
	alertElement.classList.add('pop-alert')
	alertElement.classList.add(`pop-alert-${style}`)
	alertElement.textContent = txt
	alertElement.setAttribute('onclick', 'this.remove()')
	document.body.appendChild(alertElement)

	const alerts = document.getElementsByClassName('pop-alert')
	if (setting.animations) for (let i = 0, l = alerts.length; i < l; i++) PopAlertFrame(alerts[i])
	else for (let i = 0, l = alerts.length; i < l; i++) {
		const bottom = Number(alerts[i].style.bottom.replace('px', ''))
		alerts[i].style.bottom = (bottom+45)+'px'
	}
	

	setTimeout(() => {
		alertElement.remove()
	}, 4000)
}

/*
options => {
	pop => true || false, Show PopAlert()

	sort => string -> 'success', 'warning', 'danger'

	sound => true || false, Play Notification Sound

	soundName => string || null, if null then it will get sound name from sort property (it will play the sounds in Sounds/Notifications/{SoundName}.ogg)

	notification => true || false, Show Window, Linux, MacOS Defualt Notification
}
*/
function Notify(title = 'title', body = null, options = { pop:true, sort:'success', sound:true, soundName:null, notification:true }) {
	let not = options.notification
	if (typeof not != 'boolean') not = true
	if (not == true && setting.not && remote.Notification.isSupported()) {
		const not_options = {title:title}
		if (body != null) not_options.body = body
		new remote.Notification(not_options).show()
	}

	if (options.sort != 'success' && options.sort != 'warning' && options.sort != 'danger') options.sort = 'success'

	let pop = options.pop
	if (typeof options.pop != 'boolean') pop = true
	if (pop == true) PopAlert(title, options.sort)

	let sound = options.sound
	if (typeof options.sound != 'boolean') sound = true
	if (sound == true && setting.not_sound) {
		if (options.soundName != null) new Audio('Sounds/Notifications/'+options.soundName+'.ogg').play()
		else new Audio('Sounds/Notifications/'+options.sort+'.ogg').play()
	}
}