const mysql = require('promise-mysql')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tarasca'
})

function getConecction(){
    return connection;
}

module.exports = { getConecction }