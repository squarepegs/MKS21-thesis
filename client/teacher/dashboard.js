//socket Emit functionality
var socket = io();
window.jeopardy = {};

socket.on('error', function(){
  alert("there was a server error. Please try starting a new session.");
});

var sortByTime = function(a,b){
  if (a.time < b.time) return 1;
  else if (a.time > b.time) return -1;
  else return 0;
};

//
// REACT COMPONENTS:
//

var Tabs = React.createClass({
  launch:function(){
    console.log('launch')
  },
   decks:function(){
    console.log('decks')
  },
   createDecks:function(){
    console.log('createDecks')
  },
   classData:function(){
    console.log('classData')
  },
   studentData:function(){
    console.log('studentData')
  },
   myProfile:function(){
    console.log('myProfile')
  },
  render:function(){
    return (
    <div>
      <button onClick={this.launch}>Launch Game</button>
      <button onClick={this.decks}>My Decks</button>
      <button onClick={this.createDecks}>Create Decks</button> 
      <button onClick={this.classData}>Class Data</button>
      <button onClick={this.studentData}>Student Data</button>
      <button onClick={this.myProfile}>My Profile</button>
    </div>
    )
  }
})

var Profile = React.createClass({
  profile: {},
  getProfile: function() {
    // session is not defined
    $.get('/api/profile', user, function(req, res){
      console.log('success', req.user, req.user.id)
      // this.profile.firstName = user.firstName;
      // this.profile.lastName = user.lastName;
      // this.profile.email = user.email;
    })
    // return {
    //   username: '',
    //   lastGistUrl: ''
    // };
  },
  updateProfile: function(){
    // if ($('#firstName').val()) {
    //   this.profile.firstName = $('#firstName').val();
    // }
    // if ($('#lastName').val()) {
    //   this.profile.lastName = $('#lastName').val();
    // }
    // if ($('#email').val()) {
    //   this.profile.email = $('#email').val();
    // }
    // $.post('/api/updateProfile', this.profile, function(null, user){
    //   console.log('success', user)
    // })
    
  },
  render:function(){
    return(
      <div>
        <form>
          <fieldset>
            <ul>
              <li>Username: {window.jeopardy.username || 'username'}</li>
              <li>First Name: {window.jeopardy.username || 'firstname'} &mdash;&mdash;  <input type="text" name="firstName"/><button>Change First Name</button></li>
              <li>Last Name: {window.jeopardy.username || 'lastname'} &mdash;&mdash;  <input type="text" name="lastName"/><button>Change Last Name</button></li>
              <li>E&ndash;mail: {window.jeopardy.username || 'email'} &mdash;&mdash;  <input type="text" name="email"/><button>Change E&ndash;mail</button></li>
              <li><a className="btn" onClick={this.getProfile}>Update Profile</a></li>
            </ul>
          </fieldset>
        </form>
      </div>
      )
  }
})

var MyDecks = React.createClass({
  render:function(){
    return(
      <div>
        <ul>
          <li>List Decks Here</li>
        </ul>
      </div>
      )
  }
})

var CreateDecks = React.createClass({
  render:function(){
    return(
      <div>
        <div>
          <label>Deck Name:</label><input type="text" name="deckName" />
          <label>Notes:</label><input type="textarea" name="deckNotes" />
          <button>Start New Deck</button>
          <div id="questionArea">QuestionArea</div>
        </div>
      </div>
      )
  }
})

// needed for CreateQuestion's select tag

var CreateQuestion = React.createClass({
  componentDidMount: function(){
        $('select').material_select();
  },
  render:function(){
    return(
      <div>
        <div>
          <div className="input-field col s12">
          <select>
            <option value="" disabled defaultValue>Choose QuestionType</option>
            <option value="Jeopardy">Jeopardy</option>
            <option value="Multiple Choice">Multiple Choice</option>
            <option value="Hangman">Hangman</option>
          </select>
          <label>Question Type: </label> 
        </div>
          <label>Category: </label><input type="text" name="category" />
          <label>Question: </label><input type="text" name="question" />
          <label>Answer: </label><input type="text" name="answer" />
          <label>Points: </label><input type="text" name="points" />

          <button>Add Question To Deck</button>
        </div>
      </div>
      )
  }
})


