const { app, BrowserWindow, screen} = require('electron') 
const { setMainMenu } = require('./menu.js')

const createWindow = () => {
    const mainScreen = screen.getPrimaryDisplay();
    const dimensions = mainScreen.workAreaSize;

    const window = new BrowserWindow({
        width: dimensions.width,
        height: dimensions.height,
        // webPreferences: { // para precargar codigo
        //     preload
        // }
    })

    window.loadFile('index.html')
}

setMainMenu()

app.whenReady().then(() => {
    createWindow()
})