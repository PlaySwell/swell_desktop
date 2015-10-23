## Shopswell Desktop App

**How to run:**

```
git clone git@github.com/PlaySwell/swell_desktop.git
nw swell_desktop
```

**How to set your icon for OS X:**

```
cd swell_desktop
npm install nw
touch node_modules/nw/nwjs/nwjs.app
touch node_modules/nw/nwjs/nwjs.app/Contents/Info.plist
./node_modules/.bin/nw --mac_plist ./mac_files/app.plist --mac_icon ./mac_files/app.icns
```

## APIs

* [Notification](https://github.com/nwjs/nw.js/wiki/Notification)

## Extras

* [node-notifier](https://github.com/mikaelbr/node-notifier)
* [node-schedule](https://github.com/tejasmanohar/node-schedule)
* [request](https://github.com/request/request)
* [path](https://github.com/jinder/path)
* [wake-event](https://github.com/HenrikJoreteg/wake-event)

