const mysql = require('promise-mysql')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tarasca'
})

function getConnection() {
    return connection
}

const allowedWords = ['bills', 'balances', 'id', 'entity', 'value', 'debts']

function isValidWord(word) {
    return allowedWords.includes(word)
}

async function createItem(table, item) {
    if (!isValidWord(table)) {
        throw new Error('Invalid word')
    }
    const conn = await getConnection()
    item.value = parseFloat(item.value)
    const query = `INSERT INTO ?? SET ?`
    const result = await conn.query(query, [table, item])
    return result
}
    
async function selectItemColumn(table, column, value){
    if (!isValidWord(table) || !isValidWord(column)) {
        throw new Error('Invalid word')
    }
    const conn = await getConnection()
    const query = `SELECT ?? FROM ?? WHERE id = ?`
    const [result] = await conn.query(query, [column, table, value])
    return result
}

async function selectItem(table, column, value){
    if (!isValidWord(table) || !isValidWord(column)) {
        throw new Error('Invalid word')
    }
    const conn = await getConnection()
    const query = `SELECT * FROM ?? WHERE ?? = ?`
    const [result] = await conn.query(query, [table, column, value])
    return result
}

async function selectAll(table){
    if (!isValidWord(table)) {
        throw new Error('Invalid word')
    }
    const conn = await getConnection()
    const query = `SELECT * FROM ??`
    const result = await conn.query(query, table)
    return result
}

async function updateItemColumn(table, column, value, id){
    if (!isValidWord(table) || !isValidWord(column)) {
        throw new Error('Invalid word')
    }
    const conn = await getConnection()
    const query = `UPDATE ?? SET ?? = ? WHERE id = ?`
    const result = await conn.query(query, [table, column, value, id])
    return result
}

async function updateItem(table, item, value){
    if (!isValidWord(table)) {
        throw new Error('Invalid word')
    }
    const conn = await getConnection()
    const query = `UPDATE ?? SET ? WHERE id = ?`
    const result = await conn.query(query, [table, item, value])
    return result
}

async function deleteItem(table, column, value){
    if (!isValidWord(table) || !isValidWord(column)) {
        throw new Error('Invalid word')
    }
    const conn = await getConnection()
    const query = `DELETE FROM ?? WHERE ?? = ?`
    const result = await conn.query(query, [table, column, value])
    return result
}

async function createTables() {
    try {
        const conn = await getConnection()

        await conn.query(`
            CREATE TABLE IF NOT EXISTS balances (
                id INT(11) AUTO_INCREMENT PRIMARY KEY,
                entity VARCHAR(30) NOT NULL,
                value DECIMAL(30,0) NOT NULL,
                icon VARCHAR(100) NOT NULL,
                color VARCHAR(10) NOT NULL,
                currency VARCHAR(5) NOT NULL
            )
        `)

        await conn.query(`
            CREATE TABLE IF NOT EXISTS bills (
                id INT(11) AUTO_INCREMENT PRIMARY KEY,
                entity VARCHAR(30) NOT NULL,
                value DECIMAL(30,0) NOT NULL,
                icon VARCHAR(100) NOT NULL,
                color VARCHAR(10) NOT NULL,
                currency VARCHAR(5) NOT NULL,
                description VARCHAR(50) NOT NULL,
                date DATE NOT NULL,
                type VARCHAR(9) NOT NULL
            )
        `)

        await conn.query(`
            CREATE TABLE IF NOT EXISTS debts (
                id INT(11) AUTO_INCREMENT PRIMARY KEY,
                entity VARCHAR(30) NOT NULL,
                value DECIMAL(30,0) NOT NULL,
                icon VARCHAR(100) NOT NULL,
                color VARCHAR(10) NOT NULL,
                currency VARCHAR(5) NOT NULL,
                date DATE NOT NULL,
                type VARCHAR(15) NOT NULL
            )
        `)

        console.log('Tables created successfully')
    } catch (error) {
        console.error('Error creating tables:', error)
    }
}

createTables()

module.exports = { getConnection, deleteItem, updateItem, updateItemColumn, selectAll, selectItem, selectItemColumn, createItem }
