var User     = require('../models/userModel')
var Deck     = require('../models/deckModel')
var Test     = require('../models/testModel')
var mongoose = require('mongoose');
var _        = require('underscore');

module.exports = {
  recordTest: function(req, res) {
    console.log("This is req.body in controller", req.body);
    testDataObj = JSON.parse(req.body.testData);
    console.log("this is parsed", testDataObj)

    var lookup = mongoose.Types.ObjectId(req.user.id);
    var newTest = new Test();
    newTest._owner = req.user.id;
    newTest._deck = req.body._deck;
    newTest.time = new Date();
    newTest.testData = testDataObj;
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
  }

}

