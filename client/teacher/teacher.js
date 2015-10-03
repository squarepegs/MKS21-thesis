//socket Emit functionality
var socket = io();
window.jeopardy = {};

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

var Dashboard = React.createClass({
  render:function(){
    return (
    <div>
      <h2 id="roomcode">Your code is: {window.jeopardy.code}</h2>
      <QA />
      <NewQ />
      <BuzzedInList />
      <ActiveList />
    </div>
    )
  }
})

var QA = React.createClass({
  render:function(){
    socket.on('asked-question', function(data){
      React.render(
        <div>
          <h4>Category: {data.category} - ${data.value}</h4>
          <h3>Question:</h3>
          <h2>{data.question}</h2>
          <h3>Answer:</h3>
          <h2>{data.answer}</h2>
        </div>,document.getElementById('question')
        )
    })
    return (
    <div>
      <h2 id="question"></h2>
    </div>
    )
  },
})

var BuzzedInList = React.createClass({
  buzzedIn: [],
  render:function(){
    socket.on('asked-question', function(data){
      this.buzzedIn = [];
      React.render(
        <div>
          Waiting for buzz...
        </div>,document.getElementById('buzzedIn')
        )
    })
    socket.on('buzzed-in', function(data){
      if (this.buzzedIn.indexOf(data.username) === -1){
        this.buzzedIn.push(data.username);
        this.buzzedIn.sort(sortByTime);
      }
      console.log('after this.buzzedIn', this.buzzedIn, "data", data)

      var elements = [];
      for(var i = 0; i < this.buzzedIn.length; i++){
        elements.push(<li>{this.buzzedIn[i]}</li>);
      }

      React.render(
        <div>
          <ol>{elements}</ol>
        </div>,document.getElementById('buzzedIn')
        )
    })
    return (
    <div>
      <h2>Buzzed in:</h2>
      <p id="buzzedIn"></p>
    </div>
    )
  },
})

var ActiveList = React.createClass({
  activeList: [],
  render:function(){
    socket.on('update-list', function(data){
      this.activeList = data;
      console.log("this.activeList, data: ", this.activeList, data)
      var elements = [];
      for(var i = 0; i < this.activeList.length; i++){
        elements.push(<li>{this.activeList[i]}</li>);
      }

      React.render(
        <div>
          <ul>{elements}</ul>
        </div>,document.getElementById('activeList')
      )
    })
    return (
    <div>
      <h2>Active Players:</h2>
      <p id="activeList"></p>
    </div>
    )
  },
})


var NewQ = React.createClass({
  render:function(){
    return (
    <div>
      <button onClick={this.clickHandler}> new question </button>
    </div>
    )
  },
  clickHandler: function(){
    socket.emit('newQ',{code: window.jeopardy.code});
  }
})

var Main = React.createClass({
  handleClick: function(){
    window.jeopardy.username = $('#username').val();
    socket.emit('new-game',{username:window.jeopardy.username});
    React.render(
      <Dashboard />
      ,document.getElementById('main'))
  },
  render: function(){
    socket.on('made-game', function(data){
      window.jeopardy.code = data.code;
      React.render(<Dashboard />, document.getElementById('main'));
    })
    return (
      <div>
        <label>Username: </label>
        <input type="text" className="input" id="username" />
        <button onClick={this.handleClick}>START NEW GAME</button>
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
