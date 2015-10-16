//socket Emit functionality
var socket = socket ? socket.socket.reconnect() : io();
window.jeopardy = {};
window.activeList = [];
var buzzedIn = [];
var testData = [];
var questionData = {};
var decks = JSON.parse(sessionStorage.decks);

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
    //here we get the deck data back or if there is no deck data we get the data back of all the rooms

    socket.on('rooms created', function (data){
      console.log('these are all the decks available ',data)
      if(this.isMounted()){
        this.setState(function(){
          var rooms = [];
          for (var i = 0; i < data.length; i++){
            if(typeof data[i] === 'object'){
              var bucket = [];
              bucket.push(data[i].title);
              bucket.push(data[i].code);
              bucket.push(data[i].deckID);
              rooms.push(bucket);
            } 
          }
        return {
          items: rooms
        }
        })
      }  
    }.bind(this))
  
  },

  clickHandler: function(event){
    if(event.target.value){
    var selected;

    console.log('this is the state', this.state.items)
      this.setState({selected: event.target.value})
      for(var i = 0; i<this.state.items.length; i++){
        if(this.state.items[i].indexOf(event.target.value) !== -1){
          selected = this.state.items[i]
        }
      }
      console.log('these are the selected values', selected[0], selected[1], selected[2])    
      socket.emit('join room', selected[1], selected[2])
    }
  },

  render: function() {

    var items = this.state.items.map(function (element, i) {
      return (<Room name={element[0]} code={element[1]} deckID={element[2]} key={i} />)}.bind(this));
    
    return (
      <div>
      <select className="browser-default inline" onChange={this.clickHandler}>
        <option className="dropdown-item" value="" disable selected></option>
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
      <a href="#" className="btn red darken-2 wide-btn" onClick={this.clickHandler}>End Game</a>
    </div>
    )
  }
})

var GameDashboard = React.createClass({


  render:function(){

    return (
    <div id='gameDashboard'>
      <div className="row headroom-whitespace">
        <div className="col s6 flow-text center" id="roomcode">
        <span className="brand-logo">Digi<span className="orange-text">Quiz</span></span>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          Your code is: {window.jeopardy.code}
        </div>
        <div className="col s4">
          <NewQ deckID={this.props.deckID} />
          </div>
      </div>
      <div className="row">
          <div className="col s4">
            <ActiveList />  
            <BuzzedInList />
            <Feedback />
            <EndGame />
          </div>
          <QA />

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
      questionData.rootTime = Date.now();


      React.render(
        <div className="col s8">
          <div className="card blue-grey flow-text lighten-1">
          <div className="card-content white-text">
          <div className="card-title">Category:</div>{data.category.toUpperCase()} - ${data.value}</div></div>
          <div className="card blue-grey flow-text darken-1">  
            <div className="card-content white-text">
              <div className="card-title">Question:</div>{data.question.toUpperCase()}
              </div>
              </div>

            <div className="card blue-grey flow-text darken-2">  
            <div className="card-content white-text">
              <div className="card-title">Answer:</div>{data.answer.toUpperCase()}
      

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

    <div className="row card teal darken-2">
      <div className="card-content flow-text white-text">
        <div className="card-title">Live Feedback:</div>
        <div id="feedback"></div>
      </div>
    </div>    )
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
    <div className="row card teal darken-1">
      <div className="card-content flow-text white-text">
        <div className="card-title">Buzzed in:</div>
        <div id="buzzedIn"></div>
      </div>
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

    <div className="row card teal">
      <div className="card-content flow-text white-text">
        <div className="card-title">Active Players:</div>
        <ul id="activeList">{items}</ul>
      </div>
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
      <a href="#" className="btn wide-btn" onClick={this.clickHandler}>Next Question</a>
    </div>
    )
  }
})

var Main = React.createClass({
  componentDidMount: function(){
    if(decks !== undefined){
      socket.emit('decks', decks);
    }

    socket.on('room code', function (code, deckID){
    window.jeopardy.code = code;
    sessionStorage.deckID = deckID
    React.render(
      <GameDashboard deckID={deckID} />
      ,document.getElementById('main'))
    })
  },

  handleClick: function(){
    window.jeopardy.username = 'depreciated';
    socket.emit('new game',{id:'depreciated'}, sessionStorage.deckID);
  },

  render: function(){
    return (
      <div className='container'>

          <div className="row">
            <div className="col s3 flow-text">
            <span className="brand-logo">
              Digi
              <span className="orange-text">
                Quiz
              </span>
            </span>
            </div>
            <div className="col s9 align-center">
              <a href="#" className="btn" onClick={this.handleClick}>START NEW GAME</a>
            </div>
          </div>
          <div ClassName="row">
            Existing rooms:
          </div>
          <div id="Rooms" ClassName="row">
            <RoomSelect />
          </div>

      </div>
    )
  }
})


// initial page render
React.render(
  <div className="headroom-whitespace">
    <Main />
  </div>,
  document.getElementById('main')
);
