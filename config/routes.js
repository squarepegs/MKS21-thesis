var User    = require('../db/models/userModel')

module.exports = function(app,passport){


  app.get('/', function(req, res){
    res.render('../client/landing_page/landingpage.ejs')//may need to be client/teacher/index
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/teacher',
    failureRedirect: '/',
    failureFlash: true
  }));

  app.post('/login', passport.authenticate('local-signin', {
    successRedirect: '/teacher',
    failureRedirect: '/fail',
    failureFlash: true
  }));  

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