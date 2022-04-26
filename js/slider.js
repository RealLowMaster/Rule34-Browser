sldform.onsubmit = e => {
	e.preventDefault()
	let val = Number(sldinput.value)
	if (isNaN(val) || val < 1) val = 1
	else if (val > Number(sldinput.max)) val = Number(sldinput.max)
	sldinput.value = val
	SliderChange(val)
}

sldinput.onfocus = () => KeyManager.stop = true
sldinput.addEventListener('focusout', () => KeyManager.stop = false )

const slider = {
	list: [],
	active: null,
	container: document.getElementById('slider'),
	img_container: document.getElementById('sld-img'),
	element: null,
	osize: false
}

function OpenSlider(list, index) {
	KeyManager.ChangeCategory('slider')
	slider.container.style.display = 'block'
	slider.list = list
	if (index != null && typeof index === 'number' && index >= 0 && index < list.length) slider.active = index
	else slider.active = 0

	sldinput.value = slider.active + 1
	const max = slider.list.length
	sldinput.max = max
	document.getElementById('sldpage').innerText = '/ '+max

	if (existsSync(slider.list[slider.active])) {
		if (IsFormatVideo(LastChar('.', slider.list[slider.active]))) {
			slider.element = document.createElement('video')
			slider.element.loop = true
			slider.element.muted = false
			slider.element.autoplay = true
			slider.element.controls = true
			slider.element.setAttribute('controlsList', 'nodownload')
			slider.element.classList.add('rule34-xxx-image')
			slider.element.volume = 1 / 100 * setting.default_volume
			slider.element.src = slider.list[slider.active]
		} else {
			slider.element = document.createElement('img')
			slider.element.src = slider.list[slider.active]
		}
	} else {
		slider.element = document.createElement('img')
		slider.element.src = 'Image/no-img-225x225.webp'
	}
	slider.img_container.appendChild(slider.element)
}

function SliderPrev() {
	if (slider.active > 0) SliderChange(slider.active - 1)
}

function SliderNext() {
	if (slider.active < slider.list.length - 1) SliderChange(slider.active + 1)
}

function SliderChange(index) {
	slider.active = index
	sldinput.value = slider.active + 1

	try {
		slider.element.src = ''
		slider.element.remove()
	} catch(err) {}

	if (existsSync(slider.list[slider.active])) {
		if (IsFormatVideo(LastChar('.', slider.list[slider.active]))) {
			slider.element = document.createElement('video')
			slider.element.loop = true
			slider.element.muted = false
			slider.element.autoplay = true
			slider.element.controls = true
			slider.element.setAttribute('controlsList', 'nodownload')
			slider.element.classList.add('rule34-xxx-image')
			slider.element.volume = 1 / 100 * setting.default_volume
			slider.element.src = slider.list[slider.active]
		} else {
			slider.element = document.createElement('img')
			slider.element.src = slider.list[slider.active]
		}
	} else {
		slider.element = document.createElement('img')
		slider.element.src = 'Image/no-img-225x225.webp'
	}
	slider.img_container.appendChild(slider.element)
}

function SliderOriginalSize(active) {
	if (active) {

	} else {

	}
}

function CloseSlider() {
	slider.container.style.display = 'none'
	KeyManager.ChangeCategory('default')
	if (slider.element != null) {
		slider.element.src = ''
		slider.element.remove()
		slider.element = null
	}
}