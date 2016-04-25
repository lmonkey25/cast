// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic','ngCordova', 'app.controllers', 'app.routes', 'app.services', 'app.directives'])

.run(function($ionicPlatform, $rootScope, Log, DeviceFile) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }   

    if (window.ConnectSDK && window.ConnectSDK.discoveryManager) {
        var videoFilter = new ConnectSDK.CapabilityFilter([
           ConnectSDK.Capabilities.MediaPlayer.Play.Video, 
           ConnectSDK.Capabilities.MediaControl.Any, 
           ConnectSDK.Capabilities.VolumeControl.UpDown 
        ]);
        ConnectSDK.discoveryManager.setCapabilityFilters([videoFilter]);

        ConnectSDK.discoveryManager.startDiscovery();
    }
      
    document.addEventListener("resume", onResume, false);
    document.addEventListener("pause", onPause, false);

    function onResume(){
      console.log("app us resume");
      if (window.ConnectSDK && window.ConnectSDK.discoveryManager) {
          var videoFilter = new ConnectSDK.CapabilityFilter([
             ConnectSDK.Capabilities.MediaPlayer.Play.Video, 
             ConnectSDK.Capabilities.MediaControl.Any, 
             ConnectSDK.Capabilities.VolumeControl.UpDown 
          ]);

          var imageFilter = new ConnectSDK.CapabilityFilter([
              ConnectSDK.Capabilities.MediaPlayer.Display.Image
          ]);

          ConnectSDK.discoveryManager.setCapabilityFilters([videoFilter, imageFilter]);

          ConnectSDK.discoveryManager.startDiscovery();
      }
    }

    function onPause(){
      Log.out("app us pause");
      ConnectSDK.discoveryManager.stopDiscovery();
      DeviceFile.writeAsJson("user.data", $rootScope.user, function(state){
        DeviceFile.writeAsJson("resource.data", $rootScope.data, function(state){
          Log.out("all date is saved");
        });
      })
    }
  });
})