var ip = "192.168.0.100";
var port = "8008";
var username = "popcorn";
var password = "popcorn";
var connected = false;
var view = "";
var pages = 0;
var scroll = 0;

$(function() { // -----------------------------------------------------------------------

  checkConnected(true);
  setInterval(function () {
    Popcorn("getviewstack");
  }, 1000);

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
        //console.log(data.result);
        switch (request.method) {

          case "enter":
            Popcorn("getviewstack");
            break;
      
          case "getviewstack":
            viewstackhandler(data);
            break;
           
          case "getcurrentlist":
            var type = data.result.type;
            pages = data.result.max_page;
            if (type === undefined) { 
              Popcorn("getviewstack");
              break;
            };
            $.each(data.result.list, function(index, obj) {
              var watched = false;
              if (type === "show") {
                watched = !obj.watched;
                $("#main-browser .movieTabShow").removeClass("active");
                $("#main-browser .tvshowTabShow").addClass("active");
              } else { 
                watched = obj.watched;
                $("#main-browser .tvshowTabShow").removeClass("active");
                $("#main-browser .movieTabShow").addClass("active");
              };
              $(".list .items_" + type).append('\
                <li id="' + obj._id + '" class="item' + (watched ? " watched" : "") + '" data-index="' + index + '">\
                  <img class="cover-image" src="' + obj.images.poster + '">\
                  <div class="cover">\
                    <div class="cover-overlay">\
                      <i class="fa fa-heart actions-favorites tooltipped" data-toggle="tooltip" data-placement="auto bottom" data-delay=\'{ "show": "800", "hide": "100" }\'></i>\
                      <i class="fa fa-eye actions-watched tooltipped" data-toggle="tooltip" data-placement="auto bottom" data-delay=\'{ "show": "800", "hide": "100" }\'></i>\
                    </div>\
                  </div>\
                  <p class="title" title="' + obj.slug + '">' + obj.title + '</p>\
                  <p class="year">' + obj.year + '</p>\
                  <p class="seasons">' + (obj.rating.percentage ? (obj.rating.percentage/10) : obj.rating) + '/10</p>\
                </li>\
              ');
            });
            $(".list").scrollTop(scroll);
            break;
      
          case "getselection":
            switch (view) { 

              case "shows-container-contain":
                var $showsContainer = $("#shows-container");
                $showsContainer.find(".shm-title").html(data.result.title);
                $showsContainer.find(".shmi-year").html(data.result.year);
                $showsContainer.find(".shmi-runtime").html(data.result.runtime + " min");
                $showsContainer.find(".shmi-status").html(data.result.status ? data.result.status : "N/A");
                $showsContainer.find(".shmi-genre").html(data.result.genres[0]);
                $showsContainer.find(".shmi-rating .number-container-tv").html((data.result.rating.percentage/10) + "/10");
                $showsContainer.find(".shm-synopsis").html(data.result.synopsis);

                $showsContainer.find(".sds-list ul").html("");              
                $showsContainer.find(".sde-list").html("");              
                $.each(data.result.torrents, function(key, obj) { 
                  $showsContainer.find(".sds-list ul").append('\
                    <li class="tab-season" data-tab="season-' + key + '" data-season="' + key + '">\
                      <a>Season ' + key + '</a>\
                    </li>\
                  ');
                  $showsContainer.find(".sde-list").append('\
                    <div class="tab-episodes season-' + key + '"><ul></ul></div>\
                  ');
                  $.each(data.result.torrents[key], function(key2, obj2) { 
                    $showsContainer.find(".sde-list .season-" + key + " ul").append('\
                      <li class="tab-episode" data-tab="episode-' + key2 + '" data-id="' + obj2.tvdb_id + '" data-season="' + key + '" data-episode="' + key2 + '">\
                        <a href="#" class="episodeData">\
                          <span>' + obj2.episode + '</span>\
                          <div>' + obj2.title + '</div>\
                        </a>\
                        <i id="watched-' + key + '-' + obj2.episode + '" class="fa fa-eye watched"></i>\
                      </li>\
                    ');
                  });
                });
                $showsContainer.find(".sd-overview .sdoi-title").html(data.result.selectedEpisode.title); 
                $showsContainer.find(".sd-overview .sdoi-number").html("Season " + data.result.selectedEpisode.season + ", Episode " + data.result.selectedEpisode.episode); 
                $showsContainer.find(".sd-overview .sdoi-date").html("Aired Date: " + data.result.selectedEpisode.first_aired); 
                $showsContainer.find(".sd-overview .sdoi-synopsis").html(data.result.selectedEpisode.overview); 
              
                $showsContainer.find('.tab-season[data-tab="season-' + data.result.selectedEpisode.season + '"]').addClass("active");
                $showsContainer.find('.tab-episode[data-tab="episode-' + data.result.selectedEpisode.episode + '"]').addClass("active");
                $showsContainer.find(".tab-episodes").hide();
                $showsContainer.find(".tab-episodes.season-" + data.result.selectedEpisode.season).show();
                $(".app-overlay .loading-background").css("background-image", "url('" + data.result.images.fanart + "')");
                break;
              
              case "movie-detail":
                var $movieContainer = $("#movie-detail");
                $movieContainer.find(".backdrop").css("background-image", "url('" + data.result.backdrop + "')").css("opacity", 1);
                $movieContainer.find(".poster-box img").attr("src", data.result.cover).css("opacity", 1);
                $movieContainer.find(".title").html(data.result.title);
                $movieContainer.find(".year").html(data.result.year);
                $movieContainer.find(".runtime").html(data.result.runtime + " min");
                $movieContainer.find(".genre").html("");
                $.each(data.result.genre, function(index, value) {
                  $movieContainer.find(".genre").append(value + '<span class="divider"> / </span>');
                });
                $movieContainer.find(".rating-container .number-container").html(data.result.rating + "/10");
                $movieContainer.find(".overview").html(data.result.synopsis);
                if (data.result.watched) {
                  $movieContainer.find(".watched-toggle").addClass("selected").html("Seen");
                } else { 
                  $movieContainer.find(".watched-toggle").removeClass("selected").html("Not Seen");
                };
                break;
            };  
            break;
      
          case "getloading":
            $(".app-overlay .title").html(data.result.title);
            $(".app-overlay .download_speed").html(data.result.downloadSpeed);
            $(".app-overlay .upload_speed").html(data.result.uploadSpeed);
            $(".app-overlay .value_peers").html(data.result.activePeers);
            break;
        };
      },
    });
  };

  function viewstackhandler(data) {	
    if (!connected) { return false; };
    if ( typeof(data.result.butterVersion) === "undefined" ) { 
      return false;
    };
    currentview = data.result.viewstack[data.result.viewstack.length - 1];

    if ( view !== currentview /*&& $("#settings").is(":visible") == false*/ ) { 
      switch (currentview) {
        
        case "main-browser":
          $(".list .items_show, .list .items_movie").html("");
          Popcorn("getcurrentlist");
          $(".spinner, .app-overlay, #shows-container, #movie-detail").hide();
          $("#main-browser .items").show();
          break;
      
        case "shows-container-contain":
          Popcorn("getselection");
          $(".spinner, #movie-detail, .app-overlay").hide();
          $("#shows-container").show();
          break;
      
        case "movie-detail":
          Popcorn("getselection");
          $(".spinner, .app-overlay, #shows-container").hide();
          $("#movie-detail").show();
          break;
      
        case "torrent-collection":
          break;
      
        case "player":
          Popcorn("getloading");
          Popcorn("getplaying");
          Popcorn("getsubtitles");
          break;
      
        case "app-overlay":
          Popcorn("getloading");
          Popcorn("getselection");
          $(".spinner, #main-browser .items, #shows-container, #movie-detail").hide();
          $(".app-overlay").show();
          break;

        case "notificationWrapper":
          //console.log(data);  
        break;
      
        default:
          console.debug("Current view: " + currentview);
      };
      view = currentview;
    };

    if (currentview === "app-overlay") { 
      Popcorn("getloading");
    };
  };

  $(".filter-bar").on("click", ".source", function() { 
    var $dit = $(this);
    if ($dit.is(".movieTabShow")) { 
      Popcorn("movieslist");
    } else if ($dit.is(".tvshowTabShow")) { 
      Popcorn("showslist");
    };
    view = "";
    Popcorn("getviewstack");
  });

  $(".items").on("mouseenter", "li.item", function() {
    var $dit = $(this);
    var params = [$dit.data("index").toString()];
    Popcorn("setselection", params);
  })
  .on("click", "li.item", function() {
    var $dit = $(this);
    var params = [$dit.data("index").toString()];
    Popcorn("setselection", params);
    Popcorn("enter");
    view = "";
    Popcorn("getviewstack");
  });

  $("#shows-container").on("click", ".tab-season", function() {
    var $dit = $(this);
    var params = [$dit.data("season"), 1];
    Popcorn("selectepisode", params);
    view = "";
    Popcorn("getviewstack");
  })
  .on("click", ".tab-episode", function() {
    var $dit = $(this);
    var params = [$dit.data("season"), $dit.data("episode")];
    Popcorn("selectepisode", params);
    view = "";
    Popcorn("getviewstack");
  })
  .on("click", ".sdow-watchnow", function() {
    Popcorn("enter");
  });
  
  $("#movie-detail").on("click", "#player-chooser", function() {
    Popcorn("enter");
  });

  $(".list").on("scroll", function () { 
    var $dit = $(this);
    scroll = $dit.scrollTop();
    if ($dit.scrollTop() + $dit.innerHeight() >= $dit[0].scrollHeight) {
      view = "";
      Popcorn("getviewstack");
    };
  });

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
