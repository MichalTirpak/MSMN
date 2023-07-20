/**
 * This is the file in which we set our Mrtg server
 * or get its url to generate the mrtg graphs for a 
 * certain device
 * @module mrtgController
 * 
 * @requires connectDB
 */ 

const connectDB = require('../db/connect')

/** 
 * Retrieves the MRTG server information from the database.
 * @async
 * @function getMrtgserver
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - A Promise that resolves when the results are sent to the response object. 
*/
const getMrtgserver = async (req,res) =>{
    let conn
    try{
        conn = await connectDB()
        let rows = await conn.query("select * from mrtgserver")
        res.status(200).send(rows)
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Connects to the database and updates the mrtgserver specified by `id` parameter.
 * @async
 * @function updateMrtgserver
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the results are sent to the response object. 
 */
const updateMrtgserver = async (req,res) => {
    let conn
    let data = req.params
    try{
        const { 
            url: url
        }=req.body
        conn = await connectDB()
        await conn.query("update mrtgserver set url=? where id=?", [url, data.id])
        await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Zmena mrtg serveru na: ${url}`, new Date()])
        res.status(200).send({'Updated': data.url})
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

module.exports={
    updateMrtgserver,
    getMrtgserver
}