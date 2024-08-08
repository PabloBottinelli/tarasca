const { ipcRenderer } = require('electron')
// Items
const itemList = document.getElementById('debts-bottom')

// Form
const newItemForm = document.getElementById('debtsNewItemForm')

// Modals
const formModal = new bootstrap.Modal(document.getElementById('debtsFormModal'))
const deleteModal = new bootstrap.Modal(document.getElementById('debtsDeleteModal'))
const payModal = new bootstrap.Modal(document.getElementById('debtsPayModal'))

// Form Inputs
const debtEntitySelect = document.getElementById('debtsDropdownEntitys')
const debtEntity = document.getElementById('debtEntity')
const debtValue = document.getElementById('debtValue')
const selectedDropdownOption = document.getElementById('debtSelectedDropdownOption')
const dropdownARS = document.getElementById('debtDropdownARS')
const dropdownUSD = document.getElementById('debtDropdownUSD')
const itemIconRadios = document.querySelectorAll('input[name="debtsInlineRadioOptions"]')
let debtIcon
const itemTypeRadios = document.querySelectorAll('input[name="debtsTypeOptions"]')
let debtType
const debtColor = document.getElementById('debtColor')
const debtDate = document.getElementById('debtDate')

// Buttons
const editButton = document.getElementById('debts-editButton')
const deleteButton = document.getElementById('debts-deleteButton')
const confirmDeleteButton = document.getElementById('debtConfirmDeleteButton')
const payButton = document.getElementById('debts-payButton')
const confirmPayButton = document.getElementById('confirmPayButton')

// Status 
let editingStatus = false
let selectedItem
const date = new Date()

// Create
itemIconRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
        debtIcon = e.target.value
    })
})

itemTypeRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
        debtType = e.target.value
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
        entity: debtEntity.value,
        value: debtValue.value,
        icon: debtIcon,
        color: debtColor.value,
        currency: selectedDropdownOption.textContent,
        date: debtDate.value,
        type: debtType
    }

    if(editingStatus){
        ipcRenderer.sendSync('editItem', selectedItem, item, "debts")
    }else{
        ipcRenderer.sendSync('createItem', item, "debts")
    }

    newItemForm.reset()
    getAll()
})

// Render
function renderItems(items) {
    if(items.length == 0){
        itemList.innerHTML = `<p class="advice">Acá podés agregar tus deudas <br>
        Podés seleccionar cada una y marcarla como pagada para que impacte en la cuenta correspondiente </p>`
    }else{
        itemList.innerHTML = ""
    }

    let totalLiabilities = {ars: 0, usd: 0}
    let totalReceivables = {ars: 0, usd: 0}
    let usdValue
    let arsValue

    items.forEach((i) => {
        // Calculations
        if(i.currency == "US$"){
            usdValue = i.value
            arsValue = i.value*usdPrice_buy
        }else{
            usdValue = i.value/usdPrice_sell
            arsValue = i.value
        }

        if((i.date.getMonth() + 1) == (date.getMonth() + 1)){
            if(i.type == 'liabilitie'){
                totalLiabilities.ars += arsValue
                totalLiabilities.usd += usdValue
            }else{
                totalReceivables.ars += arsValue
                totalReceivables.usd += usdValue
            }
        }

        // Render
        let formattedValue = i.currency == 'US$' ? i.value.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : i.value.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
        
        itemList.innerHTML += `
            <div id="debt-${i.id}" class="item debtItem animate__animated animate__bounceInLeft" tabindex="0">
                <div class="item-detail">
                    <div class="icon-cnt" style="background-color: ${i.color};">
                        <img src="../assets/icons/${i.icon}" alt="Icon">
                    </div>
                    <div class='itemDescription'>
                        <p>${i.entity}</p>
                        <span>Pagar el: ${(i.date).toLocaleDateString('es-ES')}</span>
                    </div>
                </div>
                <div class="item-data-cnt">
                    <span style='${i.type == 'liabilitie' ? "color: red" : "color: green"}'>${formattedValue}</span>
                </div>
            </div>
        `
    })
    
    const debtItems = document.querySelectorAll('.debtItem')
    debtItems.forEach((i) => {
        i.addEventListener('focus', function(event){
            editButton.style.display = 'inline-block'
            deleteButton.style.display = 'inline-block'
            payButton.style.display = 'inline-block'

            let splittedId = event.target.id.split("-")
            let id = splittedId[1]
            setTimeout(function(){ 
                selectedItem = id
            }, 50)
        })

        i.addEventListener('blur', function(event){
            if (event.relatedTarget !== editButton && event.relatedTarget !== deleteButton && event.relatedTarget !== payButton) {
                editButton.style.display = 'none'
                deleteButton.style.display = 'none'
                payButton.style.display = 'none'
                selectedItem = null
            }
        })
    })

    return {totalLiabilities, totalReceivables}
}

// Get
function getItems(){
    items = ipcRenderer.sendSync('getItems', "debts")
    let totalDebts = renderItems(items)
    return totalDebts
}

// Delete
deleteModal._element.addEventListener('hidden.bs.modal', function () {
    setTimeout(function(){ 
        selectedItem = null
    }, 50)
})

deleteButton.addEventListener('click', function(){
    editButton.style.display = 'none'
    deleteButton.style.display = 'none'
    payButton.style.display = 'none'
})

confirmDeleteButton.addEventListener('click', function(){
    deleteItem(selectedItem)
})

function deleteItem(id){
    ipcRenderer.sendSync('deleteItem', id, "debts")
    getAll()
}

// Edit
editButton.addEventListener('click', function() {
    editButton.style.display = 'none'
    deleteButton.style.display = 'none'
    payButton.style.display = 'none'
    editingStatus = true
    editItem()
})

formModal._element.addEventListener('hidden.bs.modal', function () {
    selectedItem = null
    editingStatus = false
    newItemForm.reset()
})

function editItem(){
    const item = ipcRenderer.sendSync('getItemById', selectedItem, "debts")
    debtEntity.value = item.entity
    debtValue.value = item.value
    debtColor.value = item.color
    debtDate.value = (item.date).toISOString().split('T')[0]
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

// Pay
payButton.addEventListener('click', function(){
    editButton.style.display = 'none'
    deleteButton.style.display = 'none'
    payButton.style.display = 'none'
})

confirmPayButton.addEventListener('click', function(){
    payItem()
})

function payItem(){
    ipcRenderer.sendSync('payItem', selectedItem, debtEntitySelect.options[debtEntitySelect.selectedIndex].textContent)
    getAll()
}

module.exports = {
    getItems,
    deleteItem,
    editItem,
    payItem
}