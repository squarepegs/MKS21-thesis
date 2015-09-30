var db         = require('./knexfile.js');

module.exports = {
  createTeacher: function(login, email, hashedPassword, firstName, lastName) {
    console.log(arguments)
    return db('teachers').insert({
        'login': login,
        'email': email,
        'hashed_password': hashedPassword,
        'first_name': firstName,
        'last_name': lastName
      });
  },
  getTeachers: function() {
      console.log('getting teacher');
      return db.select().table('teachers');
  }
};
