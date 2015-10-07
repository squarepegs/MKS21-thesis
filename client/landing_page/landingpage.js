$(document).ready(function() {
  $('.modal-trigger').leanModal();
});


$('#createLoginButton').on('click', function() {
  $(this).closest("form").submit();
});

$('#loginButton').on('click', function() {
  $(this).closest("form").submit();
});