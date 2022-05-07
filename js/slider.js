sldform.onsubmit = e => {
	e.preventDefault()
	let val = Number(sldinput.value)
	if (isNaN(val) || val < 1) val = 1
	else if (val > Number(sldinput.max)) val = Number(sldinput.max)
	sldinput.value = val
	SliderChange(val - 1)
}

sldinput.onfocus = () => KeyManager.stop = true
sldinput.addEventListener('focusout', () => KeyManager.stop = false )

const slider = {
	list: [],
	thumbList: [],
	animatedList: [],
	active: null,
	container: document.getElementById('slider'),
	img_container: document.getElementById('sld-img'),
	element: null,
	osize: false,
	overview: false,
	hide: false,
	is_url: false
}

function OpenSlider(list, index, isurl = false, thumbList, animated) {
	slider.is_url = isurl
	KeyManager.ChangeCategory('slider')
	slider.container.style.display = 'block'
	slider.list = list
	if (index != null && typeof index === 'number' && index >= 0 && index < list.length) slider.active = index
	else slider.active = 0

	if (slider.is_url && thumbList != null) slider.thumbList = thumbList
	else slider.thumbList = []

	if (slider.is_url && animated != null) slider.animatedList = animated
	else slider.animatedList = []

	const btns = document.getElementById('sld-btns').children
	if (list.length <= 1) {
		btns[0].style.display = 'none'
		btns[1].style.display = 'none'
		sldform.style.display = 'none'
		document.getElementById('sld-toggle').style.display = 'none'
	} else {
		btns[0].style.display = 'flex'
		btns[1].style.display = 'flex'
		sldform.style.display = 'block'
		document.getElementById('sld-toggle').style.display = 'block'
	}

	sldinput.value = slider.active + 1
	const max = slider.list.length
	sldinput.max = max
	document.getElementById('sldpage').innerText = '/ '+max

	SliderChange(slider.active)
}

function SliderPrev() {
	if (slider.active > 0) SliderChange(slider.active - 1)
}

function SliderNext() {
	if (slider.active < slider.list.length - 1) SliderChange(slider.active + 1)
}

function SliderChange(index) {
	if (slider.overview) {
		const children = document.getElementById('sld-overview').children
		children[slider.active].removeAttribute('active')
		children[index].setAttribute('active','')
	}
	slider.active = index
	sldinput.value = slider.active + 1

	try {
		slider.element.src = ''
		slider.element.remove()
	} catch(err) {}

	const i = slider.list[slider.active]
	let src, format
	if (!slider.is_url) {
		format = db.post[i][3]
		src = paths.dl+db.post[i][2]+'.'+format

		if (!existsSync(src)) {
			slider.element = document.createElement('img')
			slider.element.src = 'Image/no-img-225x225.webp'
			slider.img_container.appendChild(slider.element)
			if (slider.osize) {
				slider.img_container.scrollTop = 0
				slider.img_container.scrollLeft = (slider.element.clientWidth - slider.img_container.clientWidth) / 2
				SliderHighlight()
			}
			return
		}

	} else {
		src = i
		format = LastChar('.', src)
	}

	if (IsFormatVideo(format)) {
		slider.element = document.createElement('video')
		slider.element.loop = true
		slider.element.muted = false
		slider.element.autoplay = true
		slider.element.controls = true
		slider.element.setAttribute('controlsList', 'nodownload')
		slider.element.classList.add('rule34-xxx-image')
		slider.element.volume = 1 / 100 * setting.default_volume
		slider.element.draggable = false
		if (slider.osize) slider.element.onload = () => {
			if (slider.osize) {
				slider.img_container.scrollTop = 0
				slider.img_container.scrollLeft = (slider.element.clientWidth - slider.img_container.clientWidth) / 2
				SliderHighlight()
			}
		}
		slider.element.src = src
	} else {
		slider.element = document.createElement('img')
		slider.element.draggable = false
		if (slider.osize) slider.element.onload = () => {
			if (slider.osize) {
				slider.img_container.scrollTop = 0
				slider.img_container.scrollLeft = (slider.element.clientWidth - slider.img_container.clientWidth) / 2
				SliderHighlight()
			}
		}
		slider.element.src = src
	}

	slider.img_container.appendChild(slider.element)

	if (slider.osize) {
		slider.img_container.scrollTop = 0
		slider.img_container.scrollLeft = (slider.element.clientWidth - slider.img_container.clientWidth) / 2
		SliderHighlight()
	}
}

