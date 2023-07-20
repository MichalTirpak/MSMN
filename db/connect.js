/**
 * This is the file which creates, and maintains
 * the connection between the MariaDB and our
 * application
 * @module connect
 *
 * @requires mariadb
 * @requires dotenv
 */

require('dotenv').config()
const mariadb = require('mariadb')

/**
 * Creates the connection pool, which can be reused every time
 * the new connections to database are needed.
 */
const pool = mariadb.createPool({
    user : process.env.MARIA_DB_USER,
    password : process.env.MARIA_DB_PASSWORD,   
    database : process.env.MARIA_DB_NAME
})

/**
 * This is used to establish a connection between nodejs application
 * and MariaDB database, for preforming of CRUD operations
 * @returns {Object} - This returns connection object
 */
const connectDB = () =>{
    return pool.getConnection();
}

module.exports = connectDB
