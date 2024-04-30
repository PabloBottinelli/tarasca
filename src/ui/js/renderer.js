// Requires
const balances = require('./js/balances.js')
const bills = require('./js/bills.js')
// const debts = require('./js/debts.js')

// Dollar 
let usdCurrency = false
let usdPrice_sell = 0
let usdPrice_buy = 0
const dollarBuy = document.getElementById('dollar-buy')
const dollarSell = document.getElementById('dollar-sell')

// Dates
const incomesMonth = document.getElementById('incomesMonth')
const expensesMonth = document.getElementById('expensesMonth')

// Totals
const expenses = document.getElementById('expenses')
const incomes = document.getElementById('incomes')
const balance = document.getElementById('balance')

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
    formattedExpenses = usdCurrency ? totalExpenses.usd.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : totalExpenses.ars.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
    expenses.innerHTML = formattedExpenses
    formattedIncomes = usdCurrency ? totalIncomes.usd.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : totalIncomes.ars.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
    incomes.innerHTML = formattedIncomes
    formattedBalance = usdCurrency ? totalBalance.usdBal.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : totalBalance.arsBal.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })
    balance.textContent = formattedBalance
}

// Get All
let totalBalance
let totalExpenses
let totalIncomes
function getAll(){
    billsTotals = bills.getItems()
    totalExpenses = billsTotals.totalExpenses
    totalIncomes = billsTotals.totalIncomes
    totalBalance = balances.getItems(billsTotals.billsByEntity)
    renderTotals()
}

// Init
async function init(){
    await fetchDollarPrice()  
    getAll()

    date = new Date()
    month = date.toLocaleString('default', { month: 'long' })
    month = month.charAt(0).toUpperCase() + month.slice(1)
    incomesMonth.innerHTML = `Ingresos de ${month}`
    expensesMonth.innerHTML = `Gastos de ${month}`
}

init()