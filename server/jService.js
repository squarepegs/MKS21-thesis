//--------------------------------
// JSERVICE (Jeopardy API)
//--------------------------------
var globalDeckStorage = {};
var request = require('request');
var DeckController = require('../db/controllers/deckController')
module.exports = {
  getJService: function(deckID, socketCallback) {
    // var auth  = require ('./auth.js');
    //grab question from the Jservice
    if (deckID === 'jService' || deckID === null || deckID === undefined) {
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
      if (!globalDeckStorage[deckID]) {
        globalDeckStorage[deckID] = {
          index: 0,
          questions: []
        }
        console.log("This is getting all the way to jService -- DeckID:", deckID)
        DeckController.getADeck(null, null, deckID, function(deck) {
          console.log("questions loaded:", globalDeckStorage[deckID].questions.length)
          globalDeckStorage[deckID].questions = deck.questions;
          console.log("first question", globalDeckStorage[deckID].questions[0])

          socketCallback(globalDeckStorage[deckID].questions[globalDeckStorage[deckID].index]);
          globalDeckStorage[deckID].index++
        })
      } else if (globalDeckStorage[deckID].index >= globalDeckStorage[deckID].questions.length) {
        socketCallback({
          category: '',
          value: '',
          question: 'There are no more questions in this deck',
          answer: '',
        })
        delete globalDeckStorage[deckID];
      } else {
        
        // Yes, this is a prime candidate for refactoring during refactoring time.

        socketCallback(globalDeckStorage[deckID].questions[globalDeckStorage[deckID].index]);
        globalDeckStorage[deckID].index++;
      }
    }
  }
}