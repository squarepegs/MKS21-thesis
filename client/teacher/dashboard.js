'use strict';
// This requires Browserify
var React = require('react');

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
window.jeopardy = {};

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
var Tabs = React.createClass({
  displayName: 'Tabs',
  decks: function decks() {
    React.render(React.createElement(MyDecks, null), document.getElementById('view'));
  },
  classData: function classData() {
    // Just a simple redirect for right now. 
    window.location.assign('/charts');
  },
  myProfile: function myProfile() {
    React.render(React.createElement(Profile, null), document.getElementById('view'));
  },
  logout: function logout() {
    $.get('/api/logout', function(req, res) {
      window.location.assign("/");
    });
  },
  render: function render() {
    var context = this;
    return React.createElement('ul', {
      className: context.props.nav === 'nav-mobile' ? 'side-nav' : 'right hide-on-med-and-down'
    }, React.createElement('li', null, React.createElement('a', {
      href: '/teacher',
      target: '_blank'
    }, 'Launch Game')), React.createElement('li', null, React.createElement('a', {
      href: '#',
      onClick: this.decks
    }, 'My Decks')), React.createElement('li', null, React.createElement('a', {
      href: '#',
      onClick: this.myProfile
    }, 'My Profile')), React.createElement('li', null, React.createElement('a', {
      href: '/charts',
      onClick: this.classData
    }, 'Data Charts')), React.createElement('li', null, React.createElement('a', {
      href: '#',
      onClick: this.logout
    }, 'Logout')));
  }
});

// Main View Area
var ViewArea = React.createClass({
  displayName: 'ViewArea',
  render: function render() {
    return React.createElement('div', {
      id: 'view'
    });
  }
});

// Profile Area
var Profile = React.createClass({
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
    $.get('/api/profile', function(req, res) {
      if (req.local) {
        context.setState({
          'username': req.local.username
        });
      }
      if (req.facebook) {
        context.setState({
          'username': req.facebook.name
        });
      }
      context.setState({
        'firstName': req.profile.firstName
      });
      context.setState({
        'lastName': req.profile.lastName
      });
      context.setState({
        'email': req.profile.email
      });
    });
  },
  prepFirstName: function prepFirstName(event) {
    this.setState({
      'firstName': event.target.value
    });
  },
  prepLastName: function prepLastName(event) {
    this.setState({
      'lastName': event.target.value
    });
  },
  prepEmail: function prepEmail(event) {
    this.setState({
      'email': event.target.value
    });
  },
  updateProfile: function updateProfile() {
    var context = this;
    var query = context.state;
    $.post('/api/profile', query, function(req, res) {
      Materialize.toast('Profile Saved!', 4000);
    });
  },
  render: function render() {
    return React.createElement('div', null, React.createElement('form', null, React.createElement('fieldset', null, React.createElement('ul', null, React.createElement('li', null, 'Username: ', this.state.username), React.createElement('li', null, 'First Name:  ', React.createElement('input', {
      type: 'text',
      value: this.state.firstName,
      onChange: this.prepFirstName,
      name: 'firstName'
    })), React.createElement('li', null, 'Last Name: ', React.createElement('input', {
      type: 'text',
      value: this.state.lastName,
      onChange: this.prepLastName,
      name: 'lastName'
    })), React.createElement('li', null, 'E–mail: ', React.createElement('input', {
      type: 'text',
      value: this.state.email,
      onChange: this.prepEmail,
      name: 'email'
    })), React.createElement('li', null, React.createElement('button', {
      className: 'btn waves-effect waves-light',
      onClick: this.updateProfile
    }, 'Update Profile'))))));
  }
});

