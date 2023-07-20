/**
 * This file sets up a passport session for user which
 * is authorized through our keycloak SSO login page
 * @module apiRoutes
 * 
 * @requires express
 */ 

const express = require('express')
const router = express.Router();

const {getBuildings, searchBuildings, getBuilding, postBuilding, updateBuilding, deleteBuilding} = require('../controllers/buildingsController');
const {getLocations, getLocationsInBuilding, getLocation, postLocation, updateLocation, deleteLocation, searchLocations} = require('../controllers/locationsController');
const {getDevices, getDevice, getDevicesInLocation, searchDevices, postDevice, updateDevice, deleteDevice} = require('../controllers/devicesController')
const {getLogs, searchLogs } = require('../controllers/logsController');
const {getUsers, searchUsers, deleteUser, updateUser, getUser} = require('../controllers/usersController');
const {getMrtgserver, updateMrtgserver} = require('../controllers/mrtgController');


/**
 * Endpoints for performing CRUD operations for buildings 
 */
/**
 * @swagger
 * /api/v1/buildings:
 *   get:
 *     summary: Get all buildings
 *     description: Retrieve a list of all buildings
 *     responses:
 *       '200':
 *         description: A list of buildings
 */
router.route('/api/v1/buildings').get(getBuildings)
router.route('/api/v1/buildings/search').get(searchBuildings)
router.route('/api/v1/buildings/:id').get(getBuilding)
router.route('/api/v1/buildings').post(postBuilding)
router.route('/api/v1/buildings/:id').patch(updateBuilding)
router.route('/api/v1/buildings/:id').delete(deleteBuilding)

/**
 * Endpoints for performing CRUD operations for locations
 */
router.route('/api/v1/locations').get(getLocations)
router.route('/api/v1/locations/search').get(searchLocations)
router.route('/api/v1/locations/:id').get(getLocation)
router.route('/api/v1/locations/building/:budovaid').get(getLocationsInBuilding)
router.route('/api/v1/locations').post(postLocation)
router.route('/api/v1/locations/:id').patch(updateLocation)
router.route('/api/v1/locations/:id').delete(deleteLocation)

/**
 * Endpoint for performing CRUD operations for devices
 */
router.route('/api/v1/devices').get(getDevices)
router.route('/api/v1/devices/search').get(searchDevices)
router.route('/api/v1/devices/:id').get(getDevice)
router.route('/api/v1/devices/location/:idlokalita').get(getDevicesInLocation)
router.route('/api/v1/devices').post(postDevice)
router.route('/api/v1/devices/:id').patch(updateDevice)
router.route('/api/v1/devices/:id').delete(deleteDevice)

/**
 * Endpooint for performing CRUD operations for users
 */
router.route('/api/v1/users').get(getUsers)
router.route('/api/v1/users/search').get(searchUsers)
router.route('/api/v1/users/:id').get(getUser)
router.route('/api/v1/users/:id').patch(updateUser)
router.route('/api/v1/users/:id').delete(deleteUser)

/**
 * Endpoint for handling logs get/search operations
 */
router.route('/api/v1/logs').get(getLogs)
router.route('/api/v1/logs/search').get(searchLogs)

/**
 * Endpoint for handling mrtg get/patch operations
 */
router.route('/api/v1/mrtgserver').get(getMrtgserver)
router.route('/api/v1/mrtgserver/:id').patch(updateMrtgserver)

module.exports = {
    routes: router
}

