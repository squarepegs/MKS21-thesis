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
//   getADeck: function(req, res){
//     // console.log("req.user.id", req.user.id)
//     var lookup = mongoose.Types.ObjectId(req.user.id);
//     User.findOne(
//         {"_id" : lookup}, // selector
//         function(err, user){ //callback
//           var deck = user.decks[req.params.index];
//           console.log("deck:", deck);
//           res.send(deck);
//        })
//   },

//   ///// WRITE THIS OUT NEXT!!!!! -- BB THURSDAY OCT 8TH
//   amendADeck: function(req, res){
//     // console.log("req.user.id", req.user.id)
//     var lookup = mongoose.Types.ObjectId(req.user.id);
//     User.findByIdAndUpdate(
//         {"_id" : lookup}, // selector
//         {$push: {decks[req.params.index]: {'title':req.body.title, 'notes': req.body.notes, 'questions': []}}}, //query
//         {safe: true, upsert: true}, //options
//         function(err, data){ //callback
//            console.log(err); 
//         })
//   }

//   var query = {'username':req.user.username};
// req.newData.username = req.user.username;
// MyModel.findOneAndUpdate(query, req.newData, {upsert:true}, function(err, doc){
//     if (err) return res.send(500, { error: err });
//     return res.send("succesfully saved");
// });


}

