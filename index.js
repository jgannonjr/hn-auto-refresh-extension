//  Refreshes hacker news index pages on a set interval.

var contentTableXpath = '/html/body/center/table/tbody/tr[3]/td/table';
var userBarXpath = '/html/body/center/table/tbody/tr[1]/td/table/tbody/tr/td[3]';
var logoXpath = '/html/body/center/table/tbody/tr[1]/td/table/tbody/tr/td[1]/a/img';

// Helper functions
var getXpathEl = function(doc, xpath) {
  return doc
    .evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    .singleNodeValue;
};

var replaceXpathEl = function(doc, newDoc, xpath) {
  var newEl = getXpathEl(newDoc, xpath);
  var docEl = getXpathEl(doc, xpath);
  docEl.outerHTML = newEl.outerHTML;
};

var clearAnimation = function(el) {
  el.className = '';
};

var startAnimation = function(el, animation) {
  el.className = 'animated ' + animation;
};

var getRefreshInterval = function() {
  return options.refresh_animation_secs * 1000;
};

// Handle refreshing the page
var logoEl = getXpathEl(document, logoXpath);
var refreshPage = function() {
  clearAnimation(logoEl);
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      if (options.animation_enabled) {
        startAnimation(logoEl, options.animation);
      }
      var res = xhr.responseText;
      var domParser = new DOMParser();
      var resDoc = domParser.parseFromString(res, 'text/html');
      replaceXpathEl(document, resDoc, contentTableXpath);
      replaceXpathEl(document, resDoc, userBarXpath);
    }
  };
  xhr.timeout = 10*1000;  // 10 seconds
  xhr.open('GET', window.location);
  xhr.send();
};


// Handle page state
var lastRefreshTime = new Date();
var windowBlurred = false;
var maybeRefresh = function() {
  if (windowBlurred ||
      (new Date()).valueOf() - lastRefreshTime.valueOf() < getRefreshInterval()) {
    return;
  }
  lastRefreshTime = new Date();
  refreshPage();
};

window.onfocus = function() {
  windowBlurred = false;
  maybeRefresh();
};

window.onblur = function() {
  windowBlurred = true;
};

// Get options and start interval timer
var options = {refresh_animation_secs: 60, animation: 'flash', animation_enabled: true};  // defaults
chrome.storage.sync.get(options, function(stored_options){
  options = stored_options;
  setInterval(maybeRefresh, getRefreshInterval());
});