function SliderOriginalSize(active) {
	slider.osize = active
	if (active) {
		slider.img_container.setAttribute('o','')
		slider.img_container.onmousedown = () => {
			window.onmousemove = e => {
				slider.img_container.scrollLeft -= e.movementX
				slider.img_container.scrollTop -= e.movementY
				SliderHighlight()
			}

			window.onmouseup = () => {
				window.onmousemove = null
				window.onmouseup = null
			}
		}
		slider.img_container.scrollTop = 0
		slider.img_container.scrollLeft = (slider.element.clientWidth - slider.img_container.clientWidth) / 2
		SliderHighlight()
	} else {
		slider.img_container.removeAttribute('o')
		slider.img_container.onmousedown = null
		window.onmousemove = null
		window.onmouseup = null
	}
}

function SliderOverview(active) {
	slider.overview = active
	const container = document.getElementById('sld-overview')
	container.innerHTML = null
	slider.overview = active
	if (active) {
		slider.container.setAttribute('o','')
		let save
		if (slider.is_url) {
			for (let i = 0, l = slider.list.length; i < l; i++) {
				const si = i
				const element = document.createElement('div')
				if (i == slider.active) element.setAttribute('active', '')
				element.onclick = () => SliderChange(si)
				save = document.createElement('img')
				save.loading = 'lazy'
				save.src = slider.thumbList[i] || null
				element.appendChild(save)
				save = document.createElement('p')
				save.innerText = i+1
				element.appendChild(save)
				if (slider.animatedList[i] == 0) {
					save = document.createElement('span')
					save.innerHTML = Icon('gif-format')
					element.appendChild(save)
				} else if (slider.animatedList[i] == 1) {
					save = document.createElement('span')
					save.innerHTML = Icon('play')
					element.appendChild(save)
				}
				container.appendChild(element)
			}
		} else for (let i = 0, l = slider.list.length; i < l; i++) {
			const isave = i
			const index = slider.list[i]
			const element = document.createElement('div')
			if (i == slider.active) element.setAttribute('active', '')
			element.onclick = () => SliderChange(isave)
			save = document.createElement('img')
			save.loading = 'lazy'
			let src
			if (db.post[index][0] == -1) src = paths.thumb+db.post[index][2][0]+'.jpg'
			else src = paths.thumb+db.post[index][2]+'.jpg'
			if (!existsSync(src)) src = 'Image/no-img-225x225.webp'
			save.src = src
			element.appendChild(save)
			save = document.createElement('p')
			save.innerText = i+1
			element.appendChild(save)
			if (db.post[index][0] == -1) {
				save = document.createElement('span')
				save.innerHTML = Icon('layer')
				element.appendChild(save)
			} else if (db.post[index][9] == '0') {
				save = document.createElement('span')
				save.innerHTML = Icon('gif-format')
				element.appendChild(save)
			} else if (IsFormatVideo(db.post[index][3])) {
				save = document.createElement('span')
				save.innerHTML = Icon('play')
				element.appendChild(save)
			}
			container.appendChild(element)
		}

		container.scrollLeft = slider.active * 214 - container.clientWidth / 214 / 2 * 214 + 214 / 2
	} else slider.container.removeAttribute('o')
}

function SliderHide(active) {
	slider.hide = active
	if (active) slider.container.setAttribute('h', '')
	else slider.container.removeAttribute('h')
}

function CloseSlider() {
	slider.container.style.display = 'none'
	slider.container.removeAttribute('o')
	slider.listAnimated = []
	SliderOverview(false)
	SliderOriginalSize(false)
	SliderHide(false)
	KeyManager.ChangeCategory('default')
	if (slider.element != null) {
		slider.element.src = ''
		slider.element.remove()
		slider.element = null
	}
}

function SliderHighlight() {
	if (slider.img_container.scrollTop == 0) slider.img_container.style.borderTopColor = '#5dade2'
	else slider.img_container.style.borderTopColor = '#000'

	if (slider.img_container.scrollLeft == 0) slider.img_container.style.borderLeftColor = '#5dade2'
	else slider.img_container.style.borderLeftColor = '#000'
	
	if (slider.img_container.scrollTop >= slider.element.clientHeight - slider.img_container.clientHeight) slider.img_container.style.borderBottomColor = '#5dade2'
	else slider.img_container.style.borderBottomColor = '#000'

	if (slider.img_container.scrollLeft >= slider.element.clientWidth - slider.img_container.clientWidth) slider.img_container.style.borderRightColor = '#5dade2'
	else slider.img_container.style.borderRightColor = '#000'
}

slider.img_container.onwheel = e => {
	if (!slider.osize) {
		if (e.deltaY > 0) SliderNext()
		else SliderPrev()
	} else {
		if (e.target.tagName == 'IMG') SliderHighlight()
		else if (e.deltaY > 0) SliderNext()
		else SliderPrev()
	}
}