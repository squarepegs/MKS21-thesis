require('./test-setup')('<html><body></body></html>')

var React 			= require('react/addons')
	, TodoItem		=	require('./checkBox')
	,	TestUtils 	= React.addons.TestUtils
	,	assert			=	require('assert')



describe('Todo-item component', function(){

	before('render and locate element', function(){
		var renderedComponent = TestUtils
				.renderIntoDocument(
				<TodoItem done={false} name="Write Tutorial"/>
				);
		var inputComponent = TestUtils
				.findRenderedDOMComponentWithTag(
					renderedComponent,
					'input'
				);
		this.inputElement = inputComponent.getDOMNode();
	});

	it('<input> should be of type "checkbox"', function(){
		assert(this.inputElement.getAttribute('type') === 'checkbox')	
	});

	it('<input> should not be checked', function() {
    assert(this.inputElement.checked === false);
  });

});