require('dotenv').config();
const mysql = require ('mysql2/promise');

//const connection = mysql.createPool({
   // host: 'localhost',
   // port: 3307,
   // user: 'root', 
   // password: '123456',
   // database: 'hoidanit',
   // waitForConnections: true,
   // connectionLimit: 10,
  //  queueLimit: 0
//});

 // const connection = mysql.createConnection({
 //  host: 'localhost',
 //   port: 3307,
 //   user: 'root', 
 //  password: '123456',
 //  database: 'hoidanit' });
    
 //   connection.connect(err => {
// if (err) {
 //  console.error('Database connection failed:', err);
///    return;
///  }
 // console.log('Connected to MySQL');
//});

const pool = mysql.createPool({
    host: 'localhost',
    port: 3307,
    user: 'root', 
   password: '123456',
   database: 'hoidanit'
});

module.exports = pool;
//module.exports = connection;
