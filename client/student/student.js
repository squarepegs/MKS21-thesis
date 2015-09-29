var socket = io();
window.jeopardy = {};

var QA = React.createClass({
  render:function(){
    socket.on('ask-question', function(data){
      React.render(
        <div>
          <h4>Category: {data.category} - ${data.value}</h4>
          <h3>Question:</h3>
          <h2>{data.question}</h2>
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


var Buzzer = React.createClass({
  render:function(){
    return (
    <div>
      <button onClick={this.clickHandler}> Buzz in! </button>
    </div>
    )
  },
  clickHandler: function(){
    //need to make it so they can only buzz in once per question
    socket.emit('buzz',{code:window.jeopardy.code, time:new Date(), username:window.jeopardy.username});
  }
})


var Main = React.createClass({
  handleClick: function(){
    window.jeopardy.username = $('#username').val();
    window.jeopardy.code     = $('#code').val().toUpperCase();
    socket.emit('student-join',{username:window.jeopardy.username, code:window.jeopardy.code});
    React.render(
      <div>
        <QA />
        <Buzzer />
      </div>
      ,document.getElementById('main'))
  },
  render: function(){
    socket.on('you-joined', function(data){
      React.render(<Dashboard />, document.getElementById('main'));
    })
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
