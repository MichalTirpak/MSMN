/**
 * This is the file in which are all the CRUD operations
 * for devices made by an API, while also inserts for 
 * the logs table to ensure every operations is logged
 * @module devicesController
 * 
 * @requires connectDB
 */ 

const connectDB = require('../db/connect')

/**
 * Connect to the database and get all devices if no query params are provided,
 * otherwise fetches a subset of devices based on the `limit` and `results` query params.
 * @async
 * @function getDevices
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const getDevices = async (req,res) => {
    let conn
    const results = req.query.results
    const limit = req.query.limit
    if (!limit && !results){
        try{
            conn = await connectDB()
            let rows = await conn.query("select * from swzoznam")
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
            let rows = await conn.query(`select * from swzoznam limit ${results} offset ${limit}`)
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
 * Connect to the database and search for devices based on query parameters.
 * @async
 * @function searchDevices
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const searchDevices = async (req,res) => {
    let conn
    const like = req.query.like
    const searchBy = req.query.searchBy
    const limit = req.query.limit
    if(searchBy == 'name'){
        try {
            conn = await connectDB()
            let rows = await conn.query(`select * from swzoznam where swname like '%${like}%'`)
            res.status(200).send({rows})
        } catch (error) {
            res.status(500).json({ msg: error })
        }finally{
            if(conn)
            conn.release()
        }  
    } 
    else if(limit == 5){
        if(searchBy == 'ip'){
            try {
                conn = await connectDB()
                let rows = await conn.query(`select * from swzoznam where swip like '%${like}%' limit ${limit}`)
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
                let rows = await conn.query(`select * from swzoznam where swname like '%${like}%' limit ${limit}`)
                res.status(200).send({rows})
            } catch (error) {
                res.status(500).json({ msg: error })
            }finally{
                if(conn)
                conn.release()
            }  
        }
    }
    else if(searchBy == 'ip'){
        try {
            conn = await connectDB()
            let rows = await conn.query(`select * from swzoznam where swip like '%${like}%'`)
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
            let rows = await conn.query(`select * from swzoznam where swname like '%${like}%'`)
            res.status(200).send({rows})
        } catch (error) {
            res.status(500).json({ msg: error })
        }finally{
            if(conn)
            conn.release()
        }   
    }
}

/**
 * Connect to the database and get a specific device by ID.
 * @async 
 * @function getDevice
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const getDevice = async (req,res) =>{
    let conn
    let id = req.params.id
    try{
        conn = await connectDB()
        let rows = await conn.query("select * from swzoznam where (id=?)", [ id ])
        res.status(200).send(rows)
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Connect to the database and insert a new device.
 * @async
 * @function postDevice
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const postDevice = async (req,res) => {
    let conn
    try{
        conn = await connectDB()
        const {
            swname: swname,
            swip: swip,
            snmpcomunity: snmpcomunity,
            building: buildingId,
            location: locationId,
        }=req.body
        await conn.query("insert into swzoznam (swname, swip, idlokalita, idbudova, snmpuptime, snmpcomunity, switchmap, isrouter) values (?, ?, ?, ?, ?, ?, ?, ?)", [swname, swip, locationId, buildingId, "error", snmpcomunity, 1, 0])
        let [building] = await conn.query("select nazov from budova where id=?",[buildingId])
        let [location] = await conn.query("select nazov from lokalita where id=?",[locationId])
        await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Vytvorenie zariadenia: ${swname}, s ip ${swip}, v lokalite: ${location.nazov}, v budove: ${building.nazov}`, new Date()])
        res.status(201).redirect('/devices')
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Connect to the database and get all devices in a specific location.
 * @async
 * @function getDevicesInLocation
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const getDevicesInLocation = async (req,res) =>{
    let conn
    let idlokalita = req.params.idlokalita
    try{
        conn = await connectDB()
        let rows = await conn.query("select * from swzoznam where (idlokalita=?)", [ idlokalita ])
        res.status(200).send(rows)
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Connect to the database and update a device.
 * @async
 * @function updateDevice
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const updateDevice = async (req,res) => {
    let conn
    let data = req.params
    try{
        // console.log(req.body.switchmap)
        if(req.body.switchmap !== undefined){
            const {
                switchmap: switchmap,
                swname: swname
            }=req.body  
            conn = await connectDB()
            await conn.query("update swzoznam set switchmap=? where id=?", [switchmap, data.id])
            await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Switchmap Update Zariadenia: ${swname}  na hodnotu: ${switchmap}`, new Date()])
            res.status(200).send({'Updated Switchmap': data.id})
        }else{
            const {
                swname: swname,
                swip: swip,
                snmpcomunity: snmpcomunity,
                building: buildingId,
                location: locationId,
            }=req.body
            conn = await connectDB()
            await conn.query("update swzoznam set swname=?, swip=?, snmpcomunity=?, idbudova=?, idlokalita=? where id=?", [swname,swip,snmpcomunity,buildingId,locationId, data.id])
            let [building] = await conn.query("select nazov from budova where id=?",[buildingId])
            let [location] = await conn.query("select nazov from lokalita where id=?",[locationId])
            await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Edit zariadenia: ${swname}, s ip ${swip}, v lokalite: ${location.nazov}, v budove: ${building.nazov}`, new Date()])
            res.status(200).send({'Updated Device': data.id})
        }
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}

/**
 * Deletes a device from the database based on the ID provided in the request parameters.
 * @async
 * @function deleteDevice
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the query is completed.
 */
const deleteDevice = async (req,res) => {
    let conn
    let data = req.params
    try{
        const { 
            device: device
        }=req.body
        conn = await connectDB()
        await conn.query("delete from swzoznam where (id=?)", [ data.id ])
        await conn.query("insert into logs (user, udalost, datum) values(?, ?, ?)", [req.user.name, `Zmazanie zariadenia: ${device}`, new Date()])
        res.status(200).send({'Deleted': data.id})
    }catch(error){
        res.status(500).json({ msg: error })
    }finally{
        if(conn)
        conn.release()
    }
}


module.exports = {
    getDevices,
    searchDevices,
    getDevice,
    getDevicesInLocation,
    postDevice,
    updateDevice,
    deleteDevice
}