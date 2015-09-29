//socket Emit functionality
var socket = io();
window.jeopardy = {};

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
    })
    socket.on('buzzed-in', function(data){
      this.buzzedIn.push(data.username);
      this.buzzedIn.sort(sortByTime);

      React.render(
        <div>
          <ol>{
            this.buzzedIn.map(function(student){
              return (<li>{student.name}</li>)
            })
          }</ol>
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
      React.render(
        <div>
          <ul>{
            this.activeList.map(function(student){
              return (<li>{student.name}</li>)
            })
          }</ul>
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
