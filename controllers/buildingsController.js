/**
 * This is the file in which are all the CRUD operations
 * for buildings made by an API, while also inserts for 
 * the logs table to ensure every operations is logged
 * @module buildingsController
 * 
 * @requires connectDB
 */ 

const connectDB = require('../db/connect')

/**
 * Retrieves all buildings from the database if no query params are provided,
 * otherwise fetches a subset of buildings based on the `limit` and `results` query params.
 * @async
 * @function getBuildings
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const getBuildings = async (req,res) => {
    let conn
    const results = req.query.results
    const limit = req.query.limit
    if (!limit && !results){
        try{
            conn = await connectDB()
            let rows = await conn.query("select * from budova")
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
            let rows = await conn.query(`select * from budova limit ${results} offset ${limit}`)
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
 * Searches for buildings in the database that match the given search term.
 * @async
 * @function searchBuildings
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const searchBuildings = async (req,res) => {
    let conn
    const like = req.query.like
    try {
        conn = await connectDB()
        let rows = await conn.query(`select * from budova where nazov like '%${like}%'`)
        res.status(200).send({rows})
    } catch (error) {
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Retrieves a single building from the database.
 * @async
 * @function getBuilding
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const getBuilding = async (req,res) =>{
    let conn
    let id = req.params.id
    try{
        conn = await connectDB()
        let rows = await conn.query("select * from budova where (id=?)", [ id ])
        res.status(200).send(rows)
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Inserts a new building into the database.
 * @async
 * @function postBuilding
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const postBuilding = async (req,res) => {
    let conn
    try{
        conn = await connectDB()
        const {
            name: buildingName,
        }=req.body
        await conn.query("insert into budova (nazov) values (?)", [buildingName])
        await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Vytvorenie budovy: ${buildingName}`, new Date()])
        res.status(201).redirect('/buildings')
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Updates an existing building in the database.
 * @async
 * @function updateBuilding
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const updateBuilding = async (req,res) => {
    let conn
    let data = req.params
    try{
        const { 
            name: name,
            oldName: oldName,
        }=req.body
        conn = await connectDB()
        await conn.query("update budova set nazov=? where id=?", [name, data.id])
        await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Uprava budovy: ${oldName}  na: ${name}`, new Date()])
        res.status(200).send({'Updated': data.id})
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Deletes a building from the database.
 * @async
 * @function deleteBuilding
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const deleteBuilding = async (req,res) => {
    let conn
    let data = req.params
    try{
        const { 
            building: building
        }=req.body
        conn = await connectDB()
        await conn.query("delete from budova where (id=?)", [ data.id ])
        // console.log(req.body)
        await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Zmazanie budovy: ${building}`, new Date()])
        res.status(200).send({'Deleted': data.id})
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}


module.exports = {
    getBuildings,
    searchBuildings,
    deleteBuilding,
    postBuilding,
    getBuilding,
    updateBuilding
}