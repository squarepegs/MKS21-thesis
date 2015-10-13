var User     = require('../models/userModel')
var Deck     = require('../models/deckModel')
var Test     = require('../models/testModel')
var mongoose = require('mongoose');
var _        = require('underscore');

module.exports = {
  startTest: function(req, res) {
    var lookup = mongoose.Types.ObjectId(req.user.id);
    var newTest = new Test();
    newTest._owner = req.user.id;
    newTest._deck = req.body._deck;
    newTest.time = req.body.time;
    newTest.questions = [];
    
    newTest.save(function(err, data) {
      if (err) {
        throw err;
      }
      console.log(data);
    }).then(function(newTest) {
      User.findByIdAndUpdate(
        { "_id": lookup }, // selector
        { $push: { "tests": newTest._id } }, //query
        {
          safe: true,
          upsert: true
        }, //options
        function(err, data) { //callback
          console.log(err);
        });
    });
  },

}

