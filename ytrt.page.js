/* YouTube Rotten Tomatoes Chrome Extension JavaScript */
var googleApiBaseUrl = 'https://www.googleapis.com/customsearch/v1';
var googleApiKey = 'AIzaSyCgUP3G497NOXDiVaafgar7EYvR3G2RgRU';
var cx = '012830761965841514384:jbwgcct_sbm';
var videoTitle = '';
var scoreThreshold = 59;
var keywords = ['trailer', 'teaser'];

$(document).ready(function() {
  var observer = new MutationObserver( function(mutations) {
    var newVideoTitle = $('.watch-title').text();
    var includesKeyword = keywords.some(function(str) { return newVideoTitle.toLowerCase().indexOf(str) >= 0; });
    if (videoTitle !== newVideoTitle && includesKeyword) {
      videoTitle = newVideoTitle;
      insertLoadingIcons();
      googleSearch(videoTitle);
    }
  });
  observer.observe(document.body, {characterData: true, childList: true});
});

function googleSearch(videoTitle) {
  var searchUrlConfig = '?key=' + googleApiKey + '&cx=' + cx;
  var searchUrl = googleApiBaseUrl  + searchUrlConfig + '&q=' + encodeURI(videoTitle);

  $.get( searchUrl, function(response) {
    if (response.items) {
      getRTScores(response);
    } else {
      insertAlternate();
    }
  })
  .fail(function(response) {
    insertAlternate();
  });
}

function getRTScores(response) {
  var rtMovieLink = response.items[0].link;
  var httpsMovieLink = rtMovieLink.replace(/http:\/\//, 'https://');
  $.get( httpsMovieLink, function(rtHTML) {
    var parsedHTML = $('<div>').append($.parseHTML(rtHTML));
    var criticScoreEl = parsedHTML.find('.critic-score .meter-value span');
    var audienceScoreEl = parsedHTML.find('.audience-score .meter-value span');

    if (criticScoreEl[0] && audienceScoreEl[0]) {
      var criticScore = criticScoreEl[0].innerText;
      var audienceScore = audienceScoreEl[0].innerText.slice(0, -1);
      insertScores(criticScore, audienceScore);
    } else {
      insertAlternate();
    }
  })
  .fail(function(response) {
    insertAlternate();
  });
}

function insertLoadingIcons() {
  var html = '<div id="ytrt-container">' +
  '<span class="ytrt-spinner"></span>' +
  '<span class="ytrt-spinner"></span>' +
  '</div>';
  $(".watch-title-container").append(html);
}

function insertScores(criticScore, audienceScore) {
  $(".ytrt-spinner").remove();

  var criticElId = criticScore <= scoreThreshold ? 'ytrt-critic-splat' : 'ytrt-critic';
  var criticScoreHTML = '<span class="ytrt-icon" id="' +
  criticElId + '"></span><span class="ytrt-score">' +
  criticScore +
  '<span class="ytrt-percentage">%</span></span>';
  $("#ytrt-container").append(criticScoreHTML);

  var audienceElId = audienceScore <= scoreThreshold ? 'ytrt-audience-spill' : 'ytrt-audience';
  var audienceScoreHTML = '<span class="ytrt-icon" id="' +
  audienceElId + '"></span><span class="ytrt-score">' +
  audienceScore +
  '<span class="ytrt-percentage">%</span></span>';
  $("#ytrt-container").append(audienceScoreHTML);
}

function insertAlternate() {
  $(".ytrt-spinner").remove();
  var alternateHTML = '<span class="ytrt-icon" id="ytrt-critic"></span><span class="ytrt-score">- -</span>';
  $("#ytrt-container").append(alternateHTML);
}
