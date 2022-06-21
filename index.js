const { app, BrowserWindow } = require('electron')

app.setAppUserModelId("Rule34 Browser")
app.disableHardwareAcceleration()

function createWindow () {
	const win = new BrowserWindow({
		icon: __dirname+'/Image/favicon.ico',
		minWidth: 800,
		minHeight: 600,
		width: 800,
		height: 600,
		frame: false,
		center: true,
		show: false,
		backgroundColor: "#fff",
		paintWhenInitiallyHidden: true,
		title: 'Rule34 Browser v1.0.0',
		webPreferences: {
			enableRemoteModule: true,
			nodeIntegration: true,
			contextIsolation: false
		}
	})

	win.maximize(true)
	win.setMenu(null)

	win.addListener('close', e => {e.preventDefault()})
	win.loadFile(require('path').join(__dirname, 'index.html'))
	win.once('ready-to-show', () => {
		win.show()
	})
}

app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})