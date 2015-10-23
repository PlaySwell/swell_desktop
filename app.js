"use strict";

// Includes *********************************************************

var gui = require('nw.gui');
var schedule = require('node-schedule');
var request = require('request');
var notifier = require('node-notifier');
var path = require('path');




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
      "title": main_window.title,
      "kiosk": false,
      "maximize": true,
      "height": 600,
      "visible": true,
      "as_desktop": false,
      "toolbar": false,
      "position": "center",
      "show_in_taskbar": true,
      "width": 800,
      "transparent": false,
      "exe_icon": "./icons/logo.ico",
      "mac_icon": "./mac_files/logo.icns",
      "icon": "./icons/logo-128x128.png"
    });



    app_window.on ( 'close', app_window_hide );

    main_window.focus()
    main_window.hide()

    //var loading_proc = null

    app_window.once ( 'loaded', function(){

      app_window.window.location.href = url

      main_window.setShowInTaskbar(true)
      app_window.show()
      app_window.focus()

    } )

    app_window.on ( 'loaded', function(){
      //app_window.title = main_window.title
      //clearInterval( loading_proc )
      app_window_state = 'loaded'
    } )

    app_window.on ( 'loading', function(){

      //app_window.title = main_window.title
      //loading_proc = setInterval(function(){ app_window.title = main_window.title },5)
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

var tray = new gui.Tray({ tooltip: main_window.title, icon: './icons/tray.png', alticon: './icons/tray-osx.png' });

// Show window and remove tray when clicked
tray.on('click', function(){app_window_show()})


// Give it a menu
var menu = new gui.Menu();

var open_button = new gui.MenuItem({ type: 'normal', label: 'Open' })
open_button.on('click', function(){app_window_show()})

var exit_button = new gui.MenuItem({ type: 'normal', label: 'Quit' })
exit_button.on('click', function(){
  gui.App.quit();
})

menu.append(open_button);
menu.append(new gui.MenuItem({ type: 'separator' }));
menu.append(exit_button);
tray.menu = menu;




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

  var url = notification.url || undefined
  delete notification.url

  var title = notification.title
  var message = notification.message
  var sound = notification.sound = notification.sound || false;
  var icon  = path.join(process.cwd(), 'icons/'+(notification.icon || 'logo-32x32.png') )
  var image = notification.image ? path.join(process.cwd(), notification.image) : undefined;


  // var notification = new Notification(title, {icon: icon, body: message});
  //
  // notification.onclick = function () {
  //   app_window_show( { url: url } )
  // };

  notifier.notify({
    title: title,
    message: message,
    icon: icon,
    appIcon: icon,
    contentImage: image,
    sound: sound,
    wait: true,
    sender: 'com.shopswell.nwjs.desktop'
  }, function (err, response) {
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

setTimeout( pull_notifications, 1000 ) // wait 10 minutes after startup