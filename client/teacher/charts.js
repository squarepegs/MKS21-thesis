$( document ).ready(function() {
	var ctx = document.getElementById("lineChart").getContext("2d");
  var text = document.getElementById("barChart").getContext("2d");
  

	var data = {
		labels: ["John", "Fred", "Mary", "April", "David", "Jack", "Tomas"],
	    datasets: [
	        {
	            label: "Total Questions",
	            fillColor: "rgba(220,220,220,0.6)",
	            strokeColor: "rgba(220,220,220,1)",
	            pointColor: "rgba(220,220,220,1)",
	            pointStrokeColor: "#fff",
	            pointHighlightFill: "#fff",
	            pointHighlightStroke: "rgba(220,220,220,1)",
	            data: [20, 20, 20, 20, 20, 20, 20]
	        },

	        {
	            label: "Questions Attempted",
	            fillColor: "rgba(220,220,220,0.2)",
	            strokeColor: "rgba(220,220,220,1)",
	            pointColor: "rgba(220,220,220,1)",
	            pointStrokeColor: "#fff",
	            pointHighlightFill: "#fff",
	            pointHighlightStroke: "rgba(220,220,220,1)",
	            data: [12, 19, 10, 14, 8, 9, 18]
	        },

	        {
	            label: "Questions Correct",
	            fillColor: "rgba(151,187,205,0.2)",
	            strokeColor: "rgba(151,187,205,1)",
	            pointColor: "rgba(151,187,205,1)",
	            pointStrokeColor: "#fff",
	            pointHighlightFill: "#fff",
	            pointHighlightStroke: "rgba(151,187,205,1)",
	            data: [10, 15, 5, 9, 6, 7, 10]
	        }
	    ]
	};

	var time = {
		labels: ["January", "February", "March", "April", "May", "June", "July"],
	    datasets: [
	        {
	            label: "Aggregate Attempted",
	            fillColor: "rgba(220,220,220,0.2)",
	            strokeColor: "rgba(220,220,220,1)",
	            pointColor: "rgba(220,220,220,1)",
	            pointStrokeColor: "#fff",
	            pointHighlightFill: "#fff",
	            pointHighlightStroke: "rgba(220,220,220,1)",
	            data: [65, 59, 80, 81, 56, 55, 40]
	        },
	        {
	            label: "Aggregate Correct",
	            fillColor: "rgba(151,187,205,0.2)",
	            strokeColor: "rgba(151,187,205,1)",
	            pointColor: "rgba(151,187,205,1)",
	            pointStrokeColor: "#fff",
	            pointHighlightFill: "#fff",
	            pointHighlightStroke: "rgba(151,187,205,1)",
	            data: [28, 48, 40, 19, 36, 37, 40]
	        }
	    ]
	};



	var myLineChart = new Chart(ctx).Line(time);
	var mybarChart = new Chart(text).Bar(data);
	
});
