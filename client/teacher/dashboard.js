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

//============================================================================================================
//  Globals for DeckEditor
//------------------------------------------------------------------------------------------------------------
//  these global variables are used in order to pass items from one
//  React component to another, even if they do not have a parent-child relationship.
//  (otherwise we'd use props)
//  globalActiveDeckEditorComponent (React Component) allows "AddQuestion" and "EditQuestion" to have access to DeckEditor's state. 
//  globalActiveDeckQuestions (Array[{},{},...]) is a workaround for a peculiar React bug, where putting 
//  an array of objects inside a state results in losing the values - but not the keys - of the objects in the array. 
//============================================================================================================
var globalActiveDeckEditorComponent = null; 
var globalActiveDeckQuestions = [];
var globalDecksLister = null;


var ShowQuestion = React.createClass({
    edit: function(){
      isEdit = true;
      React.render(
        <EditQuestion edit={isEdit} index={this.props.index} deckID={this.props.deckID} category={this.props.category} value={this.props.value} question={this.props.question} answer={this.props.answer} />
        , document.getElementById('editThisQ' + this.props.index)
      )
    },
    delete:function(){
      globalActiveDeckQuestions.splice(this.props.index, 1);
      globalActiveDeckEditorComponent.showQs();
      console.log("globalActiveDeckQuestions -after delete", globalActiveDeckQuestions)
    },
    render:function(){
      return (
        <div>
           <div className="row"> 
              <div className="col s1">
                <button onClick={this.delete}>Delete</button>
              </div>
              <div className="col s1">
                <button onClick={this.edit}>Edit</button>
              </div>
              <div className="col s2 category">
                {this.props.category}
              </div>
              <div className="col s1 value">
                {this.props.value}
              </div>
              <div className="col s5 question">
                {this.props.question}
              </div>
              <div className="col s2 answer">
                {this.props.answer}
              </div>
            </div>
            <div id={'editThisQ'+this.props.index}></div>
        </div>
    )
  }
})



var EditQuestion = React.createClass({
  getInitialState: function(){
    var newCat = this.props.category || '';
    var newVal = this.props.value || '';
    var newQues = this.props.question || '';
    var newAns = this.props.answer || '';
    return {
      'newCat' : newCat, 
      'newVal' : newVal,
      'newQues' : newQues,
      'newAns' : newAns
    }
  },
  prepNextCat: function(event){
    this.setState({'newCat': event.target.value})
  },
  prepNextVal: function(event){
    this.setState({'newVal': event.target.value})
  },
  prepNextQues: function(event){
    this.setState({'newQues': event.target.value})
  },
  prepNextAns: function(event){
    this.setState({'newAns': event.target.value})
  },
  addQtoDeck: function(){
    var amendedQ = {
        'category': this.state.newCat, 
        'value'   : this.state.newVal, 
        'question': this.state.newQues, 
        'answer'  : this.state.newAns
    } 
    if(this.props.edit){
      globalActiveDeckQuestions[this.props.index] = amendedQ;
    } else {
      globalActiveDeckQuestions.push(amendedQ)
      this.setState({'newCat' : ''})
      this.setState({'newVal' : ''})
      this.setState({'newQues' : ''})
      this.setState({'newAns' : ''})
    }
    globalActiveDeckEditorComponent.showQs();
    console.log("globalActiveDeckQuestions", globalActiveDeckQuestions)
  },
  render: function(){
    return (
      <div ref={this.props.edit ? 'editFields' : 'addFields'} className="addQues row"> 
        <div className="col s1"><label>Category</label><input type="text" className="category" value={this.state.newCat} onChange={this.prepNextCat} />
        </div>
        <div className="col s2"><label>Value</label><input type="text" className="value" value={this.state.newVal} onChange={this.prepNextVal}  />
        </div>
        <div className="input-field col s6"><label>Question</label><textarea className="question materialize-textarea" value={this.state.newQues} onChange={this.prepNextQues} ></textarea>
        </div>
        <div className="col s2"><label>Answer</label><input type="text" className="answer" value={this.state.newAns} onChange={this.prepNextAns}  />
        </div>
        <div className="col s1"><button onClick={this.addQtoDeck}>{this.props.edit ? 'Edit Question' : 'Add Question'}</button>
        </div>
     </div>)
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
      'headers'  : '',
      'quesElements': []
    }
  },
  getInitialQs: function(){
    var context = this;
      $.get('/api/decks/' + this.props.deckID, function(req, res){
        console.log("req", req)
        console.log("req.questions", req.questions);
        context.setState({ 'title' : req.title })
        context.setState({ 'notes' : req.notes })
        console.log("context.state", context.state)
        globalActiveDeckQuestions = req.questions
        context.showQs();
      })

  },
  saveChanges: function(){
    var context = this;
    var newInfo = { 
      'title'    : context.state.title,
      'notes'    : context.state.notes,
      'questions': JSON.stringify(globalActiveDeckQuestions)
    }
    console.log("saving changes", newInfo)
    $.post('/api/decks/' + this.props.deckID, newInfo, function(req, res){
      context.render();
    })
  },
  showQs: function(){
    var quesElements = [];
    for (var i = 0; i < globalActiveDeckQuestions.length; i++){
      quesElements.push(
        <ShowQuestion index={i} key={'' + this.props.deckID + '|index:' + i} value={globalActiveDeckQuestions[i].value} question={globalActiveDeckQuestions[i].question} category={globalActiveDeckQuestions[i].category} answer={globalActiveDeckQuestions[i].answer} />
        )
    }

    var headers = (
      <div key='headers'>
           <div className="row"> 
              <div className="col s1">Delete
              </div>
              <div className="col s1">Edit
              </div>
              <div className="col s2">Category
              </div>
              <div className="col s1">Value
              </div>
              <div className="col s5">Question
              </div>
              <div className="col s2">Answer
              </div>
            </div><div name="addQ"></div>
        </div>
      );
    this.setState({'headers': headers})
    this.setState({ 'quesElements' : quesElements })

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
  componentWillMount: function(){
    this.getInitialQs();
  },
  componentDidMount: function(){
    globalActiveDeckEditorComponent = this;
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
          <hr/>{this.state.headers}{this.state.quesElements}
          <div id="newQEditor"></div>
          <hr/>
        </div>
        <EditQuestion deckID={this.props.deckID}/>
        <button onClick={this.saveChanges}>Save Changes</button>
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
        React.forceUpdate
      })
  },
  editDeck: function(event, deckID){
    if(event){
      deckID = event.target.value;
    }

    React.render(
      <div>
        <DeckEditor deckID={deckID}/>
      </div>,document.getElementById('deckEditor')
    )
  },
  playDeck: function(event){
    sessionStorage.deckID = event.target.value
    console.log("deckID:", sessionStorage.deckID);
    window.location.replace('/teacher')

     },

  getDecks: function(){
    var context = this;
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
          <tr id={'thisRowID:' + req[i]._id} key={req[i]._id}>
            <td><button value={req[i]._id} onClick={context.editDeck}>Edit Deck</button>
            <button value={req[i]._id} onClick={context.killDeck}>DeleteDeck</button></td>
            <td>{req[i].title}</td>
            <td>{req[i].notes}</td>
            <td>{req[i].questions.length}</td>
            <td><button value={req[i]._id} onClick={context.playDeck}>Play this Deck</button></td>
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
            <th>&nbsp;</th>
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
    $.post('/api/decks', query, function(req, res){
      globalDecksList.getDecks();
    })
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

  </div>,
  document.getElementById('main')
);
