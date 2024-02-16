const { app, Menu } = require('electron') 

const setMainMenu = ()   =>{
    const template = [
        {
            label: 'Tarasca',
            submenu: [
                {label: 'Balance'},
                {type : 'separator'},
                {label: 'Deudas'},
                {type : 'separator'},
                {label: 'Gastos'},
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Editar',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ]
        },
        {
            label: 'Vista',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Ventana',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
            ]
        },
    ]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

module.exports = {
    setMainMenu
}