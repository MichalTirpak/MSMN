/**
 * This file sets up a passport session for user which
 * is authorized through our keycloak SSO login page
 * @module authRoutes
 * 
 * @requires connectDB
 * @requires express
 * @requires passport
 * @requires loginStrategyConfig
 */ 

const connectDB = require('../db/connect')
const express = require('express')
const router = express.Router()
const passport = require('passport');


/**
 * Defines a route for authentication using Keycloak, when a user hits this route,
 * it triggers the Passport middleware's authenticate method with the curity
 * strategy, which authenticates the user using their Keycloak credentials.
 * @route GET /auth/keycloak
 * @authentication
 */
router.get(
    "/auth/keycloak",
    passport.authenticate(['curity']),
);

/**
 * Callback endpoint for Curity authentication
 * If authentication fails, user is redirected to /auth/keycloak
 * If authentication is successful, user is logged in and redirected to /admin
 * @route GET /auth/callback
 */
router.get(
    '/auth/callback',
    passport.authenticate(['curity'],{
        failureRedirect: '/auth/keycloak',
    }),
    function(req, res) {
        req.logIn(req.user, async function(err) {
            const conn = await connectDB()
            if (err) {
                // console.log(err);
            }
            const [rights] = await conn.query("select admin_type from admin_accounts where (user_name = ?)", [req.user.name])
            const user_type = rights.admin_type
            await conn.query("insert into logs (user, udalost, datum) values (?,?,?)", [req.user.name, `Prihlasenie pouzivatela: ${req.user.name} Prava: ${user_type}`, new Date()])
            return res.redirect('/admin');
        });
    }
);

/**
 * Handles logging out the user from the web application. Calls the PassportJS
 * logout function to remove the user's session from the server. If successful,
 * redirects the user to the logout URL specified in the loginStrategyConfig object.
 * If an error occurs, redirects the user to an error page.
 * @route GET /logout
 */
router.get('/logout', function(req, res){
    req.logout(function(err) {
        if (err) {
            console.error(err);
            return res.redirect('error');
        }
        res.redirect('https://sso.uvt.tuke.sk/auth/realms/TUKE/protocol/openid-connect/logout?redirect_uri=http://localhost:8000/logout-page')
    });
});

module.exports = {
    routes:router
}