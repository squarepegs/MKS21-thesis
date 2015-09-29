//socket Emit functionality
var socket = io();

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
    io.on('newQ', function(data){
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

var NewQ = React.createClass({
  render:function(){
    return (
    <div> 
      <button onClick={this.clickHandler}/>
    </div>
    )
  },
  clickHandler: function(){
    io.emit('new-Q',code)
  }
})

var Main = React.createClass({
  handleClick: function(){
    window.jeopardy.username = $('#username').val();
    io.emit('new-game',{username:window.jeopardy.username});
    React.render(
      <Dashboard />
      ,document.getElementById('main'))
  },
  render: function(){
    io.on('made-game', function(data){
      code = data;
      React.render(<Dashboard />, document.getElementById('main'));
    })
    return (
      <div>
        <label>Username: </label>
        <input type="text" className="input" id="username" />
        <p onClick={this.handleClick}>new game</p>
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
    <Main />
  </div>,
  document.getElementById('main')
);
