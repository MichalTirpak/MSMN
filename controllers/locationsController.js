/**
 * This is the file in which are all the CRUD operations
 * for locations made by an API, while also inserts for 
 * the logs table to ensure every operations is logged
 * @module locationsController
 * 
 * @requires connectDB
 */ 

const connectDB = require('../db/connect')

/**
 * Connects to the database and fetches all locations if no query params are provided,
 * otherwise fetches a subset of locations based on the `limit` and `results` query params.
 * @async
 * @function getLocations
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - - A Promise that resolves when the results are sent to the response object. 
 */
const getLocations = async (req,res) => {
    let conn
    const results = req.query.results
    const limit = req.query.limit
    if (!limit && !results){
        try{
            conn = await connectDB()
            let rows = await conn.query("select * from lokalita")
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
            let rows = await conn.query(`select * from lokalita limit ${results} offset ${limit}`)
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
 * Connects to the database and fetches all locations that belong to a building specified by `budovaid` parameter.
 * @async
 * @function getLocationsInBuilding
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - - A Promise that resolves when the results are sent to the response object. 
 */
const getLocationsInBuilding = async (req,res) =>{
    let conn
    let budovaid = req.params.budovaid
    try{
        conn = await connectDB()
        let rows = await conn.query("select * from lokalita where (budovaid=?)", [ budovaid ])
        res.status(200).send(rows)
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Connects to the database and fetches all locations that match the `like` query param.
 * @async
 * @function searchLocations
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - - A Promise that resolves when the results are sent to the response object. 
 */
const searchLocations = async (req,res) => {
    let conn
    const like = req.query.like
    try {
        conn = await connectDB()
        let rows = await conn.query(`select * from lokalita where nazov like '%${like}%'`)
        res.status(200).send({rows})
    } catch (error) {
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Connects to the database and fetches the location specified by `id` parameter.
 * @async
 * @function getLocation
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - - A Promise that resolves when the results are sent to the response object. 
 */
const getLocation = async (req,res) =>{
    let conn
    let id = req.params.id
    try{
        conn = await connectDB()
        let rows = await conn.query("select * from lokalita where (id=?)", [ id ])
        res.status(200).send(rows)
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Connects to the database and adds a new location to the database.
 * @async
 * @function postLocation
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the results are sent to the response object. 
 */
const postLocation = async (req,res) => {
    let conn
    try{
        conn = await connectDB()
        const {
            name: locationName,
            building: buildingId,
        }=req.body
        await conn.query("insert into lokalita (nazov, budovaid) values (?, ?)", [locationName, buildingId])
        let [building] = await conn.query("select nazov from budova where id=?",[buildingId])
        // console.log(building.nazov)
        await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Vytvorenie Lokality: ${locationName}, v budove: ${building.nazov}`, new Date()])
        res.status(201).redirect('/locations')
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Connects to the database and updates the location specified by `id` parameter.
 * @async
 * @function updateLocation
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the results are sent to the response object. 
 */
const updateLocation = async (req,res) => {
    let conn
    let data = req.params
    try{
        const { 
            name: name,
            building: buildingId,
            oldName: oldName,
            oldBuilding: oldBuilding
        }=req.body
        conn = await connectDB()
        await conn.query("update lokalita set nazov=?, budovaid=? where id=?", [name, buildingId, data.id])
        if(name != oldName){
            if(buildingId != oldBuilding){
                let [building] = await conn.query("select nazov from budova where id=?",[buildingId])
                await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Uprava Lokality: ${oldName}  na: ${name} a jej budovy na: ${building.nazov}`, new Date()])
            }else{
                await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Uprava Lokality: ${oldName}  na: ${name}`, new Date()])
            }
        }else{
            let [building] = await conn.query("select nazov from budova where id=?",[buildingId])
            await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Uprava Lokality: ${oldName}  na budovu: ${building.nazov}`, new Date()])  
        }
        res.status(200).send({'Updated': data.id})
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Connects to the database and deletes the location specified by `id` parameter.
 * @async
 * @function deleteLocation
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the results are sent to the response object. 
 */
const deleteLocation = async (req,res) => {
    let conn
    let data = req.params
    try{
        const { 
            location: location
        }=req.body
        conn = await connectDB()
        await conn.query("delete from lokalita where (id=?)", [ data.id ])
        await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Zmazanie lokality: ${location}`, new Date()])
        res.status(200).send({'Deleted': data.id})
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

module.exports = {
    getLocations,
    getLocationsInBuilding,
    searchLocations,
    getLocation,
    postLocation,
    updateLocation,
    deleteLocation
}