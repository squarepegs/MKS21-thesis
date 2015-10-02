var pg           = require('pg');
var databasehost = process.env.HOST || '0.0.0.0';
var databaseport = 5432;
var db           = require('knex')({
 client: 'pg',
 connection: {
   host: databasehost,
   port: databaseport,
   user: 'postgres',
   password: 'postgres',
   database: 'chicken',
 },
 pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
});

module.exports = db;