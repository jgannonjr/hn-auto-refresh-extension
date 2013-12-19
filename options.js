// Saves options to chrome.storage.sync.
var save_options = function() {
  var refresh_interval_secs = parseInt(document.getElementById('refresh_interval_secs').value, 10) || 60;
  if (refresh_interval_secs < 30) {
    refresh_interval_secs = 30;
  }

  var animSelect = document.getElementById('animation');
  var animation = animSelect.children[animSelect.selectedIndex].value;

  var animation_enabled = document.getElementById('animation_enabled').checked;

  chrome.storage.sync.set(
      {refresh_interval_secs: refresh_interval_secs, animation: animation, animation_enabled: animation_enabled},
      function() {
    update_and_show_page();
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.innerHTML = 'Options Saved.';
    setTimeout(function() {
      status.innerHTML = '';
    }, 1000);
  });
};

// Restores select box state to saved value from chrome.storage.sync.
var update_and_show_page = function() {
  chrome.storage.sync.get(
      {refresh_interval_secs: 60, animation: 'flash', animation_enabled: true},  // defaults
      function(options) {
    document.getElementById('refresh_interval_secs').value = options.refresh_interval_secs;
    var animSelect = document.getElementById('animation');
    for (var i = 0; i < animSelect.children.length; i++) {
      var child = animSelect.children[i];
      if (child.value == options.animation) {
        child.selected = 'true';
        break;
      }
    }
    document.getElementById('animation_enabled').checked = options.animation_enabled;
    document.getElementById('options').style.display = 'block';
  });

};

document.addEventListener('DOMContentLoaded', update_and_show_page);
document.querySelector('#save').addEventListener('click', save_options);