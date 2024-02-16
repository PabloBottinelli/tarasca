const { app, BrowserWindow} = require('electron') 
const { setMainMenu } = require('./menu.js')

const createWindow = () => {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
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