const { ipcRenderer } = require('electron');

const newItemForm = document.getElementById('newItemForm')

// ITEM FUNCTIONS
const itemEntity = document.getElementById('entity')
const itemValue = document.getElementById('value')
const itemColor = document.getElementById('color')

let itemIcon
const itemList = document.getElementById('detail-bottom')

let selectedItem = null;
const editButton = document.getElementById('editButton')
const deleteButton = document.getElementById('deleteButton')

let items = [];

// FORM
document.querySelectorAll('input[name="inlineRadioOptions"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
        itemIcon = e.target.value
    })
})

newItemForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const newItem = {
        entity: itemEntity.value,
        value: itemValue.value,
        icon: itemIcon,
        color: itemColor.value
    }

    const result = ipcRenderer.sendSync('createItem', newItem);
})

// RENDER
function renderItems(items) {
    itemList.innerHTML = ""
    items.forEach((i) => {
      itemList.innerHTML += `
        <div id="${i.id}" class="item" style="background-color: ${hexToRGBA(i.color, 0.9)};">
            <div class="item-detail">
                <img src="media/${i.icon}" alt="Icon">
                <h3>${i.entity}</h3>
            </div>
            <div class="item-data-cnt">
                <span>${i.value}</span>
            </div>
        </div>
      `
    })

    const itemElements = document.querySelectorAll('.item')
    itemElements.forEach((itemElement) => {
        itemElement.addEventListener('mouseover', function() {
            if(selectedItem != itemElement){
                const computedStyle = window.getComputedStyle(itemElement);
                const backgroundColor = computedStyle.backgroundColor;
                const [r, g, b, _] = backgroundColor.match(/\d+/g)
                itemElement.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${1})`
                itemElement.style.border = '2px solid #272727'
            }
        })
    
        itemElement.addEventListener('mouseout', function() {
            if(selectedItem != itemElement){
                const computedStyle = window.getComputedStyle(itemElement);
                const backgroundColor = computedStyle.backgroundColor;
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
    hex = hex.replace('#', '');

    // Convierto el valor hexadecimal a valores numéricos RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Creo la cadena RGBA utilizando los valores RGB y el valor alfa
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

document.addEventListener('click', function(event) {
    if (selectedItem && !selectedItem.contains(event.target)) {
        selectedItem.style.border = '2px solid transparent';
        editButton.style.display = 'none'
        deleteButton.style.display = 'none'
        selectedItem = null;
    }
});

function getItems(){
    items = ipcRenderer.sendSync('getItems')
    renderItems(items)
}

function init(){
    getItems()
}

init()