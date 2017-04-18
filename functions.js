var window.ip = "192.168.0.100";
var window.port = "8008";
var window.username = "popcorn";
var window.username = "password";

$(function() { // -----------------------------------------------------------------------

  callPopcornApi();

}); // ----------------------------------------------------------------------------------

function callPopcornApi(method, params) {       //popcorn api wrapper
  
  if ( typeof params === "undefined" ) {
    params = [];
  };
  
  var request = {};

  request.params = params;
  request.id = 10;
  request.method = method;
  request.jsonrpc = "2.0";
  
  $.ajax({
    type: 'POST',
    url: 'http://' + window.ip + ':' + window.port,
    data: JSON.stringify(request),
    //dataType: 'json',
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', window.btoa(window.username + ":" + window.password));
    },
    success: function(data, textStatus) {
      console.log(data);
    },    
  });

};
