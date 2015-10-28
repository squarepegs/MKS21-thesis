// dashboard.js
'use strict';
// This requires Browserify
// var React = require( 'react' );

// -----------------------
// USE OF `sessionStorage`
// -----------------------
// We stored the decks in session storage back on the dashboard page. 
// This allows the teacher to retain access to the deck ID numbers.
// There is probably a better way to do this. 
// If no deckID is defined in sessionStorage, it defaults
// to using the 'jService' to grab jeopardy questions from 
// jService.io
// -----------------------
sessionStorage.deckID = 'jService'; // Jeopardy Service is Default
window.jeopardy = { };

// -----------------------
// REACT COMPONENTS: 
// -----------------------
// *Initial Render: <div id="main">
//  └┬─ViewArea (renders <div id="view">)
//   ├──Profile (on click in Tabs)
//   └┬─MyDecks (on click in Tabs)
//    ├──CreateDecks
//    └┬─SingleDeck
//     └┬─DeckEditor (on click in SingleDeck)
//      └┬─ShowQuestion
//       └──EditQuestion (on click in ShowQuestion)
//
// *Initial Render: <div id="navbar">
//  └──Tabs
//
// *Initial Render: <div id="nav-mobile">
//  └──Tabs
// -----------------------

// Navigation
var Tabs = React.createClass( {
  displayName: 'Tabs',
  decks: function decks() {
    React.render(
      <MyDecks />, document.getElementById( 'view' )
    )
  },
  classData: function classData() {
    // Just a simple redirect for right now. 
    window.location.assign( '/charts' );
  },
  myProfile: function myProfile() {
    React.render(
      <Profile />, document.getElementById( 'view' )
    )
  },
  logout: function logout() {
    $.get( '/api/logout', function ( req, res ) {
      window.location.assign( "/" );
    } );
  },
  render: function render() {
    return (
    <ul className={ this.props.nav === 'nav-mobile' ? 'side-nav' : 'right hide-on-med-and-down' }>
      <li>
        <a
           href="/teacher"
           target="_blank">Launch Game</a>
      </li>
      <li>
        <a
           href="#"
           onClick={ this.decks }>My Decks</a>
      </li>
      <li>
        <a
           href="#"
           onClick={ this.myProfile }>My Profile</a>
      </li>
      <li>
        <a
           href="/charts"
           onClick={ this.classData }>Data Charts</a>
      </li>
      <li>
        <a
           href="#"
           onClick={ this.logout }>Logout</a>
      </li>
    </ul>
    )
  }
} );

// Main View Area
var ViewArea = React.createClass( {
  displayName: 'ViewArea',
  render: function render() {
    return (
    <div id='view'></div>
    );
  }
} );

// Profile Area
var Profile = React.createClass( {
  displayName: 'Profile',
  getInitialState: function getInitialState() {
    return {
      username: 'loading',
      firstName: 'loading',
      lastName: 'loading',
      email: 'loading'
    };
  },
  componentDidMount: function componentDidMount() {
    // Here we see Brian's use of "var context = this" vs. Juan's .bind(this) method. 
    var context = this;
    $.get( '/api/profile', function ( req, res ) {
      if ( req.local ) {
        context.setState( { 'username': req.local.username } );
      }
      if ( req.facebook ) {
        context.setState( { 'username': req.facebook.name } );
      }
      context.setState( { 'firstName': req.profile.firstName } );
      context.setState( { 'lastName': req.profile.lastName } );
      context.setState( { 'email': req.profile.email } );
    } );
  },
  prepFirstName: function prepFirstName( event ) {
    this.setState( { 'firstName': event.target.value } );
  },
  prepLastName: function prepLastName( event ) {
    this.setState( { 'lastName': event.target.value } );
  },
  prepEmail: function prepEmail( event ) {
    this.setState( { 'email': event.target.value } );
  },
  updateProfile: function updateProfile() {
    var query = this.state;
    $.post( '/api/profile', query, function ( req, res ) {
      Materialize.toast( 'Profile Saved!', 4000 );
    } );
  },
  render: function render() {
    return (
    <div>
      <form>
        <fieldset>
          <ul>
            <li>
              Username:
              { this.state.username }
            </li>
            <li>
              First Name:
              <input
                     type="text"
                     value={ this.state.firstName }
                     onChange={ this.prepFirstName }
                     name="firstName" />
            </li>
            <li>
              Last Name:
              <input
                     type="text"
                     value={ this.state.lastName }
                     onChange={ this.prepLastName }
                     name="lastName" />
            </li>
            <li>
              E&ndash;mail:
              <input
                     type="text"
                     value={ this.state.email }
                     onChange={ this.prepEmail }
                     name="email" />
            </li>
            <li>
              <button
                      className="btn waves-effect waves-light"
                      onClick={ this.updateProfile }>
                Update Profile
              </button>
            </li>
          </ul>
        </fieldset>
      </form>
    </div>
    )
  }
} );

