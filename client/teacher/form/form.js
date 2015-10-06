var form = {
	fields:{
		question: "Who is your daddy?",
		answer: "Johannes Kepler",
		pointValue: "3.14"
	},
	username: null
}

//---helper functions start---//

var onChangeField = function(value){

}


//--helper functions end---//

//---Form creation functions start---//
var FieldCreate = React.createClass({
	render: function (){
		var userField = this.props.userField
		return (
			<div  className="form-field">
						{userField}
				<input type="text" value={userField}/>
			</div> 
		)
	}
})

var QuestionFormCreate = React.createClass({
	render: function(){
		var fields = this.props.form.fields
		return (
			<div className="form-fields">
			{
				_.map(fields, function (field, key){
					return (
						<FieldCreate	key={key} userField={field} />
					)
				})
			}
			</div>
		);
	}
})

//---Form creation functions end ---//
var name = 'Moe';

var onChange = function () {
	React.render(
		<QuestionFormCreate form={form} onChangeField={onChangeField} />
	,
	document.getElementById('main')
);
}

onChange();