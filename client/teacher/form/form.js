var form = {
	fields:[ ],
	username: 'Mrs. Landingham'
}

var fieldObject = {
	question: null,
	pointValue: null,
	answer: null,
}
//---helper functions start---//

var QuestionBox = React.createClass({
	render: function(){
		return (
			<div className="questionBox">
			Hello World Im a question box
			<QuestionForm />
			</div>
		);
	}

});

var QuestionForm = React.createClass({
	render: function() {
		return (
			<div className="commentForm">
			Hello world Im a question form
			</div>
		)
	}
})

var Field = React.createClass({
	render: function(){
		return (
			
		)
	}
})

var onChange = function () {
	React.render(
		<QuestionBox />
	,
	document.getElementById('main')
);
}

onChange();