// List of All Decks
var MyDecks = React.createClass( {
  displayName: 'MyDecks',
  getInitialState: function getInitialState() {
    return {
      decks: [],
      deckElements: []
    };
  },
  killDeck: function killDeck( event ) {
    var context = this;
    var mutatedDecks = [ ];
    for (var i = 0; i < this.state.decks.length; i++) {
      if ( this.state.decks[ i ]._id !== event.target.value ) {
        mutatedDecks.push( this.state.decks[ i ] );
      }
    }
    // ANTIPATTERN!
    this.state.decks = mutatedDecks;
    // You're supposed to use:
    // this.setState({decks: mutatedDecks})
    // but for some reason the page will not rerender unless the
    // state is muated directly. In short, setState merely prepares
    // the state for a change, it doesn't actually change it.
    // Refactoring this so that it works would probably take as long
    // as switching to another framework.
    // We decided on React for a number of reasons, but we're not sure
    // that the two-way data binding of Angular wouldn't have been
    // extremely useful here.  C'est la vie.
    this.buildElements();
    $.post( '/api/killdeck', { 'deckID': event.target.value }, function ( req, res ) {} );
  },
  editDeck: function editDeck( event, deckID ) {
    if ( event ) {
      deckID = event.target.value;
      // .unmountComponentAtNode will no longer work in React 0.15 - in 0.14 (which we are using)
      // it works with a warning.  For that reason, our react version needs to be frozen at 0.14.
      React.unmountComponentAtNode( document.getElementById( 'deckEditor' ) );
    }
    React.render(
      <div>
        <DeckEditor deckID={ deckID } />
      </div>, document.getElementById( 'deckEditor' )
    )
  },
  playDeck: function playDeck( event ) {
    sessionStorage.deckID = event.target.value;
    window.location.replace( '/teacher' );
  },
  shareDeck: function shareDeck( event ) {
    var recipient = prompt( 'Who would you like to share this deck with?' );
    if ( recipient != null ) {
      $.post( '/api/shareDeck', {
        'recipient': recipient,
        'deckID': event.target.value
      }, function ( success ) {} );
    } else {
      alert( "Username can't be blank. Please try again." );
    }
  },
  buildElements: function buildElements() {
    var decksArr = [ ];
    for (var i = 0; i < this.state.decks.length; i++) {
      var decksObj = { };
      decksObj.deckID = this.state.decks[ i ]._id;
      decksObj.title = this.state.decks[ i ].title;
      decksArr.push( decksObj );
    }
    sessionStorage.decks = JSON.stringify( decksArr );
    var context = this;
    var elements = [ ];
    for (var i = 0; i < this.state.decks.length; i++) {
      elements.push( React.createElement( SingleDeck, {
        deck: this.state.decks[ i ],
        kill: this.killDeck,
        play: this.playDeck,
        edit: this.editDeck,
        share: this.shareDeck
      } ) );
    }
    context.setState( { deckElements: elements } );
    this.render();
  },
  getDecks: function getDecks() {
    var context = this;
    $.get( '/api/decks', function ( req, res ) {
      context.setState( { decks: req } );
      context.buildElements();
    } );
  },
  componentDidMount: function componentDidMount() {
    this.getDecks();
    if ( this.props.deckToEdit ) {
      this.editDeck( null, this.props.deckToEdit );
    }
  },
  render: function render() {
    return (
    <div>
      <h3>Decks</h3>
      <table className="responsive-table">
        <tr>
          <th>
            &nbsp;
          </th>
          <th>
            &nbsp;
          </th>
          <th>
            Title
          </th>
          <th>
            Notes
          </th>
          <th>
            #Qs
          </th>
          <th>
            &nbsp;
          </th>
          <th>
            &nbsp;
          </th>
        </tr>
        { this.state.deckElements }
      </table>
      <div id="deckEditor"></div>
      <div className="card green lighten-5">
        <CreateDecks />
      </div>
    </div>
    )
  }
} );

