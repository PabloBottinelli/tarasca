const { ipcRenderer } = require('electron')

const newItemForm = document.getElementById('newItemForm')
const itemEntity = document.getElementById('entity')
const itemValue = document.getElementById('value')
const itemColor = document.getElementById('color')
const itemIconRadios = document.querySelectorAll('input[name="inlineRadioOptions"]')
const selectedDropdownOption = document.getElementById('selectedDropdownOption')
const dropdownARS = document.getElementById('balanceDropdownARS')
const dropdownUSD = document.getElementById('balanceDropdownUSD')
const itemList = document.getElementById('balance-bottom')
let itemIcon
// FORM
const modalDialog = document.getElementById('modal-dialog')
const formModal = document.getElementById('balanceformModal')

// BUTTONS
const editButton = document.getElementById('balance-editButton')
const deleteButton = document.getElementById('balance-deleteButton')
const confirmDeleteButton = document.getElementById('confirmDeleteButton')
const formCloseButton = document.getElementById('formCloseButton')
const formCloseButton2 = document.getElementById('formCloseButton2')

let selectedItem = null
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
    getItems()
})

// Render
function renderItems(items) {
    itemList.innerHTML = ""
    let bal = 0
    let value;
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
            <div id="${i.id}" class="item animate__animated animate__bounceInLeft">
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
    })

    const itemElements = document.querySelectorAll('.item')
    itemElements.forEach((itemElement) => {
        itemElement.addEventListener('mouseover', function() {
            if(selectedItem != itemElement){
                itemElement.style.border = '2px solid #272727'
            }
        })
    
        itemElement.addEventListener('mouseout', function() {
            if(selectedItem != itemElement){
                itemElement.style.border = '2px solid rgb(161, 161, 161)'
            }
        })

        itemElement.addEventListener('click', function(){
            if(selectedItem != itemElement){
                if(selectedItem){
                    selectedItem.style.border = '2px solid  rgb(161, 161, 161)'
                }
                itemElement.style.border = '2px solid red'
                editButton.style.display = 'inline-block'
                deleteButton.style.display = 'inline-block'
                selectedItem = itemElement
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
    balances.deleteItem(selectedItem.id)
})

function deleteItem(id){
    ipcRenderer.sendSync('deleteItem', id, "balances")
    getItems()
}

// Edit
editButton.addEventListener('click', function(event) {
    event.stopPropagation()
    balances.editItem(selectedItem.id)
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

// Styles
document.addEventListener('click', function(event) {
    if(selectedItem && !selectedItem.contains(event.target) && !editingStatus){
        selectedItem.style.border = '2px solid rgb(161, 161, 161)'
        editButton.style.display = 'none'
        deleteButton.style.display = 'none'
        selectedItem = null
    }
    if(editingStatus && (event.target == formCloseButton || event.target == formCloseButton2 || (event.target != modalDialog && event.target == formModal))){
        editingStatus = false
        selectedItem.style.border = '2px solid rgb(161, 161, 161)'
        editButton.style.display = 'none'
        deleteButton.style.display = 'none'
        selectedItem = null
        newItemForm.reset()
    }
})

module.exports = {
    getItems,
    deleteItem,
    editItem
}