// List of All Decks
var MyDecks = React.createClass({
  displayName: 'MyDecks',
  getInitialState: function getInitialState() {
    return {
      decks: [],
      deckElements: []
    };
  },
  killDeck: function killDeck(event) {
    var context = this;
    var mutatedDecks = [];
    for (var i = 0; i < this.state.decks.length; i++) {
      if (this.state.decks[i]._id !== event.target.value) {
        mutatedDecks.push(this.state.decks[i]);
      }
    }
    // ANTIPATTERN!
    // You're supposed to use:
    // this.setState({decks: mutatedDecks})
    this.state.decks = mutatedDecks;
    // but for some reason the page will not rerender unless the
    // state is muated directly. In short, setState merely prepares
    // the state for a change, it doesn't actually change it.
    // Refactoring this so that it works would probably take as long
    // as switching to another framework.
    // We decided on React for a number of reasons, but we're not sure
    // that the two-way data binding of Angular wouldn't have been
    // extremely useful here.  C'est la vie.
    this.buildElements();
    $.post('/api/killdeck', {
      'deckID': event.target.value
    }, function(req, res) {});
  },
  editDeck: function editDeck(event, deckID) {
    if (event) {
      deckID = event.target.value;
      // .unmountComponentAtNode will no longer work in React 0.15 - in 0.14 (which we are using)
      // it works with a warning.  For that reason, our react version needs to be frozen at 0.14.
      React.unmountComponentAtNode(document.getElementById('deckEditor'));
    }
    React.render(React.createElement('div', null, React.createElement(DeckEditor, {
      deckID: deckID
    })), document.getElementById('deckEditor'));
  },
  playDeck: function playDeck(event) {
    sessionStorage.deckID = event.target.value;
    window.location.replace('/teacher');
  },
  shareDeck: function shareDeck(event) {
    var recipient = prompt('Who would you like to share this deck with?');
    if (recipient != null) {
      $.post('/api/shareDeck', {
        'recipient': recipient,
        'deckID': event.target.value
      }, function(success) {});
    } else {
      alert("Username can't be blank. Please try again.");
    }
  },
  buildElements: function buildElements() {
    var decksArr = [];
    for (var i = 0; i < this.state.decks.length; i++) {
      var decksObj = {};
      decksObj.deckID = this.state.decks[i]._id;
      decksObj.title = this.state.decks[i].title;
      decksArr.push(decksObj);
    }
    sessionStorage.decks = JSON.stringify(decksArr);
    var context = this;
    var elements = [];
    for (var i = 0; i < this.state.decks.length; i++) {
      elements.push(React.createElement(SingleDeck, {
        deck: this.state.decks[i],
        kill: this.killDeck,
        play: this.playDeck,
        edit: this.editDeck,
        share: this.shareDeck
      }));
    }
    context.setState({
      deckElements: elements
    });
    this.render();
  },
  getDecks: function getDecks() {
    var context = this;
    $.get('/api/decks', function(req, res) {
      context.setState({
        decks: req
      });
      context.buildElements();
    });
  },
  componentDidMount: function componentDidMount() {
    this.getDecks();
    if (this.props.deckToEdit) {
      this.editDeck(null, this.props.deckToEdit);
    }
  },
  render: function render() {
    return React.createElement('div', null, React.createElement('h3', null, 'Decks'), React.createElement('table', {
      className: 'responsive-table'
    }, React.createElement('tr', null, React.createElement('th', null, ' '), React.createElement('th', null, ' '), React.createElement('th', null, 'Title'), React.createElement('th', null, 'Notes'), React.createElement('th', null, '#Qs'), React.createElement('th', null, ' '), React.createElement('th', null, ' ')), this.state.deckElements), React.createElement('div', {
      id: 'deckEditor'
    }), React.createElement('div', {
      className: 'card green lighten-5'
    }, React.createElement(CreateDecks, null)));
  }
});

