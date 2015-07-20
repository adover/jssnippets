  var fixIOSHeightBug = function(){
    // Fixes iOS 7 bug where VH isn't noticed
    if(utils.getBrowser().device.indexOf("iPhone") >= 0 || utils.getBrowser().device.indexOf("iPad") >= 0){
      console.log("iOS Browser Detected")
      $(".scene").each(function(){
        console.log("scene")
        var winHeight = $(window).outerHeight() + "px";
        $(this).css({"height" : winHeight})
      })
    }else{
      console.log("Non iOS Browser Detected")
    }
  }