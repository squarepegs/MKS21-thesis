var User = require('../db/models/userModel')

module.exports = function(app){
  app.get('/', function(req, res){
    res.render('../client/landing_page')//may need to be client/teacher/index
  });

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
