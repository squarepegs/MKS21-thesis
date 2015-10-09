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
  getInitialState: function(){
    return {
      username: 'loading', 
      firstName: 'loading',
      lastName: 'loading',
      email: 'loading'
      }
  },
  componentDidMount: function(){
    var context = this;
    $.get('/api/profile', function(req, res){
     if (req.local){
      context.setState({'username': req.local.username});
     }
     if (req.facebook){
      context.setState({'username': req.facebook.name});
     }
      context.setState({'firstName': req.profile.firstName});
      context.setState({'lastName': req.profile.lastName});
      context.setState({'email': req.profile.email});
     });
  },
  prepFirstName: function(event){
    this.setState({'firstName': event.target.value});
  },
  prepLastName: function(event){
    this.setState({'lastName': event.target.value});
  },
  prepEmail: function(event){
    this.setState({'email': event.target.value});
  },
  updateProfile: function(){
    var context = this;
    var query = context.state
    $.post('/api/profile', query, function(req, res){})
    context.setState({'firstName': ''});
    context.setState({'lastName': ''});
    context.setState({'email': ''});
  },
  render:function(){
    return(
      <div>
        <form>
          <fieldset>
            <ul>
              <li>Username: { this.state.username }</li>
              <li>First Name:  <input type="text" value={this.state.firstName} onChange={this.prepFirstName} name="firstName"/>{this.state.firstName}</li>
              <li>Last Name: <input type="text" value={this.state.lastName} onChange={this.prepLastName} name="lastName"/>{this.state.lastName}</li>
              <li>E&ndash;mail: <input type="text" value={this.state.email} onChange={this.prepEmail} name="email"/>{this.state.email}</li>
              <li><p>{this.status}</p><a className="btn" onClick={this.updateProfile}>Update Profile</a></li>
            </ul>
          </fieldset>
        </form>
      </div>
      )
  }
})

var DeckEditor = React.createClass({
  getInitialState: function(){
    return {
      'title'    : '',
      'notes'    : '',
      'questions': [],
      'nextCat'  : '',
      'nextVal'  : '',
      'nextQues' : '',
      'nextAns'  : '',
      'quesElements': []
    }
  },
  saveChanges: function(){
    var context = this;
    var newInfo = { 
      'title'    : context.state.title,
      'notes'    : context.state.notes,
      'questions': JSON.stringify(context.state.questions)
    }
    console.log("saving changes", newInfo)
    $.post('/api/decks/' + this.props.deckID, newInfo, function(req, res){})
  },
  addQ: function(){
    var context = this;
    question = {
      category : this.state.nextCat,
      value    : this.state.nextVal,
      question : this.state.nextQues,
      answer   : this.state.nextAns,
    }
    console.log("this.state", this.state)
    var newQs = this.state.questions;
    newQs.push(question)
    this.setState({questions: newQs})
    setTimeout(console.log(context.state.questions), 2000);
    this.setState({nextCat: '', nextVal: '', nextQues: '', nextAns: ''})
  },
  editQuestion: function(index, property){
    var amendments = this.state.questions;
    amendments[index][property] = event.target.value;
    this.setState({questions: amendments});
  },
  loadQs: function(qs){
    this.setState({'questions': qs})
  },
  showQs: function(){
    var context = this;
        $.get('/api/decks/' + this.props.deckID, function(req, res){
          console.log("req", req)
            console.log("req.questions", req.questions);
            var questions = req.questions.slice();
            context.loadQs(questions);
            context.setState({ 'title' : req.title })
            context.setState({ 'notes' : req.notes })
            console.log("context.state", context.state)
            var quesElements = [];
            for (var i = 0; i < questions.length; i++){
              console.log("run")
              quesElements.push(
                <div key={i}>
                  <fieldset>
                     <div className="row"> 
                        <div className="col s1"><button key={i} onClick={context.clearQ}>Clear</button>
                        </div>
                        <div className="col s1"><input type="text" className="category" name={'ques' + i + 'category'} onChange={context.editQuestion(i, 'category')} defaultValue={questions[i].category}/>
                        </div>
                        <div className="col s2"><input type="text" className="value" name={'ques' + i + 'value'} onChange={context.editQuestion(i, 'value')} defaultValue={questions[i].value}/>
                        </div>
                        <div className="input-field col s6"><textarea className="question" name={'ques' + i + 'question'}  onChange={context.editQuestion(i, 'question')}  defaultValue={questions[i].question}></textarea>
                        </div>
                        <div className="input-field col s2"><input type="text" className="answer" name={'ques' + i + 'answer'} onChange={context.editQuestion(i, 'answer')}  defaultValue={questions[i].answer}/>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                )
          }
context.setState({ 'quesElements' : quesElements })

context.render();
        });

  },
  componentWillMount: function(){
    this.showQs();
  },
  prepNextQues: function(){
    this.setState({'nextQues': event.target.value});
  },
  prepNextAns: function(){
    this.setState({'nextAns': event.target.value});
  },
  prepNextCat: function(){
    this.setState({'nextCat': event.target.value});
  },
  prepNextVal: function(){
    this.setState({'nextVal': event.target.value});
  },
  changeTitle: function(){
    this.setState({'title': event.target.value});
  },
  changeNotes: function(){
    this.setState({'notes': event.target.value});
  },
  render:function(){
    return(
      <div>
        <h3>DeckEditor {this.props.deckID}</h3>
        <div className="row">
          <div className="col s4"><label>Title</label><input type="text" className="title" value={this.state.title} onChange={this.changeTitle}/>
          </div>
          <div className="col s8"><label>Notes</label><textarea className="notes materialize-textarea" value={this.state.notes} onChange={this.changeNotes}></textarea>
          </div>
          <hr/>{this.state.quesElements}
          <hr/>
        </div>
            <div className="addQues row"> 
              <div className="col s1"><label>Category</label><input type="text" className="category" value={this.state.nextCat} onChange={this.prepNextCat} />
              </div>
              <div className="col s2"><label>Value</label><input type="text" className="value" value={this.state.nextVal} onChange={this.prepNextVal}  />
              </div>
              <div className="input-field col s6"><label>Question</label><textarea className="question materialize-textarea" value={this.state.nextQues} onChange={this.prepNextQues} ></textarea>
              </div>
              <div className="col s2"><label>Answer</label><input type="text" className="answer" value={this.state.nextAns} onChange={this.prepNextAns}  />
              </div>
              <div className="col s1"><button onClick={this.addQ}>Add Question</button>
              </div>
           </div>
        <button onClick={this.saveChanges}>Save Changes</button>
        <div name="newQ"></div>
      </div>
      )
  }
})

