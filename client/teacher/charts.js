// We used Charts.js because we found it to be easiest to use, but if we had the time
// we would refactor using D3, as that framework may be more difficult to work with
// but would also have more options and customization. 

$(document).ready(function() {
  getChartData();
});
var getChartData = function(dataID) {
  $.get('/api/getTestData', function(req, res) {
    console.log(req);
    var text = document.getElementById("barChart").getContext("2d");
    testData = req[0].testData.slice(1); // when we have multiple tests, we need to change this line. 
    var displayData = {}
    var categories = []
    var players = {}
      // parse the data into an object
      // that lists people by player -- category -- average for category
    for (var q = 0; q < testData.length; q++) {
      // create an array of categories
      if (categories.indexOf(testData[q].category) === -1) {
        categories.push(testData[q].category)
      }
      for (var p = 0; p < testData[q].buzzes.length; p++) {
        // if players(player name) doesn't exist, initialize it
        if (players[testData[q].buzzes[p].id] === undefined) {
          players[testData[q].buzzes[p].id] = {}
        }
        // if players(player name)(category name) doesn't exist, initialize it
        if (players[testData[q].buzzes[p].id][testData[q].category] === undefined) {
          players[testData[q].buzzes[p].id][testData[q].category] = [];
        }
        // push the difference between the time player buzzes and the question was asked
        // for each player for each category into the object
        players[testData[q].buzzes[p].id][testData[q].category].push(testData[q].buzzes[p].time - testData[q].rootTime)
      }
    }
    // average the time for each player, for each category
    for (var player in players) {
      for (var category in players[player]) {
        var divisor = players[player][category].length;
        players[player][category] = (players[player][category].reduce(function(pv, cv, i, arr) {
          return pv + cv;
        }) / divisor);
      }
    }
    displayData.labels = categories;
    displayData.datasets = []
    var index = 0;
    for (var player in players) {
      for (var category in players[player]) {
        if (players[player].displayArray === undefined) {
          players[player].displayArray = []
        }
        players[player].displayArray.push(players[player][category])
      }
    }
    var count = 0;
    for (var player in players) {
      var red = 100 - (count * 20);
      var green = 255 - (count * 30);
      var blue = 200 - (count * 65); 
      displayData.datasets[count] = {
        label: player,
        fillColor: "rgba(" + red + "," + green + "," + blue + ",0.6)",
        strokeColor: "rgba(220,220,220,1)",
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: players[player].displayArray
      }
      count++;
    }
    var recoveredBarChart = new Chart(text).Bar(displayData);
  });
}