/**
 * This is the file which renders all the views
 * which are only supposed to be used by super 
 * admin_type users
 * @module render
 * 
 * @requires axios
 * @requires dotenv
 */

const axios = require('axios')
require('dotenv').config()

const api_url_buildings = `${process.env.API_URL}buildings/`;
const api_url_locations = `${process.env.API_URL}locations/`;
const api_url_devices = `${process.env.API_URL}devices/`
const api_url_users = `${process.env.API_URL}users/`;
const api_url_mrtg = `${process.env.API_URL}mrtgserver/`

/**
 * Renders the index page.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.index = (req,res) =>{
    res.render('../views/pages/index.ejs')
}

/**
 * Renders the dashboard page with data count on devices, locations, buildings, and users.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.dashboard = (req,res) => {
    const axiosDevices = axios.get(api_url_devices)
    const axiosLocations = axios.get(api_url_locations)
    const axiosBuildings = axios.get(api_url_buildings)
    const axiosUsers = axios.get(api_url_users)
    axios.all([axiosDevices, axiosLocations, axiosBuildings, axiosUsers])
    .then(axios.spread(function(devicesdata, locationsdata, buildingsdata, usersdata) {
            let devices = countData(devicesdata.data)
            let buildings = countData(buildingsdata.data)
            let locations = countData(locationsdata.data)
            let users = countData(usersdata.data)
            res.render('../views/pages/dashboard.ejs', {
                user: req.user,
                devices: devices,
                buildings: buildings,
                locations: locations,
                users: users
            })
        }))
}

/**
 * Renders the buildings page.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.buildings = (req,res) => {
    res.render('../views/pages/buildings/buildings.ejs', {
        user: req.user,
    })    
}

/**
 * Renders the buildings edit page for a specific building ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.buildingsUpdate = (req,res) => {
    axios.all([
        axios.get(api_url_buildings+req.params.id).then((buildingdata) => {
            let data = unArrayJson(buildingdata.data)
            res.render('../views/pages/buildings/building-edit.ejs',{
                user: req.user,
                building: data,
                api_url: api_url_buildings
            })
        })
    ])
}

/**
 * Renders the buildings add page.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.buildingsAdd = (req,res) => {
    res.render('../views/pages/buildings/building-add.ejs',{
        user: req.user,
    })
}

/**
 * Renders the locations page.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.locations = (req,res) => {
    res.render('../views/pages/locations/locations.ejs', {
        user: req.user,
    })
}

/**
 * Renders the locations add page.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.locationsAdd = (req,res) => {
    axios.get(api_url_buildings).then((buildingsdata) => {
        res.render('../views/pages/locations/locations-add.ejs',{
            user: req.user,
            buildings: buildingsdata.data
        })
    })  
}

/**
 * Renders the locations edit page for a specific location ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.locationsUpdate = (req,res) => {
    const axiosLocations = axios.get(api_url_locations+req.params.id)
    const axiosBuildings = axios.get(api_url_buildings)
    axios.all([axiosLocations, axiosBuildings]).then(axios.spread(function(locationsdata, buildingsdata) {
        let data = unArrayJson(locationsdata.data)
        axios.get(api_url_buildings+data.budovaid).then((usedBuildingData)=>{
            let usedBuilding = unArrayJson(usedBuildingData.data)
            res.render('../views/pages/locations/locations-edit.ejs',{
                user: req.user,
                location: data,
                api_url: api_url_buildings,
                buildings: buildingsdata.data,
                usedBuilding: usedBuilding
            })
        })
    }))  
}

/**
 * Renders the user page with the user data.
 * @param {Object} req 
 * @param {Object} res 
 * @returns {void} 
 */
exports.users = (req,res)=>{
    res.render('../views/pages/users/users.ejs', {
        user: req.user,
    })
}

/**
 * Renders the user edit page for the specific user.
 * @param {Object} req 
 * @param {Object} res
 * @returns {void}  
 */
exports.usersUpdate = (req,res)=>{
    axios.get(api_url_users+req.params.id).then((usersData)=>{
        let data = unArrayJson(usersData.data)
        res.render('../views/pages/users/users-edit.ejs',{
            user: req.user,
            userInfo: data
        })
    })
}

/**
 * Renders the logs page with the logs data.
 * @param {Object} req 
 * @param {Object} res 
 * @returns {void} 
 */
exports.logs = (req,res)=>{
    res.render('../views/pages/logs/logs.ejs', {
        user: req.user,
    })
}

/**
 * Renders the devices page with the devices data.
 * @param {Object} req 
 * @param {Object} res 
 * @returns {void} 
 */
exports.devices =  (req,res) =>{
    res.render('../views/pages/devices/devices.ejs',{
        user: req.user
    })
}

/**
 * Renders the devices add page 
 * @param {Object} req 
 * @param {Object} res 
 * @returns {void}
 */
exports.devicesAdd = (req,res) => {
    res.render('../views/pages/devices/devices-add.ejs',{
        user: req.user
    })
}

/**
 * Renders the devices edit page for the specific device ID.
 * @param {Object} req 
 * @param {Object} res
 * @returns {void}  
 */
exports.devicesUpdate = (req,res) => {
    axios.get(api_url_devices+req.params.id).then(function(devicesdata) {
        let data = unArrayJson(devicesdata.data)
        const axiosBuildings = axios.get(api_url_buildings+data.idbudova)
        const axiosLocations = axios.get(api_url_locations+data.idlokalita)
        axios.all([axiosBuildings, axiosLocations]).then(axios.spread((buildingdata, locationdata) => {
            let building = unArrayJson(buildingdata.data)
            let location = unArrayJson(locationdata.data)
            res.render('../views/pages/devices/devices-edit.ejs',{
                user: req.user,
                device: data,
                location: location,
                building: building
            })
        }))
    })  
}

/**
 * Renders the mrtg graphs page for specific device with its IP,
 * and using the mrtg server url.
 * @param {Object} req 
 * @param {Object} res
 * @returns {void}  
 */
exports.mrtg = (req,res) =>{
    const ip = req.params.ip;
    axios.get(api_url_mrtg).then((mrtgdata) => {
        let mrtg = unArrayJson(mrtgdata.data)
        res.render('../views/pages/mrtg.ejs', {
            ip: ip,
            url: mrtg.url
        })
    })
}

/**
 * Renders the settings page, where the mrtg server can be modified.
 * @param {Object} req 
 * @param {Object} res
 * @returns {void}  
 */
exports.settings = (req,res) =>{
    axios.get(api_url_mrtg).then((mrtgdata) => {
        let mrtg = unArrayJson(mrtgdata.data)
        res.render('../views/pages/settings.ejs', {
            user: req.user,
            url: mrtg.url,
            id: mrtg.id
        })
    })
}

exports.loader = (req,res) => {
    res.render('../views/loaderio-e02618692f2e16b7e561ab0a850b92e0');
}

/**
 * Counts the total amount of data
 * @param {Object} data - The data from api-call
 * @returns {number} The amount of data for the dataset provided
 */
function countData(data){
    let amount = 0
    data.forEach((one)=>{
        amount++
    })
    return amount
}

/**
 * Transforms [{}] json format into {} for a single object
 * @param {Object} data 
 * @returns {Object} The unarrayed json object
 */
function unArrayJson(data){
    let jsonString = JSON.stringify(data)
    let jsonSliced = jsonString.slice(1, -1)
    let jsonJson = JSON.parse(jsonSliced)
    return jsonJson
}
