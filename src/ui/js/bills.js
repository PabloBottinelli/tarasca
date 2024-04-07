const { ipcRenderer } = require('electron')

// Items
const itemList = document.getElementById('bills-bottom')

// Form
const newItemForm = document.getElementById('billsNewItemForm')

// Modals
const formModal = new bootstrap.Modal(document.getElementById('billsFormModal'))
const deleteModal = new bootstrap.Modal(document.getElementById('billsDeleteModal'))

// Form Inputs
const billEntitySelect = document.getElementById('billsDropdownEntitys')
const billValue = document.getElementById('billsValue')
const selectedDropdownOption = document.getElementById('billsSelectedDropdownOption')
const dropdownARS = document.getElementById('billsDropdownARS')
const dropdownUSD = document.getElementById('billsDropdownUSD')
const itemIconRadios = document.querySelectorAll('input[name="billsInlineRadioOptions"]')
let billIcon
const itemTypeRadios = document.querySelectorAll('input[name="billsTypeOptions"]')
let billType
const billColor = document.getElementById('billsColor')
const billDate = document.getElementById('billsDate')
const billDescription = document.getElementById('billsDescription')

// Buttons
const editButton = document.getElementById('bills-editButton')
const deleteButton = document.getElementById('bills-deleteButton')
const confirmDeleteButton = document.getElementById('billConfirmDeleteButton')

// Status 
let editingStatus = false
let selectedItem

// Create
itemIconRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
        billIcon = e.target.value
    })
})

itemTypeRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
        billType = e.target.value
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
        entity: billEntitySelect.textContent,
        value: billValue.value,
        icon: billIcon,
        color: billColor.value,
        currency: selectedDropdownOption.textContent,
        description: billDescription.value,
        date: billDate.value,
        type: billType
    }

    if(editingStatus){
        ipcRenderer.sendSync('editItem', selectedItem, item, "bills")
    }else{
        ipcRenderer.sendSync('createItem', item, "bills")
    }

    newItemForm.reset()
    getAll()
})

// Render
function renderItems(items) {
    itemList.innerHTML = ""
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
        
        bal = i.type == 'expense' ? bal - value : bal + value 
        let formattedValue = usdCurrency ? value.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : value.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
        
        itemList.innerHTML += `
            <div id="bill-${i.id}" class="item billItem animate__animated animate__bounceInLeft" tabindex="0">
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
    
    const billItems = document.querySelectorAll('.billItem')
    billItems.forEach((i) => {
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

    return bal
}

// Get
function getItems(){
    items = ipcRenderer.sendSync('getItems', "bills")
    let totalBalance
    totalBalance = renderItems(items)
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
    ipcRenderer.sendSync('deleteItem', selectedItem, "bills")
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
    const item = ipcRenderer.sendSync('getItemById', selectedItem, "bills")
    const options = billEntitySelect.options;
    for (let i = 0; i < options.length; i++) {
        if (options[i].value == item.entity) {
            options[i].selected = true
            break
        }
    }
    billValue.value = item.value
    billColor.value = item.color
    billDescription.value = item.description
    billDate.value = (item.date).toISOString().split('T')[0]
    selectedDropdownOption.textContent = item.currency
    itemIconRadios.forEach(function(radio){
        if(radio.value == item.icon){
            radio.checked = true
            radio.dispatchEvent(new Event('change'))
        }
    })
    itemTypeRadios.forEach((radio) => {
        if(radio.value == item.type){
            radio.checked = true
            radio.dispatchEvent(new Event('change'))
        }
    })
}

module.exports = {
    getItems,
    deleteItem,
    editItem
}