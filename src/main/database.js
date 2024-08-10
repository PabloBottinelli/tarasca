const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

const dbPath = path.resolve(__dirname, '../db/database.sqlite')

if (!fs.existsSync(dbPath)) {
    console.log('El archivo de base de datos no existe. Creando una nueva base de datos...');
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err)
    } else {
        console.log('Connected to the SQLite database.')
    }
})

function getConnection() {
    return db
}

const allowedWords = ['bills', 'balances', 'id', 'entity', 'value', 'debts']

function isValidWord(word) {
    return allowedWords.includes(word)
}

async function createItem(table, item) {
    if (!isValidWord(table)) {
        throw new Error('Invalid word')
    }

    const keys = Object.keys(item).join(',')
    const placeholders = Object.keys(item).map(() => '?').join(',')

    const query = `INSERT INTO ${table} (${keys}) VALUES (${placeholders})`
    const values = Object.values(item)

    return new Promise((resolve, reject) => {
        db.run(query, values, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve({ id: this.lastID })
            }
        })
    })
}

async function selectItem(table, column, value) {
    if (!isValidWord(table) || !isValidWord(column)) {
        throw new Error('Invalid word')
    }

    const query = `SELECT * FROM ${table} WHERE ${column} = ?`

    return new Promise((resolve, reject) => {
        db.get(query, [value], (err, row) => {
            if (err) {
                reject(err)
            } else {
                resolve(row)
            }
        })
    })
}

async function selectItemColumn(table, column, value){
    if (!isValidWord(table) || !isValidWord(column)) {
        throw new Error('Invalid word')
    }

    const query = `SELECT ${column} FROM ${table} WHERE id = ?`
    return new Promise((resolve, reject) => {
        db.get(query, [value], (err, row) => {
            if (err) {
                reject(err)
            } else {
                resolve(row)
            }
        })
    })
}

async function selectAll(table) {
    if (!isValidWord(table)) {
        throw new Error('Invalid word')
    }

    const query = `SELECT * FROM ${table}`

    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

async function updateItemColumn(table, column, value, id){
    if (!isValidWord(table) || !isValidWord(column)) {
        throw new Error('Invalid word')
    }

    const query = `UPDATE ${table} SET ${column} = ? WHERE id = ?`

    return new Promise((resolve, reject) => {
        db.get(query, [value, id], (err, row) => {
            if (err) {
                reject(err)
            } else {
                resolve(row)
            }
        })
    })
}

async function updateItem(table, item, id) {
    if (!isValidWord(table)) {
        throw new Error('Invalid word')
    }

    const setClause = Object.keys(item).map(key => `${key} = ?`).join(', ')
    const values = [...Object.values(item), id]

    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`

    return new Promise((resolve, reject) => {
        db.run(query, values, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve({ changes: this.changes })
            }
        })
    })
}

async function deleteItem(table, column, value) {
    if (!isValidWord(table) || !isValidWord(column)) {
        throw new Error('Invalid word')
    }

    const query = `DELETE FROM ${table} WHERE ${column} = ?`

    return new Promise((resolve, reject) => {
        db.run(query, [value], function (err) {
            if (err) {
                reject(err)
            } else {
                resolve({ changes: this.changes })
            }
        });
    });
}

async function createTables() {
    try {
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS balances (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entity TEXT NOT NULL,
                    value REAL NOT NULL,
                    icon TEXT NOT NULL,
                    color TEXT NOT NULL,
                    currency TEXT NOT NULL
                )
            `)

            db.run(`
                CREATE TABLE IF NOT EXISTS bills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entity TEXT NOT NULL,
                    value REAL NOT NULL,
                    icon TEXT NOT NULL,
                    color TEXT NOT NULL,
                    currency TEXT NOT NULL,
                    description TEXT NOT NULL,
                    date TEXT NOT NULL,
                    type TEXT NOT NULL
                )
            `)

            db.run(`
                CREATE TABLE IF NOT EXISTS debts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entity TEXT NOT NULL,
                    value REAL NOT NULL,
                    icon TEXT NOT NULL,
                    color TEXT NOT NULL,
                    currency TEXT NOT NULL,
                    date TEXT NOT NULL,
                    type TEXT NOT NULL
                )
            `)

            console.log('Tables created successfully')
        })
    } catch (error) {
        console.error('Error creating tables:', error)
    }
}

createTables()

module.exports = { getConnection, deleteItem, updateItemColumn, updateItem, selectAll, selectItemColumn, selectItem, createItem }
