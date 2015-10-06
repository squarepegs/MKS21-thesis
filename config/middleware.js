// var morgan      = require('morgan'), // used for logging incoming request
//     bodyParser  = require('body-parser'),
//     helpers     = require('./helpers.js'); // our custom middleware
//     userController = require('../db/users/userController.js');


// module.exports = function (app, express) {
//   console.log("I get to middleware.js")
//   // Express 4 allows us to use multiple routers with their own configurations
//   var userRouter = express.Router();

//   app.use(morgan('dev'));
//   app.use(bodyParser.urlencoded({extended: true}));
//   app.use(bodyParser.json());

//   app.use('/api/users', userRouter); // use user router for all user request
//   // authentication middleware used to decode token and made available on the request
//   app.use(helpers.errorLogger);
//   app.use(helpers.errorHandler);

//   // inject our routers into their respective route files
//   require('../db/users/userRoutes.js')(userRouter);
// };