var MyDecks = React.createClass({
  killDeck: function(event){
    var context = this;
    $.post('/api/killdeck', {'deckID':event.target.value}, function(req, res){
        console.log("callback");
        context.getDecks();
      })
  },
  editDeck: function(event){
    var deckID = event.target.value;

    React.render(
      <div>
        <DeckEditor deckID={deckID}/>
      </div>,document.getElementById('deckEditor')
    )
  },
  getDecks: function(){
    React.render(
      <div>
      </div>
    ,document.getElementById('listOfDecks')
    ) // clear fields
    var context = this;
    $.get('/api/decks', function(req, res){
      console.log('deck req', req, req.length) // req is an array of objects
  
      var elements = [];
      for(var i = 0; i < req.length; i++){
        elements.push(
          <tr key={req[i]._id}>
            <td><button value={req[i]._id} onClick={context.editDeck}>Edit Deck</button>
            <button value={req[i]._id} onClick={context.killDeck}>DeleteDeck</button></td>
            <td>{req[i].title}</td>
            <td>{req[i].notes}</td>
            <td>{req[i].questions.length}</td>
          </tr>
          )
        }
      console.log('elements', elements)
      React.render(
      <div>
        <table>
          <tr>
            <th>&nbsp;</th>
            <th>Title</th>
            <th>Notes</th>
            <th># questions</th>
          </tr>    
          {elements}
        </table>
      </div>
      ,document.getElementById('listOfDecks')
      )
    });
  },
  componentDidMount: function(){
    this.getDecks();
  },
  render:function(){
    return(
      <div>
        <h3>Decks</h3>
        <div id="listOfDecks"></div>
        <div id="deckEditor"></div>
      </div>
      )
  }
})

var CreateDecks = React.createClass({
  getInitialState: function(){
    return {
      title: '',
      notes: '',
      }
  },
  createDeck: function(){
    var context = this;
    var query = context.state
    $.post('/api/decks', query, function(req, res){})
    context.setState({'title': ''});
    context.setState({'notes': ''});
  },
  prepTitle: function(event){
    this.setState({'title': event.target.value});
  },
  prepNotes: function(event){
    this.setState({'notes': event.target.value});
  },
  render:function(){
    return(
      <div>
        <div>
          <label>Deck Name:</label><input type="text" value={this.state.title} onChange={this.prepTitle} name="deckName" />
          <label>Notes:</label><input type="textarea" value={this.state.notes} onChange={this.prepNotes} name="deckNotes" />
          <a className="btn" onClick={this.createDeck}>Create New Deck</a>
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


// React.render(
//   <div>
//     <Tabs />
//     <hr/><hr/>
//     <Profile />
//     <hr/><hr/>
//     <CreateDecks />
//     <hr/><hr/>
//     <CreateQuestion />
//     <hr/><hr/>
//     <Main />
//   </div>,
//   document.getElementById('main')
// );

