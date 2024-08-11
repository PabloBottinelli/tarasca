const {createWindow} = require('./main')
const {app} = require('electron')

if(require('electron-squirrel-startup')) app.quit()
    
require('./database')

require('electron-reload')(__dirname)

app.allowRendererProcessReuse = false
app.whenReady().then(createWindow)