// Create a new deck (just initializes it, doesn't add questions, yet). 
var CreateDecks = React.createClass({
  displayName: 'CreateDecks',
  getInitialState: function getInitialState() {
    return {
      title: '',
      notes: ''
    };
  },
  createDeck: function createDeck() {
    var context = this;
    var query = context.state;
    $.post('/api/decks', query, function(req, res) {
      newDeckID = req;
      Materialize.toast('Deck has been added!', 4000);
      React.unmountComponentAtNode(document.getElementById('view'));
      React.render(React.createElement(MyDecks, {
        deckToEdit: newDeckID
      }), document.getElementById('view'));
    });
    context.setState({
      'title': ''
    });
    context.setState({
      'notes': ''
    });
  },
  prepTitle: function prepTitle(event) {
    this.setState({
      'title': event.target.value
    });
  },
  prepNotes: function prepNotes(event) {
    this.setState({
      'notes': event.target.value
    });
  },
  render: function render() {
    return React.createElement('div', {
      className: 'card-content'
    }, React.createElement('div', {
      className: 'card-title grey-text darken-2'
    }, 'Create a new deck'), React.createElement('div', {
      className: 'row'
    }, React.createElement('div', {
      className: 'col s4'
    }, React.createElement('label', null, 'Deck Name:'), React.createElement('input', {
      type: 'text',
      value: this.state.title,
      onChange: this.prepTitle,
      name: 'deckName'
    })), React.createElement('div', {
      className: 'col s6'
    }, React.createElement('label', null, 'Notes:'), React.createElement('input', {
      type: 'text',
      value: this.state.notes,
      onChange: this.prepNotes,
      name: 'deckNotes'
    })), React.createElement('div', {
      className: 'col s2'
    }, React.createElement('button', {
      className: 'btn waves-effect waves-light',
      onClick: this.createDeck
    }, 'Create'))));
  }
});

// The information of a single deck. MyDecks is filled with multiple instances
// of SingleDeck. 
var SingleDeck = React.createClass({
  displayName: 'SingleDeck',
  render: function render() {
    console.log("369: this.props.deck._id", this.props.deck._id);
    return React.createElement('tr', {
      id: 'thisRowID:' + this.props.deck._id,
      key: this.props.deck._id
    }, React.createElement('td', null, React.createElement('button', {
      className: 'btn waves-effect waves-light',
      value: this.props.deck._id,
      onClick: this.props.edit
    }, 'Edit')), React.createElement('td', null, React.createElement('button', {
      className: 'btn waves-effect waves-light',
      value: this.props.deck._id,
      onClick: this.props.kill
    }, 'Delete')), React.createElement('td', null, this.props.deck.title), React.createElement('td', null, this.props.deck.notes), React.createElement('td', null, this.props.deck.questions.length), React.createElement('td', null, React.createElement('button', {
      className: 'btn waves-effect waves-light',
      value: this.props.deck._id,
      onClick: this.props.play
    }, 'Play')), React.createElement('td', null, React.createElement('button', {
      className: 'btn waves-effect waves-light',
      value: this.props.deck._id,
      id: 'share' + this.props.deck._id,
      onClick: this.props.share
    }, 'Share')));
  }
});

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
var globalActiveDeckQuestions = [];
var globalDecksLister = null;

