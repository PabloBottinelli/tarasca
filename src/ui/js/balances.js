const { ipcRenderer } = require('electron')

// Items
const itemList = document.getElementById('balance-bottom')

// Form
const newItemForm = document.getElementById('balanceNewItemForm')

// Modals
const formModal = new bootstrap.Modal(document.getElementById('balanceFormModal'))
const deleteModal = new bootstrap.Modal(document.getElementById('balancesDeleteModal'))

// Form Inputs
const itemEntity = document.getElementById('balanceEntity')
const itemValue = document.getElementById('balanceValue')
const itemColor = document.getElementById('balanceColor')
const itemIconRadios = document.querySelectorAll('input[name="balanceInlineRadioOptions"]')
const selectedDropdownOption = document.getElementById('balanceSelectedDropdownOption')
const dropdownARS = document.getElementById('balanceDropdownARS')
const dropdownUSD = document.getElementById('balanceDropdownUSD')
let itemIcon

// Bills Form
const billsDropdownEntitys = document.getElementById('billsDropdownEntitys')

// Buttons
const editButton = document.getElementById('balance-editButton')
const deleteButton = document.getElementById('balance-deleteButton')
const confirmDeleteButton = document.getElementById('balanceConfirmDeleteButton')

// Status 
let editingStatus = false
let selectedItem

// Create
itemIconRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
        itemIcon = e.target.value
    })
})

dropdownARS.addEventListener('click', function(){
    selectedDropdownOption.textContent = 'ARS'
})

dropdownUSD.addEventListener('click', function(){
    selectedDropdownOption.textContent = 'US$'
})

newItemForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const item = {
        entity: itemEntity.value,
        value: itemValue.value,
        icon: itemIcon,
        color: itemColor.value,
        currency: selectedDropdownOption.textContent
    }

    if(editingStatus){
        ipcRenderer.sendSync('editItem', selectedItem, item, "balances")
    }else{
        ipcRenderer.sendSync('createItem', item, "balances")
    }

    newItemForm.reset()
    getAll()
})

// Render
function renderItems(items){
    if(items.length == 0){
        itemList.innerHTML = `<p class="advice">Acá podés agregar los balances de tus cuentas</p>`
        billsDropdownEntitys.innerHTML = `<option value="invalid"> No hay entidades registradas</option>`
    }else{
        billsDropdownEntitys.innerHTML = ""
        itemList.innerHTML = ""
    }

    let usdBal = 0
    let arsBal = 0

    items.forEach((i) => {
        // Calculations
        if(i.currency == "US$"){
            usdBal += i.value
            arsBal += i.value*usdPrice_buy
        }else{
            usdBal += i.value/usdPrice_sell
            arsBal += i.value
        }

        // Render
        let formattedValue = i.currency == 'US$' ? i.value.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : i.value.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
        
        itemList.innerHTML += `
            <div id="balance-${i.id}" class="item balanceItem animate__animated animate__bounceInLeft" tabindex="0">
                <div class="item-detail">
                    <div class="icon-cnt" style="background-color: ${i.color};">
                        <img src="media/${i.icon}" alt="Icon">
                    </div>
                    <h3>${i.entity}</h3>
                </div>
                <div class="item-data-cnt">
                    <span>${formattedValue}</span>
                </div>
            </div>
        `

        billsDropdownEntitys.innerHTML += `
            <option value="${i.id}">${i.entity}</option>
        `
    })
    
    const balanceItems = document.querySelectorAll('.balanceItem')
    balanceItems.forEach((i) => {
        i.addEventListener('focus', function(event){
            editButton.style.display = 'inline-block'
            deleteButton.style.display = 'inline-block'
            let splittedId = event.target.id.split("-")
            let id = splittedId[1]
            selectedItem = id
        })

        i.addEventListener('blur', function(event){
            if (event.relatedTarget !== editButton && event.relatedTarget !== deleteButton) {
                editButton.style.display = 'none'
                deleteButton.style.display = 'none'
                selectedItem = null
            }
        })
    })

    return {usdBal, arsBal}
}

// Get
function getItems(){
    items = ipcRenderer.sendSync('getItems', "balances")
    let totalBalance = renderItems(items)
    return totalBalance
}

// Delete
deleteModal._element.addEventListener('hidden.bs.modal', function () {
    // This timeout is to avoid conflicts when sending the id to the database
    setTimeout(function(){ 
        selectedItem = null
    }, 1000)
})

deleteButton.addEventListener('click', function(){
    editButton.style.display = 'none'
    deleteButton.style.display = 'none'
})

confirmDeleteButton.addEventListener('click', function(){
    deleteItem()
})

function deleteItem(){
    ipcRenderer.sendSync('deleteBills', selectedItem)
    ipcRenderer.sendSync('deleteItem', selectedItem, "balances")

    getAll()
}

// Edit
editButton.addEventListener('click', function() {
    editButton.style.display = 'none'
    deleteButton.style.display = 'none'
    editingStatus = true
    editItem()
})

formModal._element.addEventListener('hidden.bs.modal', function () {
    selectedItem = null
    editingStatus = false
    newItemForm.reset()
})

function editItem(){
    const item = ipcRenderer.sendSync('getItemById', selectedItem, "balances")
    itemEntity.value = item.entity
    itemValue.value = item.value
    itemColor.value = item.color
    selectedDropdownOption.textContent = item.currency
    itemIconRadios.forEach(function(radio){
        if(radio.value == item.icon){
            radio.checked = true
            radio.dispatchEvent(new Event('change'))
        }
    })
}

// Exports
module.exports = {
    getItems,
    deleteItem,
    editItem
}