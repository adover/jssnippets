define(['jquery', 'underscore', 'backbone', 'libs/detectmobilebrowser/detectmobilebrowser','json!../../../content/content.json'],
function ($, _, Backbone, detectmobilebrowser, content) {
  var utils = {
    // Enabler for LocalStorage
    siteContent: content,
    vector: "down",
    isLocalStorageNameSupported: function () {
      var testKey = 'test', storage = window.localStorage;

      try {
          storage.setItem(testKey, '1');
          storage.removeItem(testKey);
          return true;
      }
      catch (error){
        return false;
      }
    },
    // Browser Checking
    getBrowser: function(){
      // Check to see if it's a mobilebrowser
      var device = "desktop";
      var orientation = "landscape";
      // console.log(orientation)

      if($(window).height() > $(window).width()){
        orientation = "portrait";
        // console.log(orientation)
      }

      if($.browser.mobile){
        // it's a mobile browser, we need to return some info about it
        // Test if portrait or landscape
        if(navigator.userAgent.match(/iPhone|iPod/i)){
          device = "mobile iPhone";
        }else{
          device = "mobile";
        }

      }else{
        if(navigator.userAgent.match(/iPad/i)){
          device = "iPad";
        }
      }
      return {
        device: device,
        orientation: orientation
      }  
    },
    fixIOSHeightBug: function(){
      // Fixes iOS 7 bug where VH isn't noticed
      var that = this;
      if(that.getBrowser().device.indexOf("iPhone") >= 0 || that.getBrowser().device.indexOf("iPad") >= 0){
        console.log("iOS Browser Detected")

        $(".scene").each(function(){
          var winHeight = $(window).outerHeight() + "px";
          $(this).css({"height" : winHeight})
        })
      }else{
        console.log("Non iOS Browser Detected")
      }
    },
    // Is an element on screen?
    isOnScreenVert: function(elem, offset) {
      if(elem.length > 0){
        var win = $(window);

        var viewport = {
          top: win.scrollTop()
        };
        viewport.bottom = viewport.top + win.height() + offset;

        var bounds = elem.offset();
        bounds.bottom = bounds.top + elem.outerHeight();

        return (!(viewport.bottom < bounds.top || viewport.top > bounds.bottom));

      }  
    },
    // Is this a retina view or na?
    isRetina: function(){
      return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio >= 2)) && /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
    },
    // Converting percentages to Pixels based on screen res
    convertPercentToPx: function(value, axis) {
      if(typeof value === "string" && value.match(/%/g)) {
        if(axis === 'y') value = (parseFloat(value) / 100) * $(window).height();
        if(axis === 'x') value = (parseFloat(value) / 100) * $(window).width();
      }
      return value;
    },
    makeSeconds: function(time){
      var ms = time.split(":");

      return ((+ms[0])* 60) + (+ms[1]);
    }
  }
  return utils;
});
