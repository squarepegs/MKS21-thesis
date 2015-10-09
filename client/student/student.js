var socket = io();
window.jeopardy = {buzzed:false, question:{}};

var QA = React.createClass({

  componentDidMount: function(){
    $('#buzzer').removeClass("red darken-3");
    $('#buzzer').text('Buzz in!');
  },
  
  render:function(){
    React.render(
      <div className="container">
        <div className="jep-panel yellow-text blue darken-4 card-panel flow-text">
          <div className="flow-text white-text category"><strong>{window.jeopardy.question.category.toUpperCase()} - ${window.jeopardy.question.value}</strong></div>
          <div className="flow-text question">{window.jeopardy.question.question.toUpperCase()}</div>
        </div>
        <p>{window.jeopardy.buzzed}</p>
      </div>, document.getElementById('question')
    )
  }
});

var Waiting = React.createClass({
  componentDidMount: function(){
      socket.on('student question', function(data){
      window.jeopardy.buzzed = false;
      window.jeopardy.question = data;
      React.render( 
        <div>
        <QA />
        </div>, document.getElementById('question') )
    })  
  },
  render:function(){

    return ( <div id="question">Waiting for new question...</div> )
  },
})

var Buzzer = React.createClass({
  render:function(){
    return (
    <div className="buzzer center-align valign-wrapper">
      <a className="waves-effect center-align valign waves-light btn-large" id="buzzer" onClick={this.clickHandler}>Buzz in!</a>
    </div>
    )
  },

  clickHandler: function(){
    $('#buzzer').addClass("red darken-3");
    $('#buzzer').text('BUZZ!');
    socket.emit('buzz',{code:window.jeopardy.code, time:new Date(), id:window.jeopardy.username});
    window.jeopardy.buzzed = true;
  }
})

var Main = React.createClass({
  componentDidMount: function(){
    socket.on('student joined', function(){
    console.log("you joined!");
    React.render( <div> <Waiting /> <Buzzer /> </div>, document.getElementById('main') )
    })
   socket.on('error', function(){alert("No such game. Please try another game code.")})

  },

  handleClick: function(){
    window.jeopardy.username = $('#username').val();
    window.jeopardy.code     = $('#code').val().toUpperCase();
    if (window.jeopardy.username.length < 1) alert("Please enter a username.");
    else socket.emit('student join',{id:window.jeopardy.username, code:window.jeopardy.code});
  },
  render: function(){

    return (
      <div className="signin">
        <h1>Sign in to play:</h1>
        <label>Username: </label>
        <input type="text" className="input" placeholder="Choose a Username" id="username" />
        <label>Code: </label>
        <input type="text" className="input" placeholder="Enter Your Code" id="code" />
        
        <a onClick={this.handleClick} className="waves-effect waves-light btn-large"><i className="material-icons right">play_arrow</i>Join Game</a>
        <div id="status"></div>
      </div>
    )
  }
})

// initial page render
React.render(
  <div className="container">
    <Main />
  </div>,
  document.getElementById('main')
);
