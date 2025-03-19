// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',         // Change if needed
  user: 'root',   // Your MySQL username
  password: '', // Your MySQL password
  database: 'greenwich_box_office'   // Your database name
});

module.exports = connection;
