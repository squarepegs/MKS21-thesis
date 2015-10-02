var db         = require('./knexfile.js');

module.exports = {
  //should be a single user table
  addUser: function(login, email, hashedPassword, firstName, lastName, type) {
    console.log(arguments)
    return db('users').insert({
      'login': login,
      'email': email,
      'hashed_password': hashedPassword,
      'first_name': firstName,
      'last_name': lastName,
      'user_type': type
    }).then(function(x){
      console.log("result of adding a user: " + x)
    });
  },
  login: function(username,password) {
    console.log('getting user: ' + username);
    //hash password here?
    return db('users').where({
        login: username,
        hashed_password: password
    })
    .select()
    .then(function(x){
      console.log("result of login attempt is: ");
      console.log(x);
    })
  }
};

// knex('users').where({login: 'login'}).select('id')