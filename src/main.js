const {BrowserWindow, screen, Notification, ipcMain} = require('electron')
const { setMainMenu } = require('./ui/js/menu.js')
const { getConnection } = require('./database.js')

ipcMain.on('createItem', async (event, item, table) => {
  try {
    const conn = await getConnection()
    item.value = parseFloat(item.value)
    const result = await conn.query('INSERT INTO ?? SET ?', [table, item])

    new Notification({
      title: 'Completado',
      body: 'El item se guardo correctamente'
    }).show()

    item.id = result.insertId
    event.returnValue = item

  } catch(error) {
    new Notification({
      title: 'Error',
      body: error.message
    }).show()
  }
})

ipcMain.on('editItem', async (event, id, item, table) => {
  try {
    const conn = await getConnection()
    item.value = parseFloat(item.value)
    const result = await conn.query('UPDATE ?? SET ? WHERE id = ?', [table, item, id])

    new Notification({
      title: 'Completado',
      body: 'El item se modificó correctamente'
    }).show()

    item.id = result.insertId
    event.returnValue = item

  } catch(error) {
    new Notification({
      title: 'Error',
      body: error.message
    }).show()
  }
})

ipcMain.on('updateBalance', async (event, item) => {
  try{
    const conn = await getConnection()
    const [result] = await conn.query('SELECT * FROM balances WHERE entity = ?', item.entity)
    result.value = item.type == 'income' ? result.value + item.value : result.value - item.value
    const result2 = await conn.query('UPDATE balances SET value = ? WHERE id = ?', [result.value, result.id])
    event.returnValue = result2    
  }catch(error){
    new Notification({
      title: 'Error',
      body: error.message
    })
  }
})

ipcMain.on('getItems', async (event, table) => {
  try {
    const conn = await getConnection()
    const results = await conn.query('SELECT * FROM ??', table)
    event.returnValue = results
  }catch(error){
    new Notification({
      title: 'Error',
      body: error.message
    }).show()
  }
})

ipcMain.on('deleteItem', async(event, id, table) => {
  try{
    const conn = await getConnection()
    const result = await conn.query('DELETE FROM ?? WHERE id = ?', [table, id])

    new Notification({
      title: 'Completado',
      body: 'El item se eliminó correctamente'
    }).show()
    
    event.returnValue = result
  }catch(error){
    new Notification({
      title: 'Error',
      body: error.message
    }).show()
  }
})

ipcMain.on('deleteBills', async(event, id) => {
  try{
    const conn = await getConnection()
    const [result] = await conn.query('SELECT entity FROM balances WHERE id = ?', id)
    const result2 = await conn.query('DELETE FROM bills WHERE entity = ?', result.entity)

    new Notification({
      title: 'Completado',
      body: 'Se eliminaron los items correctamente'
    }).show()
    
    event.returnValue = result2
  }catch(error){
    new Notification({
      title: 'Error',
      body: error.message
    }).show()
  }
})

ipcMain.on('getItemById', async(event, id, table) => {
  try{
    const conn = await getConnection()
    const result = await conn.query('SELECT * FROM ?? WHERE id = ?', [table, id])
    event.returnValue = result[0]
  }catch(error){
    new Notification({
      title: 'Error',
      body: error.message
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