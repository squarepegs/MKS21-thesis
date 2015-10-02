var pg           = require('pg');
var databasehost = process.env.HOST || '0.0.0.0';
var databaseport = 5432
var db         = require('knex')({
 client: 'pg',
 connection: {
   host: databasehost,
   port: databaseport,
   user: 'postgres',
   password: 'postgres',
   database: 'jeopardy',
 }
});

module.exports = db;