var DeckEditor = React.createClass({
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
    $.get('/api/decks/' + context.props.deckID, function(req, res) {
      context.setState({
        'title': req.title
      });
      context.setState({
        'notes': req.notes
      });
      globalActiveDeckQuestions = req.questions;
      context.showQs();
    });
  },
  saveChanges: function saveChanges() {
    var context = this;
    var newInfo = {
      'title': context.state.title,
      'notes': context.state.notes,
      'questions': JSON.stringify(globalActiveDeckQuestions)
    };
    $.post('/api/decks/' + this.props.deckID, newInfo, function(req, res) {
      context.render();
      Materialize.toast('Changes have been saved!', 4000); // 4000 is the duration of the toast
    });
  },
  showQs: function showQs() {
    var quesElements = [];
    for (var i = 0; i < globalActiveDeckQuestions.length; i++) {
      quesElements.push(React.createElement(ShowQuestion, {
        save: this.saveChanges,
        index: i,
        key: '' + this.props.deckID + '|index:' + i,
        value: globalActiveDeckQuestions[i].value,
        question: globalActiveDeckQuestions[i].question,
        category: globalActiveDeckQuestions[i].category,
        answer: globalActiveDeckQuestions[i].answer
      }));
    }
    var headers = React.createElement('div', {
      key: 'headers'
    }, React.createElement('div', {
      className: 'row'
    }, React.createElement('div', {
      className: 'col s1'
    }, 'Delete'), React.createElement('div', {
      className: 'col s1'
    }, 'Edit'), React.createElement('div', {
      className: 'col s2'
    }, 'Category'), React.createElement('div', {
      className: 'col s1'
    }, 'Value'), React.createElement('div', {
      className: 'col s5'
    }, 'Question'), React.createElement('div', {
      className: 'col s2'
    }, 'Answer')), React.createElement('div', {
      name: 'addQ'
    }));
    this.setState({
      'headers': headers
    });
    this.setState({
      'quesElements': quesElements
    });
  },
  prepNextQues: function prepNextQues() {
    this.setState({
      'nextQues': event.target.value
    });
  },
  prepNextAns: function prepNextAns() {
    this.setState({
      'nextAns': event.target.value
    });
  },
  prepNextCat: function prepNextCat() {
    this.setState({
      'nextCat': event.target.value
    });
  },
  prepNextVal: function prepNextVal() {
    this.setState({
      'nextVal': event.target.value
    });
  },
  changeTitle: function changeTitle() {
    this.setState({
      'title': event.target.value
    });
  },
  changeNotes: function changeNotes() {
    this.setState({
      'notes': event.target.value
    });
  },
  componentWillMount: function componentWillMount() {
    this.getInitialQs();
  },
  componentDidMount: function componentDidMount() {
    globalActiveDeckEditorComponent = this;
  },
  render: function render() {
    return React.createElement('div', null, React.createElement('h3', null, 'DeckEditor ', this.state.title), React.createElement('div', {
      className: 'row'
    }, React.createElement('div', {
      className: 'col s4'
    }, React.createElement('label', null, 'Title'), React.createElement('input', {
      type: 'text',
      className: 'title',
      value: this.state.title,
      onChange: this.changeTitle
    })), React.createElement('div', {
      className: 'col s6'
    }, React.createElement('label', null, 'Notes'), React.createElement('input', {
      type: 'text',
      className: 'notes',
      value: this.state.notes,
      onChange: this.changeNotes
    })), React.createElement('div', {
      className: 'col s2'
    }, React.createElement('button', {
      className: 'btn waves-effect waves-light',
      id: 'saveButton',
      onClick: this.saveChanges
    }, 'Save Title and Notes'))), React.createElement('hr', null), this.state.headers, this.state.quesElements, React.createElement('div', {
      id: 'newQEditor'
    }), React.createElement('hr', null), React.createElement('div', {
      id: 'editAddStatus'
    }), React.createElement(EditQuestion, {
      save: this.saveChanges,
      deckID: this.props.deckID
    }));
  }
});

// ShowQuestion lists a single question when editing a deck. 
var ShowQuestion = React.createClass({
  displayName: 'ShowQuestion',
  edit: function edit() {
    isEdit = true;
    React.render(React.createElement(EditQuestion, {
      save: this.props.save,
      edit: isEdit,
      index: this.props.index,
      deckID: this.props.deckID,
      category: this.props.category,
      value: this.props.value,
      question: this.props.question,
      answer: this.props.answer
    }), document.getElementById('editThisQ' + this.props.index));
  },
  'delete': function _delete() {
    globalActiveDeckQuestions.splice(this.props.index, 1);
    globalActiveDeckEditorComponent.showQs();
  },
  render: function render() {
    return React.createElement('div', null, React.createElement('div', {
      className: 'row'
    }, React.createElement('div', {
      className: 'col s1'
    }, React.createElement('button', {
      className: 'btn waves-effect waves-light',
      onClick: this['delete']
    }, 'Delete')), React.createElement('div', {
      className: 'col s1'
    }, React.createElement('button', {
      className: 'btn waves-effect waves-light',
      onClick: this.edit
    }, 'Edit')), React.createElement('div', {
      className: 'col s2 category'
    }, this.props.category), React.createElement('div', {
      className: 'col s1 value'
    }, this.props.value), React.createElement('div', {
      className: 'col s5 question'
    }, this.props.question), React.createElement('div', {
      className: 'col s2 answer'
    }, this.props.answer)), React.createElement('div', {
      id: 'editThisQ' + this.props.index
    }));
  }
});

