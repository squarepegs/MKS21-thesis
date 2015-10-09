var User     = require('../models/userModel')
var mongoose = require('mongoose');

module.exports = {
  getProfile: function(req, res){
    // console.log("req.user.id", req.user.id)
    var lookup = mongoose.Types.ObjectId(req.user.id);
    User.findOne({"_id" : lookup}, function(err, data){
      if (err){
        throw err;
      }
      // console.log("data", data);
      res.send(data);
    })
  },
  amendProfile: function(req, res){
    var query = {
      'profile.firstName': req.body.firstName,
      'profile.lastName' : req.body.lastName,
      'profile.email'    : req.body.email
    }
    // console.log("req.user.id", req.user.id)
    var lookup = mongoose.Types.ObjectId(req.user.id);
    User.findOneAndUpdate({"_id" : lookup}, query, function(err, data){
      if (err){
        throw err;
      }
      console.log(data);

      // console.log("data", data);
      res.send("success!");
    })
  }


}

// var query = {'username':req.user.username};
// req.newData.username = req.user.username;
// MyModel.findOneAndUpdate(query, req.newData, {upsert:true}, function(err, doc){
//     if (err) return res.send(500, { error: err });
//     return res.send("succesfully saved");
// });