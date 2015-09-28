//socket Emit functionality
var socket = io();

var Username = React.createClass({
  render: function(){
    return (
      <div>
      <label>Username: </label>
      <input type="text" className="input" id="username" />
      </div>
    )
  }
})

var Roomcode = React.createClass({
  render: function(){
    return (
      <div>
      <label>Game Code: </label>
      <input type="text" className="input" id="roomcode" />
      <div id="status"></div>
      </div>
    )
  }
})


var SubmitButton = React.createClass({
  handleClick: function(event){
    var submitObj = {}
    submitObj.username = $('#username').val();
    submitObj.roomcode = $('#roomcode').val();
    socket.emit('studentLogin', submitObj);
    $('#username').val('');
    $('#roomcode').val('');
    React.render(<p>'Logging In'</p>, document.getElementById('status'))
  },
  render: function() {
    return (
      <div className="login">
        <p onClick={this.handleClick}>
         <a className="btn btn-success btn-lg buzzer" href="#" role="button">Log In</a>
      </p>  
      </div>
    );
  }
});

// initial page render
React.render(
  <div>
    <Username />
    <Roomcode /> 
    <SubmitButton />
  </div>,
  document.getElementById('studentLogin')
);



