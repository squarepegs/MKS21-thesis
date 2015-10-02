var db         = require('./knexfile.js');

module.exports = {
  //type should be 'student' or 'teacher'
  //currently the schema allows duplicates; this will be fixed in the future.
  addUser: function(login, email, hashedPassword, firstName, lastName, type) {
    console.log(arguments)
    return db('users').insert({
      'login': login,
      'email': email,
      'hashed_password': hashedPassword,
      'first_name': firstName,
      'last_name': lastName,
      'user_type': type
    }).then(function(output){
      // console.log("result of adding a user: ");
      // console.log(x);
      return output
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
      console.log(x[0]);
      return x[0];
    })
  }
};

// knex('users').where({login: 'login'}).select('id')