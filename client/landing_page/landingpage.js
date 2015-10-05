$(document).ready(function() {
  $('.modal-trigger').leanModal();
});

var signUp = function(username, password) {
  //TODO --- somehow get an HTTP request to http:// URL / signup / username /password
}

$('#createLoginButton').on('click', function() {
  var u = $('#signupUsername').val();
  var p = $('#signupPassword').val();
  signUp(u, p);
});