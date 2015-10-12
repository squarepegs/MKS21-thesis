//--------------------------------
// JSERVICE (Jeopardy API)
//--------------------------------
var request = require('request');
var $ = require('jquery')
// var auth  = require ('./auth.js');
var globalDeckStorage = {}; 

module.exports = {

  getJService: function(deckID, socketCallback) {
    
    //grab question from the Jservice
    if (deckID === jService){
    request('http://jservice.io/api/random', function(error, response, body) {
      
      console.log("getJeopardyQ being called");
      
      if (!error && response.statusCode == 200) {
        ques = JSON.parse(body)[0]; // get just ONE question. We might be able to queue up multiples, reducing the number of API calls

        // DEBUG CODE, REMOVE BEFORE PRODUCTION
        console.log("Category:", ques.category.title, "$", ques.value);
        console.log("Question:", ques.question);
        // END DEBUG CODE

        var formattedQues = {}; // yeah, yeah, I know, but I think this makes cleaner code than using a literal -- bb
        formattedQues.category = ques.category.title;
        formattedQues.value = ques.value;
        formattedQues.question = ques.question;
        formattedQues.answer = ques.answer;
        console.log("formattedQues", JSON.stringify(formattedQues)); // DEBUG CODE, REMOVE BEFORE PRODUCTION

        socketCallback(formattedQues); // should we include bluebird?
        }
      }); 
    } else {
      // initialize deck if not already intialized
      if(!globalDeckStorage[deckID]){
        globalDeckStorage[deckID] = {
          index: 0,
          questions: []
        }

        $.get('/api/decks/' + deckID, function(req, res){
          globalDeckStorage[deckID].questions = req.questions;
          console.log("first question", globalDeckStorage[deckID].questions[0])
          socketCallback(globalDeckStorage[deckID].questions.index);
          globalDeckStorage[deckID].index++
        })
      } else {
        if(globalDeckStorage[deckID].index >= globalDeckStorage[deckID].questions.length){
          socketCallback({category: '', value: '', question:'There are no more questions in this deck', answer: ''})
          delete globalDeckStorage[deckID]; 
        } else {
          socketCallback(globalDackStorage[deckID].questions.index);
          globalDeckStorage[deckID].index++;
        }
      }




    }




  }
};