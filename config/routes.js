module.exports = function(app, passport){
  app.get('/', function(req, res){
    res.render('index.html')//may need to be client/teacher/index
  });

};
