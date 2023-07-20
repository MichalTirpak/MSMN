/**
 * This is the file in which are all the CRUD operations
 * for users made by an API, while also inserts for 
 * the logs table to ensure every operations is logged
 * @module usersController
 * 
 * 
 * @requires connectDB
 */ 

const connectDB = require('../db/connect')

/**
 * Retrieves a list of all users from the database if no query params are provided,
 * otherwise fetches a subset of locations based on the `limit` and `results` query params.
 * @async
 * @function getUsers
 * @param {Object} req - The request object containing the query parameters.
 * @param {Object} res - The response object to send the results to.
 * @returns {Promise<void>} - A Promise that resolves when the results are sent to the response object. 
 */
const getUsers = async (req,res) => {
    let conn
    const results = req.query.results
    const limit = req.query.limit
    if (!limit && !results){
        try{
            conn = await connectDB()
            let rows = await conn.query("select id, user_name, admin_type from admin_accounts")
            res.status(200).send(rows)
        }catch(error){
            res.status(500).json({ msg: error })
        }finally{
            if(conn)
            conn.release()
        }
    }
    else{
        try{
            conn = await connectDB()
            let rows = await conn.query(`select id, user_name, admin_type from admin_accounts limit ${results} offset ${limit}`)
            res.status(200).send(rows)
        }catch(error){
            res.status(500).json({ msg: error })
        }finally{
            if(conn)
            conn.release()
        }
    }
}

/**
 * Retrieves a single user from the database based on the specified user ID.
 * @async
 * @function getUser
 * @param {Object} req - The request object containing the query parameters.
 * @param {Object} res - The response object to send the results to.
 * @returns {Promise<void>} - A Promise that resolves when the results are sent to the response object. 
 */

const getUser = async (req,res) =>{
    let conn
    let id = req.params.id
    try{
        conn = await connectDB()
        let rows = await conn.query("select * from admin_accounts where (id=?)", [ id ])
        res.status(200).send(rows)
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Connects to the database and fetches all users that match the `like` query param.
 * @async
 * @function searchUsers
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the results are sent to the response object. 
 */
const searchUsers = async (req,res) => {
    let conn
    const like = req.query.like
    try {
        conn = await connectDB()
        let rows = await conn.query(`select * from admin_accounts where user_name like '%${like}%'`)
        res.status(200).send({rows})
    } catch (error) {
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Connects to the database and updates the user specified by `id` parameter.
 * @async
 * @function updateUser
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the results are sent to the response object. 
 */
const updateUser = async (req,res) => {
    let conn
    let data = req.params
    try{
        const { 
            name: userName,
            admin_type: userAdminType
        }=req.body
        conn = await connectDB()
        await conn.query("update admin_accounts set user_name=?, admin_type=? where id=?", [userName, userAdminType ,data.id])
        await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Uprava Prav uzivatela: ${userName}  na: ${userAdminType}`, new Date()])
        res.status(200).send({'Updated': data.id})
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Connects to the database and deletes the user specified by `id` parameter.
 * @async
 * @function deleteUser
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the results are sent to the response object. 
 */
const deleteUser = async (req,res) => {
    let conn
    let data = req.params
    try{
        const { 
            username: username
        }=req.body
        conn = await connectDB()
        await conn.query("delete from admin_accounts where (id=?)", [ data.id ])
        await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Zmazanie uzivatela: ${username}`, new Date()])
        res.status(200).send({'Deleted': data.id})
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}


module.exports = {
    getUsers,
    searchUsers,
    deleteUser,
    updateUser,
    getUser
}