// Create a new deck (just initializes it, doesn't add questions, yet). 
var CreateDecks = React.createClass( {
  displayName: 'CreateDecks',
  getInitialState: function getInitialState() {
    return { title: '', notes: '' };
  },
  createDeck: function createDeck() {
    var context = this;
    var query = context.state;
    $.post( '/api/decks', query, function ( req, res ) {
      newDeckID = req;
      // Materialize.toast is a non-obtrusive way to quickly show information to the user. 
      Materialize.toast( 'Deck has been added!', 4000 );
      React.unmountComponentAtNode( document.getElementById( 'view' ) );
      React.render(
        <MyDecks deckToEdit={ newDeckID } />,
        document.getElementById( 'view' )
      )
    } );
    context.setState( { 'title': '' } );
    context.setState( { 'notes': '' } );
  },
  prepTitle: function prepTitle( event ) {
    this.setState( { 'title': event.target.value } );
  },
  prepNotes: function prepNotes( event ) {
    this.setState( { 'notes': event.target.value } );
  },
  render: function render() {
    return (
    <div className="card-content">
      <div className="card-title grey-text darken-2">
        Create a new deck
      </div>
      <div className="row">
        <div className="col s4">
          <label>
            Deck Name:
          </label>
          <input
                 type="text"
                 value={ this.state.title }
                 onChange={ this.prepTitle }
                 name="deckName" />
        </div>
        <div className="col s6">
          <label>
            Notes:
          </label>
          <input
                 type="text"
                 value={ this.state.notes }
                 onChange={ this.prepNotes }
                 name="deckNotes" />
        </div>
        <div className="col s2">
          <button
                  className="btn waves-effect waves-light"
                  onClick={ this.createDeck }>
            Create
          </button>
        </div>
      </div>
    </div>
    )
  }
} );

// The information of a single deck. MyDecks is filled with multiple instances
// of SingleDeck. 
var SingleDeck = React.createClass( {
  displayName: 'SingleDeck',
  render: function render() {
    console.log( "369: this.props.deck._id", this.props.deck._id );
    return (
    <tr
        id={ 'thisRowID:' + this.props.deck._id }
        key={ this.props.deck._id }>
      <td>
        <button
                className="btn waves-effect waves-light"
                value={ this.props.deck._id }
                onClick={ this.props.edit }>
          Edit
        </button>
      </td>
      <td>
        <button
                className="btn waves-effect waves-light"
                value={ this.props.deck._id }
                onClick={ this.props.kill }>
          Delete
        </button>
      </td>
      <td>
        { this.props.deck.title }
      </td>
      <td>
        { this.props.deck.notes }
      </td>
      <td>
        { this.props.deck.questions.length }
      </td>
      <td>
        <button
                className="btn waves-effect waves-light"
                value={ this.props.deck._id }
                onClick={ this.props.play }>
          Play
        </button>
      </td>
      <td>
        <button
                className="btn waves-effect waves-light"
                value={ this.props.deck._id }
                id={ 'share'+this.props.deck._id }
                onClick={ this.props.share }>
          Share
        </button>
      </td>
    </tr>
    )
  }
} );

//============================================================================================================
//  Globals for DeckEditor
//------------------------------------------------------------------------------------------------------------
//  These global variables are used in order to pass items from one
//  React component to another, even if they do not have a parent-child relationship.
//  (otherwise we'd use props)
//  globalActiveDeckEditorComponent (React Component) allows "AddQuestion" and "EditQuestion" to have access to DeckEditor's state.
//  globalActiveDeckQuestions (Array[{},{},...]) is a workaround for a peculiar React bug, where putting
//  an array of objects inside a state results in losing the values - but not the keys - of the objects in the array.
//============================================================================================================
var globalActiveDeckEditorComponent = null;
var globalActiveDeckQuestions = [ ];
var globalDecksLister = null;