// When it's time to edit the question, the "Show Question" instance spawns
// this Edit Question area under it for the specific "ShowQuestion"
var EditQuestion = React.createClass({
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
  prepNextCat: function prepNextCat(event) {
    this.setState({
      'newCat': event.target.value
    });
  },
  prepNextVal: function prepNextVal(event) {
    this.setState({
      'newVal': event.target.value
    });
  },
  prepNextQues: function prepNextQues(event) {
    this.setState({
      'newQues': event.target.value
    });
  },
  prepNextAns: function prepNextAns(event) {
    this.setState({
      'newAns': event.target.value
    });
  },
  addQtoDeck: function addQtoDeck() {
    var context = this;
    var amendedQ = {
      'category': this.state.newCat,
      'value': this.state.newVal,
      'question': this.state.newQues,
      'answer': this.state.newAns
    };
    if (this.props.edit) {
      globalActiveDeckQuestions[this.props.index] = amendedQ;
    } else {
      globalActiveDeckQuestions.push(amendedQ);
      this.setState({
        'newCat': ''
      });
      this.setState({
        'newVal': ''
      });
      this.setState({
        'newQues': ''
      });
      this.setState({
        'newAns': ''
      });
    }
    globalActiveDeckEditorComponent.showQs();
    this.props.save();
    if (this.props.edit) {
      React.render(React.createElement('div', {
        id: 'editThisQ' + this.props.index
      }, React.createElement('div', {
        id: "saved" + this.props.index
      }, 'Question edited. Click "Save Changes" to save changes.')), document.getElementById('editThisQ' + this.props.index));
    } else {
      React.render(React.createElement('div', {
        id: 'addThisQ' + this.props.index
      }, React.createElement('div', {
        id: "saved" + this.props.index
      }, 'Question added. Click "Save Changes" to save changes.')), document.getElementById('editAddStatus'));
    }
    setTimeout(function() {
      $('#saved' + context.props.index).fadeOut();
    }, 3000);
  },
  render: function render() {
    return React.createElement('div', {
      ref: this.props.edit ? 'editFields' : 'addFields',
      className: 'addQues row'
    }, React.createElement('div', {
      className: 'col s1'
    }, React.createElement('label', null, 'Category'), React.createElement('input', {
      type: 'text',
      className: 'category',
      value: this.state.newCat,
      onChange: this.prepNextCat
    })), React.createElement('div', {
      className: 'col s1'
    }, React.createElement('label', null, 'Value'), React.createElement('input', {
      type: 'text',
      className: 'value',
      value: this.state.newVal,
      onChange: this.prepNextVal
    })), React.createElement('div', {
      className: 'col s6'
    }, React.createElement('label', null, 'Question'), React.createElement('input', {
      type: 'text',
      className: 'question',
      value: this.state.newQues,
      onChange: this.prepNextQues
    })), React.createElement('div', {
      className: 'col s2'
    }, React.createElement('label', null, 'Answer'), React.createElement('input', {
      type: 'text',
      className: 'answer',
      value: this.state.newAns,
      onChange: this.prepNextAns
    })), React.createElement('div', {
      className: 'col s2'
    }, React.createElement('button', {
      className: 'btn waves-effect waves-light',
      onClick: this.addQtoDeck
    }, this.props.edit ? 'Save' : 'Add')));
  }
});



// initial page render
React.render(React.createElement(Tabs, {
  nav: "main"
}), document.getElementById('navbar'));
React.render(React.createElement(Tabs, {
  nav: "nav-mobile"
}), document.getElementById('nav-mobile'));
React.render(React.createElement('div', null, React.createElement(ViewArea, null)), document.getElementById('main'));