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

          // SEE COMMENTS BELOW
          globalDeckStorage[deckID]
          .questions[globalDeckStorage[deckID].index]
          .questionIndex = globalDeckStorage[deckID].index

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
        
        // Okay, this line probably needs to be refactored.  But here's what is going on: 
        // ====================================
        // globalDeckStorage stores all the decks currently being played. 
        // and the specific deck for a specific game is stored at a key that corresponds to the deck ID
        // That deck is an object with a key called questions, which is an array. 
        // We want to get the specific question that corresponds to the current index
        // That index is also stored as a property on the deck. 
        // We then need to assign that index as a property on the question because
        // eventually we plan to track the user's buzz-in speed, and need to know which question
        // tracks to which speed. We'll assign that variable to .questionIndex when
        // we send it to the socket.  
        // The result is that in order to simply add the question number to the object we send
        // we need the rather lengthy:

        globalDeckStorage[deckID]
          .questions[globalDeckStorage[deckID].index]
          .questionIndex = globalDeckStorage[deckID].index

        // Yes, this is a prime candidate for refactoring during refactoring time.

        socketCallback(globalDeckStorage[deckID].questions[globalDeckStorage[deckID].index]);
        globalDeckStorage[deckID].index++;
      }
    }
  }
}