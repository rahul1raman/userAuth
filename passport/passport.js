var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var mongoose = require('mongoose');
//var User = require('../models/users');
var User = mongoose.model('User');
var session = require('express-session');
var jwt = require('jsonwebtoken');
var secret = 'hariputtar';

module.exports = function(app, passport) {
    // Start Passport Configuration Settings
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false } }));
    // End Passport Configuration Settings

    // Serialize users once logged in   
    passport.serializeUser(function(user, done) {
        if(user.active){
          token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });  
        }else{
            token = 'inactive/error';
        }
        done(null, user.id); // Return user object
    });

    // Deserialize Users once logged out    
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user); // Complete deserializeUser and return done
        });
    });

    // Facebook Strategy    
    passport.use(new FacebookStrategy({
            clientID: '184644552044814', // Replace with your Facebook Developer App client ID
            clientSecret: 'bbd0eec3d7d5f7a85f33777d3fe59196', // Replace with your Facebook Developer client secret
            callbackURL: "http://localhost:3000/auth/facebook/callback", // Replace with your Facebook Developer App callback URL
            profileFields: ['id', 'displayName', 'photos', 'email']
        },
        function(accessToken, refreshToken, profile, done) {
        	//console.log(profile._json.email )
            User.findOne({ email: profile._json.email }).select('username password email active').exec(function(err, user) {
                if (err) done(err);

                if (user && user !== null) {
                    done(null, user);
                } else {
                    done(err);
                }
            });
        }
    ));

    passport.use(new TwitterStrategy({
        consumerKey: 'NAzasgkyRPpkEgoIo7AfhT70L',
        consumerSecret: 'jE4qk3H5S4sJiAszSXpet0zUtcKijWEesIVihUIAbumVQJ3TK6',
        callbackURL: "http://localhost:3000/auth/twitter/callback",
        userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
    },
    function(token, tokenSecret, profile, done) {
      //console.log(profile.emails[0].value);
      //done(null, profile);
      User.findOne({ email: profile.emails[0].value }).select('username password email active').exec(function(err, user) {
        if (err) done(err);
        if (user && user !== null) {
            done(null, user);
         } else {
            done(err);
        }
      });
    }
  ));

    

    passport.use(new GoogleStrategy({
        clientID: '821853285609-5j75hmre3tdngeb67emmon55huvq8hbi.apps.googleusercontent.com',
        clientSecret: '0887kOEa7XJEaxO0EzIvpYsJ',
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
       //console.log(profile);
       //done(null, profile);
       User.findOne({ email: profile.emails[0].value }).select('username password email active').exec(function(err, user) {
        if (err) done(err);
        if (user && user !== null) {
            done(null, user);
         } else {
            done(err);
        }
      });
   }
   ));



    app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {failureRedirect : '/facebookerror'}), function(req, res){
                res.redirect('/facebook/'+token);
        
        });


    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

    //twitter
    app.get('/auth/twitter', passport.authenticate('twitter'));


    app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {failureRedirect: '/twittererror' }), function(req, res){
                    res.redirect('/twitter/'+token);
    });


    //google routes
    app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.google.com/m8/feeds', 'profile', 'email'] }));
    
    app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/googleerror' }),
            function(req, res) {
                    res.redirect('/google/'+token);
        });

    return passport; // Return Passport Object
};