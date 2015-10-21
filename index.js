"use strict";

var gui = require('nw.gui');

var new_win = gui.Window.open('https://www.shopswell.com', {

  "fullscreen": false,
  "kiosk_emulation": false,
  "resizable": true,
  "show": true,
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

  // Show tray
  tray = new gui.Tray({ icon: 'icon.png' });

  // Show window and remove tray when clicked
  tray.on('click', function() {
    new_win.show();
    this.remove();
    tray = null;
  });
});

new_win.on ('loaded', function(){
  // the native onload event has just occurred
  console.log('test!!!')
});


new_win.on ('close', function(){
  window.close()
});