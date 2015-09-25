var Buzzer = React.createClass({
  getInitialState: function() {
  	return {buzzed: false};
  },
  handleClick: function(event){
    this.setState({buzzed: !this.state.buzzed});
  },
  render: function() {
  	var text = this.state.buzzed ? 'Buzz In' : 'Answer Question';
  	return (
  	  <p onClick={this.handleClick}>
        you {text} this. Click to Buzz In.
      </p>  
  	);
  }
});

React.render(
  <Buzzer />,
  document.getElementById('student')
);