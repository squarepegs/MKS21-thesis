//socket Emit functionality
var socket = socket ? socket.socket.reconnect() : io();
window.jeopardy = {};
var activeList = [];
var buzzedIn = [];
var testData = [];
var questionData = {};

console.log('teacher socket: ', socket)

socket.on('error', function (err){
  console.log('this is the error', err);
});

var sortByTime = function(a,b){
  if (a.time < b.time) return 1;
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
        console.log('this is the value of state.items after push', this.state.items)
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
  // componentDidMount:function(){
  //   socket.on('disconnect', function (user){
  //   console.log('someone has disconnected from the server')
  //     if(socket.disconnected===true){
  //     React.unmountComponentAtNode(document.getElementById('main'));
  //     } 
  //   console.log(user, " has left the game");
  //   })   
  // },
  
  clickHandler: function(){
    socket.emit('end game', window.jeopardy.code);
  },

  render: function(){
    return (
    <div>
      <button onClick={this.clickHandler}> End Game </button>
    </div>
    )
  }
})

var Dashboard = React.createClass({


  render:function(){
    console.log('this should be the code', window.jeopardy.code)
    return (
    <div>
      <h2 id="roomcode">Your code is: {window.jeopardy.code}</h2>
      <EndGame />
      <QA />
      <NewQ deckID={this.props.deckID} />
      <BuzzedInList />
      <ActiveList />
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

      React.render(
        <div>
          <h4>Category: {data.category} - ${data.value}</h4>
          <h3>Question:</h3>
          <h2>{data.question}</h2>
          <h3>Answer:</h3>
          <h2>{data.answer}</h2>
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
      if (buzzedIn.indexOf(data) === -1){
        console.log("buzzed in data", data)
        buzzedIn.push(data);
        buzzedIn.sort(sortByTime);
        questionData.buzzes = buzzedIn;
      }
      console.log('after this.buzzedIn', buzzedIn, "data", data)

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
    <div>
      <h2>Buzzed in:</h2>
      <p id="buzzedIn"></p>
    </div>
    )
  },
})



var ActiveList = React.createClass({

  componentDidMount: function(){
    socket.on('student joined', function (data){
      console.log("student data on joined (data)", data)
    
    console.log("activeList, ", activeList);
      activeList.push(data);
      questionData.activeList = activeList;

    var elements = [];
    for(var i = 0; i < activeList.length; i++){
        elements.push(<li>{activeList[i]}</li>);
      }

    React.render(
      <div>
        <ul>{elements}</ul>
      </div>,document.getElementById('activeList')
      )
    })
    socket.on('user disconnected', function (student){
      var index = activeList.indexOf(student);
      if(index !== -1){
        activeList.splice(index, 1);
      var elements = [];
        for(var i = 0; i < activeList.length; i++){
          elements.push(<li>{activeList[i]}</li>);
        }
      React.render(
        <div>
          <ul>{elements}</ul>
        </div>,document.getElementById('activeList')
      )
      }
    })
  },

  render:function(){
    return (
    <div>
      <h2>Active Players:</h2>
      <p id="activeList"></p>
    </div>
    )
  },
})


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
    socket.on('room code', function (code){
      console.log('these are the rooms i am in', socket)
      console.log('this is the deck I am playing', deckID)
    window.jeopardy.code = code;
    React.render(<GameDashboard deckID={deckID} />, document.getElementById('main'));
    })
  },

  handleClick: function(){
    console.log("deckID:", sessionStorage.deckID)
    testDataIndex = 0;
    testData = [];
    socket.emit('new game', {id:window.jeopardy.username}, sessionStorage.deckID);
    React.render(
      <GameDashboard deckID={sessionStorage.deckID} />
      ,document.getElementById('main'))
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
