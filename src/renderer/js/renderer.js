// Requires
const balances = require('./js/balances.js')
const bills = require('./js/bills.js')
const debts = require('./js/debts.js')

// Dollar 
let usdCurrency = false
let usdPrice_sell = 0
let usdPrice_buy = 0
const dollarBuy = document.getElementById('dollar-buy')
const dollarSell = document.getElementById('dollar-sell')

// Dates
const flowMonth = document.getElementById('flowMonth')

// Totals
const flow = document.getElementById('flow')
const net = document.getElementById('net')
const balance = document.getElementById('balance')
const debtsDisplay = document.getElementById('debts')

async function fetchDollarPrice() {
    try {
        const response = await fetch('https://api.bluelytics.com.ar/v2/latest')
        const data = await response.json()
        usdPrice_sell = data.blue.value_sell
        usdPrice_buy = data.blue.value_buy
        dollarSell.textContent = "V: " + usdPrice_sell 
        dollarBuy.textContent =  "C: " + usdPrice_buy
    } catch (error) {
        console.error('Error al obtener los datos:', error)
    }
}

// Currency Switch
const switchButton = document.getElementById('flexSwitchCheckChecked')

switchButton.addEventListener('click', function(){
    usdCurrency = !usdCurrency
    renderTotals()
})

// Render Totals
function renderTotals(){
    formattedFlow = usdCurrency ? (totalIncomes.usd - totalExpenses.usd).toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : (totalIncomes.ars - totalExpenses.ars).toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
    flow.innerHTML = formattedFlow
    formattedBalance = usdCurrency ? totalBalance.usdBal.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : totalBalance.arsBal.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
    balance.textContent = formattedBalance
    result = usdCurrency ? totalReceivables.usd - totalLiabilities.usd : totalReceivables.ars - totalLiabilities.ars
    formattedDebts = usdCurrency ? result.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : result.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
    debtsDisplay.textContent = formattedDebts
    formattedNet = usdCurrency ? (totalBalance.usdBal + totalReceivables.usd - totalLiabilities.usd).toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : (totalBalance.arsBal + totalReceivables.ars - totalLiabilities.ars).toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
    net.innerHTML = formattedNet
}

// Get All
let totalBalance
let totalExpenses
let totalIncomes
let totalLiabilities
let totalReceivables
function getAll(){
    billsTotals = bills.getItems()
    debtsTotals = debts.getItems()
    totalExpenses = billsTotals.totalExpenses
    totalIncomes = billsTotals.totalIncomes
    totalLiabilities = debtsTotals.totalLiabilities
    totalReceivables = debtsTotals.totalReceivables
    totalBalance = balances.getItems()
    renderTotals()
}

// Init
async function init(){
    await fetchDollarPrice()  
    getAll()

    date = new Date()
    month = date.toLocaleString('default', { month: 'long' })
    month = month.charAt(0).toUpperCase() + month.slice(1)
    flowMonth.innerHTML = `Flujo de ${month}`
}

init()