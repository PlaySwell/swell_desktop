"use strict";

// Includes *********************************************************

var gui = require('nw.gui');
var schedule = require('node-schedule');
var request = require('request');
var path = require('path');
var notifier = require('node-notifier');




// Global Config ****************************************************
var shopswell_host = 'https://www.shopswell.com'




// Define Windows ***************************************************

var main_window = gui.Window.get();

var app_window = null

var app_window_state = null

var app_window_show = function( options ){

  if( options == undefined ) options = {}

  if( app_window ) {

    main_window.setShowInTaskbar(true)
    main_window.focus()

    if( app_window_state == 'loaded' ) {

      app_window.show()
      app_window.focus()
      if ( options.url ) app_window.window.location.href = options.url;

    } else {

      app_window.once ( 'loaded', function(){

        app_window.show()
        app_window.focus()
        if ( options.url ) app_window.window.location.href = options.url;

      } )

    }


    main_window.hide()

  } else {

    var url = options.url || shopswell_host

    app_window = gui.Window.open('splash.html', {
      "focus": true,
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



    app_window.on ( 'close', app_window_hide );

    main_window.focus()
    main_window.hide()

    app_window.once ( 'loaded', function(){

      app_window.window.location.href = url

      main_window.setShowInTaskbar(true)
      app_window.show()
      app_window.focus()

    } )

    app_window.on ( 'loaded', function(){

      app_window_state = 'loaded'

    } )

    app_window.on ( 'loading', function(){

      app_window_state = 'loading'

    } )

  }



}

var app_window_hide = function(){

  main_window.setShowInTaskbar(false)
  app_window.hide()

}

main_window.on ( 'close', app_window_hide );





// Define Tray Icon *************************************************

var tray = new gui.Tray({ icon: 'tray.png' });

// Show window and remove tray when clicked
tray.on('click', app_window_show);





// Process Notifications *************************************************

var pull_notifications = function() {

  request(shopswell_host+'/api_desktop.json', function (error, response, body) {

    if (!error && response.statusCode == 200) {
      console.log( response.body )

      var body_obj = JSON.parse(response.body)

      if( body_obj && body_obj.notifications ) {

        body_obj.notifications.forEach(function(notification){

          assert_notification( notification )

        })
      }

    }
  })

}



var assert_notification = function ( notification ) {

  var url = notification.url || undefined || 'http://google.com'
  delete notification.url

  notification.open = notification.title || void 0
  notification.open = notification.message || void 0
  notification.sound = notification.sound || false
  notification.appIcon = notification.icon = notification.icon ? path.join(process.cwd(), notification.icon) : undefined;
  notification.image = notification.image ? path.join(process.cwd(), notification.image) : undefined;
  notification.sender = 'com.shopswell.desktop'
  notification.wait = false
  notification.time = 20000
  notification.open = void 0


  notifier.notify(notification, function (err, response) {
    if (response == "Activate\n") {

      app_window_show( { url: url } )

    }
  });
};




// Scheduling Notification Pulls ************************************
// +---------------- minute (0 - 59)
// |  +------------- hour (0 - 23)
// |  |  +---------- day of month (1 - 31)
// |  |  |  +------- month (1 - 12)
// |  |  |  |  +---- day of week (0 - 7) (Sunday=0 or 7)
// |  |  |  |  |
// *  *  *  *  *  command to be executed
// Local clock time!!!!!

schedule.scheduleJob('0 10 */3 * *', function(){
  console.log('Every 3 days at 10:00am!');

  pull_notifications()
});

setTimeout( pull_notifications, 10 * 60000 ) // wait 10 minutes after startup