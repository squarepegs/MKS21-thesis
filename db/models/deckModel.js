var mongoose = require('mongoose');

var deckSchema = mongoose.Schema({
  _owner   : {type: String},
  title    : {type: String},
  notes    : {type: String},
  questions: {
    type: Array
  }

});

module.exports = mongoose.model('deck', deckSchema);
