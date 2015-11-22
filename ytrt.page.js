/* YouTube Rotten Tomatoes Chrome Extension JavaScript */
var googleApiBaseUrl = 'https://www.googleapis.com/customsearch/v1';
var googleApiKey = 'AIzaSyCgUP3G497NOXDiVaafgar7EYvR3G2RgRU';
var cx = '012830761965841514384:jbwgcct_sbm';
var rtApiBaseUrl = 'https://api.rottentomatoes.com/api/';
var rtApiKey = 'aebvjw8x6v5ba586xkhb5a9c';
var videoTitle = '';
var imdbPostfix = ' - IMDb';

$(document).ready(function() {
  videoTitle = $('.watch-title').text();
  console.log('video title', videoTitle);

  // If 'trailer' is in the title
  if (videoTitle.toLowerCase().indexOf('trailer') >= 0){
    var titleToSearch = videoTitle + ' movie';
    googleSearch(titleToSearch);

    // var script = document.createElement('script');
    // script.type = 'text/javascript';
    // script.src = 'https://www.google.com/jsapi';
    // $('head').append(script);
    //
    // google.load('search','1');
    // google.setOnLoadCallback(OnLoad);
  }
});

function googleSearch(titleToSearch) {
  var searchUrlConfig = '?key=' + googleApiKey + '&cx=' + cx;
  var searchUrl = googleApiBaseUrl  + searchUrlConfig + '&q=' + encodeURI(titleToSearch);
  debugger;
  // Get Google Custom Search results
  $.get( searchUrl, function(response) {
    if (response.items.length >= 0) {
      // var movieTitle = response.items[0].title;
      // Get rotten tomatoes HTML
      var rtMovieLink = response.items[0].link;
      var httpsMovieLink = rtMovieLink.replace(/http:\/\//, 'https://');
      $.get( httpsMovieLink, function(rtHTML) {
        console.log('RT Get rtHTML success', rtHTML);
        var parsedHTML = $('<div>').append($.parseHTML(rtHTML));
        var criticScoreEl = parsedHTML.find('.critic-score .meter-value span');
        var audienceScoreEl = parsedHTML.find('.audience-score .meter-value span');
        if (criticScoreEl[0] && audienceScoreEl[0]) {
          var criticScore = criticScoreEl[0].innerText;
          var audienceScore = audienceScoreEl[0].innerText.slice(0, -1);
          insertScores(criticScore, audienceScore);
        }
      })
      .fail(function(response) {
        console.log('RT Get response error', response);
      });
    }
    console.log('Get response success', response);
  })
  .fail(function(response) {
    console.log('Get response error', response);
  });
}

function OnLoad() {
  // Create a search control
  var searchControl = new google.search.SearchControl();

  var localSearch = new google.search.LocalSearch();
  searchControl.addSearcher(localSearch);
  searchControl.addSearcher(new google.search.WebSearch());

  // Set the Local Search center point
  localSearch.setCenterPoint("New York, NY");

  // tell the searcher to draw itself and tell it where to attach
  searchControl.draw(document.getElementById("searchcontrol"));

  // execute an inital search
  searchControl.execute("VW GTI");
}

function insertScores(criticScore, audienceScore) {
  // var searchUrlDetails = '&page_limit=1&page=1&apikey=' + rtApiKey;
  // var searchUrl = rtApiBaseUrl + 'public/v1.0/movies.json?q=' + encodeURI(videoTitle) + searchUrlDetails;
  var html = '<div id="ytrt-container"><span id="ytrt-critic"></span><span class="ytrt-score">' +
  criticScore +
  '<span class="ytrt-percentage">%</span></span><span id="ytrt-audience"></span><span class="ytrt-score">' +
  audienceScore +
  '<span class="ytrt-percentage">%</span></span></div>';
  $(".watch-title-container").append(html);

  // $.get(searchUrl, function(response) {
  //   console.log('Get response success', response);
  //   var criticScore = response.movies[0].ratings.critics_score;
  //   var audienceScore = response.movies[0].ratings.audience_score;
  //
  //   $(".watch-title-container").append(html);
  // }, function(response) {
  //   console.log('Get response error', response);
  // });
}
