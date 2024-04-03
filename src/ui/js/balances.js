const { ipcRenderer } = require('electron')

// Items
const itemList = document.getElementById('balance-bottom')

// Form
const formModal = document.getElementById('balanceFormModal')
const modalDialog = document.getElementById('balance-modal-dialog')
const newItemForm = document.getElementById('balanceNewItemForm')
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
const confirmDeleteButton = document.getElementById('confirmDeleteButton')
const formCloseButton = document.getElementById('balanceFormCloseButton')
const formCloseButton2 = document.getElementById('balanceFormCloseButton2')

// Status 
let editingStatus = false

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
        ipcRenderer.sendSync('editItem', selectedItem.id, item, "balances")
        editingStatus = false
        selectedItem.style.border = '2px solid transparent'
        editButton.style.display = 'none'
        deleteButton.style.display = 'none'
        selectedItem = null
    }else{
        ipcRenderer.sendSync('createItem', item, "balances")
    }

    newItemForm.reset()
    getAll()
})

// Render
function renderItems(items) {
    itemList.innerHTML = ""
    billsDropdownEntitys.innerHTML = ""
    let bal = 0
    let value

    items.forEach((i) => {
        if((i.currency == "US$" && usdCurrency) || (i.currency == "ARS" && !usdCurrency)){
            value = i.value
        }else if(i.currency == "ARS" && usdCurrency){
            value = i.value/usdPrice_sell
        }else{
            value = i.value*usdPrice_buy
        }
        
        bal += value
        let formattedValue = usdCurrency ? value.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : value.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
        
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
        i.addEventListener('click', function(){
            if(selectedItem != i){
                editButton.style.display = 'inline-block'
                deleteButton.style.display = 'inline-block'
            }
        })
    })

    return bal
}

// Get
function getItems(){
    items = ipcRenderer.sendSync('getItems', "balances")
    let totalBalance
    totalBalance = renderItems(items)
    return totalBalance
}

// Delete
deleteButton.addEventListener('click', function(event){
    event.stopPropagation()
})

confirmDeleteButton.addEventListener('click', function(){
    console.log(selectedItem)
    let splittedId = selectedItem.id.split("-")
    let number = splittedId[1]
    deleteItem(number)
})

function deleteItem(id){
    ipcRenderer.sendSync('deleteItem', id, "balances")
    getAll()
}

// Edit
editButton.addEventListener('click', function(event) {
    event.stopPropagation()
    let splittedId = selectedItem.id.split("-")
    let number = splittedId[1]
    editItem(number)
})

function editItem(id){
    const item = ipcRenderer.sendSync('getItemById', id, "balances")
    itemEntity.value = item.entity
    itemValue.value = item.value
    itemColor.value = item.color
    itemIcon = item.icon
    selectedDropdownOption.textContent = item.currency
    itemIconRadios.forEach(function(radio){
        if(radio.value == item.icon){
            radio.checked = true
        }
    })
    editingStatus = true
}

// Style States
document.addEventListener('click', function(event){
    if((selectedItem && !(selectedItem.contains(event.target)) && !editingStatus) || (selectedItem && selectedItem.classList[1] != "balanceItem")){
        editButton.style.display = 'none'
        deleteButton.style.display = 'none'
        selectedItem = null
    }
    if(editingStatus && (event.target == formCloseButton || event.target == formCloseButton2 || (event.target != modalDialog && event.target == formModal))){
        editingStatus = false
        selectedItem = null
        newItemForm.reset()
    }
})

module.exports = {
    getItems,
    deleteItem,
    editItem
}