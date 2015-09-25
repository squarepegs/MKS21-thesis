//socket Emit functionality
var socketEmit = function(text){
var socket = io();
  socket.emit('buzz', $('#buzz').text());
    return false;
  });
  socket.on('buzz', function (student){
    $('.questionbox').append($('<li>').text(student+' .You answered the question!'));
  })
}

var makeroom = function()
{
    var text = "";
    var possible = "BCDFGHJKLMNPQRSTVWXZ";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var Studentquestion = React.createClass({
  render: function(){
      var question = 'At which point does a question need an answer? (in React)';
    return (
      <div className="questionbox">
        <h4>Question:</h4>
        <h3>{question}</h3>
      </div>
      );
  }
});


var Roomcode = React.createClass({
  render: function(){
    var room = makeroom();
    return (
    <div className="roomcode-info">Your code is: <span className="roomcode">{room}</span></div>
    )
  }
})


var Buzzer = React.createClass({
  getInitialState: function() {
  	return {buzzed: false};
  },
  handleClick: function(event){
    this.setState({buzzed: !this.state.buzzed});
  },
  render: function() {
  	var text = this.state.buzzed ? 'BUZZ IN' : 'YOU BUZZED';
  	return (
  	  <div className="buzz">
        <p onClick={this.handleClick}>
         <a className="btn btn-success btn-lg buzzer" href="#" role="button">{text}</a>
      </p>  
      </div>
  	);
  }
});

React.render(
  <div>
    <Roomcode />
    <Studentquestion />
    <Buzzer />
  </div>,
  document.getElementById('student')
);



