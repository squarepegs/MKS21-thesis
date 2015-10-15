
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
var feedbackByCategory = function(testData) {
  var categoryBucket = {}
  for (var q = 0; q < testData.length; q++) { // q = question
    if (categoryBucket[testData[q].category] === undefined) {
      categoryBucket[testData[q].category] = {};
    }
    for (var player in testData[q].feedbacks) {
      if (categoryBucket[testData[q].category][player] === undefined) {
        categoryBucket[testData[q].category][player] = [testData[q].feedbacks[player]]
      } else {
        if (testData[q].feedbacks[player]) {
          categoryBucket[testData[q].category][player].push(testData[q].feedbacks[player])
        }
      }
    }
  }
  return categoryBucket;
}
var getChartData = function() {
  $.get('/api/getTestData', function(req, res) {
    var text = document.getElementById("barChart").getContext("2d");
    console.log("tests req", req);
    testData = req[0].testData.slice(1);
    // average score per category for player
    var byCategory = feedbackByCategory(testData);
    console.log(byCategory);
    var displayData = {};
    displayData.datasets = [];
    displayData.labels = [];
    playerAverages = {};
    for (var category in byCategory) {
      playerAverages[category] = [];
      displayData.labels.push(category);
      for (var player in byCategory[category]) {
        console.log("byCategory[category][player]", byCategory[category][player], "category", category, "player", player)
        var avg = byCategory[category][player].reduce(function(a, b) {
          return a + b;
        }) / byCategory[category][player].length
        if (playerAverages[player]  === undefined){
          playerAverages[player] = [avg];
        } else {
        playerAverages[player].push(avg)
        }
        console.log(playerAverages)
      }
      console.log("averages for " + category, playerAverages[category])
    }

  for (var category in playerAverages){
    for (var player in playerAverages[category])
      var playerArray.push(playerAverages[category][player])
    }
  }

        displayData.datasets.push({
          labels: category,
          fillColor: "rgba(220,220,220,0.6)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: playerArray
      })


    var recoveredBarChart = new Chart(text).Bar(displayData);
  });
}

$(document).ready(function() {
  getChartData();
});