var DeckEditor = React.createClass( {
  displayName: 'DeckEditor',
  getInitialState: function getInitialState() {
    return {
      'title': '',
      'notes': '',
      'questions': [],
      'nextCat': '',
      'nextVal': '',
      'nextQues': '',
      'nextAns': '',
      'headers': '',
      'quesElements': []
    };
  },
  getInitialQs: function getInitialQs() {
    var context = this;
    $.get( '/api/decks/' + context.props.deckID, function ( req, res ) {
      context.setState( { 'title': req.title } );
      context.setState( { 'notes': req.notes } );
      globalActiveDeckQuestions = req.questions;
      context.showQs();
    } );
  },
  saveChanges: function saveChanges() {
    var context = this;
    var newInfo = {
      'title': context.state.title,
      'notes': context.state.notes,
      'questions': JSON.stringify( globalActiveDeckQuestions )
    };
    $.post( '/api/decks/' + this.props.deckID, newInfo, function ( req, res ) {
      context.render();
      Materialize.toast( 'Changes have been saved!', 4000 ); // 4000 is the duration of the toast
    } );
  },
  showQs: function showQs() {
    var quesElements = [ ];
    for (var i = 0; i < globalActiveDeckQuestions.length; i++) {
      quesElements.push(
        <ShowQuestion
                      save={ this.saveChanges }
                      index={ i }
                      key={ '' + this.props.deckID + '|index:' + i }
                      value={ globalActiveDeckQuestions[i].value }
                      question={ globalActiveDeckQuestions[i].question }
                      category={ globalActiveDeckQuestions[i].category }
                      answer={ globalActiveDeckQuestions[i].answer } />
      );
    }
    var headers = (
    <div key='headers'>
      <div className="row">
        <div className="col s1">
          Delete
        </div>
        <div className="col s1">
          Edit
        </div>
        <div className="col s2">
          Category
        </div>
        <div className="col s1">
          Value
        </div>
        <div className="col s5">
          Question
        </div>
        <div className="col s2">
          Answer
        </div>
      </div>
      <div name="addQ"></div>
    </div>
    );
    this.setState( { 'headers': headers } );
    this.setState( { 'quesElements': quesElements } );
  },
  prepNextQues: function prepNextQues() {
    this.setState( { 'nextQues': event.target.value } );
  },
  prepNextAns: function prepNextAns() {
    this.setState( { 'nextAns': event.target.value } );
  },
  prepNextCat: function prepNextCat() {
    this.setState( { 'nextCat': event.target.value } );
  },
  prepNextVal: function prepNextVal() {
    this.setState( { 'nextVal': event.target.value } );
  },
  changeTitle: function changeTitle() {
    this.setState( { 'title': event.target.value } );
  },
  changeNotes: function changeNotes() {
    this.setState( { 'notes': event.target.value } );
  },
  componentWillMount: function componentWillMount() {
    this.getInitialQs();
  },
  componentDidMount: function componentDidMount() {
    globalActiveDeckEditorComponent = this;
  },
  render: function render() {
    return (
    <div>
      <h3>DeckEditor { this.state.title }</h3>
      <div className="row">
        <div className="col s4">
          <label>
            Title
          </label>
          <input
                 type="text"
                 className="title"
                 value={ this.state.title }
                 onChange={ this.changeTitle } />
        </div>
        <div className="col s6">
          <label>
            Notes
          </label>
          <input
                 type="text"
                 className="notes"
                 value={ this.state.notes }
                 onChange={ this.changeNotes } />
        </div>
        <div className="col s2">
          <button
                  className="btn waves-effect waves-light"
                  id="saveButton"
                  onClick={ this.saveChanges }>
            Save Title and Notes
          </button>
        </div>
      </div>
      <hr/>
      { this.state.headers }
      { this.state.quesElements }
      <div id="newQEditor"></div>
      <hr/>
      <div id="editAddStatus"></div>
      <EditQuestion
                    save={ this.saveChanges }
                    deckID={ this.props.deckID } />
    </div>
    )
  }
} );

// ShowQuestion lists a single question when editing a deck. 
var ShowQuestion = React.createClass( {
  displayName: 'ShowQuestion',
  edit: function edit() {
    isEdit = true;
    React.render(
      <EditQuestion
                    save={ this.props.save }
                    edit={ isEdit }
                    index={ this.props.index }
                    deckID={ this.props.deckID }
                    category={ this.props.category }
                    value={ this.props.value }
                    question={ this.props.question }
                    answer={ this.props.answer } />,
      document.getElementById( 'editThisQ' + this.props.index )
    )
  },
  'delete': function _delete() {
    globalActiveDeckQuestions.splice( this.props.index, 1 );
    globalActiveDeckEditorComponent.showQs();
  },
  render: function render() {
    return (
    <div>
      <div className="row">
        <div className="col s1">
          <button
                  className="btn waves-effect waves-light"
                  onClick={ this.delete }>
            Delete
          </button>
        </div>
        <div className="col s1">
          <button
                  className="btn waves-effect waves-light"
                  onClick={ this.edit }>
            Edit
          </button>
        </div>
        <div className="col s2 category">
          { this.props.category }
        </div>
        <div className="col s1 value">
          { this.props.value }
        </div>
        <div className="col s5 question">
          { this.props.question }
        </div>
        <div className="col s2 answer">
          { this.props.answer }
        </div>
      </div>
      <div id={ 'editThisQ'+this.props.index }></div>
    </div>
    )
  }
} );

