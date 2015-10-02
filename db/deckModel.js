var db         = require('./knexfile.js');

module.exports = {
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
    // work in progress?
    // not tested yet.
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
  getDeck: function(deckName) {
    // should this go and retrieve every question, I guess?
    // actually, should probably different models to do either functionality.
    // at the moment it will just return name, topic, description.
    return db('decks').where({
        name: deckName
      })
      .select().then(function(deck){
        console.log("this is deck[0]: ");
        console.log(deck[0]);
        return deck[0];
      })
  },
  deleteDeck: function(deck) {
    console.log("this doesn't do anything yet.")
    // return db.select(deck).table('decks').delete() // ???
  }
};
