require('dotenv').config();
<<<<<<< HEAD
const mysql = require ('mysql2')

//test mysql
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = connection;
=======
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
>>>>>>> 5247a51d76e8a77a7e757084e5f84ee459ae7d98
