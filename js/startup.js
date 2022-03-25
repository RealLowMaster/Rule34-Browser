loading.Show(8, 'Loading...')

function Startup() {
	loading.Forward('Loading App Name...')
	try {
		document.getElementById('window-name').children[1].innerText = process.env.npm_package_name.replace(/-/g, ' ')+' '+process.env.npm_package_version
	} catch(err) {
		console.error(err)
		Alert('LoadingAppName->ERR: '+err)
		return
	}

	loading.Forward('Load Settings...')
	try {
		LoadSettings()
	} catch(err) {
		console.error(err)
		setting = defaultSetting
		Alert('LoadSetting->ERR: '+err)
	}

	loading.Forward('Apply Languages...')
	try {
		ApplyLanguage(setting.language)
	} catch(err) {
		console.error(err)
		Alert('ApplyingLanguages->ERR: '+err)
	}

	loading.Forward('Setting HotKeys...')
	try {
		SetHotKeys()
	} catch(err) {
		console.error(err)
		Alert('SettingHotKeys->ERR: '+err)
	}

	loading.Forward('Setting ContextMenus')
	try {
		SetContextMenus()
	} catch(err) {
		console.error(err)
		Alert('SettingContextMenu->ERR: '+err)
	}

	loading.Forward('Converting Icons...')
	try {
		ApplyIcons()
	} catch(err) {
		console.error(err)
		Alert('ConvertingIcons->ERR: '+err)
	}

	loading.Forward('Loading Database...')
	try {
		LoadDatabase()
	} catch(err) {
		console.error(err)
		error(err)
	}
}

let stateCheck = setInterval(() => {
	if (document.readyState == 'complete') {
		clearInterval(stateCheck)
		Startup()
	}
}, 100)