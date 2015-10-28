// -----------------------
// NOTES
// -----------------------
// On `this`: 
//   Since React uses the `this` keyword a bunch, this comes up. 
//   Juan prefers using the `.bind(this)` method as it is precisely
//   what .bind was designed for. 
//   Brian prefers using var context = this; just in case you have
//   to refer to two different "this"es in code. 
//   This may cause inconsistent style.  
//
// -----------------------

'use strict';

// -----------------------
// GLOBAL VARIABLES
// -----------------------
// These variables are global because they don't quite fit the
// usecase for React.setState({}), and can't be passed as props
// because not all items have a parent-child relationship.
// In truth, we might be able to refactor a few, now that
// we're more comfortable with React.  
// -----------------------

// If socket exists, reconnect to it, if not, create a new one. 
var socket = socket ? socket.socket.reconnect() : io();
window.jeopardy = {};
window.activeList = [];
var buzzedIn = [];
var testData = [];
var questionData = {};

// -----------------------
// USE OF `sessionStorage`
// -----------------------
// We stored the decks in session storage back on the dashboard page. 
// This allows the teacher to retain access to the deck ID numbers.
// There is probably a better way to do this. 
// -----------------------

var decks = sessionStorage.decks;

socket.on('error', function(err) {
  console.log('this is the error', err);
});

// -----------------------
// Helper Functions
// -----------------------
// weAlreadyHaveOneOfThese() is just a simple helper function
// that checks to see if we already have an entry for that user
// This is mainly used to make sure that no one can buzz in
// more than once per question. 
// (Since "buzzes" are objects with an .id and a .time,
// you have to check to see if there is a particular buzz. 
//
// sortByTime() is designed to compare timestamps. *Usually* the 
// person who buzzed in first is the person who the server hears
// from first, but with lag and multiple networks, that might 
// not always be true.  We use timestamps to make sure that's the case.
// We did have a bug where if you set your computer/phone's system clock
// earlier, you can get an earlier timestamp. I think the best way to handle that
// would be to check if the timestamp is earlier then the timestamp when
// the question was asked.  
// -----------------------

var weAlreadyHaveOneOfThese = function weAlreadyHaveOneOfThese(object, key, value) {
  for (var ref in object) {
    if (object[ref][key] === value) {
      return true;
    }
  }
  return false;
};

var sortByTime = function sortByTime(a, b) {
  if (a.time > b.time) return 1;
  else if (a.time > b.time) return -1;
  else return 0;
};

// -----------------------
// REACT COMPONENTS: 
// -----------------------
// *Initial Render: <div id="main">
//   └┬─Main
//    └┬─RoomSelect
//     └──Room
//
// *On 'room code' (socket): <div id="main">
//   └┬─GameDashboard
//    ├──NewQ
//    ├┬─ActiveList
//    │└──Student
//    ├──BuzzedInList
//    ├──Feedback
//    ├┬─EndGame 
//    │└──.clickHandler (Replace GameDashboard with Main); 
//    └──QA
// -----------------------

var Main = React.createClass({
  displayName: 'Main',
  componentDidMount: function componentDidMount() {
    if (decks !== undefined) {
      decks = JSON.parse(sessionStorage.decks);
      socket.emit('decks', decks);
    }
    socket.on('room code', function(code, deckID) {
      window.jeopardy.code = code;
      sessionStorage.deckID = deckID;
      React.render(React.createElement(GameDashboard, {
        deckID: deckID
      }), document.getElementById('main'));
    });
  },
  handleClick: function handleClick() {
    window.jeopardy.username = 'depreciated';
    socket.emit('new game', {
      id: 'depreciated'
    }, sessionStorage.deckID);
  },
  render: function render() {
    return React.createElement('div', {
      className: 'container'
    }, React.createElement('div', {
      className: 'row'
    }, React.createElement('div', {
      className: 'col s3 flow-text'
    }, React.createElement('span', {
      className: 'brand-logo'
    }, 'Digi', React.createElement('span', {
      className: 'orange-text'
    }, 'Quiz'))), React.createElement('div', {
      className: 'col s9 align-center'
    }, React.createElement('a', {
      href: '#',
      className: 'btn',
      onClick: this.handleClick
    }, 'START NEW GAME'))), React.createElement('div', {
      className: 'row'
    }, 'Existing rooms:'), React.createElement('div', {
      id: 'Rooms',
      className: 'row'
    }, React.createElement(RoomSelect, null)));
  }
});

