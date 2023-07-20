/**
 * This is the file in which we get logs based on our needs,
 * or if we simply search for a log from certain user, about
 * certain event
 * @module logsController
 * 
 * @requires connectDB
 */ 

const connectDB = require('../db/connect')

/**
 * Retrieves logs from the database if no query params are provided,
 * otherwise fetches a subset of logs based on the `limit` and `results` query params.
 * @async
 * @function getLogs
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const getLogs = async (req,res) => {
    let conn
    const results = req.query.results
    const limit = req.query.limit
    if (!limit && !results){
        try{
            conn = await connectDB()
            let rows = await conn.query("select * from logs order by id desc;")
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
            let rows = await conn.query(`select * from logs order by id desc limit ${results} offset ${limit}`)
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
 * Searches logs from the database based on the specified search criteria.
 * @async
 * @function searchLogs
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const searchLogs = async (req,res) => {
    let conn
    const like = req.query.like
    const searchBy = req.query.searchBy
    if(searchBy == 'user'){
        try {
            conn = await connectDB()
            let rows = await conn.query(`select * from logs where user like '%${like}%' order by id desc`)
            res.status(200).send({rows})
        } catch (error) {
            res.status(500).json({ msg: error })
        }finally{
            if(conn)
            conn.release()
        }  
    } 
    else if(searchBy == 'udalost'){
        try {
            conn = await connectDB()
            let rows = await conn.query(`select * from logs where udalost like '%${like}%' order by id desc`)
            res.status(200).send({rows})
        } catch (error) {
            res.status(500).json({ msg: error })
        }finally{
            if(conn)
            conn.release()
        }
    }else{
        try {
            conn = await connectDB()
            let rows = await conn.query(`select * from logs where user like '%${like}%' order by id desc`)
            res.status(200).send({rows})
        } catch (error) {
            res.status(500).json({ msg: error })
        }finally{
            if(conn)
            conn.release()
        }   
    }
}

module.exports = {
    getLogs,
    searchLogs
}