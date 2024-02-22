// student.js

var socket = io();
// window.jeopardy is used to locally store question information as well as the state of the buzzer, so that users can't buzz in more than once.
window.jeopardy = {
  buzzed: false,
  question: {}
};

// -----------------------
// REACT COMPONENTS: 
// -----------------------
// *Initial Render: <div id="main">
//   └┬─Main
//    ├──QA
//    ├──Buzzer
//    └──Feedback
//
// -----------------------

var Main = React.createClass( {
  componentDidMount: function () {
    socket.on( 'student joined', function ( host ) {
      console.log( "you joined " + host + "'s room" );
      React.render( <div>
                      <QA />
                      <Buzzer />
                      <Feedback />
                    </div>, document.getElementById( 'main' ) )
    } )
    socket.on( 'disconnect', function () {
      if ( socket.disconnected === true ) {
        // Console.logs for adding functionality later. 
        console.log( window.jeopardy.username + ", you have been disconnected from the game session" )
      }
      if ( socket.connected === true ) {
        console.log( 'someone has disconnected from the server' )
      }
    } )
  },
  handleClick: function () {
    window.jeopardy.username = $( '#username' ).val(); // We need to store the username because this field will be removed from the DOM on submit.
    window.jeopardy.code = $( '#code' ).val().toUpperCase(); // jQuery is sometimes easier to use than manipulation React state/props
    if ( window.jeopardy.username.length < 1 ) alert( "Please enter a username." );
    else socket.emit( 'student join', {
        id: window.jeopardy.username,
        code: window.jeopardy.code
      } );
    React.render( <div>
                    <QA />
                    <Buzzer />
                  </div>, document.getElementById( 'main' ) ) // This basically replaces the entire page. 
  },
  render: function () {
    return (
    <div className="signin">
      <h1>Sign in to play:</h1>
      <label>
        Username:
      </label>
      <input
         type="text"
         className="input"
         placeholder="Choose a Username"
         id="username" />
      <label>
        Code:
      </label>
      <input
         type="text"
         className="input"
         placeholder="Enter Your Code"
         id="code" />
      <a
         onClick={ this.handleClick }
         className="waves-effect waves-light btn-large"><i className="material-icons right">play_arrow</i>Join Game</a>
      <div id="status"></div>
    </div>
    )
  }
} )


var QA = React.createClass( {
  getInitialState: function () {
    return {
      category: '',
      question: 'Waiting for Question',
      value: '',
      buzzed: false
    }
  },
  componentDidMount: function () {
    var context = this;
    socket.on( 'student question', function ( data ) {
      // Reset the text and color every time there's a question. 
      $( '#buzzer' ).removeClass( "red darken-3" );
      $( '#buzzer' ).text( 'Buzz in!' );
      context.setState( { category: data.category.toUpperCase() } )
      context.setState( { value: data.value } )
      context.setState( { question: data.question.toUpperCase() } )
      context.setState( { buzzed: false } ) // reset the buzz state. 
    } )
    socket.on( 'buzz', this.setState( { buzzed: true } ) )
  },
  render: function () {
    return (
    <div className="container">
      <div className="jep-panel yellow-text blue darken-4 card-panel flow-text">
        <div className="flow-text white-text category">
          <strong>{ this.state.category } - ${ this.state.value }</strong>
        </div>
        <div className="flow-text question">
          { this.state.question }
        </div>
      </div>
    </div>
    )
  }
} );

var Buzzer = React.createClass( {
  getInitialState: function () {
    return { clicked: false }
  },
  componentDidMount: function () {
    socket.on( 'end game', function ( room ) {
      socket.disconnect();
      React.render(
        <div className="container">
          <Main />
        </div>,
        document.getElementById( 'main' )
      ) // reset the page. 
    } )

  },
  clickHandler: function () {
    // Change the buzzer's color to let student know they have buzzed in.
    $( '#buzzer' ).addClass( "red darken-3" );
    $( '#buzzer' ).text( 'BUZZ!' );
    socket.emit( 'buzz', {
      code: window.jeopardy.code,
      time: Date.now(),
      id: window.jeopardy.username
    } );
  },
  render: function () {
    return (
    <div className="buzzer center-align valign-wrapper">
      <a
         className="waves-effect center-align valign waves-light btn-large"
         id="buzzer"
         onClick={ this.clickHandler }>Buzz in!</a>
    </div>
    )
  }
} )

var Feedback = React.createClass( {
  getInitialState: function () {
    // On/Off don't ever change, so they might be props. 
    return {
      feedback: 0,
    }
  },
  componentDidMount: function () {
    var context = this;
    socket.on( 'student question', function ( data ) {
      context.setState( { 'feedback': 0 } )
    } )
  },
  setFeedback: function ( feedback ) {
    this.setState( { 'feedback': feedback } )
    socket.emit( 'send feedback', {
      'feedback': feedback,
      id: window.jeopardy.username
    } )
  },
  oneStar: function () {
    this.setFeedback( 1 )
  },
  twoStar: function () {
    this.setFeedback( 2 )
  },
  threeStar: function () {
    this.setFeedback( 3 )
  },
  fourStar: function () {
    this.setFeedback( 4 )
  },
  fiveStar: function () {
    this.setFeedback( 5 )
  },
  render: function () {
    var on = '/client/images/star_on.png';
    var off = '/client/images/star_off.png';
    // hmm... can we write this more DRYly? 
    return (
    <div className="container">
      <h4>How difficult was this question?</h4>
      <div className="starBox row">
        <div className="col s1">
          Less Difficult
        </div>
        <div className="col s2">
          <img
           name="star1"
           className="star"
           onClick={ this.oneStar }
           src={ this.state.feedback >= 1 ? on : off }></img>
        </div>
        <div className="col s2">
          <img
           name="star2"
           className="star"
           onClick={ this.twoStar }
           src={ this.state.feedback >= 2 ? on : off }></img>
        </div>
        <div className="col s2">
          <img
           name="star3"
           className="star"
           onClick={ this.threeStar }
           src={ this.state.feedback >= 3 ? on : off }></img>
        </div>
        <div className="col s2">
          <img
           name="star4"
           className="star"
           onClick={ this.fourStar }
           src={ this.state.feedback >= 4 ? on : off }></img>
        </div>
        <div className="col s2">
          <img
           name="star5"
           className="star"
           onClick={ this.fiveStar }
           src={ this.state.feedback >= 5 ? on : off }></img>
        </div>
        <div className="col s1">
          More Difficult
        </div>
      </div>
    </div>
    )
  }
} )


// initial page render
React.render(
  <div className="container">
    <Main />
  </div>,
  document.getElementById( 'main' )
);
