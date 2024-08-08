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
const date = new Date()

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
        entity: billEntitySelect.options[billEntitySelect.selectedIndex].textContent,
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
    if(items.length == 0){
        itemList.innerHTML = `<p class="advice">Acá podés agregar tus gastos o ingresos <br>
        Se descontaran/sumarán de la cuenta que selecciones </p>`
    }else{
        itemList.innerHTML = ""
    }

    let totalExpenses = {ars: 0, usd: 0}
    let totalIncomes = {ars: 0, usd: 0}
    let usdValue
    let arsValue

    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    let billsDateFilter = `${year}-${month}-1`

    items.forEach((i) => {
        const year = i.date.getFullYear()
        const month = String(i.date.getMonth() + 1).padStart(2, '0')
        const day = String(i.date.getDate()).padStart(2, '0')
        if(`${year}-${month}-${day}` < billsDateFilter){
            return
        }
        // Calculations
        if(i.currency == "US$"){
            usdValue = i.value
            arsValue = i.value*usdPrice_buy
        }else{
            usdValue = i.value/usdPrice_sell
            arsValue = i.value
        }

        if((i.date.getMonth() + 1) == (date.getMonth() + 1)){
            if(i.type == 'expense'){
                totalExpenses.ars += arsValue
                totalExpenses.usd += usdValue
            }else{
                totalIncomes.ars += arsValue
                totalIncomes.usd += usdValue
            }
        }

        // Render
        let formattedValue = i.currency == 'US$' ? i.value.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : i.value.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
        
        itemList.innerHTML += `
            <div id="bill-${i.id}" class="item billItem animate__animated animate__bounceInLeft" tabindex="0">
                <div class="item-detail">
                    <div class="icon-cnt" style="background-color: ${i.color};">
                        <img src="../assets/icons/${i.icon}" alt="Icon">
                    </div>
                    <div class='itemDescription'>
                        <p>${i.description}</p>
                        <span>${i.entity}, ${(i.date).toLocaleDateString('es-ES')}</span>
                    </div>
                </div>
                <div class="item-data-cnt">
                    <span style='${i.type == 'expense' ? "color: red" : "color: green"}'>${formattedValue}</span>
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
            setTimeout(function(){ 
                selectedItem = id
            }, 50)
        })

        i.addEventListener('blur', function(event){
            if (event.relatedTarget !== editButton && event.relatedTarget !== deleteButton) {
                editButton.style.display = 'none'
                deleteButton.style.display = 'none'
                selectedItem = null
            }
        })
    })

    return {totalExpenses, totalIncomes}
}

// Get
function getItems(){
    items = ipcRenderer.sendSync('getItems', "bills")
    let totalBills = renderItems(items)
    return totalBills
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
})

confirmDeleteButton.addEventListener('click', function(){
    deleteItem(selectedItem)
})

function deleteItem(id){
    ipcRenderer.sendSync('deleteItem', id, "bills")
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
    const options = billEntitySelect.options
    for (let i = 0; i < options.length; i++) {
        if(options[i].label == item.entity) {
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