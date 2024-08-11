const {BrowserWindow, screen, Notification, ipcMain} = require('electron')
const { setMainMenu } = require('../renderer/js/menu.js')
const { deleteItem, updateItem, updateItemColumn, selectAll, selectItem, selectItemColumn, createItem } = require('./database.js')
const path = require('path')

ipcMain.on('createItem', async (event, item, table) => {
  try {
    const result = await createItem(table, item)

    if(table == 'bills'){
      const entityItem = await selectItem('balances', 'entity', item.entity)
      entityItem.value = item.type == 'income' ? entityItem.value + parseInt(item.value) : entityItem.value - parseInt(item.value)
      await updateItemColumn('balances', 'value', entityItem.value, entityItem.id)
    }

    new Notification({
      title: 'Completado',
      body: 'El item se creó correctamente'
    }).show()

    event.returnValue = result

  }catch(error){
    new Notification({
      title: 'Error',
      body: error.message
    }).show()
  }
})

ipcMain.on('editItem', async (event, id, item, table) => {
  try {
    if(table == 'bills'){
      const oldItem = await selectItem(table, 'id', id)
      const entity = await selectItem('balances', 'entity', item.entity)
      if(item.type == oldItem.type){
        entity.value = item.type == 'income' ? entity.value - oldItem.value + parseInt(item.value) : entity.value + oldItem.value - parseInt(item.value)
      }else{
        entity.value = item.type == 'income' ? entity.value + oldItem.value + parseInt(item.value) : entity.value - oldItem.value - parseInt(item.value)
      }
      await updateItemColumn('balances', 'value', entity.value, entity.id)
    }
    const result = await updateItem(table, item, id)

    new Notification({
      title: 'Completado',
      body: 'El item se modificó correctamente'
    }).show()

    event.returnValue = result

  }catch(error){
    new Notification({
      title: 'Error',
      body: error.message
    }).show()
  }
})

ipcMain.on('getItems', async (event, table) => {
  try {
    const results = await selectAll(table)

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
    if(table == 'bills'){
      const item = await selectItem(table, 'id', id)
      const entity = await selectItem('balances', 'entity', item.entity)
      entity.value = item.type == 'income' ? entity.value - item.value : entity.value + item.value
      await updateItemColumn('balances', 'value', entity.value, entity.id)
    }
    const result = await deleteItem(table, 'id', id)

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
    const result = await selectItemColumn('balances', 'entity', id)
    const result2 = await deleteItem('bills', 'entity', result.entity)

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

ipcMain.on('payItem', async(event, id, entity) => {
  try{
    const result = await selectItem('debts', 'id', id)

    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`

    const item = {
      entity: entity,
      value: result.value,
      icon: result.icon,
      color: result.color,
      currency: result.currency,
      description: result.entity,
      date: formattedDate,
      type: result.type == 'liabilitie' ? 'expense' : 'income'
    }

    const result2 = await createItem('bills', item)
    const entityItem = await selectItem('balances', 'entity', item.entity)
    entityItem.value = item.type == 'income' ? entityItem.value + item.value : entityItem.value - item.value
    await updateItemColumn('balances', 'value', entityItem.value, entityItem.id)

    const result3 = await deleteItem('debts', 'id', id)


    new Notification({
      title: 'Completado',
      body: 'Se pago la deuda correctamente'
    }).show()

    event.returnValue = result3
  }catch(error){
    new Notification({
      title: 'Error',
      body: error.message
    }).show()
  }
})

ipcMain.on('getItemById', async(event, id, table) => {
  try{
    const result = await selectItem(table, 'id', id)
    
    event.returnValue = result

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
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../assets/icon/tarasca.png'),
    webPreferences: { 
      nodeIntegration: true, // para poder importar modulos de node dentro de la ventana
      contextIsolation: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true
    }
  })

  window.loadFile('src/renderer/index.html')
}

// setMainMenu()

module.exports = {
  createWindow
}