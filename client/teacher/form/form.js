var form = {
	fields:{
		question: null,
		answer: null,
		pointValue: null
	},
	username: null
}

//---helper functions start---//

//adds a field to the form
var onAddField = function(value, index){
	var field = {value: value, index: index}
	form.fields[index] = value;
	onChange(); 

}
//detects a change in the form; if there'se a field, then the form changes
var onChangeField = function(value, index){
	var field = _.find(form.fields, function (field) {
		return field.index === index
	});
	if (field){
		form.fields[index] = value;
	}
	onChange();
}


//--helper functions end---//

//---Form creation functions start---//
var FieldCreate = React.createClass({
	render: function (){
		var fieldValue = this.props.fieldValue
		var index = this.props.index
		return (
			<div  className="form-field">
						{index}
			  <input type="text" value={fieldValue}/>
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
				_.map(fields, function (field, index){
					console.log('these are the keys that must be fed', index)
					return (
						<FieldCreate	key={index} index={index}fieldValue={field} />
					)
				})
			}
			</div>
		);
	}
})

// var AnswerEditor = React.createClass({
// 	onChange : function (event){
// 		this.props.onChange(this.props.field.index, event.target.value);
// 		render: function () {
// 			return (
// 			)
// 		}
// 	}

// })

//---Form creation functions end ---//
var name = 'Moe';

var onChange = function () {
	React.render(
		<QuestionFormCreate form={form} onChangeField={onChangeField} onAddField={onAddField} />
	,
	document.getElementById('main')
);
}

onChange();