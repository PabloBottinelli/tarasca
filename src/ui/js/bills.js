const { ipcRenderer } = require('electron')

// Items
const itemList = document.getElementById('bills-bottom')

// Form
const newItemForm = document.getElementById('billsNewItemForm')

// Form Inputs
const billEntitySelect = document.getElementById('billsDropdownEntitys')
const billValue = document.getElementById('billsValue')
const selectedDropdownOption = document.getElementById('billsSelectedDropdownOption')
const dropdownARS = document.getElementById('billsDropdownARS')
const dropdownUSD = document.getElementById('billsDropdownUSD')
const itemIconRadios = document.querySelectorAll('input[name="billsInlineRadioOptions"]')
let billIcon
const billColor = document.getElementById('billsColor')
const billDate = document.getElementById('billsDate')

// Status 
let editingStatus = false

// Create
itemIconRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
        billIcon = e.target.value
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
        entity: billEntitySelect.value,
        value: billValue.value,
        icon: billIcon,
        color: billColor.value,
        currency: selectedDropdownOption.textContent,
        date: billDate.value
    }

    if(editingStatus){
        ipcRenderer.sendSync('editItem', selectedItem.id, item, "bills")
        editingStatus = false
        selectedItem.style.border = '2px solid transparent'
        editButton.style.display = 'none'
        deleteButton.style.display = 'none'
        selectedItem = null
    }else{
        ipcRenderer.sendSync('createItem', item, "bills")
    }

    newItemForm.reset()
    getItems()
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
        
        bal += value
        let formattedValue = usdCurrency ? value.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : value.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
        
        itemList.innerHTML += `
            <div id="bills-${i.id}" class="item billItem animate__animated animate__bounceInLeft" tabindex="0">
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

    return bal
}

// Get
function getItems(){
    items = ipcRenderer.sendSync('getItems', "bills")
    let totalBills
    totalBills = renderItems(items)
    return totalBills
}

module.exports = {
    getItems
}