var RoomSelect = React.createClass({
  displayName: 'RoomSelect',
  getInitialState: function getInitialState() {
    return {
      items: [''],
      selected: ''
    };
  },
  componentDidMount: function componentDidMount() {
    //here we get the deck data back or if there is no deck data we get the data back of all the rooms
    socket.on('rooms created', (function(data) {
      if (this.isMounted()) {
        this.setState(function() {
          var rooms = [];
          for (var i = 0; i < data.length; i++) {
            if (typeof data[i] === 'object') {
              var bucket = [];
              bucket.push(data[i].title);
              bucket.push(data[i].code);
              bucket.push(data[i].deckID);
              rooms.push(bucket);
            }
          }
          return {
            items: rooms
          };
        });
      }
    }).bind(this));
  },
  clickHandler: function clickHandler(event) {
    if (event.target.value) {
      var selected;
      if (event.target.value !== 'jService') {
        this.setState({
          selected: event.target.value
        });
        for (var i = 0; i < this.state.items.length; i++) {
          if (this.state.items[i].indexOf(event.target.value) !== -1) {
            selected = this.state.items[i];
          }
        }
        socket.emit('join room', selected[1], selected[2]);
      } else {
        socket.emit('join room', null, 'jService');
      }
    }
  },
  render: function render() {
    var items = this.state.items.map((function(element, i) {
      return React.createElement(Room, {
        name: element[0],
        code: element[1],
        deckID: element[2],
        key: i
      });
    }).bind(this));
    return React.createElement('div', null, React.createElement('select', {
      className: 'browser-default inline',
      onChange: this.clickHandler
    }, React.createElement('option', {
      className: 'dropdown-item',
      value: ''
    }), React.createElement('option', {
      className: 'dropdown-item',
      value: 'jService'
    }, 'jService'), items));
  }
});

var Room = React.createClass({
  displayName: 'Room',
  render: function render() {
    return React.createElement('option', {
      className: 'dropdown-item'
    }, this.props.name);
  }
});

var GameDashboard = React.createClass({
  displayName: 'GameDashboard',
  render: function render() {
    return React.createElement('div', {
      id: 'gameDashboard'
    }, React.createElement('div', {
      className: 'row headroom-whitespace'
    }, React.createElement('div', {
      className: 'col s6 flow-text center',
      id: 'roomcode'
    }, React.createElement('span', {
      className: 'brand-logo'
    }, 'Digi', React.createElement('span', {
      className: 'orange-text'
    }, 'Quiz')), 'Your code is: ', window.jeopardy.code), React.createElement('div', {
      className: 'col s4'
    }, React.createElement(NewQ, {
      deckID: this.props.deckID
    }))), React.createElement('div', {
      className: 'row'
    }, React.createElement('div', {
      className: 'col s4'
    }, React.createElement(ActiveList, null), React.createElement(BuzzedInList, null), React.createElement(Feedback, null), React.createElement(EndGame, null)), React.createElement(QA, null)));
  }
});

var NewQ = React.createClass({
  displayName: 'NewQ',
  clickHandler: function clickHandler() {
    testData.push(questionData);
    questionData = {};
    questionData.buzzes = {};
    socket.emit('newQ', window.jeopardy.code, this.props.deckID);
  },
  render: function render() {
    return React.createElement('div', null, React.createElement('a', {
      href: '#',
      className: 'btn wide-btn',
      onClick: this.clickHandler
    }, 'Next Question'));
  }
});

var ActiveList = React.createClass({
  displayName: 'ActiveList',
  getInitialState: function getInitialState() {
    return {
      items: ['']
    };
  },
  componentDidMount: function componentDidMount() {
    socket.on('student joined', (function(data) {
      window.activeList = data;
      if (this.isMounted()) {
        this.setState(function() {
          var list = [];
          for (var i = 0; i < data.length; i++) {
            list.push(data[i]);
          }
          return {
            items: list
          };
        });
      }
    }).bind(this));
    socket.on('user disconnected', (function(student) {
      if (this.isMounted()) {
        this.setState(function() {
          var index = window.activeList.indexOf(student);
          if (index !== -1) {
            window.activeList.splice(index, 1);
          }
          return {
            items: window.activeList
          };
        });
      }
    }).bind(this));
  },
  render: function render() {
    var items = this.state.items.map((function(item, i) {
      return React.createElement(Student, {
        name: item,
        key: i
      });
    }).bind(this));
    return React.createElement('div', {
      className: 'row card teal'
    }, React.createElement('div', {
      className: 'card-content flow-text white-text'
    }, React.createElement('div', {
      className: 'card-title'
    }, 'Active Players:'), React.createElement('ul', {
      id: 'activeList'
    }, items)));
  }
});

// TODO: to be refactored: students stored in local storage 
// and temporary variable used to reconstruct storage as an array 
// localStorage only stores strings
var Student = React.createClass({
  displayName: 'Student',
  render: function render() {
    return React.createElement('li', {
      className: 'student'
    }, this.props.name);
  }
});

