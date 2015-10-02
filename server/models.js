// database stuff here

module.exports = function(knex) {
  console.log('module.exports is being read');
  return {
    createTeacher: function(login, email, hashedPassword, firstName, lastName) {
        console.log('we got the data: ', login, email, hashedPassword, firstName, lastName);
        return knex('teachers').insert({
          'login': login,
          'email': email,
          'hashed_password': hashedPassword,
          'first_name': firstName,
          'last_name': lastName
        });
        console.log('it didn\'t error out')
    },
    getTeachers: function() {
        console.log('getting teacher');
        return knex.select().table('teachers');
    }
  };
};