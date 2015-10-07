var form = {
	fields:[ ],
	username: 'Mrs. Landingham'
}

var fields = {
	question: 'who am i?',
	pointValue: '3',
	answer: 'Juan',
}
//---helper functions start---//

var formObj = {}

var QuestionBox = React.createClass({


	render: function(){
		return (
			<div className="questionBox">
			<QuestionForm fields={this.props.fields} />
			</div>
		);
	}

});

var QuestionForm = React.createClass({
	handleSubmit: function(e){
		e.preventDefault();
		form.fields.push(formObj);
		console.log(form)
	
	},

	render: function() {
		return (
			<form className="questionForm" onSubmit={this.handleSubmit}>
				<FieldList fields={this.props.fields}/>
				<input type="submit" value="Submit" />
			</form>
		)
	}
})

var Field = React.createClass({
	getInitialState: function(){
		return {value: ''}
	},

	handleChange: function(event){
		this.setState({value: event.target.value})
	},

	render: function (){
		var value = this.state.value;
		formObj[this.props.category] = this.state.value;
		console.log(formObj)

		return (
			<div className="field">
			{this.props.category}
			<input type="text" value={value} onChange={this.handleChange}/>
			</div>
		)
	}
})

var FieldList = React.createClass({
	render: function(){
		var fieldNodes = _.map(this.props.fields, function (field, index){
			return (
				<Field key={index} ref={index} category={index}>
				{field}
				</Field>

			);
		});

		return (
			<div className="fieldList">
				{fieldNodes}
			</div>
		)
	}
})

var onChange = function () {

	React.render(
		<QuestionBox fields={fields}/>
	,
	document.getElementById('main')
);
}

onChange();