url = 'http://localhost:8000/data';

var makeTeacher = function(login, email, hashedPassword, firstName, lastName){
  console.log(login, email, hashedPassword, firstName, lastName)

  socket.emit('makeTeacher', {
      login: login, 
      email: email, 
      hashedPassword: hashedPassword,
      firstName: firstName, 
      lastName: lastName
  });
  
  console.log('posting');
}


// app.post('/data',
//   function(req, res){
//     models.createTeacher(req.body.login, req.body.email, req.body.hashedPassword, req.body.firstName, req.body.lastName);
//   }
// );
