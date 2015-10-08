var User    = require('../db/models/userModel');
var UserController    = require('../db/controllers/userController');
var DeckController    = require('../db/controllers/deckController');

var mongoose = require('mongoose');

module.exports = function(app,passport){


  app.get('/', function(req, res){
    res.render('../client/landing_page/landingpage.ejs')//may need to be client/teacher/index
  });
  app.get('/dashboard', function(req, res){
    res.render('../client/teacher/dashboard.ejs')//may need to be client/teacher/index
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/dashboard',
    failureRedirect: '/fail',
    failureFlash: true
  }));

  app.post('/login', passport.authenticate('local-signin', {
    successRedirect: '/dashboard',
    failureRedirect: '/fail',
    failureFlash: true
  }), function(user){
    console.log(user);
  });

  app.get('/api/profile', function(req, res){
    UserController.getProfile(req, res)
  });

  app.post('/api/profile', function(req, res){
    UserController.amendProfile(req, res)
  });

  app.get('/api/decks', function(req, res){
    DeckController.getDecks(req, res)
  });

  app.post('/api/decks', function(req, res){
    DeckController.newDeck(req, res)
  });

  app.get('/auth/facebook', passport.authenticate('facebook'));//can add ('facebook', {scope: ['email']}) for email permissions

  app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/teacher', 
                                      failureRedirect: '/' }));


};

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/')
  }
}