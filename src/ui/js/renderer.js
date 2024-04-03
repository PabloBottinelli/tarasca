// Requires
const balances = require('./js/balances.js')
const bills = require('./js/bills.js')
const debts = require('./js/debts.js')

// Dollar 
let usdCurrency = false
let usdPrice_sell = 0
let usdPrice_buy = 0
const dollarInfo = document.getElementById('dollar-info')

async function fetchDollarPrice() {
    try {
        const response = await fetch('https://api.bluelytics.com.ar/v2/latest')
        const data = await response.json()
        usdPrice_sell = data.blue.value_sell
        usdPrice_buy = data.blue.value_buy
        dollarInfo.textContent = "V: " + usdPrice_sell + " " + "C: " + usdPrice_buy
    } catch (error) {
        console.error('Error al obtener los datos:', error)
    }
}

// Currency Switch
const switchButton = document.getElementById('flexSwitchCheckChecked')

switchButton.addEventListener('click', function(){
    usdCurrency = !usdCurrency
    let totals
    totals = getAll()
    renderTotals(totals)
})

// Render Balance
const balance = document.getElementById('balance')

function renderTotals(totals){
    if(totals){
        let formattedBalance = usdCurrency ? totals.totalBalance.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : totals.totalBalance.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
        balance.textContent = formattedBalance
    }
}

// Get All
function getAll(){
    let totalBalance = balances.getItems()
    let totalBills = bills.getItems()
    renderTotals({totalBalance, totalBills})
}

// Init
async function init(){
    await fetchDollarPrice()  
    getAll()
}

init()