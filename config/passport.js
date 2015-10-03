var LocalStrategy = require('passport-local').Strategy;

//TODO: need to make a user 
var Users = require('../db/userModel');

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
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, username, password, done){
    //node.js function to make async, unless data is sent back
    //our look up wont fire
    process.nextTick(function(){
      Users.getUserByName({'local.username': username}), function(err,user){
        if(err)
          return done(err);
        if(user){
          return done(null, false, req.flash('signupMessage', 'Username already taken'));
        } else {
          
            var login = username;
            var hashed_password = password;//need bcrypt
            Users.addUser(login, 'test email', hashedPassword, 'firstname test', 'lastname test','type test')
            // var newUser = new User();
            // newUser.local.email = email;
            // newUser.local.password = password;
            // var hashedPassword = bcrypt stuff
           //this is what the model wantsaddUser: function(login, email, hashedPassword, firstName, lastName, type)
            //model.users.addUser(username, email, hashedPassword, firstName, lastName, type)
        }
      }
    });

  })),

  passport.use('local-signin', new LocalStrategy({

    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, username, password, done){
    process.nextTick(function(){
      User.findOne({'local.username': username}), function(err,user){
        if(err)
          return done(err);
        if(!user){
          return done(null, false, req.flash('loginMessage', 'no user found'));
        if(user.local.password !== password){
          return done(null, false, req.flash('loginMessage', 'incorrect password'));
        }
        return done(null, user);  
        };
      }
    });
  }
  ));
  

};