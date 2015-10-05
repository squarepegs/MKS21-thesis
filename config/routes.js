var User    = require('../db/models/userModel')

module.exports = function(app, passport){


  app.get('/', function(req, res){
    res.render('../client/landing_page/landingpage.ejs', { message: req.flash('signupMessage') });
  });

  app.post('/', passport.authenticate('local-signup', {
    successRedirect: '/teacher',
    failureRedirect: '#',
    failureFlash: true
  }));


  app.get('/signup/:username/:password', function(req, res){
    var newUser = new User();
    newUser.local.username = req.params.username;
    newUser.local.password = req.params.password; 
    console.log("Username & Password", newUser.local.username, newUser.local.password);
    newUser.save(function(err){
      if(err){
        throw err;
      }
    })
    res.send('Success!');
  })

};
