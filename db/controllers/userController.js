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
  }


}