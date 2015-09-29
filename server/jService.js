var request     = require('request') 
// var auth  = require ('./auth.js');

module.exports = {
	
//--------------------------------
// JSERVICE (Jeopardy API)
//--------------------------------

getQ: function(socketCallback){

	request('http://jservice.io/api/random', function (error, response, body) {
		console.log("getJeopardyQ being called")
	  if (!error && response.statusCode == 200) {
	  	ques = JSON.parse(body)[0] // get just ONE question. We might be able to queue up multiples, reducing the number of API calls

	  	// DEBUG CODE, REMOVE BEFORE PRODUCTION
	  	console.log("Send This To Room", room);
	    console.log("Category:", ques.category.title, "$", ques.value);
	    console.log("Question:", ques.question);
	    // END DEBUG CODE

	    var formattedQues      = {}; // yeah, yeah, I know, but I think this makes cleaner code than using a literal -- bb
	    formattedQues.category = ques.category.title;
	    formattedQues.value    = ques.value;
	    formattedQues.question = ques.question;
	    formattedQues.answer   = ques.answer;
	    console.log("formattedQues", JSON.stringify(formattedQues)); 	// DEBUG CODE, REMOVE BEFORE PRODUCTION
	    
	    socketCallback(formattedQues); // should we include bluebird? 
	  }
	})

}
//--------------------------------
// END JSERVICE
//--------------------------------

};
