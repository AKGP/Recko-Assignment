// var mysql = require('promise-mysql');
var connnection;
const mysql = require('mysql2/promise');

connnection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'ajay_123.',
    database : 'reckoassignment'
  });
module.exports = connnection;

