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
      type: 'student'
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
