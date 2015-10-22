"use strict";

var gui = require('nw.gui');
var schedule = require('node-schedule');

var win = gui.Window.get();

win.on ('close', function(e){
  win.setShowInTaskbar(false)
  new_win.hide()
});

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
  // this.hide();
  // win.setShowInTaskbar(false)

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



var showNativeNotification = function (icon, title, message, sound, image) {

  var notifier;
  try {
    notifier = require('node-notifier');
  } catch (error) {
    console.error(error);
    if (error.message == "Cannot find module 'node-notifier'") {
      window.alert("Can not load module 'node-notifier'.\nPlease run 'npm install'");
    }
    return false;
  }

  var path = require('path');

  icon = icon ? path.join(process.cwd(), icon) : undefined;
  image = image ? path.join(process.cwd(), image) : undefined;

  notifier.notify({
    title: title,
    message: message,
    icon: icon,
    appIcon: icon,
    contentImage: image,
    sound: sound,
    time: 20000,
    sticky: true,
    wait: false,
    sender: 'com.shopswell.desktop'
  }, function (err, response) {
    if (response == "Activate\n") {
      console.log("node-notifier: notification clicked");
      //NW.Window.get().focus();
    }
  });
};




// +---------------- minute (0 - 59)
// |  +------------- hour (0 - 23)
// |  |  +---------- day of month (1 - 31)
// |  |  |  +------- month (1 - 12)
// |  |  |  |  +---- day of week (0 - 7) (Sunday=0 or 7)
// |  |  |  |  |
// *  *  *  *  *  command to be executed
//--------------------------------------------------------------------------

var j = schedule.scheduleJob('* * * * *', function(){
  console.log('Every minute');
  showNativeNotification( "", "Shopswell has found some great deals!", "check it out!!", false, false )
});

var j = schedule.scheduleJob('0 10 */3 * *', function(){
  console.log('Every 3 days at 10:00am!');
  showNativeNotification( "", "Shopswell has found some great deals!", "check it out!!", false, false )
});