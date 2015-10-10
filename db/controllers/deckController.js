var User     = require('../models/userModel')
var Deck     = require('../models/deckModel')
var mongoose = require('mongoose');
var _        = require('underscore');

module.exports = {
  newDeck: function(req, res) {
    console.log("new deck req.body", req.body);
    var lookup = mongoose.Types.ObjectId(req.user.id);
    var newDeck = new Deck();
    newDeck._owner = lookup;
    newDeck.title = req.body.title;
    newDeck.notes = req.body.notes;
    newDeck.questions = [];
    console.log("what is newDeck?", newDeck)
    newDeck.save(function(err, data) {
      if (err) {
        throw err;
      }
      console.log(data);
    }).then(function(newDeck) {
      User.findByIdAndUpdate(
        { "_id": lookup }, // selector
        { $push: { "decks": newDeck._id } }, //query
        {
          safe: true,
          upsert: true
        }, //options
        function(err, data) { //callback
          console.log(err);
        });
    });
  },
   killDeck: function(req, res){
    var lookup = mongoose.Types.ObjectId(req.user.id);
    User.findOne(
        {"_id" : lookup}, // selector
        function(err, user){ //callback
            var deckArray = user.decks;
            console.log("deckArray before:", deckArray)
            console.log("req.body", req.body)
            var deckArray = _.reject(deckArray, function(deckID){ return deckID == req.body.deckID; }); //type coersion (==) needed here.
            console.log("deckArray after:", deckArray)

            user.decks = deckArray;
            user.save(function(err){
              if(err){
                throw err;
              }
            })

           }
        )
    // TODO: I can remove the deck from the user's decks array but I'm having difficulty
    // removing it completely from the db: The following line does not work 
    // Deck.findbyIdAndRemove(req.body.deckID, function(){})
  },
  getDecks: function(req, res){
    // console.log("req.user.id", req.user.id)
    var lookup = mongoose.Types.ObjectId(req.user.id);
    User.findOne({"_id" : lookup}, function(err, user){
      if (err){
        throw err;
      }
      Deck.find()
        .where('_id').in(user.decks)
        .select()
        .exec()
        .then(function(decks){
          res.send(decks)
        })
    })
  },
  getADeck: function(req, res){
    // console.log("req.user.id", req.user.id)
    var lookup = mongoose.Types.ObjectId(req.params.id);
    console.log(req.params.id)
    Deck.findOne(
        {"_id" : lookup}, // selector
        function(err, deck){ //callback
          var sendDeck = {
            '_id': deck._id,
            'notes': deck.notes,
            'title': deck.title,
            'questions': deck.questions
          }
          console.log("server-side sendDeck", sendDeck)
         res.send(sendDeck)
       })
  },
  amendADeck: function(req, res){
    console.log("req.body amendadeck", req.body)
    var newInfo = {
      'title': req.body.title,
      'notes' : req.body.notes,
      'questions' : JSON.parse(req.body.questions)
    }
    // console.log("req.user.id", req.user.id)
    var lookup = mongoose.Types.ObjectId(req.params.id);
    Deck.findOneAndUpdate({"_id" : lookup}, newInfo, function(err, data){
      if (err){
        throw err;
      }
      console.log(data);

      // console.log("data", data);
      res.send("success!");
    })
  }




}