var ListQuestions = React.createClass({
  questions: [],
  render:function(){
    // socket.on('update-list', function(data){
    //   this.activeList = data;
    //   console.log("this.activeList, data: ", this.activeList, data)
    //   var elements = [];
    //   for(var i = 0; i < this.activeList.length; i++){
    //     elements.push(<li>{this.activeList[i]}</li>);
    //   }

    //   React.render(
    //     <div>
    //       <ul>{elements}</ul>
    //     </div>,document.getElementById('questionList')
    //   )
    // })
    return (
    <div>
      <h2>Questions</h2>
      <p id="questionList"></p>
    </div>
    )
  },
})


var Dashboard = React.createClass({
  render:function(){
    return (
    <div>
      <h2 id="roomcode">Your code is: {window.jeopardy.code}</h2>
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
    socket.on('asked-question', function(data){
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

var BuzzedInList = React.createClass({
  buzzedIn: [],
  render:function(){
    socket.on('asked-question', function(data){
      this.buzzedIn = [];
      React.render(
        <div>
          Waiting for buzz...
        </div>,document.getElementById('buzzedIn')
        )
    })
    socket.on('buzzed-in', function(data){
      if (this.buzzedIn.indexOf(data.username) === -1){
        this.buzzedIn.push(data.username);
        this.buzzedIn.sort(sortByTime);
      }
      console.log('after this.buzzedIn', this.buzzedIn, "data", data)

      var elements = [];
      for(var i = 0; i < this.buzzedIn.length; i++){
        elements.push(<li>{this.buzzedIn[i]}</li>);
      }

      React.render(
        <div>
          <ol>{elements}</ol>
        </div>,document.getElementById('buzzedIn')
        )
    })
    return (
    <div>
      <h2>Buzzed in:</h2>
      <p id="buzzedIn"></p>
    </div>
    )
  },
})

var ActiveList = React.createClass({
  activeList: [],
  render:function(){
    socket.on('update-list', function(data){
      this.activeList = data;
      console.log("this.activeList, data: ", this.activeList, data)
      var elements = [];
      for(var i = 0; i < this.activeList.length; i++){
        elements.push(<li>{this.activeList[i]}</li>);
      }

      React.render(
        <div>
          <ul>{elements}</ul>
        </div>,document.getElementById('activeList')
      )
    })
    return (
    <div>
      <h2>Active Players:</h2>
      <p id="activeList"></p>
    </div>
    )
  },
})


var NewQ = React.createClass({
  render:function(){
    return (
    <div>
      <button onClick={this.clickHandler}> new question </button>
    </div>
    )
  },
  clickHandler: function(){
    socket.emit('newQ',{code: window.jeopardy.code});
  }
})

var Main = React.createClass({
  handleClick: function(){
    window.jeopardy.username = $('#username').val();
    socket.emit('new-game',{username:window.jeopardy.username});
    React.render(
      <Dashboard />
      ,document.getElementById('main'))
  },
  render: function(){
    socket.on('made-game', function(data){
      window.jeopardy.code = data.code;
      React.render(<Dashboard />, document.getElementById('main'));
    })
    return (
      <div>
        <label>Username: </label>
        <input type="text" className="input" id="username" />
        <button onClick={this.handleClick}>START NEW GAME</button>
        <div id="status"></div>
      </div>
    )
  }
})



// initial page render
React.render(
  <div>
    <Tabs />
    <hr/><hr/>
    <Profile />
    <hr/><hr/>
    <MyDecks />
    <hr/><hr/>
    <CreateDecks />
    <hr/><hr/>
    <CreateQuestion />
    <hr/><hr/>
    <Main />
  </div>,
  document.getElementById('main')
);