var BuzzedInList = React.createClass({
  displayName: 'BuzzedInList',
  componentDidMount: function componentDidMount() {
    socket.on('teacher question', function(data) {
      buzzedIn = [];
      React.render(React.createElement('div', null, 'Waiting for buzz...'), document.getElementById('buzzedIn'));
    });
    socket.on('buzzed in', function(data) {
      if (!weAlreadyHaveOneOfThese(questionData.buzzes, 'id', data.id)) {
        buzzedIn.push(data);
        buzzedIn.sort(sortByTime);
        questionData.buzzes = buzzedIn;
      }
      var elements = [];
      for (var i = 0; i < buzzedIn.length; i++) {
        elements.push(React.createElement('li', null, buzzedIn[i].id));
      }
      // WARNING: Each child in an array or iterator should have a unique "key" prop. Check the top-level render call using <ol>. See https://fb.me/react-warning-keys for more information.
      React.render(React.createElement('div', null, React.createElement('ol', null, elements)), document.getElementById('buzzedIn'));
    });
  },
  render: function render() {
    return React.createElement('div', {
      className: 'row card teal darken-1'
    }, React.createElement('div', {
      className: 'card-content flow-text white-text'
    }, React.createElement('div', {
      className: 'card-title'
    }, 'Buzzed in:'), React.createElement('div', {
      id: 'buzzedIn'
    })));
  }
});

var Feedback = React.createClass({
  displayName: 'Feedback',
  componentDidMount: function componentDidMount() {
    socket.on('teacher question', function(data) {
      React.render(React.createElement('div', null, 'Waiting for feedback'), document.getElementById('feedback'));
    });
    socket.on('feedback incoming', function(data, deckID) {
      if (questionData.feedbacks === undefined) {
        questionData.feedbacks = {};
      }
      questionData.feedbacks[data.id] = data.feedback;
      var elements = [];
      for (var key in questionData.feedbacks) {
        elements.push(React.createElement('li', null, key, ' : ', questionData.feedbacks[key]));
      }
      React.render(React.createElement('div', null, React.createElement('ol', null, elements)), document.getElementById('feedback'));
    });
  },
  render: function render() {
    return React.createElement('div', {
      className: 'row card teal darken-2'
    }, React.createElement('div', {
      className: 'card-content flow-text white-text'
    }, React.createElement('div', {
      className: 'card-title'
    }, 'Live Feedback:'), React.createElement('div', {
      id: 'feedback'
    })));
  }
});

var EndGame = React.createClass({
  displayName: 'EndGame',
  clickHandler: function clickHandler() {
    socket.emit('end game', window.jeopardy.code);
    socket.disconnect();
    React.render(React.createElement('div', null, React.createElement(Main, null)), document.getElementById('main'));
  },
  render: function render() {
    return React.createElement('div', null, React.createElement('a', {
      href: '#',
      className: 'btn red darken-2 wide-btn',
      onClick: this.clickHandler
    }, 'End Game'));
  }
});

var QA = React.createClass({
  displayName: 'QA',
  componentDidMount: function componentDidMount() {
    socket.on('teacher question', function(data) {
      if (data.question === 'There are no more questions in this deck') {
        testDataString = JSON.stringify(testData);
        $.post('/api/recordTest', {
          'testData': testDataString
        }, function(req, res) {
          // ???
        });
      }
      questionData.category = data.category;
      questionData.question = data.question;
      questionData.pointValue = data.value;
      questionData.answer = data.answer;
      questionData.feedbacks = {};
      questionData.rootTime = Date.now();
      React.render(React.createElement('div', {
        className: 'col s8'
      }, React.createElement('div', {
        className: 'card blue-grey flow-text lighten-1'
      }, React.createElement('div', {
        className: 'card-content white-text'
      }, React.createElement('div', {
        className: 'card-title'
      }, 'Category:'), data.category.toUpperCase(), ' - $', data.value)), React.createElement('div', {
        className: 'card blue-grey flow-text darken-1'
      }, React.createElement('div', {
        className: 'card-content white-text'
      }, React.createElement('div', {
        className: 'card-title'
      }, 'Question:'), data.question.toUpperCase())), React.createElement('div', {
        className: 'card blue-grey flow-text darken-2'
      }, React.createElement('div', {
        className: 'card-content white-text'
      }, React.createElement('div', {
        className: 'card-title'
      }, 'Answer:'), data.answer.toUpperCase()))), document.getElementById('question'));
    });
  },
  render: function render() {
    return React.createElement('div', null, React.createElement('h2', {
      id: 'question'
    }));
  }
});

// initial page render
// TODO: "WARNING: React.render is deprecated. Please use ReactDOM.render from require('react-dom') instead.""
// ReactDOM requires Browserify (or Webpack) and we have not had luck
// with getting Browserify working properly. 

React.render(React.createElement('div', {
  className: 'headroom-whitespace'
}, React.createElement(Main, null)), document.getElementById('main'));