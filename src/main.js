const {BrowserWindow, screen, Notification, ipcMain} = require('electron')
const { setMainMenu } = require('./ui/menu.js')
const { getConnection } = require('./database.js')

ipcMain.on('createItem', async (event, item) => {
  try {
    const conn = await getConnection()
    item.value = parseFloat(item.value)
    const result = await conn.query('INSERT INTO item SET ?', item)

    new Notification({
      title: 'Completado',
      body: 'El item se guardo correctamente'
    }).show()

    item.id = result.insertId
    event.returnValue = item

  } catch(error) {
    new Notification({
      title: 'Error',
      body: error
    }).show()
  }
})

ipcMain.on('editItem', async (event, id, item) => {
  try {
    const conn = await getConnection()
    item.value = parseFloat(item.value)
    const result = await conn.query('UPDATE item SET ? WHERE id = ?', [item, id])

    new Notification({
      title: 'Completado',
      body: 'El item se modificó correctamente'
    }).show()

    item.id = result.insertId
    event.returnValue = item

  } catch(error) {
    new Notification({
      title: 'Error',
      body: error
    }).show()
  }
})

ipcMain.on('getItems', async (event, item) => {
  try {
    const conn = await getConnection()
    const results = await conn.query('SELECT * FROM item')
    event.returnValue = results
  }catch(error){
    new Notification({
      title: 'Error',
      body: error
    }).show()
  }
})

ipcMain.on('deleteItem', async(event, id) => {
  try{
    const conn = await getConnection()
    const result = await conn.query('DELETE FROM item WHERE id = ?', id)

    new Notification({
      title: 'Completado',
      body: 'El item se eliminó correctamente'
    }).show()

    event.returnValue = result
  }catch(error){
    new Notification({
      title: 'Error',
      body: error
    }).show()
  }
})

ipcMain.on('getItemById', async(event, id) => {
  try{
    const conn = await getConnection()
    const result = await conn.query('SELECT * FROM item WHERE id = ?', id)
    event.returnValue = result[0]
  }catch(error){
    new Notification({
      title: 'Error',
      body: error
    }).show()
  }
})

function createWindow() {
  const mainScreen = screen.getPrimaryDisplay()
  const dimensions = mainScreen.workAreaSize

  const window = new BrowserWindow({
    width: dimensions.width,
    height: dimensions.height,
    webPreferences: { 
      nodeIntegration: true, // para poder importar modulos de node dentro de la ventana
      contextIsolation: false,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true
    }
  })

  window.loadFile('src/ui/index.html')
}

setMainMenu()

module.exports = {
  createWindow
}