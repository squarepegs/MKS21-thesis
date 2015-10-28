// teacher.js
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
      React.render(
        <GameDashboard deckID={deckID} />
        ,document.getElementById('main')
      )
    });
  },
  handleClick: function handleClick() {
    window.jeopardy.username = 'depreciated';
    socket.emit('new game', {
      id: 'depreciated'
    }, sessionStorage.deckID);
  },
  render: function render() {
    return (
      <div className='container'>
        <div className="row">
          <div className="col s3 flow-text">
            <span className="brand-logo">
              Digi
              <span className="orange-text">Quiz</span>
            </span>
          </div>
          <div className="col s9 align-center">
            <a href="#" className="btn" onClick={this.handleClick}>START NEW GAME</a>
          </div>
        </div>
        <div className="row">Existing rooms:</div>
        <div id="Rooms" className="row">
          <RoomSelect />
        </div>
      </div>
    );

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
      return (<Room name={element[0]} code={element[1]} deckID={element[2]} key={i} />);
    }).bind(this));
    return (
      <div>
        <select className="browser-default inline" onChange={this.clickHandler}>
          <option className="dropdown-item" value=""></option>
          <option className="dropdown-item" value="jService">jService</option>
          {items}
        </select>
      </div>
    );
  }
});

var Room = React.createClass({
  displayName: 'Room',
  render: function render() {
    return (
      <option className="dropdown-item">{this.props.name}</option>
    );
  }
});

var GameDashboard = React.createClass({
  displayName: 'GameDashboard',
  render: function render() {
    return (
    <div id='gameDashboard'>
      <div className="row headroom-whitespace">
        <div className="col s6 flow-text center" id="roomcode">
        <span className="brand-logo">Digi<span className="orange-text">Quiz</span></span>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          Your code is: {window.jeopardy.code}
        </div>
        <div className="col s4">
          <NewQ deckID={this.props.deckID} />
          </div>
      </div>
      <div className="row">
        <div className="col s4">
          <ActiveList />  
          <BuzzedInList />
          <Feedback />
          <EndGame />
        </div>
        <QA />
      </div>
    </div>
    )
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
    return (
    <div>
      <a href="#" className="btn wide-btn" onClick={this.clickHandler}>Next Question</a>
    </div>
    );
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
    var items = this.state.items.map(function(item, i) {
      return (
        <Student name={item} key={i} />
      )}.bind(this))
    return (    
      <div className="row card teal">
        <div className="card-content flow-text white-text">
          <div className="card-title">Active Players:</div>
          <ul id="activeList">{items}</ul>
        </div>
      </div>  
    )
  }
});

// TODO: to be refactored: students stored in local storage 
// and temporary variable used to reconstruct storage as an array 
// localStorage only stores strings
var Student = React.createClass({
  displayName: 'Student',
  render: function render() {
    return (
      <li className="student">{this.props.name}</li>
    );
  }
});

var BuzzedInList = React.createClass({
  displayName: 'BuzzedInList',
  componentDidMount: function componentDidMount() {
    socket.on('teacher question', function(data) {
      buzzedIn = [];
      React.render(
        <div>
          Waiting for buzz...
        </div>,document.getElementById('buzzedIn')
      )
    });
    socket.on('buzzed in', function(data) {
      if (!weAlreadyHaveOneOfThese(questionData.buzzes, 'id', data.id)) {
        buzzedIn.push(data);
        buzzedIn.sort(sortByTime);
        questionData.buzzes = buzzedIn;
      }
      var elements = [];
      for (var i = 0; i < buzzedIn.length; i++) {
        elements.push(<li key={'ol'+i} >{buzzedIn[i].id}</li>);
      }
      React.render(
        <div>
          <ol>{elements}</ol>
        </div>,document.getElementById('buzzedIn')
      )
    });
  },
  render: function render(){
    return (
      <div className="row card teal darken-1">
        <div className="card-content flow-text white-text">
          <div className="card-title">Buzzed in:</div>
          <div id="buzzedIn"></div>
        </div>
      </div>  
    )
  }
});

var Feedback = React.createClass({
  displayName: 'Feedback',
  componentDidMount: function componentDidMount() {
    socket.on('teacher question', function(data) {
      React.render(
        <div>
          Waiting for feedback
        </div>,document.getElementById('feedback')
        )
    });
    socket.on('feedback incoming', function(data, deckID) {
      if (questionData.feedbacks === undefined) {
        questionData.feedbacks = {};
      }
      questionData.feedbacks[data.id] = data.feedback;
      var elements = [];
      for (var key in questionData.feedbacks) {
        elements.push(<li>{key} : {questionData.feedbacks[key]}</li>);
      }
      React.render(
        <div>
          <ol>{elements}</ol>
        </div>,document.getElementById('feedback')
      )
    });
  },
  render:function render(){
    return (
      <div className="row card teal darken-2">
        <div className="card-content flow-text white-text">
          <div className="card-title">Live Feedback:</div>
          <div id="feedback"></div>
        </div>
      </div>    
    )
  }
});

var EndGame = React.createClass({
  displayName: 'EndGame',
  clickHandler: function clickHandler() {
    socket.emit('end game', window.jeopardy.code);
    socket.disconnect();
    React.render(
      <div>
        <Main />
      </div>,
      document.getElementById('main')
    )
  },
  render: function render() {
    return (
    <div>
      <a href="#" className="btn red darken-2 wide-btn" onClick={this.clickHandler}>End Game</a>
    </div>
    )
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
      React.render(
        <div className="col s8">
          <div className="card blue-grey flow-text lighten-1">
          <div className="card-content white-text">
          <div className="card-title">Category:</div>{data.category.toUpperCase()} - ${data.value}</div></div>
          <div className="card blue-grey flow-text darken-1">  
            <div className="card-content white-text">
              <div className="card-title">Question:</div>{data.question.toUpperCase()}
            </div>
          </div>
          <div className="card blue-grey flow-text darken-2">  
            <div className="card-content white-text">
               <div className="card-title">Answer:</div>{data.answer.toUpperCase()}
            </div>
          </div>
        </div>, document.getElementById('question')
      )
    });
  },
  render: function render() {
    return (
      <div>
        <h2 id="question"></h2>
      </div>
    );
  }
});

// initial page render
// TODO: "WARNING: React.render is deprecated. Please use ReactDOM.render from require('react-dom') instead.""
// ReactDOM requires Browserify (or Webpack) and we have not had luck
// with getting Browserify working properly. 

React.render(
  <div className="headroom-whitespace">
    <Main />
  </div>,
  document.getElementById('main')
);