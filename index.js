"use strict";

var gui = require('nw.gui');

var win = gui.Window.get();

var new_win = gui.Window.open('https://www.shopswell.com', {

  "fullscreen": false,
  "kiosk_emulation": false,
  "resizable": true,
  "show": false,
  "always-on-top": false,
  "frame": true,
  "title": "Shopswell",
  "kiosk": false,
  "maximize": true,
  "height": 600,
  "exe_icon": "",
  "visible": true,
  "as_desktop": false,
  "toolbar": false,
  "position": "center",
  "show_in_taskbar": true,
  "mac_icon": "",
  "width": 800,
  "transparent": false,
  "icon": ""
});

new_win.on('minimize', function() {
  // Hide window
  this.hide();
  win.setShowInTaskbar(false)

});

new_win.on ('loaded', function(){
  // the native onload event has just occurred
  console.log('test!!!')
});


new_win.on ('close', function(e){
  //e.preventDefault()
  win.setShowInTaskbar(false)
  new_win.hide()
});


// Show tray
var tray = new gui.Tray({ icon: 'tray.png' });

// Show window and remove tray when clicked
tray.on('click', function() {
  win.setShowInTaskbar(true)
  new_win.show();
  //this.remove();
  //tray = null;
});