var db         = require('../db/knexfile.js');

module.exports = {
  users:    require('../db/userModel.js'),
  decks:    require('../db/deckModel.js')
};