// When it's time to edit the question, the "Show Question" instance spawns
// this Edit Question area under it for the specific "ShowQuestion"
var EditQuestion = React.createClass( {
  displayName: 'EditQuestion',
  getInitialState: function getInitialState() {
    var newCat = this.props.category || '';
    var newVal = this.props.value || '';
    var newQues = this.props.question || '';
    var newAns = this.props.answer || '';
    return {
      'newCat': newCat,
      'newVal': newVal,
      'newQues': newQues,
      'newAns': newAns
    };
  },
  prepNextCat: function prepNextCat( event ) {
    this.setState( { 'newCat': event.target.value } );
  },
  prepNextVal: function prepNextVal( event ) {
    this.setState( { 'newVal': event.target.value } );
  },
  prepNextQues: function prepNextQues( event ) {
    this.setState( { 'newQues': event.target.value } );
  },
  prepNextAns: function prepNextAns( event ) {
    this.setState( { 'newAns': event.target.value } );
  },
  addQtoDeck: function addQtoDeck() {
    var context = this;
    // amendedQ can also be a newly created question.
    var amendedQ = {
      'category': this.state.newCat,
      'value': this.state.newVal,
      'question': this.state.newQues,
      'answer': this.state.newAns
    };
    // this.props.edit is a boolean which tells you if this is an amendment (true)
    // or a brand new question (false); 
    if ( this.props.edit ) {
      globalActiveDeckQuestions[ this.props.index ] = amendedQ;
    } else {
      globalActiveDeckQuestions.push( amendedQ );
      this.setState( {
        'newCat': '',
        'newVal': '',
        'newQues': '',
        'newAns': ''
      } );
    }
    globalActiveDeckEditorComponent.showQs();
    this.props.save();
    if ( this.props.edit ) {
      React.render(
        <div id={ 'editThisQ'+this.props.index }>
          <div id={ "saved"+this.props.index }>
            Question edited.
          </div>
        </div>,
        document.getElementById( 'editThisQ' + this.props.index )
      )
    } else {
      React.render(
        <div id={ 'addThisQ'+this.props.index }>
          <div id={ "saved"+this.props.index }>
            Question added.
          </div>
        </div>,
        document.getElementById( 'editAddStatus' )
      )
      setTimeout( function () {
        $( '#saved' + context.props.index ).fadeOut();
      },
        3000 );
    }
  },
  render: function render() {
    return (
    <div
         ref={ this.props.edit ? 'editFields' : 'addFields' }
         className="addQues row">
      <div className="col s1">
        <label>
          Category
        </label>
        <input
               type="text"
               className="category"
               value={ this.state.newCat }
               onChange={ this.prepNextCat } />
      </div>
      <div className="col s1">
        <label>
          Value
        </label>
        <input
               type="text"
               className="value"
               value={ this.state.newVal }
               onChange={ this.prepNextVal } />
      </div>
      <div className="col s6">
        <label>
          Question
        </label>
        <input
               type="text"
               className="question"
               value={ this.state.newQues }
               onChange={ this.prepNextQues } />
      </div>
      <div className="col s2">
        <label>
          Answer
        </label>
        <input
               type="text"
               className="answer"
               value={ this.state.newAns }
               onChange={ this.prepNextAns } />
      </div>
      <div className="col s2">
        <button
                className="btn waves-effect waves-light"
                onClick={ this.addQtoDeck }>
          { this.props.edit ? 'Save' : 'Add' }
        </button>
      </div>
    </div>
    )
  }
} );

// initial page render
React.render(
  <Tabs nav={ "main" } />, document.getElementById( 'navbar' )
);

React.render(
  <Tabs nav={ "nav-mobile" } />, document.getElementById( 'nav-mobile' )
);

React.render(
  <div>
    <ViewArea />
  </div>,
  document.getElementById( 'main' )
);
