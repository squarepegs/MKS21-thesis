//socket Emit functionality
var socket = socket ? socket.socket.reconnect() : io();
window.jeopardy = {};
window.activeList = [];
var buzzedIn = [];
var testData = [];
var questionData = {};

console.log('teacher socket: ', socket)

socket.on('error', function (err){
  console.log('this is the error', err);
});
// HELPER FUNCTIONS

var weAlreadyHaveOneOfThese = function(object, key, value){
  for(var ref in object){
    if(object[ref][key] === value){ return true }
  }
  return false
}

var sortByTime = function(a,b){
  if (a.time > b.time) return 1;
  else if (a.time > b.time) return -1;
  else return 0;
};

//
// REACT COMPONENTS:
//
var Room = React.createClass({

  render: function() {
    return (
      <option className="dropdown-item">{this.props.name}</option>
    );
  }
});

var RoomSelect = React.createClass({

  getInitialState: function(){
    return {
      items: [''],
      selected: ''
    }
  },

  componentDidMount: function(){
    socket.on('rooms created', function (allRooms){
      console.log('these are all the rooms available ',allRooms)
      if(this.isMounted()){
        this.setState(function(){
          var rooms = [];
          for (var i = 0; i < allRooms.length; i++){
          rooms.push(allRooms[i]);
          }
          rooms.sort().reverse();
        return {items: rooms}
        })
      }
    }.bind(this))
  },

  clickHandler: function(event){
    if(event.target.value){
      console.log('clicked this', event.target.value)
      this.setState({selected: event.target.value})
      socket.emit('join room', event.target.value);
    }
  },

  render: function() {
    var items = this.state.items.map(function(item, i) {
      return (<Room name={item} key={i} />);
    }.bind(this))
    return (
      <div>
      <select className="browser-default" onChange={this.clickHandler}>
        {items}
      </select>
      </div>
    );
  }
});

var EndGame = React.createClass({

  clickHandler: function(){
    socket.emit('end game', window.jeopardy.code);
    socket.disconnect();
    React.render(
      <div>
        <Main />
        </div>,
      document.getElementById('main'))
  },

  render: function(){
    return (
    <div>
      <button onClick={this.clickHandler}> End Game </button>
    </div>
    )
  }
})

var GameDashboard = React.createClass({


  render:function(){

    return (
    <div id='gameDashboard'>
      <h2 id="roomcode">Your code is: {window.jeopardy.code}</h2>
      <EndGame />
      <QA />
      <NewQ deckID={this.props.deckID} />
      <div className="row">
          <BuzzedInList />
          <ActiveList />  
          <Feedback />
      </div>
    </div>
    )
  }
})




var QA = React.createClass({
  componentDidMount: function(){
    socket.on('teacher question', function(data){
      if (data.question === 'There are no more questions in this deck'){
        console.log("testData", testData)
        testDataString = JSON.stringify(testData)
        $.post('/api/recordTest', {'testData':testDataString}, function(req, res){
          // ???
        })
      } 
      questionData.category = data.category;
      questionData.question = data.question;
      questionData.pointValue = data.value;
      questionData.answer = data.answer;
      questionData.feedbacks = {};

      React.render(
        <div>
          <h4>Category: {data.category} - ${data.value}</h4>
          <div className="card blue-grey darken-1">  
            <div className="card-content white-text">
              <span className="card-title">Question:</span> {data.question}
              <h3>Answer:</h3>
              <h2>{data.answer}</h2>
            </div>
          </div>
        </div>, document.getElementById('question')
        )
    })


  },

  render:function(){
    return (
    <div>
      <h2 id="question"></h2>
    </div>
    )
  },
})


      socket.on('feedback incoming', function(data, deckID){
        console.log("feedback", data)
        if (questionData.feedbacks === undefined){
          questionData.feedbacks = {};
        }
        questionData.feedbacks[data.id] = data.feedback;
      })



