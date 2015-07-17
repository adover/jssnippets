      $(document,window).on("keydown keyup", function(e) {
          e.preventDefault();
          console.log(e.which)
          // Space is 32
          // page up 33
          // page down 34
          // end 35
          // home  36
          // up arrow  38
          // down arrow  40
          // tab 9

          if(e.which == 32 || e.which == 34 || e.which == 35 || e.which == 40){
            utils.vector = "down";
          }else if(e.which == 33 || e.which == 36 || e.which == 38){
            utils.vector = "up";
          }else if(e.which == 9){
            return false;
          }

      });
      
      // Requires jQuery.touchSwipe
      $(window).swipe({
        swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
          if(direction == "up"){
            utils.vector = "up";
          }else if(direction == "down"){
            utils.vector = "down";
          }
        }
      })

      // Requires jQuery.mouseWheel
      $(window).mousewheel(function(event, delta){

        if(delta > 0){
          // Scrolling up
          utils.vector = "up";
        }else{
          // Scrolling down
          utils.vector = "down";
        }

      });