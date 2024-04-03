const { ipcRenderer } = require('electron')

// Items
const itemList = document.getElementById('balance-bottom')

// Form
const newItemForm = document.getElementById('balanceNewItemForm')

// Form Inputs
const formModal = new bootstrap.Modal(document.getElementById('balanceFormModal'))
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'))
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
        // ipcRenderer.sendSync('editItem', selectedItem.id, item, "balances")
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
        i.addEventListener('focus', function(event){
            editButton.style.display = 'inline-block'
            deleteButton.style.display = 'inline-block'
            let splittedId = event.target.id.split("-")
            let id = splittedId[1]
            selectedItem = id
            console.log("Focus item: ", id)
        })

        i.addEventListener('blur', function(event){
            if (event.relatedTarget !== editButton && event.relatedTarget !== deleteButton) {
                editButton.style.display = 'none'
                deleteButton.style.display = 'none'
                selectedItem = null
                console.log("Blur item: ", selectedItem)
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
deleteModal._element.addEventListener('hidden.bs.modal', function () {
    selectedItem = null
    console.log("se cerro el delete modal ", selectedItem)
})

deleteButton.addEventListener('click', function(){
    editButton.style.display = 'none'
    deleteButton.style.display = 'none'
})

confirmDeleteButton.addEventListener('click', function(){
    
    // let splittedId = selectedItem.id.split("-")
    // let number = splittedId[1]
    // deleteItem(number)

})

function deleteItem(id){
    ipcRenderer.sendSync('deleteItem', id, "balances")
    getAll()
}

// Edit
editButton.addEventListener('click', function(event) {
    editButton.style.display = 'none'
    deleteButton.style.display = 'none'
    editingStatus = true
    // let splittedId = selectedItem.id.split("-")
    // let number = splittedId[1]
    // editItem(number)
})

formModal._element.addEventListener('hidden.bs.modal', function () {
    selectedItem = null
    editingStatus = false
    console.log("se cerro el form modal ", selectedItem)
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
}

module.exports = {
    getItems,
    deleteItem,
    editItem
}