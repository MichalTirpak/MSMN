/**
 * This file sets up a passport session for user which
 * is authorized through our keycloak SSO login page
 * @module viewRoutes
 * 
 * @requires express
 * @requires services
 */ 

const express = require('express');
const router = express.Router();
const services = require('../services/render')

/**
 * This file serves as a listing of all the routes that our webapplication
 * is currently using, each route takes a function from services to render 
 * the views for them, also these are protected routes only for users with
 * super admin_type accounts in the database.
 */

router.get('/admin', services.dashboard)

router.get('/buildings', services.buildings)

router.get('/buildings/add', services.buildingsAdd)

router.get('/buildings/edit/:id', services.buildingsUpdate)

router.get('/locations', services.locations)

router.get('/locations/add', services.locationsAdd)

router.get('/locations/edit/:id', services.locationsUpdate)

router.get('/devices', services.devices)

router.get('/devices/add', services.devicesAdd)

router.get('/devices/edit/:id', services.devicesUpdate)

router.get('/users', services.users)

router.get('/users/edit/:id', services.usersUpdate)

router.get('/logs', services.logs)

router.get('/settings', services.settings)

module.exports={
    routes: router 
}