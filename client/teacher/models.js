url = 'http://localhost:8000/data';

var addUser = function(login, email, hashedPassword, firstName, lastName){
  console.log(login, email, hashedPassword, firstName, lastName)
//should the password be hashed here, or server side? I believe
//server side, so I have changed 'hashedPassword' to 'password'
//we do need to be using https for transmitting this password, though.
  socket.emit('add-user', {
      login: login, 
      email: email, 
      password: password,
      firstName: firstName, 
      lastName: lastName,
      type: 'teacher'
  });
  
  console.log('adding teacher');
};

var login = function(username, password){
  socket.emit('login', {
    username: username,
    password: password
  });
};

socket.on('db-response', function(packet){
  console.log('db responded with: ');
  console.log(packet);
});

var createDeck = function(name,topic,description,user){
  socket.emit('create-deck', {
    name: name,
    topic: topic,
    description: description,
    user: user
  })
}


// app.post('/data',
//   function(req, res){
//     models.createTeacher(req.body.login, req.body.email, req.body.hashedPassword, req.body.firstName, req.body.lastName);
//   }
// );
