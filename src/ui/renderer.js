const { ipcRenderer } = require('electron')

// FORM
const newItemForm = document.getElementById('newItemForm')
const modalDialog = document.getElementById('modal-dialog')
const formModal = document.getElementById('formModal')

// FORM INPUTS
const itemEntity = document.getElementById('entity')
const itemValue = document.getElementById('value')
const itemColor = document.getElementById('color')
const itemIconRadios = document.querySelectorAll('input[name="inlineRadioOptions"]')
const selectedDropdownOption = document.getElementById('selectedDropdownOption')
const dropdownARS = document.getElementById('dropdownARS')
const dropdownUSD = document.getElementById('dropdownUSD')
let itemIcon

// ITEM LIST
const itemList = document.getElementById('detail-bottom')
// const dropdownMenu = document.getElementById('dropdownMenu')

// BUTTONS
const editButton = document.getElementById('editButton')
const deleteButton = document.getElementById('deleteButton')
const confirmDeleteButton = document.getElementById('confirmDeleteButton')
const formCloseButton = document.getElementById('formCloseButton')
const switchButton = document.getElementById('flexSwitchCheckChecked')

// STATUS VARIABLES
let selectedItem = null
let editingStatus = false
let usdCurrency = false
let usdPrice = 0

fetch('https://api.bluelytics.com.ar/v2/latest')
.then(response => response.json())
.then(data => {
    usdPrice = data.blue.value_sell
    console.log(usdPrice)
})
.catch(error => {
    console.error('Error al obtener los datos:', error)
})


// TOTAL BALANCE
const balance = document.getElementById('balance')

// CREATE AND EDIT FUNCTIONS
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
        ipcRenderer.sendSync('editItem', selectedItem.id, item)
        editingStatus = false
        selectedItem.style.border = '2px solid transparent'
        editButton.style.display = 'none'
        deleteButton.style.display = 'none'
        selectedItem = null
    }else{
        ipcRenderer.sendSync('createItem', item)
    }

    newItemForm.reset()
    getItems()
})

// RENDER
function renderItems(items) {
    itemList.innerHTML = ""
    let bal = 0
    items.forEach((i) => {
        bal += i.value
        let value = usdCurrency ? i.value/usdPrice: i.value
        let formattedValue = usdCurrency ? value.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : value.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
        itemList.innerHTML += `
            <div id="${i.id}" class="item animate__animated animate__bounceInLeft" style="background-color: ${hexToRGBA(i.color, 0.9)};">
                <div class="item-detail">
                    <img src="media/${i.icon}" alt="Icon">
                    <h3>${i.entity}</h3>
                </div>
                <div class="item-data-cnt">
                    <span>${formattedValue}</span>
                </div>
            </div>
        `
        // dropdownMenu.innerHTML += `
        //     <li><a class="dropdown-item" href="#">${i.entity}</a></li>
        // `
    })

    bal = usdCurrency ? bal/usdPrice : bal
    let formattedBalance = usdCurrency ? bal.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : bal.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
    balance.textContent = formattedBalance

    const itemElements = document.querySelectorAll('.item')
    itemElements.forEach((itemElement) => {
        itemElement.addEventListener('mouseover', function() {
            if(selectedItem != itemElement){
                const computedStyle = window.getComputedStyle(itemElement)
                const backgroundColor = computedStyle.backgroundColor
                const [r, g, b, _] = backgroundColor.match(/\d+/g)
                itemElement.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${1})`
                itemElement.style.border = '2px solid #272727'
            }
        })
    
        itemElement.addEventListener('mouseout', function() {
            if(selectedItem != itemElement){
                const computedStyle = window.getComputedStyle(itemElement)
                const backgroundColor = computedStyle.backgroundColor
                const [r, g, b, _] = backgroundColor.match(/\d+/g)
                itemElement.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${0.9})`
                itemElement.style.border = '2px solid transparent'
            }
        })

        itemElement.addEventListener('click', function(){
            if(selectedItem != itemElement){
                if(selectedItem){
                    selectedItem.style.border = '2px solid transparent'
                }
                itemElement.style.border = '2px solid red'
                editButton.style.display = 'inline-block'
                deleteButton.style.display = 'inline-block'
                selectedItem = itemElement
            }
        })
    })
}

function hexToRGBA(hex, alpha) {
    // Elimino el símbolo '#' si está presente
    hex = hex.replace('#', '')

    // Convierto el valor hexadecimal a valores numéricos RGB
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    // Creo la cadena RGBA utilizando los valores RGB y el valor alfa
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

document.addEventListener('click', function(event) {
    if(selectedItem && !selectedItem.contains(event.target) && !editingStatus){
        selectedItem.style.border = '2px solid transparent'
        editButton.style.display = 'none'
        deleteButton.style.display = 'none'
        selectedItem = null
    }
    if(editingStatus && (event.target == formCloseButton || (event.target != modalDialog && event.target == formModal))){
        editingStatus = false
        selectedItem.style.border = '2px solid transparent'
        editButton.style.display = 'none'
        deleteButton.style.display = 'none'
        selectedItem = null
        newItemForm.reset()
    }
})

switchButton.addEventListener('click', function(){
    usdCurrency = !usdCurrency
    getItems()
})

// GET
function getItems(){
    items = ipcRenderer.sendSync('getItems')
    renderItems(items)
}

// DELETE 
deleteButton.addEventListener('click', function(event){
    event.stopPropagation()
})

confirmDeleteButton.addEventListener('click', function(event){
    deleteItem(selectedItem.id)
})

function deleteItem(id){
    ipcRenderer.sendSync('deleteItem', id)
    getItems()
}

// EDIT 
editButton.addEventListener('click', function(event) {
    event.stopPropagation()
    editItem(selectedItem.id)
})

function editItem(id){
    const item = ipcRenderer.sendSync('getItemById', id)
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

function init(){
    getItems()
}

init()