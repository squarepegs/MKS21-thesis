//socket Emit functionality
var socket = io();
window.jeopardy = {};
var activeList = [];
var buzzedIn = [];

socket.on('error', function(){
  alert("there was a server error. Please try starting a new session.");
});

var sortByTime = function(a,b){
  if (a.time < b.time) return 1;
  else if (a.time > b.time) return -1;
  else return 0;
};

//
// REACT COMPONENTS:
//
var Room = React.createClass({

  render: function() {
    return (
      <option className="dropdown-item">{this.props.name}</option>
    );
  }
});

var RoomSelect = React.createClass({

  getDefaultProps: function() {
    return {
      items: ['rooma', 'roomb']
    }
  },

  render: function() {
    var items = this.props.items.map(function(item, i) {
      return (<Room name={item} key={i} />);
    }.bind(this))
    return (
      <div>
      <select className="browser-default">
        {items}
      </select>
      </div>
    );
  }
});

var GameDashboard = React.createClass({
  componentDidMount:function(){

  },

  render:function(){
    return (
    <div>
      <h2 id="roomcode">Your code is: {window.jeopardy.code}</h2>
      <RoomSelect />
      <QA />
      <NewQ deckID={this.props.deckID} />
      <BuzzedInList />
      <ActiveList />
    </div>
    )
  }
})




var QA = React.createClass({
  componentDidMount: function(){
    socket.on('teacher question', function(data){
      if (data.question === 'There are no more questions in this deck'){
        sessionStorage.deckID = 'jService';
      }
      React.render(
        <div>
          <h4>Category: {data.category} - ${data.value}</h4>
          <h3>Question:</h3>
          <h2>{data.question}</h2>
          <h3>Answer:</h3>
          <h2>{data.answer}</h2>
        </div>, document.getElementById('question')
        )
    })
  },

  render:function(){
    return (
    <div>
      <h2 id="question"></h2>
    </div>
    )
  },
})

var BuzzedInList = React.createClass({
  componentDidMount: function(){
    socket.on('teacher question', function (data){
      buzzedIn = [];
      React.render(
        <div>
          Waiting for buzz...
        </div>,document.getElementById('buzzedIn')
        )
    })
    
    socket.on('buzzed in', function(data){
      if (buzzedIn.indexOf(data.id) === -1){
        buzzedIn.push(data.id);
        buzzedIn.sort(sortByTime);
      }
      console.log('after this.buzzedIn', buzzedIn, "data", data)

      var elements = [];
      for(var i = 0; i < buzzedIn.length; i++){
        elements.push(<li>{buzzedIn[i]}</li>);
      }

      React.render(
        <div>
          <ol>{elements}</ol>
        </div>,document.getElementById('buzzedIn')
        )
    })

  },

  render:function(){
    return (
    <div>
      <h2>Buzzed in:</h2>
      <p id="buzzedIn"></p>
    </div>
    )
  },
})

var ActiveList = React.createClass({

  componentDidMount: function(){
    socket.on('student joined', function (data){
    
    console.log("activeList, ", activeList);
      activeList.push(data);

    var elements = [];
    for(var i = 0; i < activeList.length; i++){
        elements.push(<li>{activeList[i]}</li>);
      }

    React.render(
      <div>
        <ul>{elements}</ul>
      </div>,document.getElementById('activeList')
      )
    })
  },

  render:function(){
    return (
    <div>
      <h2>Active Players:</h2>
      <p id="activeList"></p>
    </div>
    )
  },
})


var NewQ = React.createClass({
  clickHandler: function(){
    console.log("NewQ clicked")
    socket.emit('newQ', window.jeopardy.code, this.props.deckID);
  },

  render:function(){
    return (
    <div>
      <button onClick={this.clickHandler}> new question </button>
    </div>
    )
  }
})

var Main = React.createClass({
  componentDidMount: function(){
    socket.on('welcome message', function (code, deckID){
      console.log('these are the rooms i am in', socket)
      console.log('this is the deck I am playing', deckID)
    window.jeopardy.code = code;
    React.render(<GameDashboard deckID={sessionStorage.deckID} />, document.getElementById('main'));
    })
  },

  handleClick: function(){
    console.log("deckID:", sessionStorage.deckID)
    socket.emit('new game', {id:window.jeopardy.username}, sessionStorage.deckID);
    React.render(
      <GameDashboard deckID={sessionStorage.deckID} />
      ,document.getElementById('main'))
  },

  render: function(){
    return (
      <div>
        <label>Username: </label>
        <input type="text" className="input" id="username" />
        <button onClick={this.handleClick}>Start Game</button>
        <div id="status"></div>
      </div>
    )
  }
})


// initial page render
React.render(
  <div>
    <Main />
  </div>,
  document.getElementById('main')
);
