var ip = "192.168.0.100";
var port = "8008";
var username = "popcorn";
var password = "popcorn";
var connected = false;
var view = "";
var currentlist = {};

$(function() { // -----------------------------------------------------------------------

  checkConnected(true); 
	Popcorn("getviewstack");
  Popcorn("getcurrentlist");
	//setInterval( function() {
  //}, 1000);

  function Popcorn(method, params) { 
    if ( typeof params === "undefined" ) {
      params = [];
    };

    var request = {};
    request.params = params;
    request.id = 10;
    request.method = method;
    request.jsonrpc = "2.0";

    $.ajax({
      type: "POST",
      url: "http://" + ip + ":" + port,
      data: JSON.stringify(request),
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", btoa(username + ":" + password));
      },
      success: function(data, textStatus) {
        console.log(data.result);
        switch (request.method) { 
      
          case "getviewstack":
            viewstackhandler(data);
            break;
      
          case "getcurrentlist":
            var type = data.result.type;
            var pages = data.result.max_page;
            var page = data.result.page;
            currentlist[type] = {
              pages: pages
            };
            $.each(data.result.list, function(key, obj) {
              $(".items ul." + type).append('\
                <li id="' + obj._id + '" class="item">\
                  <img class="cover-image" src="' + obj.images.poster + '">\
                  <div class="cover">\
                    <div class="cover-overlay">\
                      <i class="fa fa-heart actions-favorites tooltipped" data-toggle="tooltip" data-placement="auto bottom" data-delay=\'{ "show": "800", "hide": "100" }\'></i>\
                      <i class="fa fa-eye actions-watched tooltipped" data-toggle="tooltip" data-placement="auto bottom" data-delay=\'{ "show": "800", "hide": "100" }\'></i>\
                    </div>\
                  </div>\
                  <p class="title" title="' + obj.slug + '">' + obj.title + '</p>\
                  <p class="year">' + obj.year + '</p>\
                </li>\
              ');
            });
            break;
      
          case "getloading":
            
            break;
        };
      },
    });
  };

  function showsBrowser() { 
    $(".items ul.show").html("");
    for (var i = 1; i <= currentlist.show.pages; i++) { 
      Popcorn("getcurrentlist", i);
    };
  };

  function viewstackhandler(data) {	
    if ( typeof(data.result.butterVersion) === "undefined" ) { 
      return false;
    };
    currentview = data.result.viewstack[data.result.viewstack.length - 1];

    if ( view !== currentview /*&& $("#settings").is(":visible") == false*/ ) { 
      switch (currentview) {
        
        case "main-browser":
          Popcorn("getcurrentlist");
          break;
      
        case "shows-container-contain":
          Popcorn("getselection");
          break;
      
        case "movie-detail":
          Popcorn("getselection");
          break;
      
        case "player":
          Popcorn("getloading");
          Popcorn("getplaying");
          Popcorn("getsubtitles");
          break;
      
        case "app-overlay":
          Popcorn("getloading");
          Popcorn("getselection");
          break;
      
        default:
          console.debug("Current view: " + currentview);
      };
      view = currentview;
    };
  };

  function checkConnected(warning) {
    var request = {};
    request.params = [];
    request.id = 10;
    request.method = "ping";
    request.jsonrpc = "2.0";
    
    $.ajax({
      type: "POST",
      url: "http://" + ip + ":" + port,
      data: JSON.stringify(request),
      beforeSend: function(xhr) { 
        xhr.setRequestHeader("Authorization", btoa(username + ":" + password)); 
      },
      success: function(data, textStatus) {
        if ( typeof data.error === "undefined" ) { //check if there are no errors
          console.info("Connection established.");
          //closeSettings();
          connected = true;
        } else { //there are errors
          if ( warning ) {
            console.error("Invalid login credentials.");
          };
          connected = false;
        };
      },
      error: function() {
        if ( warning ) {
          console.error("Could not connect to given client.");
        };
        connected = false;
      }
    });
  };

  var lists = {
    genres: [
      'All',
      'Action',
      'Adventure',
      'Animation',
      'Biography',
      'Comedy',
      'Crime',
      'Documentary',
      'Drama',
      'Family',
      'Fantasy',
      'Film-Noir',
      'History',
      'Horror',
      'Music',
      'Musical',
      'Mystery',
      'Romance',
      'Sci-Fi',
      'Short',
      'Sport',
      'Thriller',
      'War',
      'Western'
    ],

    sorters: [
      'trending',
      'popularity',
      'last added',
      'year',
      'title',
      'rating'
    ],

    sorters_tv: [
      'trending',
      'popularity',
      'updated',
      'year',
      'name',
      'rating'
    ],

    sorters_fav: [
      'watched items',
      'year',
      'title',
      'rating'
    ],

    types_fav: [
      'All',
      'Movies',
      'TV',
      'Anime'
    ],

    genres_tv: [
      'All',
      'Action',
      'Adventure',
      'Animation',
      'Children',
      'Comedy',
      'Crime',
      'Documentary',
      'Drama',
      'Family',
      'Fantasy',
      'Game Show',
      'Home and Garden',
      'Horror',
      'Mini Series',
      'Mystery',
      'News',
      'Reality',
      'Romance',
      'Science Fiction',
      'Soap',
      'Special Interest',
      'Sport',
      'Suspense',
      'Talk Show',
      'Thriller',
      'Western'
    ],

  };

}); // ----------------------------------------------------------------------------------