var Feedback = React.createClass({
  componentDidMount: function(){
    socket.on('teacher question', function (data){
      feedback = {};
      React.render(
        <div>
          Waiting for feedback
        </div>,document.getElementById('feedback')
        )
    })
    
      socket.on('feedback incoming', function(data, deckID){
        console.log("feedback", data)
        if (questionData.feedbacks === undefined){
          questionData.feedbacks = {};
        }
        questionData.feedbacks[data.id] = data.feedback;
        console.log('after this.feedbacks', questionData.feedbacks, "data", data)

      var elements = [];
      for(var key in questionData.feedbacks){
        elements.push(<li>{key} : {questionData.feedbacks[key]}</li>);
      }

      React.render(
        <div>
          <ol>{elements}</ol>
        </div>,document.getElementById('feedback')
        )

      })
  },

  render:function(){
    return (
    <div className="col s4">
      <h2>Feedback:</h2>
      <div id="feedback"></div>
    </div>
    )
  },
})

var BuzzedInList = React.createClass({
  componentDidMount: function(){
    socket.on('teacher question', function (data){
      buzzedIn = [];
      React.render(
        <div>
          Waiting for buzz...
        </div>,document.getElementById('buzzedIn')
        )
    })
    
    socket.on('buzzed in', function(data){
      if (!weAlreadyHaveOneOfThese(questionData.buzzes, 'id', data.id)){
        console.log("buzzed in data", data)
        buzzedIn.push(data);
        buzzedIn.sort(sortByTime);
        questionData.buzzes = buzzedIn;
        console.log('after this.buzzedIn', buzzedIn, "data", data)
      }

      var elements = [];
      for(var i = 0; i < buzzedIn.length; i++){
        elements.push(<li>{buzzedIn[i].id}</li>);
      }

      React.render(
        <div>
          <ol>{elements}</ol>
        </div>,document.getElementById('buzzedIn')
        )
    })
  },

  render:function(){
    return (
    <div className="col s4">
      <h2>Buzzed in:</h2>
      <div id="buzzedIn"></div>
    </div>
    )
  },
})



 //to be refactored: students stored in local storage and temporary variable used to reconstruct storage as an array localStorage only stores strings

var ActiveList = React.createClass({

  getInitialState: function(){
    return {
      items : ['']
    }
  },

  componentDidMount: function(){

    socket.on('student joined', function (data){
      window.activeList = data;
      console.log('this is the data from students', data)
      console.log('this is the activeList when students join', window.activeList)  
      if(this.isMounted()){
          this.setState(function(){
          var list = []
          for (var i = 0; i < data.length; i++){
          list.push(data[i]);
          }
          return({items: list})
        })
      }
    }.bind(this))

    socket.on('user disconnected', function (student){   
      console.log('this is the list of students at disconnect', window.activeList)
      if(this.isMounted()){
      this.setState(function(){
        var index = window.activeList.indexOf(student)
        if(index !== -1){
          window.activeList.splice(index, 1);
        }
        return({items: window.activeList})
      })
      }
    }.bind(this));
  },

  render:function(){ 
    var items = this.state.items.map(function(item, i) {
      return (<Student name={item} key={i} />);
      }.bind(this))
    return (
    <div className="col s4">
      <h2>Active Players:</h2>
      <ul id="activeList">{items}</ul>
    </div>
    )
  },
})


var Student = React.createClass({

  render: function() {
    return (
      <li className="student">{this.props.name}</li>
    );
  }
});



var NewQ = React.createClass({
  clickHandler: function(){
    console.log("NewQ clicked")
    testData.push(questionData);
    questionData = {};
    questionData.buzzes = {};
    socket.emit('newQ', window.jeopardy.code, this.props.deckID);
  },

  render:function(){
    return (
    <div>
      <button onClick={this.clickHandler}> new question </button>
    </div>
    )
  }
})

var Main = React.createClass({
  componentDidMount: function(){
    socket.on('room code', function (code, deckID){
    window.jeopardy.code = code;
    sessionStorage.deckID = deckID
    React.render(
      <GameDashboard deckID={deckID} />
      ,document.getElementById('main'))
    })
  },

  handleClick: function(){
    window.jeopardy.username = $('#username').val();
    socket.emit('new game',{id:window.jeopardy.username}, sessionStorage.deckID);
  },

  render: function(){
    return (
      <div>
        <label>Username: </label>
        <input type="text" className="input" id="username" />
        <button onClick={this.handleClick}>START NEW GAME</button>
        <div id="Rooms">
        These are the available rooms:
        <RoomSelect />
        </div>
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
