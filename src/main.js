const {BrowserWindow, screen} = require('electron')
const { setMainMenu } = require('./ui/menu.js')

let window

function createWindow() {
    const mainScreen = screen.getPrimaryDisplay();
    const dimensions = mainScreen.workAreaSize;

    window = new BrowserWindow({
        width: dimensions.width,
        height: dimensions.height,
        webPreferences: { 
            nodeIntegration: true // para poder importar modulos de node dentro de la ventana
        }
    })

    window.loadFile('src/ui/index.html')
}

setMainMenu()

module.exports = {
    createWindow
}