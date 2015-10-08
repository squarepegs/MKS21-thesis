var User     = require('../models/userModel')
var mongoose = require('mongoose');

module.exports = {
  newDeck: function(req, res){
    var lookup = mongoose.Types.ObjectId(req.user.id);
    User.findByIdAndUpdate(
        {"_id" : lookup}, // selector
        {$push: {"decks": {'title':req.body.title, 'notes': req.body.notes, 'questions': []}}}, //query
        {safe: true, upsert: true}, //options
        function(err, data){ //callback
           console.log(err); 
        })
  },
   killDeck: function(req, res){
    var lookup = mongoose.Types.ObjectId(req.user.id);
    User.findOne(
        {"_id" : lookup}, // selector
        function(err, user){ //callback
            var deckArray = user.decks;
            deckArray.splice(req.body.deckNum, 1);
            User.update(
              {"_id" : lookup}, 
              {$set:{'decks': deckArray}}, 
              function(err, deck){
                res.send("success")
              }) 
           }
        )
  },
  getDecks: function(req, res){
    // console.log("req.user.id", req.user.id)
    var lookup = mongoose.Types.ObjectId(req.user.id);
    User.findOne({"_id" : lookup}, function(err, data){
      if (err){
        throw err;
      }
      res.send(data);
    })
  },
  getADeck: function(req, res){
    // console.log("req.user.id", req.user.id)
    var lookup = mongoose.Types.ObjectId(req.user.id);
    User.findOne(
        {"_id" : lookup}, // selector
        function(err, user){ //callback
          var deck = user.decks[req.params.index];
          console.log("deck:", deck);
          res.send(deck);
       })
  }
  // amendProfile: function(req, res){
  //   var query = {
  //     'profile.firstName': req.body.firstName,
  //     'profile.lastName' : req.body.lastName,
  //     'profile.email'    : req.body.email
  //   }
  //   // console.log("req.user.id", req.user.id)
  //   var lookup = mongoose.Types.ObjectId(req.user.id);
  //   User.findOneAndUpdate({"_id" : lookup}, query, function(err, data){
  //     if (err){
  //       throw err;
  //     }
  //     console.log(data);

  //     // console.log("data", data);
  //     res.send("success!");
  //   })
  // }


}

// var query = {'username':req.user.username};
// req.newData.username = req.user.username;
// MyModel.findOneAndUpdate(query, req.newData, {upsert:true}, function(err, doc){
//     if (err) return res.send(500, { error: err });
//     return res.send("succesfully saved");
// });