/**
 * This is the main file for the web application.
 * It initializes and starts the application server.
 * @module app
 * 
 * @requires express
 * @requires connectDB
 * @requires cookieParser
 * @requires session
 * @requires getConfiguredPassport
 * @requires path
 * @requires bodyParser
 * 
 * Routes for application 
 * 
 * @requires viewRoutes
 * @requires apiRoutes
 * @requires authRoutes
 * @requires nonAuthRoutes
 */

const express = require('express')
const connectDB = require('./db/connect')
const cookieParser = require('cookie-parser');
const session = require('express-session')
const { getConfiguredPassport } = require('./config/passport');
const path = require('path')
const bodyParser = require('body-parser')
const viewRoutes = require('./routes/viewRoutes')
const apiRoutes = require('./routes/apiRoutes')
const authRoutes = require('./routes/authRoutes')
const nonAuthRoutes = require('./routes/nonAuthRoutes')
const swaggerUi = require('swagger-ui-express');
const { swaggerDocs } = require('./swaggerConfig');

const app = express()
const appPort = 8000


/**
 * Start the application server.
 * @function
 * @async
 * @returns {void}
 */
const start = async() =>{
    try {
      let conn = await connectDB()
        
      require('express-ejs-layouts')
      app.set('view engine', 'ejs')
      app.use(express.static(path.join(__dirname, '')))   
      app.use(cookieParser())
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }))
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));  

      app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: {maxAge: 360000}
      }));

      const passport = await getConfiguredPassport();
      app.use(passport.initialize());
      app.use(passport.session());

      /** 
       * Register Routes
       * authRoutes.. authentification
       * apiRoutes.. api calls
       * viewRoutes.. routes which lead to all the views in webapplication
       */

      app.use(authRoutes.routes)
      app.use(apiRoutes.routes)
      app.use(nonAuthRoutes.routes)
      app.use(ensureLoggedIn, viewRoutes.routes) 

      /**
       * Middleware that ensures the user is logged in and has the correct permissions.
       * If the user is logged in and has sufficient permissions, the request is passed on to the next middleware.
       * If the user is not logged in or does not have sufficient permissions, they are redirected to the appropriate page.
       * @async
       * @function ensureLoggedIn
       * @param {Object} req - The request object.
       * @param {Object} res - The response object.
       * @param {Function} next - The next middleware function.
       * @returns {void}
       */
      async function ensureLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
          const name = req.user.name
          const [rows] = await conn.query("select admin_type from admin_accounts where (user_name = ?)", [name])
          const rights = rows.admin_type
          if (rights == 'super'){
            return next();
          }
          res.redirect('/') 
        }
        res.redirect('/auth/keycloak')
      }
      app.listen(appPort, ()=> console.log(`App is listening on url http://localhost:${appPort}`))
    } 
    catch (error) {
      console.log(error)
    }
}

start()

