/**
 * This file sets up a passport session for user which
 * is authorized through our keycloak SSO login page
 * @module nonAuthRoutes
 * 
 * @requires express
 * @requires services
 */ 

const express = require('express');
const router = express.Router();
const services = require('../services/render')

/**
 * This file serves as a listing of the routes that our webapplication
 * is currently using, each route takes a function from services to render 
 * the views for them, these are unprotected routes for all the users.
 */

router.get('/', services.index)

router.get('/mrtg/:ip', services.mrtg)

module.exports={
    routes: router 
}