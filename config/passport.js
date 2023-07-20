/**
 * This file sets up a passport session for user which
 * is authorized through our keycloak SSO login page
 * @module passport
 * 
 * @requires connectDB
 * @requires passport
 * 
 * Passport Curity
 * 
 * @requires Strategy
 * @requires discoverAndCreateClient
 * 
 * @requires loginStrategyConfig
 */ 

const passport = require('passport');
const connectDB = require('../db/connect')
const { Strategy, discoverAndCreateClient } = require('passport-curity');
const loginStrategyConfig = require('../keycloak_login.json')


/**
 * Serialize user for passport session
 * @param {Object} user - User object containing user details
 * @param {Function} done - Callback function to return the serialized user
 * @returns {Promise<void>} - Promise resolving with the serialized user
*/
passport.serializeUser(async (user, done) => {
    const conn = await connectDB()
    const rows = await conn.query("select * from admin_accounts where (user_name = ?) or (email = ?)", [user.name, user.email],)
    if (rows.length > 0) {
        conn.release()
    }else{
        await conn.query("insert into admin_accounts (user_name, email, admin_type) values (?, ?, ?)", [user.name, user.email, 'user'])
        conn.release()
    }
    done(null, user);
  });
  
/**
 * Deserialize user for passport session
 * @param {Object} user - Serialized user object
 * @param {Function} done - Callback function to return the deserialized user
*/  
passport.deserializeUser((user, done) => {
    done(null, user);
});

/**
 * Get a configured passport instance for authentication
 * @async
 * @function getConfiguredPassport
 * @returns {Promise<passport>} - Promise resolving with a configured passport instance
*/
const getConfiguredPassport = async() =>{
    const client = 
        await discoverAndCreateClient({
            issuerUrl: loginStrategyConfig.issuer,
            clientID: loginStrategyConfig.credentials.clientID,
            clientSecret: loginStrategyConfig.credentials.clientSecret,
            redirectUris: [loginStrategyConfig.callbackURL],
            endSessionUrl: loginStrategyConfig.logoutURL
        }
    );

    const strategy = new Strategy({
        client,
        params: {
            scope: "openid profile"
        }
    }, function(accessToken, refreshToken, profile, cb){
        const user = { 
            name: profile.name,
            username: profile.preferred_username,
            email: profile.email
        };
        // console.log('this is act:',accessToken)
        // console.log('this is profile:',profile)
        return cb(null, user)
    })
    
    passport.use(strategy);

    return passport;
}

module.exports = {
    getConfiguredPassport,
}