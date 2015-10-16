$(document).ready(function() {
  getChartData();
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
  // var mybarChart = new Chart(text).Bar(data);
});
var getParticipants = function(test) {
  console.log(test);
  output = {};
  retOutput = [];
  for (var i = 0; i < test.length; i++) {
    for (var key in test[i].feedbacks) {
      output[key] = true
    }
  }
  for (var otherKey in output) {
    retOutput.push(otherKey);
  }
  return retOutput;
}
var getChartData = function() {
  $.get('/api/getTestData', function(req, res) {
    var text = document.getElementById("barChart").getContext("2d");
    console.log("tests req", req);
    testData = req[0].testData.slice(1);

    console.log("req[0].testData", req[0].testData);
    displayData = {}
    displayData.labels = getParticipants(testData);
    displayData.datasets = []
    for (var j = 0; j < displayData.labels.length; j++) {
      var feedbackScores = {};
      feedbackScores[displayData.labels[j]] = [];
      for (var i = 0; i < testData.length; i++) {
        feedbackScores[displayData.labels[j]].push(testData[i].feedbacks[displayData.labels[j]])
      }
      displayData.datasets[j] = {
        label: displayData.labels[j],
        fillColor: "rgba(220,220,220,0.6)",
        strokeColor: "rgba(220,220,220,1)",
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: feedbackScores[displayData.labels[j]]
      }
    }


    var recoveredBarChart = new Chart(text).Bar(displayData);


  });
}