var ip = "192.168.1.100";
var port = "8008";
var username = "popcorn";
var password = "popcorn";
var connected = false;
var view = "";
var page = 1;

$(function() { // -----------------------------------------------------------------------
  isWebAppiOS = (window.navigator.standalone == true);
  isWebAppChrome = (window.matchMedia('(display-mode: standalone)').matches);

  checkConnected(true);
  setInterval(function () {
    Popcorn("getviewstack");
  }, 1000);
  //Popcorn("listennotifications");

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
        if ( data.error ) { 
          console.error(request.method);
          console.error(data);
          return false;
        };
        //console.log(data);
        switch (request.method) {

          case "enter":
            Popcorn("getviewstack");
            break;
      
          case "getviewstack":
            //console.log(data.result);
            viewstackhandler(data);
            break;
           
          case "getgenres":
            var $dropdown = $("#nav-filters .genres .dropdown-menu");
            $dropdown.html('<li><a data-value=""></a></li>');
            $.each(data.result.genres, function(index, value) {
              $dropdown.append('<li><a data-value="' + value + '">' + value + '</a></li>');
            });
            break;
           
          case "getsorters":
            var $dropdown = $("#nav-filters .sorters .dropdown-menu");
            $dropdown.html('<li><a data-value=""></a></li>');
            $.each(data.result.sorters, function(index, value) {
              $dropdown.append('<li><a data-value="' + value + '">' + value + '</a></li>');
            });
            break;
           
          case "getcurrentlist":
            //console.log(data);
            var type = "";
            page = (data.result ? data.result.page : 1);
            if (data.result === undefined) {
              Popcorn("getviewstack");
              break;
            } else { 
              type = data.result.type;
            };
            if (page === 1) { 
              $(".list .items_show, .list .items_movie").html("");
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
              index = ($(".list .items_" + type + " li:last-of-type").data("index") >= 0 ? $(".list .items_" + type + " li:last-of-type").data("index") + 1 : 0);
              $(".list .items_" + type).append('\
                <li id="' + obj._id + '" class="item' + (watched ? " watched" : "") + '" data-index="' + index + '">\
                  <img class="cover-image" src="' + obj.images.poster + '">\
                  <div class="cover">\
                    <div class="cover-overlay">\
                      <i class="fa fa-heart actions-favorites tooltipped' + (obj.bookmarked ? " selected" : "") + '" data-toggle="tooltip" data-placement="auto bottom" data-delay=\'{ "show": "800", "hide": "100" }\'></i>\
                      <i class="fa fa-eye actions-watched tooltipped' + (type === "show" ? " hidden" : "") + '" data-toggle="tooltip" data-placement="auto bottom" data-delay=\'{ "show": "800", "hide": "100" }\'></i>\
                    </div>\
                  </div>\
                  <p class="title" title="' + obj.slug + '">' + obj.title + '</p>\
                  <p class="year">' + obj.year + '</p>\
                  <p class="seasons">' + (obj.rating.percentage ? (obj.rating.percentage/10) : obj.rating) + '/10</p>\
                </li>\
              ');
            });
            page++;
            break;
      
          case "getselection":
            //console.log(data);
            switch (view) { 

              case "shows-container-contain":
                var $showsContainer = $("#shows-container");
                $showsContainer.find(".sh-cover .shc-img").css("background-image", "url('" + data.result.images.fanart + "')").css("opacity", 1);
                $showsContainer.find(".sh-poster .shp-img").css("background-image", "url('" + data.result.images.poster + "')").css("opacity", 1);
                $showsContainer.find(".shm-title").html(data.result.title);
                $showsContainer.find(".shmi-year").html(data.result.year);
                $showsContainer.find(".shmi-runtime").html(data.result.runtime + " min");
                $showsContainer.find(".shmi-status").html(data.result.status ? data.result.status : "N/A");
                $showsContainer.find(".shmi-genre").html(data.result.genres[0]);
                $showsContainer.find(".shmi-imdb").data("id", data.result.imdb_id);
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
                        <i id="watched-' + key + '-' + obj2.episode + '" class="fa fa-eye watched' + (obj2.watched.watched ? " true" : "") + '"></i>\
                      </li>\
                    ');
                  });
                });
                $showsContainer.find(".sd-overview .sdoi-title").html(data.result.selectedEpisode.title); 
                $showsContainer.find(".sd-overview .sdoi-number").html("Season " + data.result.selectedEpisode.season + ", Episode " + data.result.selectedEpisode.episode); 
                var firstAired = new Date(data.result.selectedEpisode.first_aired * 1000);
                $showsContainer.find(".sd-overview .sdoi-date").html("Aired Date: " + firstAired.toDateString()); 
                $showsContainer.find(".sd-overview .sdoi-synopsis").html(data.result.selectedEpisode.overview); 
              
                $showsContainer.find('.tab-season[data-tab="season-' + data.result.selectedEpisode.season + '"]').addClass("active");
                $showsContainer.find('.tab-episode[data-tab="episode-' + data.result.selectedEpisode.episode + '"]').addClass("active");
                $showsContainer.find(".tab-episodes").hide();
                $showsContainer.find(".tab-episodes.season-" + data.result.selectedEpisode.season).show();
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
                $movieContainer.find(".movie-imdb-link").data("id", data.result.imdb_id);
                $movieContainer.find(".rating-container .number-container").html(data.result.rating + "/10");
                $movieContainer.find(".overview").html(data.result.synopsis);
                if (data.result.watched) {
                  $movieContainer.find(".watched-toggle").addClass("selected").html("Seen");
                } else { 
                  $movieContainer.find(".watched-toggle").removeClass("selected").html("Not Seen");
                };
                break;
            };
            $(".app-overlay .loading-background").css("background-image", "url('" + (data.result.backdrop ? data.result.backdrop : data.result.images.fanart) + "')");
            break;
      
          case "getplaying":
            var $appOverlay = $(".app-overlay");
            $appOverlay.find(".title").html(data.result.title);
            $appOverlay.find(".download_speed").html(data.result.downloadSpeed);
            $appOverlay.find(".upload_speed").html(data.result.uploadSpeed);
            $appOverlay.find(".value_peers").html(data.result.activePeers);
            var percentage = (data.result.currentTime / data.result.duration) * 100;
            $appOverlay.find(".playing-progressbar").css("visibility", "visible");
            $appOverlay.find("#playingbar-contents").css("width", percentage + "%");
            break;

          case "getloading":
            //console.log(data);
            var $appOverlay = $(".app-overlay");
            $appOverlay.find(".title").html(data.result.title);
            $appOverlay.find(".buffer_percent").html(data.result.bufferPercent ? data.result.bufferPercent + "%" : "");
            $appOverlay.find(".download_speed").html(data.result.downloadSpeed);
            $appOverlay.find(".upload_speed").html(data.result.uploadSpeed);
            $appOverlay.find(".value_peers").html(data.result.activePeers);
            $appOverlay.find(".playing-progressbar").css("visibility", "hidden");
            break;

          default:
            console.log(request.method);
            console.log(data);
        };
      },
    });
  };

  function viewstackhandler(data) {	
    //console.log(data);
    if (!connected) { return false; };
    if ( typeof(data.result.butterVersion) === "undefined" ) { 
      return false;
    };
    currentView = data.result.viewstack[data.result.viewstack.length - 1];
    //console.log(currentView);

    if ( view !== currentView /*&& $("#settings").is(":visible") == false*/ ) { 
      switch (currentView) {
        
        case "main-browser":
          Popcorn("getcurrentlist");
          Popcorn("getgenres");
          Popcorn("getsorters");
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
          Popcorn("getplaying");
          Popcorn("getselection");
          $(".spinner, #main-browser .items, #shows-container, #movie-detail").hide();
          $(".app-overlay").show();
          break;
      
        case "app-overlay":
          Popcorn("getloading");
          Popcorn("getselection");
          //$(".spinner, #main-browser .items, #shows-container, #movie-detail").hide();
          //$(".app-overlay").show();
          break;

        case "notificationWrapper":
          //console.log(data);  
        break;
      
        default:
          console.debug("Current view: " + currentView);
      };
      view = currentView;
    };

    if (currentView === "app-overlay") { 
      Popcorn("getloading");
    };
    if (currentView === "player") { 
      Popcorn("getplaying");
    };
  };

  $("#header").on("click", ".fullscreen", function() { 
    Popcorn("togglefullscreen");
  });

  $(".filter-bar").on("click", ".source", function() { 
    var $dit = $(this);
    if ($dit.is(".movieTabShow")) { 
      Popcorn("movieslist");
    } else if ($dit.is(".tvshowTabShow")) { 
      Popcorn("showslist");
    };
    //view = "";
    //Popcorn("getviewstack");
    location.reload(true);
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
  })
  .on("click", ".fa-eye.watched", function() {
    Popcorn("togglewatched");
  })
  .on("click", ".sdow-quality", function() {
    Popcorn("togglequality");
  })
  .on("click", ".sha-bookmark", function() {
    Popcorn("togglefavourite");
  })
  .on("click", ".fa-times.close-icon", function() {
    Popcorn("back");
  });
  
  $("#movie-detail").on("click", "#player-chooser", function() {
    Popcorn("enter");
  })
  .on("click", ".watched-toggle", function() {
    Popcorn("togglewatched");
  })
  .on("click", ".movie-quality-container", function() {
    Popcorn("togglequality");
  })
  .on("click", ".favourites-toggle", function() {
    Popcorn("togglefavourite");
  })
  .on("click", ".fa-times.close-icon", function() {
    Popcorn("back");
  });

  $(".shmi-imdb, .movie-imdb-link").on("click", function() { 
    var $dit = $(this);
    if (isWebAppiOS || isWebAppChrome) { 
      window.open("http://www.imdb.com/title/" + $dit.data("id"), "_self");
    } else { 
      window.open("http://www.imdb.com/title/" + $dit.data("id"), "_blank");
    };
  });

  $(".app-overlay").on("click", ".cancel-button", function() {
    Popcorn("back");
  });

  $(".list").on("scroll", function() { 
    var $dit = $(this);
    if ($dit.scrollTop() + $dit.innerHeight() >= $dit[0].scrollHeight) {
      Popcorn("getcurrentlist", [page]);
    };
  });

  $("#searchbox").on("keypress", function(event) {
    var $dit = $(this);
    if (event.which === 13) {
      Popcorn("filtersearch", [$dit.val()]);
      location.reload(true);
      event.preventDefault();
    };
  });

  $("#nav-filters").on("click", ".genres .dropdown-menu a", function() {
    var $dit = $(this);
    Popcorn("filtergenre", [$dit.data("value")]);
    location.reload(true);
  })
  .on("click", ".sorters .dropdown-menu a", function() {
    var $dit = $(this);
    Popcorn("filtersorter", [$dit.data("value")]);
    location.reload(true);
  });
  
  $("#torrent_col").on("click", function() {
    $(".spinner, #main-browser .items, #shows-container, #movie-detail, .app-overlay").hide();
    $("#torrent-collection-container").show();
  });
  $("#startstream").on("click", "button", function() {
    var $dit = $("#startstream");
    var args = {};
    args.imdb_id = $dit.find("imdb_id").val();
    //args.torrent_url =
    //args.backdrop =
    //args.subtitle =
    //args.selected_subtitle =
    //args.title =
    //args.quality =
    //args.type = 
    console.log(args);
    //Popcorn("startstream", args);
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

}); // ----------------------------------------------------------------------------------
