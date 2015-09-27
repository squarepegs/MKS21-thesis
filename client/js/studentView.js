//socket Emit functionality
var socket = io();


var buzzClientAppend = function(packet){
    console.log('Student data received: ', JSON.stringify(packet));
  }

//listeners
socket.on('buzzResponse', function (data){
  buzzClientAppend(data);
})

socket.on('sent question', function (data){
  console.log("Your question is", data, JSON.stringify(data)) // DEBUG CODE, REMOVE BEFORE PRODUCTION

})

//dummy student object
var student = {name: 'Billy'}

var buzzClientEmit = function(student){
  console.log('clientside -- Student: ', JSON.stringify(student))
  socket.emit('buzz', student);  // right now we're using the buzzer for multiple testing features. Will change -- bb
  socket.emit('new question', student.room) 
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
    student.room = room;
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
    var timestamp = new Date();
    //timestamp property on student object
    student.timestamp = timestamp;
    //socket emit event
    buzzClientEmit(student);
    this.setState({buzzed: !this.state.buzzed});
  },
  render: function() {
  	var text = this.state.buzzed ? 'YOU BUZZED' : 'BUZZ IN';
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



