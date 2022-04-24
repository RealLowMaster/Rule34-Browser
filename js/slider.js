let slider = {
	list: [],
	active: null,
	container: document.getElementById('slider'),
	element: null
}

function OpenSlider(list, index) {
	KeyManager.ChangeCategory('slider')
	slider.container.style.display = 'block'
	slider.list = list
	if (index != null && typeof index === 'number' && index >= 0 && index < list.length) slider.active = index
	else slider.active = 0

}

function SliderPrev() {}

function SliderNext() {}

function SliderChange(index) {}

function CloseSlider() {
	slider.container.style.display = 'none'
	KeyManager.ChangeCategory('default')
}