var socket = io();
window.jeopardy = {buzzed:false, question:{}};

var QA = React.createClass({


  getInitialState: function(){
    return {
    category: '',
    question: 'Waiting for Question',
    value: '',
    buzzed: false
    }
  },
  componentDidMount: function(){

    var context = this;

    socket.on('student question', function(data){
      $('#buzzer').removeClass("red darken-3");
      $('#buzzer').text('Buzz in!');
      context.setState({category: data.category.toUpperCase()})
      context.setState({value: data.value})
      context.setState({question: data.question.toUpperCase()})
      context.setState({buzzed:false})
    }) 
  
  },
  
  render:function(){
    return (
      <div className="container">
        <div className="jep-panel yellow-text blue darken-4 card-panel flow-text">
          <div className="flow-text white-text category"><strong>{this.state.category} - ${this.state.value}</strong></div>
          <div className="flow-text question">{this.state.question}</div>
        </div>
      </div>
    )
  }
});

var Buzzer = React.createClass({
  getInitialState: function(){
    return {clicked: false}
  },

  componentDidMount: function(){
    socket.on('end game', function (room){
      socket.disconnect();
      React.render(
          <div className="container">
            <Main />
          </div>,
          document.getElementById('main')
        ) 
    })
  
  },

  clickHandler: function(){
    if(this.state.clicked === false){
      $('#buzzer').addClass("red darken-3");
      $('#buzzer').text('BUZZ!');
      socket.emit('buzz',{code:window.jeopardy.code, time:new Date(), id:window.jeopardy.username});
    }
    // this.setState({clicked: true})
  },

  render:function(){
    return (
    <div className="buzzer center-align valign-wrapper">
      <a className="waves-effect center-align valign waves-light btn-large" id="buzzer" onClick={this.clickHandler}>Buzz in!</a>
    </div>
    )
  }
})

var Main = React.createClass({


  handleClick: function(){
    window.jeopardy.username = $('#username').val();
    window.jeopardy.code     = $('#code').val().toUpperCase();
    if (window.jeopardy.username.length < 1){ 
      alert("Please enter a username.");
    } else { 
      socket.emit('student join',{id:window.jeopardy.username, code:window.jeopardy.code});
      React.render( <div> <QA /> <Buzzer /> </div>, document.getElementById('main') )
    }
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
