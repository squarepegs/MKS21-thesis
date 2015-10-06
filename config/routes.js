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
    failureRedirect: '/student',
    failureFlash: true
  }));  



  app.get('/signup/:username/:password', function(req, res){
    console.log('doesthiswork?');
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
