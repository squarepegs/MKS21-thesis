//socket Emit functionality
var socket = io();

var Username = React.createClass({
  render: function(){
    return (
      <div>
      <label>Username: </label>
      <input type="text" className="input" id="username" />
      <input type="password" className="password" id="password" />
      <div id="status"></div>
      </div>
    )
  }
})


var SubmitButton = React.createClass({
  getInitialState: function() {
    return {buzzed: false};
  },

  handleClick: function(event){
    window.jeopardy = {};
    window.jeopardy.username = $('#username').val();
    window.jeopardy.password = $('#password').val();
    $('#username').val('');
    $('#password').val('');
    React.render(<p>'Logging In'</p>, document.getElementById('status'))
    window.location.href = '/dashboard/' + window.jeopardy.username;
  },
  render: function() {
    return (
      <div className="login">
        <p onClick={this.handleClick}>
         <a className="btn btn-success btn-lg buzzer" href="#" role="button">Go To My Dashboard</a>
      </p>  
      </div>
    );
  }
});

// initial page render
React.render(
  <div>
    <Username />
    <SubmitButton />
  </div>,
  document.getElementById('teacherLogin')
);



