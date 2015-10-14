var User    = require('../db/models/userModel');
var UserController    = require('../db/controllers/userController');
var DeckController    = require('../db/controllers/deckController');
var TestController    = require('../db/controllers/testController');

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
    failureRedirect: '/',
    failureFlash: true
  }));

  app.post('/login', passport.authenticate('local-signin', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
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

  app.get('/api/decks/:id', function(req, res){
    DeckController.getADeck(req, res)
  });

  app.post('/api/decks/:id', function(req, res){
    DeckController.amendADeck(req, res)
  });

  app.post('/api/killdeck', function(req, res){
    console.log("route killdeck")
    DeckController.killDeck(req, res)
  });

  app.post('/api/shareDeck', function(req,res){
    console.log('route sharedeck');
    DeckController.shareDeck(req, res);
  })

  app.get('/auth/facebook', passport.authenticate('facebook'));//can add ('facebook', {scope: ['email']}) for email permissions

  app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/teacher', 
                                      failureRedirect: '/' }));
  

  app.get('/api/logout', function (req, res){
    req.session.destroy(function (err) {
      res.redirect('/'); 
    });
  });
  
  

  app.post('/api/recordTest', function(req, res){
    console.log('route recordtest');
    TestController.recordTest(req, res)
  })

};

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/')
  }
}