var db         = require('./knexfile.js');

module.exports = {
  //should be a single user table
  addDeck: function(name,topic,description,user) {
    var newDeck;
    console.log(arguments)
    return db('decks').insert({
      'name': name,
      'topic': topic,
      'description': description
    })
    .then(function(inserted_deck){
      return db('users').where({
        login: user
      })
      .select('id')
    })
    .then(function(deckOwner){
      console.log('deckOwner is: (newline)')
      console.log(deckOwner)
      return db('teacher_decks').insert({ //change to user decks
        user_id: deckOwner.id,
        deck_id: newDeck
      })
      .then(function(result){console.log(result)})
    });
  },
  addCard: function(deckName, question, type, question, points, metadata) {
    return db('decks').where({
        name: deckName
      })
      .select('id')
      .then(function(deckId){
        return db('questions').insert({
          deck_id: deckId,
          type: type,
          question: question,
          points: points,
          metadata_json: metadata
        })
      })
      .then(function(result){
        console.log(result);
      })
    // return db.select().table('question');
  },
  getDeck: function(deck) {
    // should this go and retrieve every question, I guess?
    return db('decks').where({
        name: deckName
      })
      .select('id')
  },
  deleteDeck: function(deck) {
    // return db.select(deck).table('decks').delete() // ???
  }
};
