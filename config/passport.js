var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
//TODO: need to make a user 
var User = require('../db/models/userModel');
var configAuth = require('./auth')

module.exports = function(passport){
  
  passport.serializeUser(function(user, done){
    done(null, user.id);

  });
  //findById is mongo method
  passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err, user);
    });
  });

passport.use('local-signup', new LocalStrategy({
  //this should look at index.html sign up class
  usernameField: 'signupUsername',
  passwordField: 'signupPassword',
  passReqToCallback: true
}, function(req, username, password, done) {
  process.nextTick(function() {
    User.findOne({
      'local.username': username
    }, function(err, user) {
      if (err) return done(err);
      if (user) {
        return done(null, false, req.flash('signupMessage', 'That username already taken'));
      } else {
        var newUser = new User();
        newUser.local.username = username;
        newUser.local.password = newUser.generateHash(password);
        newUser.save(function(err) {
          if (err) throw err;
          return done(null, newUser);
        }).then(User.findOne({
          'local.username': username
        }, function(err, user) {
        }));
      }
    });
  });
}));

  passport.use('local-signin', new LocalStrategy({
    usernameField: 'loginUsername',
    passwordField: 'loginPassword',
    passReqToCallback: true
  },
  function(req, username, password, done){
    process.nextTick(function(){
      User.findOne({'local.username': username}, function(err,user){
        if(err){
          return done(err);
        }
        if(!user){
          return done(null, false, req.flash('loginMessage', 'no user found'));
        }
        if(!user.validPassword(password) && user.validPassword !== undefined){
          return done(null, false, req.flash('loginMessage', 'incorrect password'));
        }
        return done(null, user);  
      });
      
    });
  }
  ));

  passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL
  },

  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function(){
      User.findOne({'facebook.id': profile.id}, function(err, user){
        if(err)
          return done(err);
        if(user)
          return done(null,user);
        else {
          var newUser = new User();
          newUser.facebook.id = profile.id;
          newUser.facebook.token = accessToken;
        // newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
        // newUser.facebook.email = profile.emails[0].value;

          newUser.save(function(err){
            if(err)
              throw err;

            return done(null, newUser);
          })
        }
      });
    });
  }
  ));
   

};