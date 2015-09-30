var socket = io();
window.jeopardy = {buzzed:false, question:{}};

var QA = React.createClass({
  render:function(){
    React.render(
      <div>
        <h4>Category: {window.jeopardy.question.category} - ${window.jeopardy.question.value}</h4>
        <h3>Question:</h3>
        <h2>{window.jeopardy.question.question}</h2>
        <p>{window.jeopardy.buzzed}</p>
      </div>, document.getElementById('question')
    )
  }
});

var Waiting = React.createClass({
  render:function(){
    socket.on('ask-question', function(data){
      window.s = 4;
      window.jeopardy.buzzed = false;
      window.jeopardy.question = data;
      React.render( <QA />, document.getElementById('question') )
    })
    return ( <div id="question">Waiting for new question...</div> )
  },
})

var Buzzer = React.createClass({
  render:function(){
    return (
    <div>
      <button onClick={this.clickHandler}> Buzz in! </button>
    </div>
    )
  },
  clickHandler: function(){
    socket.emit('buzz',{code:window.jeopardy.code, time:new Date(), username:window.jeopardy.username});
    window.jeopardy.buzzed = true;
  }
})

var Main = React.createClass({
  handleClick: function(){
    window.jeopardy.username = $('#username').val();
    window.jeopardy.code     = $('#code').val().toUpperCase();
    if (window.jeopardy.username.length < 1) alert("Please enter a username.");
    else socket.emit('student-join',{username:window.jeopardy.username, code:window.jeopardy.code});
  },
  render: function(){
    socket.on('you-joined', function(){
      console.log("you joined!");
      React.render( <div> <Waiting /> <Buzzer /> </div>, document.getElementById('main') )
    })
    socket.on('no-game', function(){alert("No such game. Please try another game code.")})
    return (
      <div>
        <label>Username: </label>
        <input type="text" className="input" id="username" />
        <label>Code: </label>
        <input type="text" className="input" id="code" />
        <button onClick={this.handleClick}>JOIN GAME</button>
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
