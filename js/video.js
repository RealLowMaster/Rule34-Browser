function CreateVideo(src, auto = false, onslider = null) {
	const container = document.createElement('div')
	container.classList.add('video')

	const vid = document.createElement('video')
	vid.controls = false
	vid.loop = true
	vid.muted = false
	vid.autoplay = auto
	vid.setAttribute('controlsList', 'nodownload')
	vid.volume = 1 / 100 * setting.default_volume
	vid.src = src
	container.appendChild(vid)

	const controls = document.createElement('div')

	let save = document.createElement('div')
	save.innerHTML = Icon('play')
	save.style.padding = '7px'
	controls.appendChild(save)

	container.appendChild(controls)

	return container
}