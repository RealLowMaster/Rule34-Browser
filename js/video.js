function CreateVideo(src, auto = false, onslider = null) {
	const container = document.createElement('div')
	container.classList.add('video')

	const vid = document.createElement('video')
	vid.controls = true
	vid.loop = true
	vid.muted = false
	vid.autoplay = auto
	vid.setAttribute('controlsList', 'nodownload')
	vid.volume = 1 / 100 * setting.default_volume
	vid.src = src
	container.appendChild(vid)

	const controls = document.createElement('div')
	const bar1 = document.createElement('div')
	let save = document.createElement('div')
	bar1.appendChild(save)
	save = document.createElement('div')
	bar1.appendChild(save)
	controls.appendChild(bar1)

	const bar2 = document.createElement('div')
	
	save = document.createElement('div')
	let save2 = document.createElement('div')
	save2.innerHTML = Icon('backward')
	save.appendChild(save2)

	const play = document.createElement('div')
	play.innerHTML = Icon('play')
	play.onclick = () => {
		console.log(vid.played)
		if (vid.played) vid.pause()
		else vid.play()
	}
	save.appendChild(play)
	vid.onplay = () => { play.innerHTML = Icon('pause') }
	vid.onpause = () => { play.innerHTML = Icon('play') }

	save2 = document.createElement('div')
	save2.innerHTML = Icon('forward')
	save.appendChild(save2)

	const volumeIC = document.createElement('div')
	volumeIC.innerHTML = Icon('volume')
	volumeIC.onclick = () => {
		if (vid.muted) {
			vid.muted = false
			volumeIC.innerHTML = Icon('volume')
		} else {
			vid.muted = true
			volumeIC.innerHTML = Icon('muted')
		}
	}
	save.appendChild(volumeIC)

	const volume = document.createElement('span')
	save2 = document.createElement('div')
	volume.appendChild(save2)
	save2 = document.createElement('div')
	volume.appendChild(save2)
	save.appendChild(volume)
	vid.onvolumechange = () => {
		const vs = volume.children
		vs[0].style.width = vid.volume * 100+'px'
		vs[1].style.left = vid.volume * 100 - 5 + 'px'
	}
	vid.addEventListener('muted', e => console.log(e))

	const time = document.createElement('div')
	time.classList.add('video-time')
	save2 = document.createElement('span')
	save2.innerText = '00:00'
	time.appendChild(save2)
	save2 = document.createElement('span')
	save2.innerText = ' / '
	time.appendChild(save2)
	save2 = document.createElement('span')
	save2.innerText = '00:00'
	time.appendChild(save2)
	save.appendChild(time)
	bar2.appendChild(save)
	vid.ontimeupdate = () => {
		time.children[0].innerText = ToTime(vid.currentTime)
		const vs = bar1.children
		const vss = (100 / vid.duration) * vid.currentTime
		vs[0].style.width = vss + '%'
		vs[1].style.left = 'calc('+vss+'% - 5px)'
	}
	vid.onloadedmetadata = () => { time.children[2].innerText = ToTime(vid.duration) }
	vid.ondurationchange = () => { time.children[2].innerText = ToTime(vid.duration) }
	
	save = document.createElement('div')

	save2 = document.createElement('div')
	save2.innerHTML = Icon('enter-fullscreen')
	save.appendChild(save2)

	save2 = document.createElement('div')
	save2.innerHTML = Icon('open-new-link')
	save.appendChild(save2)

	save2 = document.createElement('div')
	save2.innerHTML = Icon('setting')
	save.appendChild(save2)

	bar2.appendChild(save)

	controls.appendChild(bar2);

	container.appendChild(controls)
	return container
}