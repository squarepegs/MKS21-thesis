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

  React.render(
    <div className="question">
    <h4>{data.category.toUpperCase()} - ${data.value}</h4>
    <h3>{data.question}</h3>
    </div>,
    document.getElementById('question')
  ); // this will replace the <h4> found in "Studentquestion"


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

    for( var i=0; i < 4; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var Studentquestion = React.createClass({
    render: function(){
    return (
      <div className="questionbox">
        <h4 id="question">Question:</h4>

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

// initial page render
React.render(
  <div>
    <Roomcode />
    <Studentquestion /> 
    <Buzzer />
  </div>,
  document.getElementById('student')
);



