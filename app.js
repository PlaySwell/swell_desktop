"use strict";

// Includes *********************************************************

var gui = require('nw.gui');
var schedule = require('node-schedule');
var request = require('request');
var notifier = require('node-notifier');
var path = require('path');
var url = require('url');
//var wakeEvent = require('wake-event');


// Initialize *******************************************************
try {
  //needed for toasting... should be done in installer.
  gui.App.createShortcut(process.env.APPDATA + "\\Microsoft\\Windows\\Start Menu\\Programs\\Shopswell.lnk");
} catch (e)
{
  console.error(e)
}


// Global Config ****************************************************
var shopswell_host = process.env.SHOPSWELL_HOST || 'https://www.shopswell.com'

var badge_label = ''

var show_in_taskbar = false


// Define Windows ***************************************************

var main_window = gui.Window.get();
var user_agent = main_window.window.navigator.userAgent

var app_window = null

var app_window_state = null

var app_window_show = function( options ){

  if( options == undefined ) options = {}

  if( app_window ) {

    set_show_in_taskbar( true )
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

      app_window.window.location.href = ( options.url || shopswell_host )

      set_show_in_taskbar( true )
      app_window.show()
      app_window.focus()
      set_badge_label()

    } )

    app_window.on ( 'loaded', function(){

      app_window_state = 'loaded'

      if ( !app_window.window.swell_desktop && shopswell_host.indexOf(app_window.window.location.host) >= 0 )
      {

        app_window.window.swell_desktop = function(){

        }
        app_window.window.swell_desktop.version = gui.App.manifest.version
        app_window.window.swell_desktop.assert_notification = assert_notification
        app_window.window.swell_desktop.pull_notifications = pull_notifications
        app_window.window.swell_desktop.app_window_show = app_window_show
        app_window.window.swell_desktop.app_window_hide = app_window_hide
        app_window.window.swell_desktop.set_badge_label = set_badge_label
        app_window.window.swell_desktop.request_attention = request_attention
        app_window.window.swell_desktop.external_link = external_link

        if ( app_window.window.swell_desktop_ready ) app_window.window.swell_desktop_ready()

      }
    } )

    app_window.on ( 'loading', function(){

      //app_window.title = main_window.title
      //loading_proc = setInterval(function(){ app_window.title = main_window.title },5)
      app_window_state = 'loading'


    } )

  }



}

var app_window_hide = function(){

  set_show_in_taskbar( false )
  app_window.hide()

}

main_window.on ( 'close', app_window_hide );


// Helpers

var set_badge_label = function( new_badge_label ){

  if( !(new_badge_label == undefined) ) badge_label = ''+new_badge_label

  main_window.setBadgeLabel(badge_label)
  if ( app_window ) app_window.setBadgeLabel(badge_label)


}

var set_show_in_taskbar = function( show ) {
  show_in_taskbar = show
  main_window.setShowInTaskbar( show )
}

var external_link = function( url ) {
  gui.Shell.openExternal( url );
}

var request_attention = function( attention ) {

  if ( attention )
  {
    var current_show_in_taskbar = show_in_taskbar
    set_show_in_taskbar( true )
    show_in_taskbar = false

    main_window.requestAttention(attention)
    if ( app_window ) app_window.requestAttention(attention)


    setTimeout( function(){
      set_show_in_taskbar( current_show_in_taskbar || show_in_taskbar )
    }, 2000 )

  }
}


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

  var options = {
    url: shopswell_host+'/api_desktop.json',
    headers: {
      'User-Agent': user_agent
    }
  };


  request(options, function (error, response, body) {

    if (!error && response.statusCode == 200) {

      var body_obj = JSON.parse(response.body)

      request_attention( body_obj.request_attention )
      set_badge_label( body_obj.badge_label )

      if( body_obj && body_obj.notifications ) {

        body_obj.notifications.forEach(function(notification){

          assert_notification( notification )

        })
      }

    }
  })

}


var image_path = function( image, args )
{
  var full_path = null

  if( args == undefined ) args = {}

  args.path = args.path || './'

  if( image )
  {
    var image_url = url.parse(image)

    if( image_url.host )
    {
      full_path = image
    }
    else
    {
      full_path = 'file://'+path.join(process.cwd(), args.path+image)
    }
  }
  else
  {
    full_path = args.default_image ? 'file://'+path.join(process.cwd(), args.path+args.default_image) : undefined;
  }

  return full_path

}


var assert_notification = function ( notification ) {

  //console.log( JSON.stringify(notification) )

  var app_window_url = notification.url || undefined
  delete notification.url

  var title   = notification.title
  var message = notification.message
  var sound   = notification.sound = notification.sound || false;
  var icon    = image_path( notification.icon, { path: 'icons/', default_image: 'logo-32x32.png' } )
  var image   = image_path( notification.image, { path: 'icons/' } )


  /*
  var notification = new Notification(title, {icon: image, body: message});

  notification.onclick = function () {
    app_window_show( { url: app_window_url } )
  };
  //*/

  //*
  notifier.notify({
    title: title,
    message: message,
    icon: icon,
    appIcon: icon,
    contentImage: image,
    sound: sound,
    wait: true,
    time: 30000,
    sticky: false,
    sender: 'com.shopswell.desktop'
  }, function (err, response) {
    if (response == "Activate\n") {

      app_window_show( { url: app_window_url } )

    }
  });
  //*/

};




// Scheduling Notification PULLs ************************************
// +---------------- minute (0 - 59)
// |  +------------- hour (0 - 23)
// |  |  +---------- day of month (1 - 31)
// |  |  |  +------- month (1 - 12)
// |  |  |  |  +---- day of week (0 - 7) (Sunday=0 or 7)
// |  |  |  |  |
// *  *  *  *  *  command to be executed
// Local clock time!!!!!

var last_pull = null

//PULL Every 3 days at 10:00am!
schedule.scheduleJob('0 10 */3 * *', function(){
  last_pull = Date.now()
  pull_notifications()
});

// PULL 1 minute after startup
setTimeout( function(){
  last_pull = Date.now()
  pull_notifications()
}, 60000 )

// After computer wakes up, check to see how long it has been since the last
// PULL, and do so if it has been more than 3 days.
// wakeEvent(function () {
//
//   var one_day=1000*60*60*24;
//
//   // Convert both dates to milliseconds
//   var date1_ms = (last_pull || Date.now()).getTime();
//   var date2_ms = Date.now().getTime();
//
//   // Calculate the difference in milliseconds
//   var difference_ms = date2_ms - date1_ms;
//
//   // Convert back to day
//   var difference_days = Math.round(difference_ms/one_day)
//
//   //If it has been more than 3 days since last pull, do so
//   if( difference_days > 3 ) pull_notifications()
//
//
// });