const mysql = require('mysql2/promise');
module.exports = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '0303hecate456',
    database: 'agroquimicos_db'
});